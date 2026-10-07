/*
 * Two-neuron browser port of https://github.com/shimazaki/ssll
 * Reference: 5e1fd634cdcebc708a12e2c3cb80242fb3b08bb8 (2026-10-07).
 * Ported from __init__.py, container.py, exp_max.py, max_posterior.py,
 * probability.py, and transforms.py; exact likelihood / Newton-Raphson.
 *
 * Original exact-inference implementation: Thomas Sharp.
 * Copyright (C) 2016 Christian Donner and Hideaki Shimazaki.
 * Copyright (C) 2018 Jimmy Gaudreault and Hideaki Shimazaki.
 * Copyright (C) 2019 Magalie Tatischeff.
 * JavaScript adaptation Copyright (C) 2026 Hideaki Shimazaki.
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or (at your
 * option) any later version. This program is distributed without any
 * warranty; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See LICENSE.txt for the full license.
 *
 * This is the two-neuron demonstration, not a port of every SSLL option.
 * Equivalent Python call:
 *   ssll.run(spikes, order=2, window=1, map_function='nr', state_cov=0.01,
 *            state_ar=None, max_iter=100, param_est='exact',
 *            param_est_eta='exact', theta_o=0, sigma_o=0.1,
 *            mstep=True, EM_Info=False)
 * F is fixed to I; Q = q I is learned. EM and MAP tolerances are 1e-4.
 * The Gaussian posterior is obtained by Laplace filtering and smoothing;
 * 'exact' describes evaluation of the four-pattern observation model.
 */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SSLL = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var SOURCE_COMMIT = '5e1fd634cdcebc708a12e2c3cb80242fb3b08bb8';
  var TOLERANCE = 1e-4;

  function diagonal(value) {
    return [[value, 0, 0], [0, value, 0], [0, 0, value]];
  }

  function copyMatrix(a) { return a.map(function (row) { return row.slice(); }); }
  function subtract(a, b) { return a.map(function (v, i) { return v - b[i]; }); }
  function add(a, b) { return a.map(function (v, i) { return v + b[i]; }); }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function matvec(a, b) { return a.map(function (row) { return dot(row, b); }); }
  function transpose(a) { return a[0].map(function (_, j) { return a.map(function (row) { return row[j]; }); }); }
  function matmul(a, b) {
    var bt = transpose(b);
    return a.map(function (row) { return bt.map(function (col) { return dot(row, col); }); });
  }
  function matrixAdd(a, b) { return a.map(function (row, i) { return add(row, b[i]); }); }
  function matrixSubtract(a, b) { return a.map(function (row, i) { return subtract(row, b[i]); }); }

  // Pivoted elimination is small and dependency-free for this 3 x 3 model.
  // A matrix right-hand side lets the same routine compute the inverse.
  function solve(a, b) {
    var width = b[0].length;
    var rows = a.map(function (row, i) { return row.concat(b[i]); });
    for (var k = 0; k < 3; k++) {
      var pivot = k;
      for (var i = k + 1; i < 3; i++) {
        if (Math.abs(rows[i][k]) > Math.abs(rows[pivot][k])) pivot = i;
      }
      var swap = rows[k]; rows[k] = rows[pivot]; rows[pivot] = swap;
      var divisor = rows[k][k];
      if (!Number.isFinite(divisor) || divisor === 0) throw new Error('Singular posterior covariance.');
      for (var j = k; j < 3 + width; j++) rows[k][j] /= divisor;
      for (i = 0; i < 3; i++) {
        if (i === k) continue;
        var scale = rows[i][k];
        for (j = k; j < 3 + width; j++) rows[i][j] -= scale * rows[k][j];
      }
    }
    return rows.map(function (row) { return row.slice(3); });
  }

  function inverse(a) { return solve(a, diagonal(1)); }

  function logDet(a) {
    // Covariances and their inverses are positive definite. Cholesky avoids
    // underflow from computing a determinant before taking its logarithm.
    var l00 = Math.sqrt(a[0][0]);
    var l10 = a[1][0] / l00;
    var l20 = a[2][0] / l00;
    var l11 = Math.sqrt(a[1][1] - l10 * l10);
    var l21 = (a[2][1] - l20 * l10) / l11;
    var l22 = Math.sqrt(a[2][2] - l20 * l20 - l21 * l21);
    var result = 2 * (Math.log(l00) + Math.log(l11) + Math.log(l22));
    if (!Number.isFinite(result)) throw new Error('Invalid posterior covariance.');
    return result;
  }

  function model(theta) {
    if (!Array.isArray(theta) || theta.length !== 3 || !theta.every(Number.isFinite)) {
      throw new TypeError('Expected three finite natural parameters.');
    }
    var logits = [0, theta[0], theta[1], theta[0] + theta[1] + theta[2]];
    var maximum = Math.max.apply(null, logits);
    var weights = logits.map(function (v) { return Math.exp(v - maximum); });
    var total = weights.reduce(function (sum, v) { return sum + v; }, 0);
    var p = weights.map(function (v) { return v / total; });
    return {
      probabilities: p, // Pattern order: 00, 10, 01, 11.
      eta: [p[1] + p[3], p[2] + p[3], p[3]],
      psi: maximum + Math.log(total)
    };
  }

  function fisher(eta) {
    var a = eta[0], b = eta[1], c = eta[2];
    return [[a - a * a, c - a * b, c - a * c],
            [c - a * b, b - b * b, c - b * c],
            [c - a * c, c - b * c, c - c * c]];
  }

  function posterior(observed, trials, initial, priorMean, priorPrecision) {
    var theta = initial.slice();
    var precision;
    for (var iteration = 0; iteration < 5000; iteration++) {
      var distribution = model(theta);
      var information = fisher(distribution.eta);
      var priorGradient = matvec(priorPrecision, subtract(theta, priorMean));
      var gradient = observed.map(function (v, i) {
        return trials * (v - distribution.eta[i]) - priorGradient[i];
      });
      precision = information.map(function (row, i) {
        return row.map(function (v, j) {
          // Upstream adds machine epsilon to the negative Hessian.
          return trials * v + priorPrecision[i][j] - (i === j ? Number.EPSILON : 0);
        });
      });
      var step = solve(precision, gradient.map(function (v) { return [v]; }));
      theta = theta.map(function (v, i) { return v + step[i][0]; });
      var maxGradient = Math.max.apply(null, gradient.map(Math.abs)) / trials;
      // As in upstream NR, the covariance uses the Hessian evaluated before
      // this final update, rather than silently recomputing it afterward.
      if (maxGradient <= TOLERANCE && iteration < 4999) {
        return {theta: theta, covariance: inverse(precision)};
      }
    }
    throw new Error('Newton-Raphson did not converge within 5000 iterations.');
  }

  function observations(spikes) {
    if (!Array.isArray(spikes) || !spikes.length || !Array.isArray(spikes[0]) || !spikes[0].length) {
      throw new TypeError('Expected nonempty spike data shaped [time][trial][2].');
    }
    var trials = spikes[0].length;
    var y = spikes.map(function (bin) {
      if (!Array.isArray(bin) || bin.length !== trials) throw new TypeError('Each time bin must have the same number of trials.');
      var counts = [0, 0, 0];
      bin.forEach(function (pair) {
        if (!Array.isArray(pair) || pair.length !== 2 ||
            (pair[0] !== 0 && pair[0] !== 1) || (pair[1] !== 0 && pair[1] !== 1)) {
          throw new TypeError('Each trial must contain two binary values (0 or 1).');
        }
        counts[0] += pair[0]; counts[1] += pair[1]; counts[2] += pair[0] * pair[1];
      });
      return counts.map(function (v) { return v / trials; });
    });
    return {y: y, trials: trials};
  }

  function logMarginal(state, y, trials) {
    var a = 0, b = 0;
    for (var t = 0; t < y.length; t++) {
      a += trials * (dot(y[t], state.filtered[t]) - model(state.filtered[t]).psi);
      var delta = subtract(state.filtered[t], state.prior[t]);
      b -= dot(delta, matvec(state.priorPrecision[t], delta));
      b += logDet(state.filteredCov[t]) + logDet(state.priorPrecision[t]);
    }
    return a + b / 2;
  }

  function estimate(spikes, options, progressCallback) {
    options = options || {};
    var limit = options.maxIterations === undefined ? 100 : options.maxIterations;
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new RangeError('maxIterations must be an integer between 1 and 100.');
    }
    if (progressCallback !== undefined && typeof progressCallback !== 'function') {
      throw new TypeError('Progress callback must be a function.');
    }
    var input = observations(spikes);
    var y = input.y, trials = input.trials, bins = y.length;
    var state = {prior: [], priorCov: [], priorPrecision: [], filtered: [], filteredCov: [],
      smoothed: [], smoothedCov: [], lagCov: [], processVariance: 0.01};
    for (var t = 0; t < bins; t++) {
      state.prior.push([0, 0, 0]);
      state.priorCov.push(diagonal(0.1));
      state.priorPrecision.push(diagonal(10));
      state.filtered.push([0, 0, 0]);
      state.filteredCov.push(diagonal(0.1));
      state.smoothed.push([0, 0, 0]);
      state.smoothedCov.push(diagonal(0.1));
      state.lagCov.push(diagonal(0.1));
    }
    var likelihood = logMarginal(state, y, trials);
    var history = [], convergence = Infinity;
    while (history.length < limit && convergence > TOLERANCE) {
      // Forward Laplace filter. The previous smoothed estimate initializes NR.
      for (t = 0; t < bins; t++) {
        if (t > 0) {
          state.prior[t] = state.filtered[t - 1].slice();
          state.priorCov[t] = matrixAdd(state.filteredCov[t - 1], diagonal(state.processVariance));
          state.priorPrecision[t] = inverse(state.priorCov[t]);
        }
        var fitted = posterior(y[t], trials, state.smoothed[t], state.prior[t], state.priorPrecision[t]);
        state.filtered[t] = fitted.theta;
        state.filteredCov[t] = fitted.covariance;
      }
      // Backward smoother and lag-one covariance (F = I).
      state.smoothed[bins - 1] = state.filtered[bins - 1].slice();
      state.smoothedCov[bins - 1] = copyMatrix(state.filteredCov[bins - 1]);
      for (t = bins - 2; t >= 0; t--) {
        var gain = matmul(state.filteredCov[t], state.priorPrecision[t + 1]);
        state.smoothed[t] = add(state.filtered[t], matvec(gain, subtract(state.smoothed[t + 1], state.prior[t + 1])));
        var correction = matmul(matmul(gain, matrixSubtract(state.smoothedCov[t + 1], state.priorCov[t + 1])), transpose(gain));
        state.smoothedCov[t] = matrixAdd(state.filteredCov[t], correction);
        state.lagCov[t + 1] = matmul(gain, state.smoothedCov[t + 1]);
      }
      // M-step: update the initial mean and isotropic transition variance.
      state.prior[0] = state.smoothed[0].slice();
      if (bins > 1) {
        var varianceSum = 0;
        for (t = 1; t < bins; t++) {
          var delta = subtract(state.smoothed[t], state.smoothed[t - 1]);
          var trace = 0;
          for (var d = 0; d < 3; d++) {
            trace += state.smoothedCov[t][d][d] - state.lagCov[t][d][d] -
              state.lagCov[t][d][d] + state.smoothedCov[t - 1][d][d];
          }
          varianceSum += trace + dot(delta, delta);
        }
        state.processVariance = varianceSum / (bins - 1) / 3;
      }
      var previous = likelihood;
      likelihood = logMarginal(state, y, trials);
      history.push(likelihood);
      // Preserve upstream's signed relative change (not absolute change).
      convergence = (previous - likelihood) / previous;
      if (progressCallback) progressCallback({iterations: history.length, maxIterations: limit,
        logLikelihood: likelihood, convergence: convergence});
    }
    return {theta: state.smoothed, covariance: state.smoothedCov, observed: y,
      processVariance: state.processVariance, logLikelihood: likelihood,
      likelihoodHistory: history, iterations: history.length, convergence: convergence};
  }

  function simulate(seed) {
    if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) {
      throw new RangeError('Seed must be an integer from 0 to 4294967295.');
    }
    // Mulberry32 keeps demonstrations reproducible without a dependency.
    var randomState = seed >>> 0;
    function random() {
      randomState = (randomState + 0x6D2B79F5) >>> 0;
      var v = randomState;
      v = Math.imul(v ^ (v >>> 15), v | 1);
      v ^= v + Math.imul(v ^ (v >>> 7), v | 61);
      return ((v ^ (v >>> 14)) >>> 0) / 4294967296;
    }
    var spikes = [], trueTheta = [];
    var patterns = [[0, 0], [1, 0], [0, 1], [1, 1]];
    for (var t = 0; t < 50; t++) {
      var theta = [-2, -2, 1 + 2 * Math.sin(4 * Math.PI * t / 50 - Math.PI / 2)];
      var p = model(theta).probabilities;
      var bin = [];
      for (var r = 0; r < 30; r++) {
        var u = random(), index = 0, cumulative = p[0];
        while (index < 3 && u >= cumulative) cumulative += p[++index];
        bin.push(patterns[index].slice());
      }
      spikes.push(bin); trueTheta.push(theta);
    }
    return {spikes: spikes, trueTheta: trueTheta, seed: seed};
  }

  return {estimate: estimate, model: model, simulate: simulate, sourceCommit: SOURCE_COMMIT};
}));

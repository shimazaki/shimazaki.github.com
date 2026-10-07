'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const reference = require('./fixtures/ssll-reference.json');
const ssll = require('../res/ssloglin/ssll.js');

// The fixed input arrays and expectations were generated independently by the
// actual Python library, pinned to the commit recorded in the fixture. Absolute
// and relative tolerances cover double-precision matrix-operation ordering;
// they are substantially smaller than either optimizer's stopping threshold.
function close(actual, expected, path, atol = 1e-8, rtol = 1e-9) {
    if (Array.isArray(expected)) {
        assert.ok(Array.isArray(actual), `${path} must be an array`);
        assert.equal(actual.length, expected.length, `${path}.length`);
        expected.forEach((value, i) => close(actual[i], value,
            `${path}[${i}]`, atol, rtol));
        return;
    }
    assert.ok(Number.isFinite(actual), `${path} must be finite (got ${actual})`);
    const tolerance = atol + rtol * Math.abs(expected);
    assert.ok(Math.abs(actual - expected) <= tolerance,
        `${path}: ${actual} != ${expected} (tolerance ${tolerance})`);
}

test('probabilities and sufficient-statistic means match current Python SSLL', () => {
    for (const expected of reference.models) {
        const actual = ssll.model(expected.theta);
        close(actual.probabilities, expected.probabilities, 'probabilities', 1e-13, 1e-13);
        close(actual.eta, expected.eta, 'eta', 1e-13, 1e-13);
        close(actual.probabilities.reduce((a, b) => a + b, 0), 1, 'normalization', 1e-14, 0);
    }
});

for (const fixture of reference.cases) {
    test(`Python parity: ${fixture.name}`, () => {
        const inputBefore = JSON.stringify(fixture.spikes);
        const actual = ssll.estimate(fixture.spikes, {maxIterations: 100});
        const expected = fixture.expected;
        close(actual.theta, expected.theta, 'theta');
        close(actual.covariance, expected.covariance, 'covariance');
        close(actual.observed, expected.observed, 'observed', 1e-14, 0);
        close(actual.processVariance, expected.processVariance, 'processVariance');
        close(actual.logLikelihood, expected.logLikelihood, 'logLikelihood');
        close(actual.likelihoodHistory, expected.likelihoodHistory, 'likelihoodHistory');
        close(actual.convergence, expected.convergence, 'convergence');
        assert.equal(actual.iterations, expected.iterations, 'EM stopping iteration');
        assert.equal(actual.likelihoodHistory.length, actual.iterations);
        assert.equal(JSON.stringify(fixture.spikes), inputBefore, 'input spikes must be preserved');

        // Covariances drive the shaded uncertainty band. Beyond numerical
        // parity, check that every one is symmetric positive definite.
        for (const [t, covariance] of actual.covariance.entries()) {
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    close(covariance[i][j], covariance[j][i], `symmetry[${t},${i},${j}]`, 1e-12, 1e-12);
                }
            }
            const [a, b, c] = covariance;
            const leadingMinor2 = a[0] * b[1] - a[1] * b[0];
            const determinant = a[0] * (b[1] * c[2] - b[2] * c[1])
                - a[1] * (b[0] * c[2] - b[2] * c[0])
                + a[2] * (b[0] * c[1] - b[1] * c[0]);
            assert.ok(a[0] > 0 && leadingMinor2 > 0 && determinant > 0,
                `covariance[${t}] must be positive definite`);
        }
    });
}

test('invalid spike arrays fail before starting inference', () => {
    for (const spikes of [[], [[]], [[[1]]], [[[0, 0]], [[0, 0], [1, 1]]],
                         [[[0, 2]]], [[[NaN, 0]]]]) {
        assert.throws(() => ssll.estimate(spikes));
    }
});

test('independent model factorizes and extreme finite inputs remain normalized', () => {
    const independent = ssll.model([-1.5, -0.75, 0]);
    close(independent.eta[2], independent.eta[0] * independent.eta[1],
        'independent pair rate', 1e-14, 0);
    for (const theta of [[1000, 1000, 1000], [-1000, -1000, -1000], [1000, -1000, -1000]]) {
        const probabilities = ssll.model(theta).probabilities;
        probabilities.forEach(p => assert.ok(Number.isFinite(p) && p >= 0 && p <= 1));
        close(probabilities.reduce((a, b) => a + b, 0), 1, 'normalization', 1e-14, 0);
    }
});

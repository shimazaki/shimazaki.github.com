/* SPDX-License-Identifier: GPL-3.0-or-later */
(function () {
    'use strict';
    const root = document.getElementById('ssll-demo');
    if (!root) return;
    const byId = id => document.getElementById(id);
    const status = byId('ssll-status');
    const truth = byId('ssll-truth');
    const workerURL = new URL('ssll-worker.js?v=20261007', document.currentScript.src);
    let worker = null;
    let sample = null;
    let result = null;

    function context(id, width, height) {
        const canvas = byId(id);
        const ratio = window.devicePixelRatio || 1;
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        const ctx = canvas.getContext('2d');
        ctx.scale(ratio, ratio);
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);
        ctx.font = '13px "Times New Roman", serif';
        return ctx;
    }

    function frame(id, width, height, low, high, yTitle, ticks) {
        const ctx = context(id, width, height);
        const area = {left: 52, right: width - 14, top: 16, bottom: height - 38};
        const x = t => area.left + t / 49 * (area.right - area.left);
        const y = value => area.bottom - (value - low) / (high - low) * (area.bottom - area.top);
        ctx.lineWidth = 1;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (const value of ticks) {
            ctx.strokeStyle = '#e4e4e4';
            ctx.beginPath(); ctx.moveTo(area.left, y(value)); ctx.lineTo(area.right, y(value)); ctx.stroke();
            ctx.fillStyle = '#333';
            ctx.fillText(String(Number(value.toFixed(2))), area.left - 7, y(value));
        }
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        for (const bin of [1, 10, 20, 30, 40, 50]) ctx.fillText(String(bin), x(bin - 1), area.bottom + 6);
        ctx.fillText('Time bin', (area.left + area.right) / 2, height - 16);
        ctx.save(); ctx.translate(14, (area.top + area.bottom) / 2); ctx.rotate(-Math.PI / 2);
        ctx.textBaseline = 'top'; ctx.fillText(yTitle, 0, 0); ctx.restore();
        ctx.strokeStyle = '#777';
        ctx.strokeRect(area.left, area.top, area.right - area.left, area.bottom - area.top);
        return {ctx, x, y, area};
    }

    function line(plot, values, color, dashed) {
        const ctx = plot.ctx;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        ctx.setLineDash(dashed ? [5, 4] : []);
        ctx.beginPath();
        values.forEach((value, t) => {
            if (t === 0) ctx.moveTo(plot.x(t), plot.y(value));
            else ctx.lineTo(plot.x(t), plot.y(value));
        });
        ctx.stroke(); ctx.setLineDash([]);
    }

    function raster(neuron) {
        const ctx = context('ssll-neuron' + (neuron + 1), 320, 210);
        const left = 38, top = 14, width = 266, height = 151;
        ctx.fillStyle = '#333'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        for (const bin of [1, 10, 20, 30, 40, 50]) ctx.fillText(String(bin), left + (bin - 0.5) / 50 * width, top + height + 6);
        ctx.fillText('Time bin', left + width / 2, 190);
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        for (const trial of [1, 10, 20, 30]) ctx.fillText(String(trial), left - 6, top + (trial - 0.5) / 30 * height);
        ctx.save(); ctx.translate(12, top + height / 2); ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center'; ctx.fillText('Trial', 0, 0); ctx.restore();
        ctx.strokeStyle = '#ddd'; ctx.strokeRect(left, top, width, height);
        if (!sample) return;
        sample.spikes.forEach((trials, t) => trials.forEach((pair, r) => {
            if (!pair[neuron]) return;
            ctx.fillStyle = pair[0] && pair[1] ? '#c62828' : '#222';
            ctx.beginPath(); ctx.arc(left + (t + 0.5) / 50 * width, top + (r + 0.5) / 30 * height, 1.7, 0, Math.PI * 2); ctx.fill();
        }));
    }

    function interaction() {
        let estimate = [], lower = [], upper = [];
        let low = -2, high = 4;
        if (result) {
            estimate = result.theta.map(row => row[2]);
            const error = result.covariance.map(matrix => 2 * Math.sqrt(matrix[2][2]));
            lower = estimate.map((value, t) => value - error[t]);
            upper = estimate.map((value, t) => value + error[t]);
            low = Math.min(0, ...lower);
            high = Math.max(0, ...upper);
            if (truth.checked) {
                low = Math.min(low, ...sample.trueTheta.map(row => row[2]));
                high = Math.max(high, ...sample.trueTheta.map(row => row[2]));
            }
            const step = Math.max(0.5, Math.ceil((high - low) / 6 * 2) / 2);
            low = Math.floor(low / step) * step;
            high = Math.ceil(high / step) * step;
        }
        const step = Math.max(0.5, Math.ceil((high - low) / 6 * 2) / 2);
        const ticks = [];
        for (let value = low; value <= high + step * 0.01; value += step) ticks.push(value);
        const plot = frame('ssll-interaction', 660, 300, low, high, 'Interaction θ₁₂', ticks);
        line(plot, Array(50).fill(0), '#444', false);
        if (!result) return;
        const ctx = plot.ctx;
        ctx.fillStyle = 'rgba(198, 40, 40, 0.18)';
        ctx.beginPath();
        upper.forEach((value, t) => t ? ctx.lineTo(plot.x(t), plot.y(value)) : ctx.moveTo(plot.x(t), plot.y(value)));
        for (let t = lower.length - 1; t >= 0; t--) ctx.lineTo(plot.x(t), plot.y(lower[t]));
        ctx.closePath(); ctx.fill();
        if (truth.checked) line(plot, sample.trueTheta.map(row => row[2]), '#555', true);
        line(plot, estimate, '#c62828', false);
    }

    function rates() {
        const plot = frame('ssll-rates', 660, 180, 0, 1, 'Probability', [0, 0.25, 0.5, 0.75, 1]);
        if (!sample) return;
        const observed = sample.spikes.map(trials => [0, 1, 2].map(i => trials.reduce((total, pair) => total + (i === 2 ? pair[0] * pair[1] : pair[i]), 0) / trials.length));
        ['#245ca6', '#287743', '#c62828'].forEach((color, i) => line(plot, observed.map(row => row[i]), color, false));
    }

    function paint() { raster(0); raster(1); interaction(); rates(); }

    function stop() {
        if (worker) worker.terminate();
        worker = null;
        root.setAttribute('aria-busy', 'false');
    }

    function fail(message) {
        stop();
        status.dataset.error = 'true';
        status.textContent = 'Analysis could not be completed. ' + message + ' Try “New sample” to retry.';
    }

    function start() {
        stop();
        sample = null; result = null;
        truth.disabled = true;
        status.dataset.error = 'false';
        status.textContent = 'Generating data and estimating the interaction…';
        root.setAttribute('aria-busy', 'true');
        paint();
        try {
            const active = new Worker(workerURL);
            worker = active;
            active.onmessage = event => {
                if (worker !== active) return;
                const data = event.data;
                if (data.type === 'sample') { sample = data.sample; paint(); }
                else if (data.type === 'progress') {
                    status.textContent = 'Estimating the interaction… iteration ' + data.progress.iterations + '.';
                } else if (data.type === 'result') {
                    result = data.result;
                    truth.disabled = false;
                    stop();
                    status.textContent = result.convergence <= 0.0001 ? 'Analysis complete.' : 'Analysis complete (100 iterations reached).';
                    byId('ssll-interaction').setAttribute('aria-label', 'Estimated interaction over 50 time bins with an approximate 95% credible interval. Use “Show true interaction” to compare with the generating interaction.');
                    paint();
                } else if (data.type === 'error') fail(data.message);
            };
            active.onerror = event => { event.preventDefault(); if (worker === active) fail('The calculation could not be loaded.'); };
            const random = new Uint32Array(1);
            if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(random);
            else random[0] = Math.floor(Math.random() * 4294967296);
            active.postMessage({seed: random[0]});
        } catch (error) { fail(error.message || 'This browser does not support background calculations.'); }
    }

    byId('ssll-refresh').addEventListener('click', start);
    truth.addEventListener('change', function () {
        byId('ssll-truth-key').hidden = !truth.checked;
        interaction();
    });
    window.addEventListener('pagehide', stop);
    window.addEventListener('pageshow', event => { if (event.persisted && !result) start(); });
    root.ssllDemo = {getSample: () => sample, getResult: () => result};
    start();
}());

/* Histogram bin-width optimization, JavaScript/Canvas version.
 * Based on BinSelection.java and DrawHistogram.java by Hideaki Shimazaki.
 * Shimazaki and Shinomoto, Neural Computation 19, 1503–1527 (2007).
 */
(function (root) {
    'use strict';

    function parseData(text) {
        const tokens = text.trim().split(/[\s,;:]+/).filter(Boolean);
        const numeric = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i;
        if (!tokens.length) throw new Error('Please enter at least two different numeric values.');
        if (tokens.some(token => !numeric.test(token) || !Number.isFinite(Number(token)))) {
            throw new Error('Use finite numbers separated by spaces, commas, semicolons, or newlines.');
        }
        return tokens.map(Number);
    }

    // First index >= boundary (or > boundary when inclusive is true).
    function bound(data, boundary, inclusive) {
        let lo = 0, hi = data.length;
        while (lo < hi) {
            const mid = Math.floor((lo + hi) / 2);
            if (data[mid] < boundary || (inclusive && data[mid] === boundary)) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }

    // Sorted data, left-closed bins, with the final right boundary included.
    // Shifted windows exclude observations outside their actual boundaries.
    function countSorted(data, bins, shift = 0) {
        const min = data[0], max = data[data.length - 1];
        const width = (max - min) / bins;
        const counts = new Array(bins);
        let left = bound(data, min + shift, false);
        for (let i = 0; i < bins; i++) {
            const edge = i === bins - 1 ? max + shift : min + shift + width * (i + 1);
            const right = bound(data, edge, i === bins - 1);
            counts[i] = right - left;
            left = right;
        }
        return counts;
    }

    function cost(counts, width) {
        const mean = counts.reduce((sum, value) => sum + value, 0) / counts.length;
        const variance = counts.reduce((sum, value) => sum + (value - mean) ** 2, 0) / counts.length;
        return (2 * mean - variance) / (width * width);
    }

    function histogram(data, bins) {
        const min = data[0], max = data[data.length - 1];
        const width = (max - min) / bins;
        const edges = Array.from({length: bins + 1}, (_, i) => min + width * i);
        edges[bins] = max;
        return {bins, width, edges, counts: countSorted(data, bins)};
    }

    function optimize(values) {
        if (values.length < 2 || values.some(value => !Number.isFinite(value))) {
            throw new Error('Please enter at least two different finite numeric values.');
        }
        const data = values.slice().sort((a, b) => a - b);
        const min = data[0], max = data[data.length - 1], range = max - min;
        if (!(range > 0) || !Number.isFinite(range)) {
            throw new Error('The data must contain at least two different values with a finite range.');
        }
        const candidates = [];
        let best;
        for (let bins = 2; bins <= 200; bins++) {
            const width = range / bins;
            if (!(width * width > 0) || !Number.isFinite(width * width)) {
                throw new Error('The numeric range is too large or small. Please rescale your data.');
            }
            let total = 0;
            // Retain the original 11-position average, without its unconditional
            // extra count in the last bin. Keep full JavaScript number precision.
            for (let j = -5; j <= 5; j++) {
                total += cost(countSorted(data, bins, width * j / 10), width);
            }
            const candidate = {bins, width, cost: total / 11};
            if (!Number.isFinite(candidate.cost)) {
                throw new Error('The numeric range is too large or small. Please rescale your data.');
            }
            candidates.push(candidate);
            if (!best || candidate.cost < best.cost) best = candidate;
        }
        return {data, min, max, candidates, optimal: {...histogram(data, best.bins), cost: best.cost}};
    }

    function format(value) { return Number(value.toPrecision(6)).toString(); }

    function draw(canvas, result, bins) {
        const h = histogram(result.data, bins);
        const width = 500, height = 300;
        const scale = root.devicePixelRatio || 1;
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        canvas.style.width = width + 'px';
        canvas.style.height = 'auto';
        const ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        const left = 52, top = 32, plotWidth = 430, plotHeight = 233;
        const rates = h.counts.map(count => count / h.width);
        const ymax = Math.max(...rates) * 1.1;
        ctx.fillStyle = '#ff0000';
        rates.forEach((rate, i) => {
            const barHeight = plotHeight * rate / ymax;
            ctx.fillRect(left + plotWidth * i / bins, top + plotHeight - barHeight, plotWidth / bins, barHeight);
        });
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(left, top, plotWidth, plotHeight);
        ctx.fillStyle = '#000000';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Rate (count / bin width)', left, 19);
        ctx.textAlign = 'right';
        ctx.fillText('Bin width ' + format(h.width) + '   # of bins ' + bins, left + plotWidth, 19);
        for (let i = 0; i <= 4; i++) {
            const y = top + plotHeight * (1 - i / 4);
            ctx.fillText(format(ymax * i / 4), left - 7, y + 4);
        }
        ctx.textAlign = 'left';
        ctx.fillText(format(result.min), left, height - 14);
        ctx.textAlign = 'right';
        ctx.fillText(format(result.max), left + plotWidth, height - 14);
        canvas.setAttribute('aria-label', 'Histogram with ' + bins + ' bins, width ' + format(h.width) + ', ' + result.data.length + ' observations.');
        return h;
    }

    function sheetHTML(result) {
        const h = result.optimal;
        const rows = h.counts.map((count, i) => '<tr><td>' + format(h.edges[i]) + '</td><td>' + count +
            '</td><td>' + format(count / h.width) + '</td><td>' + format(count / result.data.length) + '</td></tr>').join('');
        const costs = result.candidates.map(c => '<tr><td>' + c.bins + '</td><td>' + format(c.width) +
            '</td><td>' + format(c.cost) + '</td></tr>').join('');
        // Only computed numbers enter the document; user input is never HTML.
        return '<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>Data Sheet of the Optimized Histogram</title>' +
            '<style>body{max-width:850px;margin:32px auto;padding:0 20px}table{border-collapse:collapse}th,td{padding:5px 18px;text-align:right;border-bottom:1px solid #ddd}</style></head><body>' +
            '<h1>Data Sheet of Your Optimized Histogram</h1><p>Shimazaki H. and Shinomoto S., A method for selecting the bin size of a time histogram, ' +
            '<em>Neural Computation</em> 19(6), 1503–1527 (2007).</p>' +
            '<p>Optimal bin width: <strong>' + format(h.width) + '</strong><br>Optimal number of bins: <strong>' + h.bins +
            '</strong><br>Number of observations: ' + result.data.length + '</p>' +
            '<h2>Data of the optimized histogram</h2><table id="histogram-data-table"><thead><tr><th>Bin edges</th><th>Frequency</th><th>Rate</th><th>Probability</th></tr></thead><tbody>' +
            rows + '<tr><td>' + format(h.edges[h.bins]) + '</td><td></td><td></td><td></td></tr></tbody></table>' +
            '<p>Bins include their left edge; the last bin also includes its right edge.</p>' +
            '<h2>Bin width vs. cost function</h2><p>Cost averaged over 11 partition positions.</p>' +
            '<table id="histogram-cost-table"><thead><tr><th>Number of bins</th><th>Bin width</th><th>Cost</th></tr></thead><tbody>' + costs + '</tbody></table>' +
            '<p>© Hideaki Shimazaki</p></body></html>';
    }

    function mount(doc) {
        const input = doc.getElementById('histogram-data');
        if (!input) return;
        const status = doc.getElementById('histogram-status');
        const results = doc.getElementById('histogram-results');
        const slider = doc.getElementById('histogram-bin-width');
        const label = doc.getElementById('histogram-bin-label');
        const canvas = doc.getElementById('histogram-canvas');
        const sheet = doc.getElementById('histogram-sheet');
        let result = null;

        function show(bins) {
            const h = draw(canvas, result, bins);
            label.textContent = format(h.width) + ' (' + bins + ' bins)';
            slider.value = 200 - bins;
            slider.setAttribute('aria-valuetext', format(h.width) + ', ' + bins + ' bins');
        }
        function calculate() {
            result = null;
            sheet.disabled = true;
            results.hidden = true;
            try {
                result = optimize(parseData(input.value));
                results.hidden = false;
                show(result.optimal.bins);
                status.dataset.error = 'false';
                status.textContent = 'Optimal bin width: ' + format(result.optimal.width) + ' (' + result.optimal.bins +
                    ' bins; ' + result.data.length + ' observations).';
                sheet.disabled = false;
            } catch (error) {
                status.dataset.error = 'true';
                status.textContent = error.message;
            }
        }
        doc.getElementById('histogram-calculate').addEventListener('click', calculate);
        doc.getElementById('histogram-restore').addEventListener('click', () => { if (result) show(result.optimal.bins); });
        slider.addEventListener('input', () => { if (result) show(200 - Number(slider.value)); });
        input.addEventListener('input', () => {
            result = null;
            sheet.disabled = true;
            results.hidden = true;
            status.dataset.error = 'false';
            status.textContent = 'Data changed. Calculate the optimal bin size to update the histogram.';
        });
        doc.getElementById('DATAFORM').addEventListener('reset', () => root.setTimeout(calculate, 0));
        doc.getElementById('DATAFORM').addEventListener('submit', event => { event.preventDefault(); calculate(); });
        sheet.addEventListener('click', () => {
            if (!result) return;
            const popup = root.open('', '_blank');
            if (!popup) {
                status.dataset.error = 'true';
                status.textContent = 'Please allow pop-ups for this page to open the data sheet.';
                return;
            }
            popup.document.open();
            popup.document.write(sheetHTML(result));
            popup.document.close();
            popup.opener = null;
        });
        calculate();
    }

    const api = {parseData, countSorted, cost, histogram, optimize, sheetHTML, mount};
    if (typeof module === 'object' && module.exports) module.exports = api;
    else {
        root.Histogram = api;
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => mount(document));
        else mount(document);
    }
}(typeof window === 'undefined' ? globalThis : window));

/* JavaScript / Canvas version of Hideaki Shimazaki's BarHisto.java demo.
 * The original 1 ms sampling, 25 trials, rate, and display colors are retained.
 * Unlike the applet, every sample (including a partial final bin) is included.
 */
(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    } else {
        root.HistogramDemo = api;
        if (root.document.readyState === 'loading') {
            root.document.addEventListener('DOMContentLoaded', function () {
                api.mount(root.document);
            });
        } else {
            api.mount(root.document);
        }
    }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    // trials contains spike time-step indices; counts sums all trials per step.
    function generate(random) {
        random = random || Math.random;
        var length = 1000;
        var dt = 0.001;
        var trialCount = 25;
        var times = new Array(length);
        var rates = new Array(length);
        var counts = new Array(length);
        var trials = new Array(trialCount);
        var i;
        var j;
        for (j = 0; j < trialCount; j++) trials[j] = [];
        for (i = 0; i < length; i++) {
            times[i] = i * dt;
            rates[i] = 20 * Math.sin(2 * Math.PI * 1.55 * times[i]) + 15 + 15 * times[i];
            counts[i] = 0;
            for (j = 0; j < trialCount; j++) {
                if (random() < rates[i] * dt) {
                    trials[j].push(i);
                    counts[i]++;
                }
            }
        }
        return { length: length, dt: dt, trialCount: trialCount,
            times: times, rates: rates, trials: trials, counts: counts };
    }

    // Bin start, end, and width are in seconds; endIndex is exclusive.
    // squaredError is the integrated squared error divided by the duration.
    function estimate(sample, binSteps) {
        if (!Number.isInteger(binSteps) || binSteps < 1 || binSteps > sample.length) {
            throw new RangeError('Bin width must be an integer from 1 to the sample length.');
        }
        var bins = [];
        var rates = new Array(sample.length);
        var squaredError = 0;
        for (var start = 0; start < sample.length; start += binSteps) {
            var end = Math.min(start + binSteps, sample.length);
            var count = 0;
            var i;
            for (i = start; i < end; i++) count += sample.counts[i];
            var width = (end - start) * sample.dt;
            var rate = count / (sample.trialCount * width);
            bins.push({ startIndex: start, endIndex: end,
                start: start * sample.dt, end: end * sample.dt,
                width: width, count: count, rate: rate });
            for (i = start; i < end; i++) {
                rates[i] = rate;
                squaredError += Math.pow(sample.rates[i] - rate, 2);
            }
        }
        return { binSteps: binSteps, binWidth: binSteps * sample.dt,
            bins: bins, rates: rates, squaredError: squaredError / sample.length };
    }

    function draw(canvas, sample, result, visible) {
        var ctx = canvas.getContext('2d');
        if (!ctx) return;
        var width = 400;
        var height = 280;
        var view = canvas.ownerDocument.defaultView;
        var pixelRatio = Math.max(1, (view && view.devicePixelRatio) || 1);
        var bitmapWidth = Math.round(width * pixelRatio);
        var bitmapHeight = Math.round(height * pixelRatio);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        if (canvas.width !== bitmapWidth) canvas.width = bitmapWidth;
        if (canvas.height !== bitmapHeight) canvas.height = bitmapHeight;
        ctx.setTransform(bitmapWidth / width, 0, 0, bitmapHeight / height, 0, 0);
        var left = 40;
        var plotWidth = width - left - 16;
        var rasterTop = 18;
        var plotHeight = (height - 80) / 2;
        var rateTop = rasterTop + plotHeight + 30;
        var rateBottom = rateTop + plotHeight;
        var maxRate = 100;
        var duration = sample.length * sample.dt;
        function x(time) { return left + time / duration * plotWidth; }
        function y(rate) { return rateBottom - rate / maxRate * plotHeight; }
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);
        ctx.font = '11px Arial, sans-serif';
        ctx.fillStyle = '#222';
        ctx.textAlign = 'left';
        ctx.fillText(sample.trialCount + ' spike trains', left, rasterTop - 6);
        ctx.fillText('Rate (events / s)', left, rateTop - 8);

        ctx.save();
        ctx.beginPath();
        ctx.rect(left, rateTop, plotWidth, plotHeight);
        ctx.clip();
        if (visible.histogram) {
            ctx.fillStyle = '#ff0000';
            result.bins.forEach(function (bin) {
                ctx.fillRect(x(bin.start), y(bin.rate),
                    x(bin.end) - x(bin.start), rateBottom - y(bin.rate));
            });
        }
        if (visible.error) {
            ctx.fillStyle = '#ffa500';
            result.bins.forEach(function (bin) {
                ctx.beginPath();
                ctx.moveTo(x(bin.start), y(bin.rate));
                ctx.lineTo(x(bin.end), y(bin.rate));
                for (var i = bin.endIndex; i >= bin.startIndex; i--) {
                    var time = i * sample.dt;
                    var truth = i < sample.length ? sample.rates[i] :
                        20 * Math.sin(2 * Math.PI * 1.55 * time) + 15 + 15 * time;
                    ctx.lineTo(x(time), y(truth));
                }
                ctx.closePath();
                ctx.fill();
            });
        }
        if (visible.histogram) {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            result.bins.forEach(function (bin, index) {
                if (index === 0) ctx.moveTo(x(bin.start), y(bin.rate));
                else ctx.lineTo(x(bin.start), y(bin.rate));
                ctx.lineTo(x(bin.end), y(bin.rate));
            });
            ctx.stroke();
        }
        if (visible.rate) {
            ctx.strokeStyle = '#0000ff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            sample.rates.forEach(function (rate, index) {
                if (index === 0) ctx.moveTo(x(sample.times[index]), y(rate));
                else ctx.lineTo(x(sample.times[index]), y(rate));
            });
            ctx.stroke();
        }
        ctx.restore();

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        var rowHeight = plotHeight / sample.trialCount;
        sample.trials.forEach(function (trial, row) {
            trial.forEach(function (step) {
                var spikeX = x(step * sample.dt);
                var spikeY = rasterTop + row * rowHeight + rowHeight * 0.2;
                ctx.moveTo(spikeX, spikeY);
                ctx.lineTo(spikeX, spikeY + rowHeight * 0.6);
            });
        });
        ctx.stroke();
        ctx.strokeRect(left, rasterTop, plotWidth, plotHeight);
        ctx.strokeRect(left, rateTop, plotWidth, plotHeight);
        ctx.fillStyle = '#222';
        ctx.textAlign = 'right';
        ctx.fillText('1', left - 6, rasterTop + 9);
        ctx.fillText(String(sample.trialCount), left - 6, rasterTop + plotHeight);
        [0, 50, 100].forEach(function (rate) {
            ctx.fillText(String(rate), left - 6, y(rate) + 4);
        });
        ctx.textAlign = 'center';
        [0, 0.25, 0.5, 0.75, 1].forEach(function (fraction) {
            ctx.fillText(String(fraction * duration), x(fraction * duration), rateBottom + 14);
        });
        ctx.fillText('Time (s)', left + plotWidth / 2, height - 3);
    }

    function mount(doc) {
        var canvas = doc.getElementById('demo-canvas');
        if (!canvas || !canvas.getContext) return null;
        if (canvas.histogramDemo) return canvas.histogramDemo;
        var slider = doc.getElementById('demo-bin-width');
        var histogram = doc.getElementById('demo-histogram');
        var rate = doc.getElementById('demo-rate');
        var error = doc.getElementById('demo-error');
        var redrawButton = doc.getElementById('demo-redraw');
        var binLabel = doc.getElementById('demo-bin-label');
        var errorValue = doc.getElementById('demo-error-value');
        if (!slider || !histogram || !rate || !error || !redrawButton) return null;
        var sample = generate();
        var result;
        function render() {
            result = estimate(sample, Number(slider.value));
            if (binLabel) binLabel.textContent = result.binWidth.toFixed(3) + ' s';
            slider.setAttribute('aria-valuetext', result.binWidth.toFixed(3) + ' seconds');
            if (errorValue) errorValue.textContent = 'Squared error: ' + result.squaredError.toFixed(2);
            draw(canvas, sample, result, { histogram: histogram.checked,
                rate: rate.checked, error: error.checked });
        }
        function redraw() {
            sample = generate();
            render();
        }
        slider.addEventListener('input', render);
        [histogram, rate, error].forEach(function (checkbox) {
            checkbox.addEventListener('change', render);
        });
        redrawButton.addEventListener('click', redraw);
        canvas.histogramDemo = { redraw: redraw,
            getSample: function () { return sample; },
            getEstimate: function () { return result; } };
        render();
        return canvas.histogramDemo;
    }

    return { generate: generate, estimate: estimate, mount: mount };
}));

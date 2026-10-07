'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const demo = require('../res/histogram-demo.js');

function seededRandom(seed) {
    let state = seed >>> 0;
    return function () {
        state ^= state << 13;
        state ^= state >>> 17;
        state ^= state << 5;
        return (state >>> 0) / 4294967296;
    };
}

function near(actual, expected, tolerance = 1e-10) {
    assert.ok(Math.abs(actual - expected) < tolerance,
        `${actual} differs from ${expected}`);
}

test('keeps the original duration, 25 trials, and underlying rate', () => {
    const sample = demo.generate(() => 0.99);
    assert.equal(sample.length, 1000);
    assert.equal(sample.dt, 0.001);
    assert.equal(sample.trialCount, 25);
    assert.equal(sample.trials.length, 25);
    assert.equal(sample.times[0], 0);
    assert.equal(sample.times[500], 0.5);
    assert.equal(sample.times[999], 0.999);
    assert.equal(sample.rates[0], 15);
    near(sample.rates[500], 2.746233188097243);
    assert.ok(sample.rates.every(rate => rate >= 0 && rate <= 100));
});

test('sampling uses the rate times dt threshold and a supplied random source', () => {
    let calls = 0;
    const sample = demo.generate(() => { calls++; return 0.015; });
    assert.equal(calls, 25000);
    assert.equal(sample.counts[0], 0, 'the threshold comparison is strict');
    assert.equal(sample.counts[1], 25);
    assert.equal(sample.counts[500], 0);
    assert.deepEqual(demo.generate(seededRandom(12345)), demo.generate(seededRandom(12345)));
    assert.notDeepEqual(demo.generate(seededRandom(12345)).counts,
        demo.generate(seededRandom(54321)).counts);
});

test('per-step counts equal the sum of the 25 spike trains', () => {
    const sample = demo.generate(seededRandom(20261007));
    const counts = Array(sample.length).fill(0);
    for (const trial of sample.trials) {
        assert.equal(new Set(trial).size, trial.length);
        for (const step of trial) {
            assert.ok(Number.isInteger(step) && step >= 0 && step < sample.length);
            counts[step]++;
        }
    }
    assert.deepEqual(sample.counts, counts);
});

for (const width of [8, 50, 330]) {
    test(`bin width ${width} preserves all events and normalizes the final bin`, () => {
        const sample = demo.generate(seededRandom(42));
        const result = demo.estimate(sample, width);
        const eventCount = sample.trials.reduce((count, trial) => count + trial.length, 0);
        assert.equal(result.bins.length, Math.ceil(sample.length / width));
        assert.equal(result.rates.length, sample.length);
        assert.equal(result.bins.reduce((count, bin) => count + bin.count, 0), eventCount);
        const last = result.bins.at(-1);
        assert.equal(last.endIndex, sample.length);
        assert.equal(last.end, 1);
        const expectedTail = sample.length % width || width;
        assert.equal(last.width, expectedTail * sample.dt);
        assert.equal(last.count, sample.counts.slice(last.startIndex).reduce((a, b) => a + b, 0));
        near(last.rate * last.width * sample.trialCount, last.count);
        for (const rate of result.rates.slice(last.startIndex)) assert.equal(rate, last.rate);
        const integral = result.rates.reduce((sum, rate) => sum + rate * sample.dt, 0);
        near(integral, eventCount / sample.trialCount);
    });
}

test('squared error covers the entire time domain, including the partial final bin', () => {
    const sample = demo.generate(() => 0.99);
    // Place one event at the final time step, beyond the last complete 330-step bin.
    sample.trials[0].push(999);
    sample.counts[999] = 1;
    const result = demo.estimate(sample, 330);
    assert.equal(result.bins.at(-1).count, 1);
    assert.equal(result.rates[999], 4);
    let integratedError = 0;
    for (let i = 0; i < sample.length; i++) {
        const estimatedRate = i < 990 ? 0 : 4;
        const difference = sample.rates[i] - estimatedRate;
        integratedError += difference * difference * sample.dt;
    }
    near(result.squaredError, integratedError / (sample.length * sample.dt));
});

test('rejects noninteger, nonpositive, and out-of-range bin widths', () => {
    const sample = demo.generate(() => 0.99);
    for (const width of [0, -1, 1.5, 1001, NaN, Infinity, '50', null, undefined]) {
        assert.throws(() => demo.estimate(sample, width), RangeError);
    }
    assert.equal(demo.estimate(sample, 1).bins.length, 1000);
    assert.equal(demo.estimate(sample, 1000).bins.length, 1);
});

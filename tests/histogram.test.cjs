const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const H = require('../res/histogram.js');

function near(actual, expected, tolerance = 1e-10) {
    assert.ok(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), `${actual} != ${expected}`);
}

// Independent brute-force interval reference, deliberately not the binary search.
function reference(data, bins, shift) {
    const min = Math.min(...data), max = Math.max(...data), width = (max - min) / bins;
    return Array.from({length: bins}, (_, i) => {
        const left = min + shift + width * i;
        const right = i === bins - 1 ? max + shift : min + shift + width * (i + 1);
        return data.filter(x => x >= left && (x < right || (i === bins - 1 && x === right))).length;
    });
}

test('default page sample agrees with independent Python baseline', () => {
    const html = fs.readFileSync(path.join(__dirname, '../res/histogram.html'), 'utf8');
    const sample = H.parseData(html.match(/<textarea[^>]*>([\s\S]*?)<\/textarea>/)[1]);
    const result = H.optimize(sample);
    assert.equal(result.data.length, 107);
    assert.equal(result.optimal.bins, 14);
    near(result.optimal.width, 0.23285714285714285);
    near(result.optimal.cost, -320.16122685700014);
    assert.deepEqual(result.optimal.counts, [20,5,3,1,1,2,2,7,10,9,18,11,14,4]);
    assert.equal(result.candidates.length, 99);
    assert.deepEqual(result.candidates.map(c => c.bins), Array.from({length: 99}, (_, i) => i + 2));
    assert.equal(result.optimal.edges.length, 15);
    assert.equal(result.optimal.edges[14], 4.93);
});

test('all repeated maxima and internal boundary values are counted exactly once', () => {
    const data = [0, 0, .5, 1, 1, 1];
    assert.deepEqual(H.countSorted(data, 2), [2, 4]);
    assert.deepEqual(H.countSorted(data, 2, .25), [1, 3]);
    assert.deepEqual(H.countSorted(data, 2, -.25), [2, 1]);
    for (const bins of [2, 3, 14, 99, 100]) {
        assert.equal(H.histogram(data, bins).counts.reduce((a, b) => a + b, 0), data.length);
    }
});

test('shifted counts and costs match direct interval summation', () => {
    const data = [-3, -2, -2, -.75, 0, .1, .7, 1.25, 1.5, 2, 2, 2];
    const result = H.optimize(data);
    for (const candidate of result.candidates) {
        const costs = [];
        for (let j = -5; j <= 5; j++) {
            const shift = candidate.width * j / 10;
            const counts = reference(data, candidate.bins, shift);
            assert.deepEqual(H.countSorted(data, candidate.bins, shift), counts);
            const mean = counts.reduce((a, b) => a + b, 0) / candidate.bins;
            const variance = counts.reduce((sum, value) => sum + (value - mean) ** 2, 0) / candidate.bins;
            costs.push((2 * mean - variance) / candidate.width ** 2);
        }
        near(candidate.cost, costs.reduce((a, b) => a + b, 0) / 11);
    }
});

test('valid numeric separators and exponents, invalid text is not silently discarded', () => {
    assert.deepEqual(H.parseData(' 1,2;3:4\n-5\t+.5 6e-2 '), [1,2,3,4,-5,.5,.06]);
    for (const text of ['', '  ', '1 NaN', '1 Infinity', '1 2bad', '<script>', '0x10 20', '1 1e999']) {
        assert.throws(() => H.parseData(text));
    }
    for (const values of [[], [1], [1,1,1], [1,Infinity], [NaN,2], [-1e308,1e308], [0,1e200,2e200], [0,1e-200]]) {
        assert.throws(() => H.optimize(values));
    }
});

test('optimization preserves its input and transforms consistently with units', () => {
    const data = [8,0,2,2,3,3,3,7,8,1];
    const original = data.slice();
    const base = H.optimize(data), changed = H.optimize(data.map(x => 4 * x + 16));
    assert.deepEqual(data, original);
    assert.equal(base.optimal.bins, changed.optimal.bins);
    near(changed.optimal.width, base.optimal.width * 4);
    near(changed.optimal.cost, base.optimal.cost / 16);
});

test('data sheet exports optimal counts, last edge and every candidate cost', () => {
    const result = H.optimize([0, .5, 1, 1]);
    const sheet = H.sheetHTML(result);
    assert.ok(sheet.startsWith('<!doctype html>'));
    assert.ok(!/NaN|undefined|Infinity/.test(sheet));
    assert.ok(sheet.includes('<td>1</td><td></td>'));
    assert.ok(sheet.includes('Number of observations: 4'));
    const costBody = sheet.split('id="histogram-cost-table"')[1].split('<tbody>')[1].split('</tbody>')[0];
    assert.equal((costBody.match(/<tr>/g) || []).length, 99);
    const frequencies = result.optimal.counts;
    assert.equal(frequencies.reduce((a, b) => a + b, 0), result.data.length);
});

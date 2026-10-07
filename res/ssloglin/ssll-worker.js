/* SPDX-License-Identifier: GPL-3.0-or-later */
'use strict';
importScripts('ssll.js?v=20261007');
self.onmessage = function (event) {
    try {
        const sample = SSLL.simulate(event.data.seed);
        self.postMessage({type: 'sample', sample: sample});
        const result = SSLL.estimate(sample.spikes, {maxIterations: 100}, function (progress) {
            self.postMessage({type: 'progress', progress: progress});
        });
        self.postMessage({type: 'result', result: result});
    } catch (error) {
        self.postMessage({type: 'error', message: error.message || String(error)});
    }
};

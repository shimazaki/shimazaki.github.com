#!/usr/bin/env python3
"""Regenerate browser-port fixtures from the pinned, unmodified Python SSLL.

Usage (a small, single-threaded calculation):
  OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 NUMBA_NUM_THREADS=1 \
    python3 tests/generate-ssll-reference.py /path/to/shimazaki/ssll

The reference checkout must match REFERENCE_COMMIT. It is imported read-only;
this script writes only tests/fixtures/ssll-reference.json beside itself.
"""

import argparse
import json
import os
from pathlib import Path
import subprocess
import sys

for variable in ('OPENBLAS_NUM_THREADS', 'OMP_NUM_THREADS', 'NUMBA_NUM_THREADS'):
    os.environ[variable] = '1'
sys.dont_write_bytecode = True

REFERENCE_COMMIT = '5e1fd634cdcebc708a12e2c3cb80242fb3b08bb8'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('reference_checkout', type=Path)
    args = parser.parse_args()
    reference = args.reference_checkout.resolve()
    commit = subprocess.check_output(
        ['git', '-C', str(reference), 'rev-parse', 'HEAD']).decode().strip()
    if commit != REFERENCE_COMMIT:
        raise SystemExit('Expected SSLL commit {}, found {}'.format(
            REFERENCE_COMMIT, commit))
    tracked_changes = subprocess.check_output(
        ['git', '-C', str(reference), 'status', '--porcelain',
         '--untracked-files=no']).decode().strip()
    if tracked_changes:
        raise SystemExit('Reference checkout has tracked changes; use a clean checkout.')

    sys.path.insert(0, str(reference))
    import numpy as np
    import scipy
    import __init__ as ssll
    import synthesis
    import transforms

    options = dict(order=2, window=1, map_function='nr', state_cov=0.01,
                   state_ar=None, max_iter=100, param_est='exact',
                   param_est_eta='exact', theta_o=0, sigma_o=0.1,
                   mstep=True, EM_Info=False, stationary=False, u=None)

    transforms.initialise(2, 2)
    time = np.arange(50)
    theta = np.column_stack((np.full(50, -2.0), np.full(50, -2.0),
                             1 + 2 * np.sin(4 * np.pi * time / 50 - np.pi / 2)))
    probabilities = np.array([transforms.compute_p(row) for row in theta])
    demo = synthesis.generate_spikes(probabilities, 30, seed=20261007).astype(int)

    patterns = np.array([[0, 0], [1, 0], [0, 1], [1, 1]], dtype=int)
    balanced = np.tile(patterns, (12, 2, 1))
    sparse = np.zeros((12, 8, 2), dtype=int)
    sparse[2, 0, 0] = 1
    sparse[6, 1, :] = 1
    sparse[9, 2, 1] = 1
    cases = [
        ('oscillating-interaction', demo, {'seed': 20261007,
         'trueTheta': theta.tolist(), 'description':
         'Two neurons, 50 time bins, 30 trials; theta=(-2,-2,1+2sin(4*pi*t/50-pi/2)).'}),
        ('all-silent', np.zeros((12, 8, 2), dtype=int), {}),
        ('all-synchronous', np.ones((12, 8, 2), dtype=int), {}),
        ('balanced-independent', balanced, {}),
        ('sparse-events', sparse, {}),
    ]
    fixtures = []
    for name, spikes, metadata in cases:
        emd = ssll.run(spikes, **options)
        fixtures.append(dict(
            name=name, metadata=metadata, spikes=spikes.tolist(),
            expected=dict(theta=emd.theta_s.tolist(),
                          covariance=emd.sigma_s.tolist(),
                          observed=emd.y.tolist(),
                          processVariance=float(emd.Q[0, 0]),
                          logLikelihood=float(emd.mll),
                          likelihoodHistory=emd.mll_list,
                          iterations=emd.iterations,
                          convergence=float(emd.convergence))))
        print('{}: {} EM iterations, log likelihood {:.12f}'.format(
            name, emd.iterations, emd.mll))

    model_fixtures = []
    for natural_parameters in ([0, 0, 0], [-2, -2, -1], [-2, -2, 3],
                               [-1, 0.5, -0.75], [8, -6, 2]):
        p = transforms.compute_p(np.array(natural_parameters, dtype=float))
        model_fixtures.append(dict(theta=natural_parameters,
                                   probabilities=p.tolist(),
                                   eta=transforms.compute_eta(p).tolist()))

    payload = dict(
        source=dict(repository='https://github.com/shimazaki/ssll',
                    commit=commit, python=sys.version.split()[0],
                    numpy=np.__version__, scipy=scipy.__version__,
                    options=options,
                    note='Actual unmodified ssll.run outputs. Python NR uses '
                         'the final pre-update Hessian for its covariance; '
                         'the browser port intentionally follows this convention.'),
        models=model_fixtures, cases=fixtures)
    destination = Path(__file__).resolve().parent / 'fixtures' / 'ssll-reference.json'
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(payload, separators=(',', ':'),
                                     allow_nan=False) + '\n')
    print(destination)


if __name__ == '__main__':
    main()

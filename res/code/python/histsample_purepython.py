from collections import defaultdict
from operator import itemgetter
from math import fsum

def shimazaki_histogram(data, start, end):
	_max = max(data)
	_min = min(data)

	results = []
	
	for N in xrange(start, end):
		width = float(_max - _min) / N

		hist = defaultdict(int)
		for x in data:
			i = int((x - _min) / width)
			if i >= N:       # Mimicking the behavior of matlab.histc(), and
				i = N - 1    # matplotlib.hist() and numpy.histogram().
			y = _min + width * i
			hist[y] += 1

		# Compute the mean and var.
		k = fsum(hist[x] for x in hist) / N
		v = fsum(hist[x]**2 for x in hist) / N - k**2

		C = (2 * k - v) / (width**2)

		results += [(hist, C, N, width)]

	optimal = min(results, key=itemgetter(1))

	if 0: # if true, print bin-widths and C-values, the cost function.
		for (hist, C, N, width) in results:
			print '%f %f' % (width, C)

	return optimal


if __name__ == '__main__':
	data = [
		4.37, 3.87, 4.00, 4.03, 3.50, 4.08, 2.25, 4.70, 1.73, 4.93, 1.73, 4.62, 
		3.43, 4.25, 1.68, 3.92, 3.68, 3.10, 4.03, 1.77, 4.08, 1.75, 3.20, 1.85, 
		4.62, 1.97, 4.50, 3.92, 4.35, 2.33, 3.83, 1.88, 4.60, 1.80, 4.73, 1.77, 
		4.57, 1.85, 3.52, 4.00, 3.70, 3.72, 4.25, 3.58, 3.80, 3.77, 3.75, 2.50, 
		4.50, 4.10, 3.70, 3.80, 3.43, 4.00, 2.27, 4.40, 4.05, 4.25, 3.33, 2.00, 
		4.33, 2.93, 4.58, 1.90, 3.58, 3.73, 3.73, 1.82, 4.63, 3.50, 4.00, 3.67, 
		1.67, 4.60, 1.67, 4.00, 1.80, 4.42, 1.90, 4.63, 2.93, 3.50, 1.97, 4.28, 
		1.83, 4.13, 1.83, 4.65, 4.20, 3.93, 4.33, 1.83, 4.53, 2.03, 4.18, 4.43, 
		4.07, 4.13, 3.95, 4.10, 2.27, 4.58, 1.90, 4.50, 1.95, 4.83, 4.12
	]

	optimal = shimazaki_histogram(data, 4, 50)

	# Print the shimazaki optimal histogram.
	(hist, C, N, width) = optimal

	print '# C=%f, N=%d, width=%f' % (C, N, width)
	for x in hist:
		print '%f %d' % (x, hist[x])
	


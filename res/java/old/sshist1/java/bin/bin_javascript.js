function Compute_CostFunction() {
	CostFunctionArray(DATA,BINS);
	alert("An optimal bin size of your data is "+OptimalBinSize().toPrecision(3)+".");
}

function OptimalBinSize() {
	var C_MIN = C[1];
	var IDX; 
	for (var i in C) {
		C_MIN = Math.min(C_MIN,C[i]);
		if (C_MIN == C[i]) {
			IDX = i;
		}
	}
	return BINS[IDX];
}

function CostFunctionArray(DATA,BINS) {	
	for (var i = 0; i < BIN_DIV; i++) {
		C[i] = CostFunction(DATA,BINS[i]);
	}
	
	return C;
}

function CostFunction(DATA,BIN) {
	var K = EventCount(DATA,BIN);	
	
	var Kbar = 0;
	for (var i in K) { Kbar += K[i] }
	Kbar = Kbar / K.length;

	var S2 = 0;
	for (var i in K) { S2 += Math.pow(K[i] - Kbar, 2); }
	S2 = S2 / (K.length-1);
	
	var c;
	c = (2*Kbar - S2)/ Math.pow(BIN.2);
	return c;
}

function EventCount(DATA,BIN) {
	var BINNUM = Math.floor((DATA_MAX - DATA_MIN)/BIN );
	
	var K = new Array(BINNUM);
	for(var i = 0; i < BINNUM; i++) {
		K[i] = 0;
		for (var j in DATA) {
			if ( DATA[j]>=BIN*i && DATA[j]<BIN*(i+1) ) {
				K[i] = K[i] + 1;
			}
		}
	}
	return K;
}
// JavaScript Document


<script type="text/javascript">
<!--

var DATA;
var DATATEXT;

function input() {
	DATATEXT = document.DATAFORM.TEXT.value;	// Read texts in a form.		
												// Replace a space with a comma.
	
	var DATASTR1;								// DATASTR is an string array.
	DATASTR1 = DATATEXT.split(/,{1,}|:{1,}|;{1,}|\s{1,}/);			// a{1,}: Match for a, aa, aaa, aaaa
	
	//var regexp = new RegExp(",{1,}|:{1,}|;{1,}|\s{1,}|\cx{1,}", "g");
	//DATASTR = DATATEXT.split(regexp);
	
	alert(DATASTR1);

	DATA = new Array(DATASTR1.length);			// 
	for (i in DATASTR1) {
		DATA[i] = parseFloat(DATASTR1[i]);			// Conversion from text to float.
		//document.writeln(DATA[i]);
	}
	//alert(DATASTR1.length);
	//alert(DATA);
	
	var K = EventCount(DATA,2);
	alert(K)
	
	alert(CostFunction(K,2));
	
	//alert(CostFunctionArray(K));
	document.writeln(CostFunctionArray(DATA));
}

function CostFunctionArray(DATA) {
	var BIN_MIN = 0.1;
	var BIN_MAX = 3;
	var BIN_DIV = 10;
	var BINS = new Array(BIN_DIV);
	var C = new Array(BIN_DIV);
	
	for (var i = 0; i < BIN_DIV; i++) {
		BINS[i] = BIN_MIN + (BIN_MAX - BIN_MIN) / BIN_DIV * i;
		
		var K = EventCount(DATA,BINS[i]);	
		C[i] = CostFunction(K,BINS[i]);
	}
	return C;
}

function CostFunction(K,BIN) {
	var Kbar = 0;
	for (var i in K) { Kbar += K[i] }
	Kbar = Kbar / K.length;

	var S2 = 0;
	for (var i in K) { S2 += Math.pow(K[i] - Kbar, 2); }
	S2 = S2 / (K.length-1);
	
	var c;
	c = (2*Kbar - S2)/BIN;
	return c;
}

function EventCount(DATA,BIN) {
	var DATA_MIN = 0;
	var DATA_MAX = 8;
	BINNUM = Math.floor((DATA_MAX - DATA_MIN)/BIN );
	
	var K = new Array(BINNUM);
	for(var i = 0; i < BINNUM; i++) {
		K[i] = 0;
		for (j in DATA) {
			if ( DATA[j]>=BIN*i && DATA[j]<BIN*(i+1) ) {
				K[i] = K[i] + 1;
			}
		}
	}
	return K;
}

function output() {
	document.open();
	for (i in DATA) {
		document.writeln(DATA);
	}
	document.close();
}

function startJSFractal() {
	//document.open();
	//document.Form.BinSelection.re();
	document.Form.BinSelection.InitializePrameters(DATA);
	var K;
	K = document.Form.BinSelection.EventCount(2,0,8);
	alert(K);
	
	var C;
	C = document.Form.BinSelection.CostFunction();
	alert(C);
	//alert(document.Form.BinSelection.test());
	
	//document.close();
}
//-->
</script>

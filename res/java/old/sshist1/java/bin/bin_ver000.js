// JavaScript Document
// 2006 Hideaki Shimazaki

//var DATA;
var DATATEXT;

var BIN_MIN = 0.01;
var BIN_MAX = 1;
var BIN_DIV = 20;
var BINS;
var BINS_LEN;
var BIN_OPT;

var DATA;
var DATA_MIN;
var DATA_MAX;
var DATA_N;
var DATA_LEN;

var C;
var K;

function Initialize_Parameters() {		//Find parameters form the posted data.
	DATA = PostData();
	DATA_MIN = DATA[1];
	DATA_MAX = DATA[1];
	for (i in DATA) {
		DATA_MIN = Math.min(DATA_MIN, DATA[i]);
		DATA_MAX = Math.max(DATA_MAX, DATA[i]);
	}
	document.PARAMETERS.BIN_MIN.value = (DATA_MAX-DATA_MIN)/200;
	document.PARAMETERS.BIN_MAX.value = (DATA_MAX-DATA_MIN)/4;
	
	document.PARAMETERS.DATA_MIN.value = DATA_MIN;
	document.PARAMETERS.DATA_MAX.value = DATA_MAX;
	
	document.PARAMETERS.DATA_N.value = 1;
}

function Default_Parameters() {
	document.PARAMETERS.BIN_MIN.value = 0.01;
	document.PARAMETERS.BIN_MAX.value = 1;
	
	document.PARAMETERS.DATA_MIN.value = 0;
	document.PARAMETERS.DATA_MAX.value = 1;
	
	document.PARAMETERS.DATA_DIV.value = 20;
}


//
function PostData() {
	DATA_TEXT = document.DATAFORM.TEXT.value;	// Read texts in a form.		
	
	var DATA_STR;								// DATASTR is an string array.
	DATA_STR = DATA_TEXT.split(/,{1,}|:{1,}|;{1,}|\s{1,}/);			// a{1,}: Match for a, aa, aaa, aaaa
	
	//var regexp = new RegExp(",{1,}|:{1,}|;{1,}|\s{1,}|\cx{1,}", "g");
	//DATASTR = DATATEXT.split(regexp);
	
	
	// Eliminate NaN
	var DATA_BUF = new Array(DATA_STR.length);			
	var I = 0;
	for (var i in DATA_STR) {
		DATA_BUF[i] =  parseFloat(DATA_STR[i]);		// Conversion from text to float.
		if (!isNaN(DATA_BUF[i])) {
			I = I + 1;								//I: Number of Numerals.
		}
	}
	
	DATA = new Array(I);
	var j = 0;
	for (var i = 0; i < DATA_BUF.length; i++) {
		if (!isNaN(DATA_BUF[i])) {
			DATA[j] =  parseFloat(DATA_STR[i]);		// Conversion from text to float.
			j = j + 1;
		}
			
	}
	return DATA;
}

function Set_Parameters() {
	DATA = PostData();
	BIN_MIN = parseFloat(document.PARAMETERS.BIN_MIN.value);
	BIN_MAX = parseFloat(document.PARAMETERS.BIN_MAX.value);
	BIN_DIV = parseFloat(document.PARAMETERS.BIN_DIV.value);

	DATA_MIN = document.PARAMETERS.DATA_MIN.value;
	DATA_MAX = document.PARAMETERS.DATA_MAX.value;
	DATA_N = parseInt(document.PARAMETERS.DATA_N.value);
	DATA_LEN = DATA.length;
	
	BINS = new Array(BIN_DIV);
	for (var i = 0; i < BINS.length; i++) {
		BINS[i] = BIN_MIN + (BIN_MAX - BIN_MIN) / BIN_DIV * i;
	}
	BINS_LEN = BINS.length;
	
	C = new Array(BIN_DIV);
	K = new Array(BINS_LEN);
}

function BinSelectionApplet() { // Call Java Functions
	// Initialization of Parameters in Java Applet
	Set_Parameters();
	document.BinSelection.InitParam(DATA_N,DATA_LEN,BINS_LEN,DATA_MAX,DATA_MIN);
	for (i in DATA) {
		document.BinSelection.InputDATA(i,DATA[i]);
	}
	for (i in BINS) {
		document.BinSelection.InputBINS(i,BINS[i]);
	}
	
	
	// Compute Cost Function in Java Applet
	document.BinSelection.CostFunctionArray();
	for (i in BINS) {
		C[i] = document.BinSelection.OutputC(i);
	}
	
	// Select an Optimal Bin Size
	//BIN_OPT = document.BinSelection.OptimalBinSize();//alert(BIN_OPT);	
	
	
	document.BinSelection.CostFunction(BIN_OPT);
	for (var i = 0; i < BINS_LEN; i++) {
		K[i] = document.BinSelection.OutputK(i);
	}
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

function StartApplet() {
	document.DrawCostFunction.Positions();
	document.DrawHistogram.OptimalHistogram();
}

function Results_In_Window() {
	WIN_RESULTS = window.open();
	//WIN_RESULTS.window.resizeTo(700,800);
	WIN_RESULTS.document.open();
	WIN_RESULTS.document.writeln("For the details of the method, please refer to<br>Shimazaki H. and Shinomoto S., A method for selecting the bin size of a time histogram, <em>Neural Computation</em><br><br>Please Copy&amp;Paste the results.<br><br>");
	WIN_RESULTS.document.writeln("Total Number of Sequences: "+DATA_N+"<br><br>");
	WIN_RESULTS.document.writeln("Optimal Bin Size: "+BIN_OPT.toPrecision(5)+"<br><br>");
	
	
	WIN_RESULTS.document.writeln("<table width=300>");
	WIN_RESULTS.document.writeln("<tr><td>BIN SIZE</td> <td>COST</td>");
	for (i in BINS) {
		WIN_RESULTS.document.writeln("<tr><td>"+BINS[i].toPrecision(3)+"</td>");
		WIN_RESULTS.document.writeln("<td>"+C[i].toPrecision(3)+"</td></tr>");
	}
	WIN_RESULTS.document.writeln("</table><br>");
	WIN_RESULTS.document.writeln("Posted Data <hr>"+DATA+"<hr><br>");
	WIN_RESULTS.document.writeln("&copy; 2006 Hideaki Shimazaki All rights reserved.");
	WIN_RESULTS.document.close();
}
// JavaScript Document
// 2006 Hideaki Shimazaki

var BIN_MIN = 0.01;
var BIN_MAX = 1;
var NS_LEN;
var BINS;
var BINS_LEN;
var BIN_OPT;

var DATA;
var DATA_MIN;
var DATA_MAX;
var DATA_LEN;

var C;
var K_OPT;
var EDGE_OPT;

function PostData() {
	DATA_TEXT = document.DATAFORM.TEXT.value;	// Read texts in a form.		
	
	var DATA_STR;								// DATASTR is an string array.
	DATA_STR = DATA_TEXT.split(/,{1,}|:{1,}|;{1,}|\s{1,}/);			// a{1,}: Match for a, aa, aaa, aaaa
	
	// Eliminate NaN
	var DATA_BUF = new Array(DATA_STR.length);			
	var I = 0;
	for (var i in DATA_STR) {
		DATA_BUF[i] =  parseFloat(DATA_STR[i]);		// Conversion from text to float.
		if (!isNaN(DATA_BUF[i])) {
			I = I + 1;								//I: Number of Numerals.
		}
	}
	
	DATA_BUF2 = new Array(I);
	var j = 0;
	for (var i = 0; i < DATA_BUF.length; i++) {
		if (!isNaN(DATA_BUF[i])) {
			DATA_BUF2[j] =  parseFloat(DATA_STR[i]);		// Conversion from text to float.
			j = j + 1;
		}
			
	}
	DATA = new Array(DATA_BUF2.length);
	DATA = DATA_BUF2.sort(SortSet);
	return DATA;
}

function SortSet(a,b){return a - b}


function Initialize_Parameters() {		//Find parameters form the posted data.
	DATA_LEN = DATA.length;
	
	DATA_MIN = DATA[1];
	DATA_MAX = DATA[1];
	
	for (i in DATA) {
		DATA_MIN = Math.min(DATA_MIN, DATA[i]);
		DATA_MAX = Math.max(DATA_MAX, DATA[i]);
	}
		
	var diff = DATA_MAX-DATA_MIN;
	var diff_buf;
	for (var i = 0; i < DATA.length -1 ; i++) {
		diff_buf = DATA[i+1]-DATA[i];
		if (diff_buf != 0) {
			diff=Math.min(diff,diff_buf);
		}
	}
	
	//BIN_MIN= diff.toPrecision(6)*2;
	//BIN_MAX = (DATA_MAX-DATA_MIN)/2;


	NS_LEN = 200;

	NS = new Array(NS_LEN);
	for (var i = 0; i < NS_LEN; i++) {
		 NS[i] = NS_LEN+1 - i;
	}

	BINS = new Array(NS_LEN);
	for (var i = 0; i < BINS.length; i++) {
		BINS[i] = (DATA_MAX - DATA_MIN) / NS[i];
	}
	BIN_MIN= BINS[1];
	BIN_MAX = BINS[BINS.length];
	
	C = new Array(NS_LEN);
}


function SetParameters() {
	NS_LEN = 200;
	
}

function BinSelectionApplet() { // Call Java Functions
	// Initialization of Parameters in Java Applet
	document.BinSelection.InitParam(DATA_LEN,NS_LEN,DATA_MAX,DATA_MIN);
	for (i in DATA) {
		document.BinSelection.InputDATA(i,DATA[i]);
	}
	for (i in BINS) {
		document.BinSelection.InputBINS(i,BINS[i]);
		document.BinSelection.InputNS(i,NS[i]);
	}
		
	// Compute Cost Function in Java Applet
	document.BinSelection.CostFunctionArray();
	for (i in BINS) {
		C[i] = document.BinSelection.OutputC(i);
	}
		
	// Select an Optimal Bin Size
	var IDX = document.BinSelection.OptimalBinSize();
	BIN_OPT = BINS[IDX];
	N_OPT = NS[IDX];

	K_OPT = new Array(N_OPT);
	EDGE_OPT = new Array(N_OPT+1); 
	for (var i = 0; i< K_OPT.length; i++) {
		K_OPT[i] = document.BinSelection.OutputK(i,N_OPT);
		EDGE_OPT[i] = DATA_MIN + BIN_OPT*i;
	}
	EDGE_OPT[i+1] = DATA_MAX;
}

function StartApplet() {
	//document.DrawCostFunction.Positions();
	document.DrawHistogram.OptimalHistogram(BIN_OPT,N_OPT);
}

function Results_In_Window() {
	WIN_RESULTS = window.open();
	//WIN_RESULTS.window.resizeTo(700,800);
	WIN_RESULTS.document.open();
	//WIN_RESULTS.document.writeln("<html><head><title>Data Sheet of the Optimized Histogram</title>");
	//WIN_RESULTS.document.writeln("<script src=http://www.google-analytics.com/urchin.js type=text/javascript></script><script type=text/javascript> _uacct=UA-745872-1; urchinTracker();	</script></head><body>");																																					
	WIN_RESULTS.document.writeln("<blockquote>&copy; 2006 2007 Hideaki Shimazaki<br><br>");
	WIN_RESULTS.document.writeln("<h2>Data Sheet of Your Optimized Histogram</h2>");
	WIN_RESULTS.document.writeln("For the details of the method, please refer to<br>Shimazaki H. and Shinomoto S., A method for selecting the bin size of a time histogram, <em>Neural Computation</em>, Vol.19, No.6, Pages 1503-1527, 2007 <a href=../ton/pdf/shimazaki_neco07.pdf onclick=javascript:urchinTracker ('/downloads/sshistogram.pdf');><img src=icons/pdf.jpg width=16 height=16 border=0 align=absbottom /></a> <br><br>");
	WIN_RESULTS.document.writeln("<font color=#FF0000>Optimal Bin Size: <b>"+BIN_OPT.toPrecision(6)+"</b></font><br><br>");
	WIN_RESULTS.document.writeln("<font color=#FF0000>Optimal Number of Bins: <b>"+N_OPT+"</b></font><br><br>");
	// Event Counts 
	WIN_RESULTS.document.writeln("<h3>Data of the optimized histogram</h3><hr><table width=600 ><tr align=right><td width=150>BIN EDGES</td> <td width=150>FREQUENCY</td> <td width=150>RATE</td> <td width=150>PROBABILITY</td> ");
	LEN_OPT = 0; for (i in K_OPT) {LEN_OPT = LEN_OPT+K_OPT[i];}
	for (i in K_OPT) {
		WIN_RESULTS.document.writeln("<tr align=right><td width=150>"+EDGE_OPT[i].toPrecision(6)+"</td>");
		WIN_RESULTS.document.writeln("<td width=150>"+K_OPT[i]+"</td>");
		RATE = K_OPT[i]/BIN_OPT;
		WIN_RESULTS.document.writeln("<td width=150>"+RATE.toPrecision(6)+"</td>");
		PROB = K_OPT[i]/LEN_OPT;
		WIN_RESULTS.document.writeln("<td width=150>"+PROB.toPrecision(6)+"</td></tr>");
	}
	WIN_RESULTS.document.writeln("<tr align=right><td width=150>"+EDGE_OPT[K_OPT.length+1].toPrecision(6)+"</td>");
	WIN_RESULTS.document.writeln("<td width=150></td><td width=150></td></tr>");
	WIN_RESULTS.document.writeln("</table><br>");
	// Cost Function
	WIN_RESULTS.document.writeln("<h3>Bin Size v.s. the Cost function</h3>");
	WIN_RESULTS.document.writeln("The cost function indicates how close a histogram is to the unknown true function.<hr>");
	WIN_RESULTS.document.writeln("<table width=300><tr align=right><td width=150>BIN SIZE</td> <td width=150>COST</td>");
	for (i in BINS) {
		WIN_RESULTS.document.writeln("<tr align=right><td width=150>"+BINS[i].toPrecision(3)+"</td>");
		WIN_RESULTS.document.writeln("<td width=150>"+C[i].toPrecision(3)+"</td></tr>");
	}
	WIN_RESULTS.document.writeln("</table><br>");
	// Posted Data
	//WIN_RESULTS.document.writeln("<h3>Posted Data</h3>");
	//WIN_RESULTS.document.writeln("<hr><table width=150>");
	//for (i in DATA) {
	//	WIN_RESULTS.document.writeln("<tr align=right><td width=150>"+DATA[i]+"</td>");
	//}
	//WIN_RESULTS.document.writeln("</table>");
	//WIN_RESULTS.document.writeln("<hr><br></blockquote></body></html>");
	WIN_RESULTS.document.close();
}
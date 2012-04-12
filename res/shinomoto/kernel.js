// JavaScript Document
//<!-- Web Application of Kernel Bandwidth Optimization -->
//<!-- 2009 Hideaki Shimazaki All rights reserved -->

var DATA;
var DATA_MIN;
var DATA_MAX;
var W;
var C;
var N;
var K = 200; 

var optw;
var opty;
var t;

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
	
	
	DATA_MIN = DATA[1];
	DATA_MAX = DATA[1];
	
	for (i in DATA) {
		DATA_MIN = Math.min(DATA_MIN, DATA[i]);
		DATA_MAX = Math.max(DATA_MAX, DATA[i]);
	}
		
	return DATA;
}

function SortSet(a,b){return a - b}


function raster(x){
	var raster = document.getElementById('Raster');
    if (raster.getContext){
    	var ctx = raster.getContext('2d');
		
		for (var i in x) {
			var X = Math.round(500*(x[i]-DATA_MIN)/(DATA_MAX-DATA_MIN));
			strokeStyle = "rgb(100,100,100)";
			ctx.strokeRect(X,0,1,20);
		}
	}
}
	
	function density() {
		optw = SearchMinimum();
		opty = kernel(optw); 
    	
		var canvas = document.getElementById('Canvas');
        if (canvas.getContext){
      		var ctx = canvas.getContext('2d');

			ctx.clearRect(0,0,500,300); 
			ctx.beginPath();
			ctx.moveTo(0,300);
			for (var i = 0;i<K;i++) {
				PointX = Math.round(i*500/(K-1));
				PointY = 300-Math.round(300*opty[i]/(1.2*Max(opty)));
				ctx.lineTo(PointX, PointY);
			}
			ctx.lineTo(500,300);
			ctx.fillStyle = "rgb(255,165,0)";
			ctx.fill();
			ctx.stroke();
			
			//ctx.fillStyle = '#000';
			//ctx.font = '14px sans-serif';
			//ctx.strokeText('The optimized bandwidth= '+optw.toPrecision(3), 270, 15);
			
		}
		//var img = canvas.toDataURL(); 
		//return img;
 	}
	
	function xaxis() {
		var x = new Array(K)
		x[0] = DATA_MIN;
		for (var i=0; i<K; i++) {
			x[i+1] = x[i] + (DATA_MAX-DATA_MIN)/(K-1); 
		}
		return x;
	}
	
	function kernel(w) {
		var x = xaxis(); 
		var y = new Array(K);
		
		for (var i=0; i<K; i++) {
			y[i] = 0;
			for (var j in DATA) {
				y[i] = y[i] + Gauss(x[i]-DATA[j],w) / DATA.length;
			}
		}
		return y;
	}
	
	function SearchMinimum(){
		//var W = new Array(50);
		W = new Array(50);
		C = new Array(W.length);
		for (var i=0; i<W.length; i++) {
			W[i] = (DATA_MAX - DATA_MIN) / (i+1);
			C[i] = Cost(W[i]);
		}
		
		var C_MIN = Min(C);	
		var IDX = Min_Idx(C); 
		var w = W[IDX];
		
		return w;
	}
	
	function Cost(w) {
		N = DATA.length;	
		var A = 0; 
		for (var i=0; i<N; i++) {
			for (var j=i+1; j<N; j++) {
				var x = DATA[i]-DATA[j];
				if (x < 5*w) {
					A = A + 2*Math.exp(-x*x/4/w/w) - 4*Math.sqrt(2)*Math.exp(-x*x/2/w/w);
				}
			}
		}
		return (N/w + A/w) / 2 / Math.sqrt(Math.PI);
	}
	
	function Gauss(x,w) {
		return 1/Math.sqrt(2*Math.PI)/w*Math.exp(-x*x/2/w/w);
	}
	
	function Max(x) {
		var x_MAX = x[0];
		for (var i in x) {
			x_MAX = Math.max(x_MAX, x[i]);
		}
		return x_MAX;
	}
	function Min(x) {
		var x_MIN = x[0];
		for (var i in x) {
			x_MIN = Math.min(x_MIN, x[i]);
		}
		return x_MIN;
	}
	
	function Min_Idx(x) {
		var x_MIN = x[0];
		var j = 0;
		for (var i in x) {
			if ( x[i] < x_MIN) {
				x_MIN = x[i];
				j = i;
			}
			
		}
		return j;
	}

function Results_In_Window() {
	WIN_RESULTS = window.open();
	WIN_RESULTS.document.open();
	WIN_RESULTS.document.writeln("<title>Data Sheet of the Optimized Histogram</title>");																																				
	WIN_RESULTS.document.writeln("<blockquote>&copy; 2009 Hideaki Shimazaki<br><br>");
	WIN_RESULTS.document.writeln("<h2>Data Sheet of Your Optimized Kernel Density Estimation</h2>");
	WIN_RESULTS.document.writeln("For the details of the method, please refer to<br>Shimazaki H. and Shinomoto S., Kernel Bandwidth Optimization in Spike Rate Estimation, <em>Journal of Computational Neuroscience</em>, Vol.29, Pages 171-182., 2010 <a href=http://www.springerlink.com/content/g22785288648l239/fulltext.pdf target=_blank  onclick=javascript:urchinTracker ('/downloads/sskernel.pdf');><img src=../tmp/icons/pdf.jpg width=16 height=16 border=0 align=absbottom /></a> <br><br>");
	WIN_RESULTS.document.writeln("<font color=#FF0000>Optimal Bandwidth: <b>"+optw.toPrecision(6)+"</b></font><br><br>");
	WIN_RESULTS.document.writeln("<h3>Data of the optimized kernel density estimate</h3><hr><table width=300><tr align=right><td width=150> X-AXIS </td> <td width=150> DENSITY </td>");
	for (i in opty) {
		WIN_RESULTS.document.writeln("<tr align=right><td>"+t[i].toPrecision(5)+"</td><td width=150>"+opty[i].toPrecision(5)+"</td>");
	}
	WIN_RESULTS.document.writeln("</table><br>");
	WIN_RESULTS.document.writeln("<h3>Cost Function</h3><hr><table width=300><tr align=right><td width=150> Bandwidth </td> <td width=150> Cost </td>");
	for (i in C) {
		WIN_RESULTS.document.writeln("<tr align=right><td>"+W[i].toPrecision(5)+"</td><td width=150>"+C[i].toPrecision(5)+"</td>");
	}
	WIN_RESULTS.document.writeln("</table><br>");
	WIN_RESULTS.document.writeln("</blockquote>");
	WIN_RESULTS.document.close();
}

//<!-- End of Web Application of Kernel Bandwidth Optimization -->
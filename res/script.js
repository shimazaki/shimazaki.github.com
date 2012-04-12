// JavaScript Document
// 2008 Hideaki Shimazaki, Ph.D. 
// 

<!--

var DATA;
var DATA_MIN;
var DATA_MAX;
var C;
var N;


// Data Acquisition
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

// Spike Generation

function PointProcess_Renewal() {
	var x = new Array(30);
	x[0] = 0;
	for (var i = 1;  i < 30; i++) {
		x[i] = x[i-1] + isi();
	}
	return x;
}

function isi() {
	//Initialize parameters
	var k = 3;
	var z = 0; var P = 0; var R = 0; var t = 0;
	var dt = 0.001;
	var y = 1;
	
	var yb = y;
	var pb = 0;//y*invGauss(0,k);
	var rb = 0;
	
	var eta = - Math.log(Math.random());
	
	while (eta > R) {
		z = z + (yb + y)/2 *dt;
		yb = y;
		
		//p = y * Math.exp(-z);
		//p = y * invGauss(z,k);
		p = y * Gamma(z,k);
		
		p = y * (z,k);
		
		P = P + (1/2*pb + 1/2*p)*dt;
		pb = p;
		
		r = p / (1-P);
		R = R + (rb + r)/2*dt;
		rb = r;
		
		t = t + dt;
		if (t>100) {break}
	}
		
	return t;
}

	
// Optimization Algorithms
function kernel(w) {
	var y = new Array(100);
	var x = DATA_MIN-(DATA_MAX-DATA_MIN)/99;
	for (var i=0; i<100; i++) {
		x = x + (DATA_MAX-DATA_MIN)/99; 
		y[i] = 0;
		for (var j in DATA) {
			y[i] = y[i] + Gauss(x-DATA[j],w);
		}
	}
	return y;
}
	
function Cost(w) {
	N = DATA.length;	
	var A = 0; 
	for (var i=0; i<N; i++) {
		for (var j=i+1; j<N; j++) {
			var x = DATA[i]-DATA[j];
			A = A + 4*Math.sqrt(2)*Math.exp(-x*x/2/w/w)-2*Math.exp(-x*x/4/w/w);
		}
	}
	return (N/w - A/w);
}
	

// Visualization
function raster(x){
	var raster = document.getElementById('Raster');
    if (raster.getContext){
   		var ctx = raster.getContext('2d');
		ctx.clearRect(0,0,1000,1000);
		
		var x_min = Min(x);
		var x_max = Max(x); 
		for (var i in x) {
			var X = Math.round(500*(x[i]-x_min)/(x_max-x_min));
			strokeStyle = "rgb(60,60,60)";
			ctx.strokeRect(X,0,0.1,20);
		}
	}
}
	
function density(x){
   	var canvas = document.getElementById('Canvas');
    if (canvas.getContext){
	   	var ctx = canvas.getContext('2d');

		var W = new Array(50);
		C = new Array(W.length);
		for (var i=0; i<W.length; i++) {
			W[i] = (DATA_MAX - DATA_MIN) / (i+1);
			C[i] = Cost(W[i]);
		}
		
		var C_MIN = Min(C);	
		var IDX = Min_Idx(C); 
		var w = W[IDX]
		alert("The optimal width is "  + W[IDX].toPrecision(3));
		
		var y = new Array(100);
		y = kernel(w);

		ctx.beginPath();
		ctx.moveTo(0,300);
		for (var i = 0;i<100;i++) {
			PointX = Math.round(i*500/99);
			PointY = 300-Math.round(300*y[i]/(1.2*Max(y)));
			ctx.lineTo(PointX, PointY);
		}
		ctx.lineTo(500,300);
		ctx.fillStyle = "rgb(255,165,0)";
		ctx.fill();
		ctx.stroke();
	}
}
	


// Basic Operations	
function SortSet(a,b){return a - b}

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

// Basic Mathmatical Functions
function Gauss(x,w) {
	return 1/Math.sqrt(2*Math.PI)/w*Math.exp(-x*x/2/w/w);
}
	
function invGauss(x,k) {
	return Math.sqrt( k / (2*Math.PI*Math.pow(x,3)) ) * Math.exp(-k/2/x * Math.pow(x-1,2));
}
	
function Gamma(x,k) { 
	return 1/GammaFunc(k) * k * Math.pow(k*x,k-1) * Math.exp(-k*x);
}

function GammaFunc(z) {
	// Lanczos approximation
	var p = new Array(1.000000000190015,76.18009172947146,-86.50532032941677,24.01409824093091,
					  -1.231739572450155,0.1208650973866179E-2,-0.5395239384953E-5);
	var sum = p[0];
	for (var i=1; i<7; i++) {
		sum = sum + p[i] / (z + i);
	}
	return Math.sqrt(2*Math.PI)/z*sum * Math.pow(z+5.5,z+0.5)*Math.exp(-(z+5.5));
}

//-->
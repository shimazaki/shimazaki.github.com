// JavaScript Document
//<script type="text/javascript">
		
function binary_sequence(N) {
	var x = new Array(N);
	
	for (var i=0;i<N-1;i++) {
		x[i] = (Math.random() < 0.2);
	}
	return x;
}
	
function draw_circles_square(x){  
	var canvas = document.getElementById('Canvas');  
    if (canvas.getContext){  
    	var ctx = canvas.getContext('2d');
							
    	var R = 8;
        var N = x.length;
		var W = Math.sqrt(N);
		for (var i = 0; i < x.length; i++) {
 			ctx.beginPath();
			if (x[i]) {
				ctx.fillStyle = "rgb(0,0,0)";
			} else {
				ctx.fillStyle = "rgb(230,230,230)";
			}
                    
			var j = i%W;
			var k = Math.floor(i/W);
                    
			ctx.arc(R+ j*2*R, R+ k*2*R, R, 0, Math.PI*2, true); 
			ctx.closePath();
			ctx.fill();
		}
	}  
}
			
function draw_circles_line(x){  
	var canvas = document.getElementById('Canvas');  
	if (canvas.getContext){  
 		var ctx = canvas.getContext('2d');
							
		var R = 8;
		var N = x.length;
		var W = Math.sqrt(N);
		for (var i = 0; i < x.length; i++) {
			ctx.beginPath();
			if (x[i]) {
				ctx.fillStyle = "rgb(0,0,0)";
			} else {
 			ctx.fillStyle = "rgb(230,230,230)";
			}
			ctx.arc(R+ i*2*R, R, R, 0, Math.PI*2, true); 
			ctx.closePath();
 			ctx.fill();
		}
	}  
}
			
//</script>
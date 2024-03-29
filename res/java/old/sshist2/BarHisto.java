/*
 * BarHisto.java
 *
 * Created on December 13, 2005, 3:07 PM
 */

/**
 *
 * @author Hideaki Shimazaki
 */
import java.awt.*;
import java.applet.Applet;

public class BarHisto extends java.applet.Applet {
	/* 2006 Hideaki Shimazaki All rights reserved. 
	 * Department of Physics, Kyoto University
	 * Kyoto 606-8502, Japan
	 * email: shimazaki at jhu.edu
	 */
	
	// Parameter Settings    
    
    int		L = 1000;
    int		Ls;
    int		N = 25;
    
    double 	t[] = new double[L];			// Time
    double	y[] = new double[L];			// The underlying rate
    double	yh[] = new double[L];			// Estimated rate
    double 	y_max = 100;					// Max of spike rate
    
    int 	x[][] = new int[N][L];			// Spike Squences
    
    int 	AxisX = 300, AxisY = 100, OffSet = 10;
    int		Axis1_PointX = OffSet;
    int		Axis1_PointY = OffSet;
    int		Axis2_PointX = Axis1_PointX;
    int		Axis2_PointY = 2*OffSet+AxisY;
    
    int		xPoint[] = new int[L];
    int		yPoint[] = new int[L];
    int		yPoint2[] = new int[L];
    
    double 	dt = .001;						// Numerical step size
    double	Delta = .05;					// The bin width
    int 	D = (int)(Delta/dt);			// Number of columns for Delta
    double		K[] = new double[L];		// Spike count in dt
    double		k[];						// Spike count in the bin (D)
    double rand; 
    
    double	MISE = 0;						// Mean integrated squared error

	Image doubleBuffer;						// Double Buffering
	Graphics bg;
	
	// Panel Settings 
	Panel top = new Panel();
	Button btn = new Button("redraw");
	
	Checkbox rate = new Checkbox("Underlying Rate",true);
	Checkbox hist = new Checkbox("Histogram",true);
	Checkbox error = new Checkbox("Error ",false);
	
	Scrollbar scrl = new Scrollbar(Scrollbar.HORIZONTAL,D,20,8,350);
	Graphs graphcnvs = new Graphs();
    
    public void init() {
    	setBackground(Color.white);
    	
    	doubleBuffer = createImage(2*AxisX+2*OffSet,2*AxisY+2*OffSet);
    	bg = doubleBuffer.getGraphics();
    	bg.setColor(Color.black);
    	
    	setLayout(new FlowLayout());
    	top.add(hist);
    	top.add(rate);
    	top.add(error);
    	top.add(btn);
    	
    	setLayout(new BorderLayout());
    	add("North",top);
    	add("South",scrl);
    	add("Center",graphcnvs);
    	
		// Make Underlying Rate Process
    	for (int i=0; i<L; i++) {
    		t[i] = i*dt;
    		y[i] = 20*Math.sin(2*Math.PI*1.55*t[i]) + 15 + 15*t[i];
    		
    		xPoint[i] = Axis2_PointX + Math.round((float) ( (double)AxisX/(double)L * t[i]/dt ) );
    		yPoint[i] = Axis2_PointY + Math.round((float) ( AxisY - y[i]*AxisY/100) );
    	}

		// Make Poisson Point Processes
    	for (int i=0; i<L; i++) {
    		for (int j=0; j<N; j++) {
    			rand = Math.random();
    			if (rand < y[i]*dt) {
    					x[j][i] = 1;
    			} else {
    				x[j][i] = 0;
    			}
    		}
    	}

    	// Make Histogram with the smallest bin size (dt)
    	for (int i=0; i<L; i++) {
    			K[i] = 0;	
    	}
    	
    	for (int i=0; i<L; i++) {
    		for (int j=0; j<N; j++) {
    			K[i] += (double)x[j][i];
    		}
    	}
    	Histogram();							// Compute the spike count 
    }

    public void paint(Graphics g) {
    	//graphcnvs.repaint();
    }
    
	// Make 
    public void Histogram() {
    	// Make Histogram with the bin size Delta
    	Ls = (int)Math.floor((double)L/(double)D);	// Number of columns of the histogram
    	k = new double[Ls];
    	
    	// Initialize k[]
    	for (int i=0; i<Ls; i++) {
    			k[i] = 0;	
    	}
    	
    	for (int i=0; i<Ls; i++) {
    		for (int j=0; j<D; j++) {
				k[i] += K[i*D+j];
    		}
    	}
    	
    	for (int i=0; i<Ls; i++) {
    		for (int j=0; j<D; j++) {
				yh[i*D+j] = k[i]/N/Delta;
				yPoint2[i*D+j] = Axis2_PointY + Math.round((float) (AxisY - yh[i*D+j]*AxisY/y_max) );
				if (yh[i*D+j] > y_max) {
					yPoint2[i*D+j] = Axis2_PointY;//OffSet - AxisY + AxisY;
				}
    		}
    	}
    	
    	// Mean Integrated Squared Error
    	MISE = 0;
    	for (int i=0; i<Ls; i++) {
    		MISE += (y[i] - yh[i])*(y[i] - yh[i])*dt;
    	}
    	MISE = MISE/(L*dt);

    	// Make Cost Function
    	
    }
    
    // Schroll bar
    public boolean handleEvent(Event e) {
		if (e.target instanceof Scrollbar) {
			Scrollbar scr = (Scrollbar)e.target;
			//System.out.println("WIDTH" + scr.getValue());
			D = scr.getValue();			
			Delta = (double)D*dt;
			Histogram();
			graphcnvs.repaint();
			return true;
		}		
		return super.handleEvent(e);
    }

    // Button and Checkbox
    public boolean action(Event e, Object o) {
    	if(e.target instanceof Button) {
    		Histogram();
    		init();
    		graphcnvs.repaint();
    	} else if (e.target instanceof Checkbox) {
    		graphcnvs.repaint();
    	}
    	return true;
    }
 		
 	class Graphs extends Canvas {
		public void paint(Graphics g) {
 			update(g);
 		}
		
    	public void update(Graphics g) {
    	bg.clearRect(0, 0, 2*AxisX+2*OffSet, 2*AxisY+2*OffSet);
    		
    	// Legend
    	/*g.setColor(Color.black);
    	g.drawString("Underlying Rate",Axis2_PointX+AxisX-100,Axis2_PointY+OffSet+10);
    	g.setColor(Color.blue);
    	g.drawLine(OffSet+AxisX-130,Axis2_PointY+OffSet+5,Axis2_PointX+AxisX-110,Axis2_PointY+OffSet+5);
		*/
		
    	// Histogram
    	if (hist.getState()) {
    		bg.setColor(Color.red);
        	for (int i=0; i<L; i++) {
    			bg.drawLine(xPoint[i],Axis2_PointY+AxisY,xPoint[i],yPoint2[i]);
    		}
    	}
        
    	// Integrated Error
    	if (error.getState()) {
    		bg.setColor(Color.orange);
    		for (int i=0; i<L-1; i++) {
    			bg.drawLine(xPoint[i],yPoint[i],xPoint[i],yPoint2[i]);
    		}
    	}
    	
    	// Histogram Edge
    	if (hist.getState()) {
        	bg.setColor(Color.black);
       		for (int i=0; i<L-1; i++) {
    			bg.drawLine(xPoint[i],yPoint2[i],xPoint[i+1],yPoint2[i+1]);
    		}
    	}
    	
    	// Underlygin Rate Process
    	if (rate.getState()) {
    		bg.setColor(Color.blue);
    		for (int i=0; i<L-1; i++) {
    			bg.drawLine(xPoint[i],yPoint[i],xPoint[i+1],yPoint[i+1]);
    		}
    	}
		
    	// Raster Plot
    	bg.setColor(Color.black);
    	for (int i=0; i<L-1; i++) {
    		for (int j=0; j<N; j++) {
    			if (x[j][i] == 1) {
    				bg.drawLine(xPoint[i],Axis1_PointY+1+4*j,xPoint[i],Axis1_PointY+1+4*j+2*x[j][i]);
    			}
    		}
    	}   
    	
    	// Axis
    	bg.setColor(Color.black);
    	bg.drawRect(Axis1_PointX,Axis1_PointY,AxisX,AxisY);
    	bg.drawRect(Axis2_PointX,Axis2_PointY,AxisX,AxisY);
    	
    	g.drawImage(doubleBuffer,0,0,this);
    	}
	}
}

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

public class CostFunction extends java.applet.Applet {
	
	// Parameter Settings    
    
    int		L = 2000;
    int		Ls;								// Number of columns of histogram
    int		N = 25;
    
    double 	t[] = new double[L];			// Time
    double	y[] = new double[L];			// The underlying rate
    double	yh[] = new double[L];			// Estimated rate
    double 	y_max = 100;					// Max of spike rate
    
    int 	x[][] = new int[N][L];			// Spike Squences
    
    int 	AxisX = 300, AxisY = 100, OffSet = 10;
    int		AxisX2 = 300, AxisY2 = 300;
    int		Axis1_PointX = OffSet;
    int		Axis1_PointY = OffSet;
    int		Axis2_PointX = Axis1_PointX;
    int		Axis2_PointY = OffSet+AxisY+Axis1_PointY;
    int		Axis3_PointX = Axis1_PointX;
    int		Axis3_PointY = OffSet+AxisY+Axis2_PointY;
    
    int		xPoint[] = new int[L];
    int		yPoint[] = new int[L];
    int		yPoint2[] = new int[L];
    int		yPoint3[] = new int[AxisX2];
    int		yPoint4[] = new int[AxisX2];
    
    double 	dt = .001;						// Numerical step size
    double	Delta = .05;					// The bin width
    int 	D = (int)(Delta/dt);			// Number of columns for Delta
    double	K[] = new double[L];			// Spike count in dt
    double	k[];							// Spike count in the bin (D)
    double	rand; 	
    
    double	C[] = new double[AxisX];
    double	Ch[] = new double[AxisX];
    int optD;

	// Panel Settings 
	Panel top = new Panel();
	Button btn = new Button("redraw");
	
	Checkbox rate = new Checkbox("Theoretical",true);
	Checkbox hist = new Checkbox("Empirical",true);
	Checkbox error = new Checkbox("Error ",false);
	
	Scrollbar scrl = new Scrollbar(Scrollbar.HORIZONTAL,D,10,4,300);
	Graphs graphcnvs = new Graphs();
    
    public void init() {
    	setBackground(Color.white);
    	
    	setLayout(new FlowLayout());
    	top.add(hist); top.add(rate); top.add(error);
    	top.add(btn);
    	
    	setLayout(new BorderLayout());
    	add("North",top);
    	add("South",scrl);
    	add("Center",graphcnvs);
    	
		// Make Underlying Rate Process
    	for (int i=0; i<L; i++) {
    		t[i] = i*dt;
    		y[i] = 30*Math.sin(2*Math.PI*1.5*t[i]) + 30 + 0*t[i];
    		
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
    	
    	ThereticalCostFunction();
    	optD = EmpiricalCostFunction();
		
		D = optD;
    	Histogram();							// Compute the spike count 
    	graphcnvs.repaint();
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
				yh[i*D+j] = k[i]/N/(D*dt);
				yPoint2[i*D+j] = Axis2_PointY + Math.round((float) (AxisY - yh[i*D+j]*AxisY/y_max) );
				if (yh[i*D+j] > y_max) {
					yPoint2[i*D+j] = Axis2_PointY;//OffSet - AxisY + AxisY;
				}
    		}
    	}
    }

   	public int Index_Max(int x[]) {
   		double	max_x = 0;
   		int		idx = 0;
   		for (int i=0 ; i<x.length; i++) {
   			max_x = Math.max(max_x,x[i]);
   			if (max_x == x[i]) {
   				idx = i;
   			}
   		}
   		return idx;
   	}
   	
    public int ThereticalCostFunction() {
   		for (int i=0; i<AxisX2; i++) {
    		D = i+1;
    		Delta = (double)D*dt;
    		Histogram();
    		
    		double mu=0, s2=0; 
    		for (int j=0; j<L; j++) {
    			mu += y[j]*dt;
    		}
    		mu = mu/(L*dt);
    		for (int j=0; j<L; j++) {
    			s2 += (y[j]-mu)*(y[j]-mu);
    		}
    		s2 = s2/(L-1);
    	
    		// Mean Integrated Squared Error
    		//double C = 0;
    		C[i] = 0;
    		for (int j=0; j<L; j++) {
    			C[i] += (y[j] - yh[j])*(y[j] - yh[j])*dt;
    		}
    		C[i] = C[i]/(L*dt);
    		C[i] = C[i] - s2;

    		yPoint3[i] = -Math.round((float)(C[i]));
    		if (yPoint3[i] < Axis3_PointY) {
    			yPoint3[i] = Axis3_PointY;
    		} else if (yPoint3[i] > Axis3_PointY + AxisY2) {
    			yPoint3[i] = Axis3_PointY + AxisY2;
    		}
   		}    
   		return Index_Max(yPoint3);
    }
   	
    public int EmpiricalCostFunction() {
    	for (int i=0; i<AxisX2; i++) {
    		D = i+1;
    		Delta = (double)D*dt;
    		Histogram();
    		double kbar = 0;
    		for (int j=0; j<Ls; j++) {
    			kbar += (double)k[j];
    		}
    		kbar = kbar/Ls;
    		double s2bar = 0;
    		for (int j=0; j<Ls; j++) {
    			s2bar += (k[j] - kbar)*(k[j] - kbar);
    		}
    		s2bar = s2bar/(Ls-1);
    		
    		//double Ch;
    		Ch[i] = (2*kbar-s2bar)/(N*(double)D*dt)/(N*(double)D*dt);

    		yPoint4[i] = -Math.round((float)(Ch[i]));
    		if (yPoint4[i] < Axis3_PointY) {
    			yPoint4[i] = Axis3_PointY;
    		} else if (yPoint4[i] > Axis3_PointY + AxisY2) {
    			yPoint4[i] = Axis3_PointY + AxisY2;
    		}
    	}
    	
    	return Index_Max(yPoint4);
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
    	//String label = o.toString();
    	if(e.target instanceof Button) {
    		if (e.arg == "redraw") {
    			init();
    			Histogram();
    			graphcnvs.repaint();
    		} 
    	} else if (e.target instanceof Checkbox) {
    		graphcnvs.repaint();
    	}
    	return true;
    }

 	class Graphs extends Canvas {
    	public void paint(Graphics g) {		
    	// Histogram
    	if (hist.getState()) {
    		g.setColor(Color.red);
        	for (int i=0; i<L; i++) {
    			g.drawLine(xPoint[i],Axis2_PointY+AxisY,xPoint[i],yPoint2[i]);
    		}
    	}
        
    	// Integrated Error
    	if (error.getState()) {
    		g.setColor(Color.orange);
    		for (int i=0; i<L-1; i++) {
    			g.drawLine(xPoint[i],yPoint[i],xPoint[i],yPoint2[i]);
    		}
    	}
    	
    	// Histogram Edge
    	if (hist.getState()) {
        	g.setColor(Color.black);
       		for (int i=0; i<L-1; i++) {
    			g.drawLine(xPoint[i],yPoint2[i],xPoint[i+1],yPoint2[i+1]);
    		}
    	}
    	
    	// Underlygin Rate Process
    	if (rate.getState()) {
    		g.setColor(Color.blue);
    		for (int i=0; i<L-1; i++) {
    			g.drawLine(xPoint[i],yPoint[i],xPoint[i+1],yPoint[i+1]);
    		}
    	}
		
    	// Raster Plot
    	g.setColor(Color.black);
    	for (int i=0; i<L-1; i++) {
    		for (int j=0; j<N; j++) {
    			if (x[j][i] == 1) {
    				g.drawLine(xPoint[i],Axis1_PointY+1+4*j,xPoint[i],Axis1_PointY+1+4*j+2*x[j][i]);
    			}
    		}
    	}

    	// Cost Function
    	if (rate.getState()) {
    		g.setColor(Color.blue);
    		for (int i=0; i<AxisX2-1; i++) {
    			g.drawLine(OffSet+i,yPoint3[i],OffSet+i+1,yPoint3[i+1]);
    		}
    	}
    	
    	// Empirical Cost Function
    	if (hist.getState()) {
    		g.setColor(Color.red);
    		for (int i=0; i<AxisX2-1; i++) {
    			g.drawRect(OffSet+i,yPoint4[i],2,2);
    		}
    		// Optimal Delta
    		g.setColor(Color.black);
    		g.fillOval(OffSet+optD-2,yPoint4[optD]-2,6,6);
    	}
    	
    	g.setColor(Color.orange);
    	g.drawLine(OffSet+D,Axis3_PointY,OffSet+D,Axis3_PointY+AxisY2);
    	
    	// Axis
    	g.setColor(Color.black);
    	g.drawRect(Axis1_PointX,Axis1_PointY,AxisX,AxisY);
    	g.drawRect(Axis2_PointX,Axis2_PointY,AxisX,AxisY);
    	g.drawRect(Axis3_PointX,Axis3_PointY,AxisX2,AxisY2);
    	}
	}
}
    // TODO overwrite start(), stop() and destroy() methods



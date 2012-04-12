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

public class DrawHistogram extends BinSelection {
	
	/* 2006 Hideaki Shimazaki All rights reserved. 
	 * Department of Physics, Kyoto University
	 * Kyoto 606-8502, Japan
	 * email: shimazaki at jhu.edu
	 */
	
	// Parameter Settings    
    double y[];
    float D;
    double bin; 
    int num;
    
    int AxisX;
    int AxisY;
    int OffsetX = 10;
    int OffsetY = 15;
    
    int xPoint[];
    int yPoint[];
    
	// Panel Settings 
	Panel top = new Panel();
	Scrollbar scrl;
	Graphs graphcnvs;
	
	Image doubleBuffer;
	Graphics bg;
    
    public void init() {
   	 	// Layout 
    	scrl = new Scrollbar(Scrollbar.HORIZONTAL,50,1,1,200);
    	graphcnvs = new Graphs();
    	setBackground(Color.white);
    	
    	//setLayout(new FlowLayout());
    	
    	setLayout(new BorderLayout());
    	//add("North",top);
    	add("South",scrl);
    	add("Center",graphcnvs);
    	
    	//D = Math.round(100*(BIN_OPT-BIN_MIN)/(BIN_MAX-BIN_MIN));
    	
    	Dimension size = getSize();
    	AxisX = size.width - 2*OffsetX -2;
    	AxisY = size.height - 4*OffsetY -2;
    	
    	xPoint = new int [AxisX];
    	yPoint = new int [AxisX];
    	
    	for (int i = 0; i < AxisX; i++) {
    		xPoint[i] = OffsetX+i;
    		yPoint[i] = OffsetY+AxisY;
    	}
    	
    	doubleBuffer = createImage(AxisX+OffsetX+1,AxisY+2*OffsetY+1);
    	bg = doubleBuffer.getGraphics();
    	bg.setColor(Color.black);
    }
    
    public void start() {
    	graphcnvs.repaint();
    }

    public void OptimalHistogram(double BIN_OPT, int N_OPT) {
    	bin = BIN_OPT;
    	num = N_OPT;
    	Histogram();
    }
    
    public void paint(Graphics g) {
    }
    
	// Make 
    public void Histogram() {    	
    	double K[] = EventCount(num,0);
    	double y[] = new double [AxisX];
    	for (int i=0; i<AxisX; i++) {
    		y[i] = 0;
    	}

    	for (int i=0; i<num; i++) {
    		int BIN_S = (int)Math.floor(AxisX * bin*i / (DATA_MAX - DATA_MIN));
    		int BIN_F = (int)Math.floor(AxisX * bin*(i+1) / (DATA_MAX - DATA_MIN));
		
    		int k = 0;
    		for (int j=BIN_S; j<BIN_F; j++) {
			if (BIN_S+k < AxisX) {
    				y[BIN_S+k] = K[i]/bin;
    				k = k + 1;
			}
    		}
    	}
    	double ymax = y[0];
    	for (int i = 0; i < AxisX; i++) {
    		ymax = Math.max(y[i], ymax);
    	}
    	ymax = ymax*1.1;
    	double ymin = 0;
    	
    	for (int i=0; i<AxisX; i++) {
    		yPoint[i] = OffsetY+AxisY-(int)Math.round(AxisY*(y[i]-ymin)/(ymax-ymin));
    	}
    	graphcnvs.repaint();
    }
    
    // Schroll bar
    public boolean handleEvent(Event e) {
		if (e.target instanceof Scrollbar) {
			Scrollbar scr = (Scrollbar)e.target;
			//System.out.println("WIDTH" + scr.getValue());
			D = scr.getValue();	
			num = NS[(int)D];
			bin = BINS[(int)D];
			//bin =  BIN_MIN +  (BIN_MAX-BIN_MIN)* (double)D / 100;
			Histogram();
			graphcnvs.repaint();
			return true;
		}		
		return super.handleEvent(e);
    }

    // Button and Checkbox
    
 	class Graphs extends Canvas {
 		
 		public void paint(Graphics g) {
 			update(g);
 		}
 		
    	public void update(Graphics g) {
    		bg.clearRect(0, 0, AxisX+OffsetX+10, AxisY+OffsetY+100);
        	// Histogram
    		bg.setColor(Color.red);
        	for (int i=0; i<AxisX; i++) {
        		bg.drawLine(xPoint[i],OffsetY+AxisY,xPoint[i],yPoint[i]);
    		}
        
    		// Histogram Edge
        	bg.setColor(Color.black);
            for (int i=0; i<AxisX-1; i++) {
            	//bg.drawLine(xPoint[i],yPoint[i],xPoint[i+1],yPoint[i+1]);
        	}
            
            // Parameters
            bg.drawString("Bin Width "+(float)bin, AxisX-98, 2*OffsetY);
            bg.drawString("# of Bins "+(int)num, AxisX-198, 2*OffsetY);
            
            // Axis
            bg.setColor(Color.black);
            bg.drawRect(OffsetX,OffsetY,AxisX,AxisY); 
                      
            bg.drawString(""+(float)DATA_MIN, OffsetX, OffsetY+AxisY+12);
            bg.drawString(""+(float)DATA_MAX, OffsetX+AxisX-22, OffsetY+AxisY+12);
        	
            g.drawImage(doubleBuffer,0,0,this);   	
    	}
    	
	}
}



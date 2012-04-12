/*
 * Java Applet Packages for Bin Size Selection
 * (c) 2006 Hideaki Shimazaki
 */
import java.awt.*;

public class DrawCostFunction extends BinSelection {
	
	/* 2006 Hideaki Shimazaki All rights reserved. 
	 * Department of Physics, Kyoto University
	 * Kyoto 606-8502, Japan
	 * email: shimazaki at jhu.edu
	 */
	
	static int X[];
	static int Y[];
	int XAXIS;
 	int YAXIS;
 	int XOFFSET = 40;
 	int YOFFSET = 40;
 	String XLABEL = "BIN";
 	String YLABEL = "COST";
 	
	public void init() {
		setBackground(Color.white);
		
		Dimension size = getSize();
		XAXIS = size.width - 2*XOFFSET;
		YAXIS = size.height - 2*YOFFSET;
		
		X = new int [10];
		Y = new int [10];
		for (int i = 0; i < 10; i++) {
			X[i] = 0;
			Y[i] = 0;
		}
	}
 	public void paint(Graphics g) {
		for (int i = 0; i < X.length; i++) {
			g.fillOval(X[i]+XOFFSET-3,YAXIS+YOFFSET-Y[i]-3,6,6);
		}
		
		g.drawLine(XOFFSET-5, YAXIS+YOFFSET, XAXIS+XOFFSET, YAXIS+YOFFSET); //X AXIS
		g.drawLine(XOFFSET, YAXIS+YOFFSET+5, XOFFSET, YOFFSET);		//Y AXIS
		
		g.drawString(XLABEL,XAXIS+XOFFSET-20,YAXIS+YOFFSET+20);
		g.drawString(YLABEL,1,YOFFSET+3);
	}
 	
 	public void Axis() {
 	}
 	
 	public void Positions() {
 		double x[] = new double [BinSelection.BINS_LEN]; 
 		double y[] = new double [BinSelection.BINS_LEN]; 
 		for (int i = 0; i<BinSelection.BINS_LEN; i++) {
 			x[i] = BinSelection.BINS[i];
 			y[i] = BinSelection.C[i];
 		}
 		
 		
 		double x_min = x[0];
 		double x_max = x[0];
 		for (int i = 0; i < x.length; i++) {
 			x_min = Math.min(x[i], x_min);
 			x_max = Math.max(x[i], x_max);
 		}
 		
 	 	double y_min;
 	 	double y_max;
 		y_min = y[0];
 		y_max = y[0];
 		for (int i = 0; i < y.length; i++) {
 			y_min = Math.min(y[i], y_min);
 			y_max = Math.max(y[i], y_max);
 		}
 		
 		X = new int [x.length];
 		Y = new int [y.length];
 		for (int i = 0; i < x.length; i++) {
 			X[i] = (int) ( (x[i] - x_min)/(x_max - x_min) * (double)XAXIS );
 			Y[i] = (int) ( (y[i] - y_min)/(y_max - y_min) * (double)YAXIS );
 		}
 		repaint();
 	}
}

import java.awt.*;
import java.applet.*;

public class BinSelection extends Applet {

	/* 2006 Hideaki Shimazaki All rights reserved. 
	 * Department of Physics, Kyoto University
	 * Kyoto 606-8502, Japan
	 * email: shimazaki at jhu.edu
	 */
	
	private static final long serialVersionUID = -4092064318517205567L;
	static double DATA[];
	//static double K[];		//The number of events within a bin
	static double K_OPT[];
	static double BINS[];
	static double BIN_MAX = 0;
	static double BIN_MIN = 0;
	static int BINS_LEN;
	static int BINNUM;
	static double BIN_OPT;
	
	static double NS[];
	static double N_MAX = 0;
	static double N_MIN = 0;
	
	static double DATA_MIN; 
	static double DATA_MAX;
	//static double N;
	static double C[];
	
 	public void init(Graphics g) {
 		setBackground(Color.white);
	} 	
 	
 	public void paint(Graphics g) {
	} 	
	
	public void InitParam(float data_length, float bins_length, float data_max, float data_min) {
		DATA = new double [(int)data_length];
		BINS_LEN = (int) bins_length;
		BINS = new double [(int) bins_length];
		/*for (int i = 0; i < data.length; i++) {
			DATA[i] = (double)data[i];
		}*/ //Passing an array is applicable to NN. 
		
		//N = (double)data_N;
		
		BINS = new double [(int)bins_length];
		
		DATA_MAX = (double)data_max;
		DATA_MIN = (double)data_min;
	}

	public double OutputC(int i) {
		return C[i];
	}
	
	public double OutputK(int i) {
		K_OPT = EventCount(BIN_OPT,0);
		return K_OPT[i];
	}
	
	public void InputDATA(int i, float data) {
		DATA[i] = data;
	}
	
	public void InputBINS(int i, float bin) {
		BINS[i] = (double)bin;
		BIN_MAX = Math.max(BIN_MAX, BINS[i]);
		BIN_MIN = Math.min(BIN_MIN, BINS[i]);
	}
	
	public double OptimalBinSize() {		//Output an optimal bin size
		double C_MIN = C[0];
		int IDX = 0;
		for (int i = 0; i < BINS.length; i++) {
			C_MIN = Math.min(C_MIN,C[i]);
			if (C_MIN == C[i]) {
				IDX = i;
			}
		}
		return BINS[IDX];
	}
	
	public void CostFunctionArray() {
		C = new double [BINS.length];
		for (int i = 0; i < BINS.length; i++) {
			double C_BUF = 0;
			double d = 10;
			for (int j = 0; j < d+1; j++) {
				C_BUF = C_BUF + CostFunction(BINS[i],BINS[i]*(double)(j-d/2)/d);
			}
			C[i] = C_BUF / (d+1); //CostFunction(BINS[i]);
		}
		BIN_OPT = OptimalBinSize();
	}
	
	public double CostFunction(double BIN, double INIT) {
		double K[] = EventCount(BIN,INIT);
		
		double Kbar = 0;
		for (int i = 0; i < BINNUM; i++) {
			Kbar = Kbar + K[i]/BINNUM; 
		}
		
		double V = 0;
		for (int i = 0; i < BINNUM; i++) {
			V = V + Math.pow(K[i] - Kbar, 2)/BINNUM;
		}
		
		double c;
		c = ( 2*Kbar - V ) / Math.pow(BIN, 2);
		return c;
	}
	
	public double[] EventCount(double BIN, double INIT) {
		BINNUM = (int)Math.ceil((DATA_MAX - DATA_MIN)/BIN );
		
		double K[] = new double[BINNUM];
		for (int i = 0; i < BINNUM; i++) {
			K[i] = 0;
			for (int j = 0; j < DATA.length; j++) {
				if (DATA[j] >= INIT + DATA_MIN + BIN*i && DATA[j] < INIT + DATA_MIN + BIN*(i+1)) {
					K[i] = K[i] + 1;
				}
			}
		}
		return K;
	}
}
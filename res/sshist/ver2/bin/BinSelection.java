
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
	static double BIN_OPT;
	
	static int NS[];
	static int N_MAX = 1;
	static int N_MIN = 1;
	
	static double DATA_MIN; 
	static double DATA_MAX;
	//static double N;
	static double C[];
	
 	public void init(Graphics g) {
 		setBackground(Color.white);
	} 	
 	
 	public void paint(Graphics g) {
	} 	
	
	public void InitParam(float data_length, float ns_length, float data_max, float data_min) {
		DATA = new double [(int)data_length];
		BINS_LEN = (int) ns_length;
		BINS = new double [(int) ns_length];
		NS = new int [(int) ns_length];
			
		DATA_MAX = (double)data_max;
		DATA_MIN = (double)data_min;
	}
	
	public void InputDATA(int i, float data) {
		DATA[i] = data;
	}
	
	public void InputBINS(int i, float bin) {
		BINS[i] = (double)bin;
		BIN_MAX = Math.max(BIN_MAX, BINS[i]);
		BIN_MIN = Math.min(BIN_MIN, BINS[i]);
	}

	public void InputNS(int i, int N) {
		NS[i] = N;
		N_MAX = Math.max(N_MAX, NS[i]);
		N_MIN = Math.min(N_MIN, NS[i]);
	}
	
	public double OutputC(int i) {
		return C[i];
	}
	
	public double OutputK(int i, int N) {
		K_OPT = EventCount(N,0);
		return K_OPT[i];
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
		return IDX;
	}
	
	public void CostFunctionArray() {
		C = new double [BINS.length];
		for (int i = 0; i < BINS.length; i++) {
			double C_BUF = 0;
			double d = 10;
			for (int j = 0; j < d+1; j++) {
				C_BUF = C_BUF + CostFunction(NS[i],BINS[i]*(double)(j-d/2)/d);
			}
			C[i] = C_BUF / (d+1); //CostFunction(BINS[i]);
		}
	}
	
	public double CostFunction(int N, double INIT) {
		double K[] = EventCount(N,INIT);
		
		double Kbar = 0;
		for (int i = 0; i < N; i++) {
			Kbar = Kbar + K[i]/(double)N; 
		}
		
		double V = 0;
		for (int i = 0; i < N; i++) {
			V = V + Math.pow(K[i] - Kbar, 2)/(double)N;
		}
		
		double BIN = (DATA_MAX - DATA_MIN)/(double)N ;
		
		double c;
		c = ( 2*Kbar - V ) / Math.pow(BIN, 2);
		return c;
	}
	
	public double[] EventCount(int N, double INIT) {
		double BIN = (DATA_MAX - DATA_MIN) / (double)N ;
		
		double K[] = new double[N];
		for (int i = 0; i < N; i++) {
			K[i] = 0;
			for (int j = 0; j < DATA.length; j++) {
				if (DATA[j] >= INIT + DATA_MIN + BIN*i && DATA[j] < INIT + DATA_MIN + BIN*(i+1)) {
					K[i] = K[i] + 1;
				}
			}
		}
		K[N-1] = K[N-1] + 1;
		return K;
	}
}
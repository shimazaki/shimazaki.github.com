import java.awt.*;
import java.applet.*;

public class Simple extends Applet {
	static double DATA[];
	
	public void InitializePram(int data_length) {
		DATA = new double [data_length];
	}
	
	public void InputDATA(int i, float data) {
		DATA[i] = data;
	}
	
	public double OutputDATA(int i) {
		 return DATA[i];
	}
}
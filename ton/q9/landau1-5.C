#define N 100
#define RAND drand48();

#include <stdio.h>
#include <stdlib.h>
#include <XRS/Control.h>
#include <XRS/Graphic.h>

/*** FUNCTIONS ***/
void initialize_var(int);
void initialize_xrs(void);
void output_to_window(void);
void laplacian(double **X, double Y[N][N]);

/*** GLOBAL VARIABLES ***/
double dt = 0.0005;
//double y[N][N];
double **y;
double **y_buf;
double dy[N][N];
double a = -1.0, b = 2.0;
double Lap[N][N];
double D = 1;
double L = 1;

Control_Window C;
Graphic_Window A0(N,N,4); 

main() {
  initialize_var(1);
  initialize_xrs();
  
  while(1) {
    laplacian(y,Lap);
    for (int i=0; i<N; i++) {
      for (int j=0; j<N; j++) {
	y_buf[i][j] = a * y[i][j] + b * y[i][j]*y[i][j]*y[i][j] - D*Lap[i][j];
      }
    }
    laplacian(y_buf,Lap);
    for (int i=0; i<N; i++) {
      for (int j=0; j<N;j ++) {
	dy[i][j] = L*Lap[i][j]*dt; 
	y[i][j] += dy[i][j]; 
      }
    }
    
    output_to_window();
    printf("%f\n",y[0][0]);
    checkevent();
  }
}

void laplacian(double **X, double Y[N][N]) {
  int i,j,im,ip,jm,jp;
  double a1,a2;
  
  for (i=0;i<N;i++) {
    if(i == 0) im = N - 1; else im = i-1;
    if(i == N-1) ip = 0; else ip = i+1;
    for (j=0 ;j<N; j++) {
      if (j == 0) jm = N - 1; else jm = j - 1;
      if (j == N-1) jp = 0; else jp = j + 1;
    
      a1 = X[ip][j] + X[im][j] + X[i][jp] + X[i][jm];
      a2 = X[ip][jp] + X[im][jm] + X[im][jp] + X[ip][jm];
      Y[i][j] = 0.5*a1 + 0.25*a2 -3.0*X[i][j];
    }
  }
}

void initialize_var(int initvalue) {
  array(y,N,N);
  array(y_buf,N,N);
  for (int i=0; i<N; i++) {
    for (int j=0; j<N; j++) {
      y[i][j] = RAND;
      dy[i][j] = 0;
    }
  }
}
 
void initialize_xrs(void) {
  C << initialize_var << "init";
  C << PARAMETER << a << "a";
  C << b << "b";
  C << D << "D";

  initialize();
}

void output_to_window(void) {
  A0.draw_2D(y);
}

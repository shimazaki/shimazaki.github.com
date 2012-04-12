#define N 100
#define RAND drand48()

#include <stdio.h>
#include <stdlib.h>
#include <XRS/Control.h>
#include <XRS/Graphic.h>

/*** FUNCTIONS ***/
void initialize_var(int);
void initialize_xrs(void);
void output_to_window(void);

/*** GLOBAL VARIABLES ***/
double dt = 0.0001;
//double y[N][N];
double **y;
double dy[N][N];
double a = -1.0, b = 2.0;

Control_Window C;
Graphic_Window A0(N,N,4); 

main() {
  initialize_var(1);
  initialize_xrs();
  
  while(1) {
    for (int i=0; i<N; i++) {
      for (int j=0; j<N; j++) {
	dy[i][j] = -(a * y[i][j] + b * y[i][j]*y[i][j]*y[i][j]) * dt;
	y[i][j] += dy[i][j]; 
      }
    }
    
    output_to_window();
    printf("%f\n",y[0][0]);
    checkevent();
  }
}

void initialize_var(int initvalue) {
  array(y,N,N);
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

  initialize();
}

void output_to_window(void) {
  A0.draw_2D(y);
}

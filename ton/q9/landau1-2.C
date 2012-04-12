#define GRAPHICS

#include <stdio.h>
#include <stdlib.h>
#ifdef GRAPHICS
#include <XRS/Control.h>
#endif

/*** FUNCTIONS ***/
void initialize_xrs(void);

/*** GLOBAL VARIABLES ***/
double dt = 0.001;
double y = 5;
double dy = 0;
double a = -1.0, b = 2.0;

Control_Window C;

main() {
  initialize_xrs();
  
  while(1) {
    dy = -(a * y + b * y*y*y) * dt;
    y += dy; 
    printf("y=%f, a=%f, b=%f\n", y, a, b); 
    checkevent();
  }
}
 
void initialize_xrs(void) {
  C << y << "y";
  C << PARAMETER << a << "a";
  C << b << "b";
  initialize();
}

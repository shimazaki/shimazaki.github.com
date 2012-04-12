#define LENGTH	20

#include <stdio.h>
/*** GLOBAL VARIABLES ***/
double dt=0.01;
double y = 10;
double dy = 0;
double a = -1.0, b = 2.0; 

main()	{
	for (int t=0; t<LENGTH; t++) {
		dy = -(a * y + b * y*y*y ) * dt;
		y = y + dy;
		printf("y = %f\n",y);
	}
}


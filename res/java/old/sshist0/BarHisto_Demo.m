function BarHisto_Demo
%Bar-Histogram
% This program gives a cost function of Bar-Graph Time Histogram.
% Aug. 24, 2005 Author Hideaki Shimazaki
% Department of Physics, Kyoto University
% D: Delta
% N: The number of Spike Sequences

clear all; close all;

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Parameter Settings
switch 1
    case 1 %FIG.2 Bar-PSTH, Gauss
	dt = 0.0001; N = 30; T = 2; mu = 30; g = 10; s = 10;
	L = ceil(T/dt); tt = dt*[1:L];
	Dmin = 0.002; Dmax = .5; nmin = Dmin/dt; nmax = Dmax/dt;
	bin = round(linspace(nmin,nmax,50));

	Nc = mu*g /s/s/sqrt(pi)
    y = StochProcess_Gauss(T,dt,mu,s,g);
end

% Rectification
y = y.*(y>0);

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Generation of Poisson Point Processes
%x = sparse(poissrnd(ones(N,1)*y.*dt));
for i = 1: N
	X(i,:) = sparse(poissrnd(y.*dt));
end

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Estimation of the Cost Functioin

x = sum(X);
for j = 1: length(bin)
	disp(strcat(num2str(j),'/',num2str(length(bin)))); % give bin width
    W = bin(j);
    D(j) = W*dt;
    
	clear x_shift;
	shift = 1; 
	for SHIFT = 1: ceil(W/1): W; %SHIFT: shifting the start point of the binning  
        x_shift = x(1,SHIFT:L);
		
		COL = floor(length(x_shift)/W);
        SPKNUM = zeros(1,COL);
        for i = 1: COL
            SPKNUM(i) = full( sum( x_shift(W*(i-1)+1:W*i) ));
        end

        kbar_SHIFT(shift) = mean([SPKNUM]);
        s2_SHIFT(shift) = var([SPKNUM])*(COL-1)/COL;
		shift = shift + 1; 
    end
    
    kbar(j) = mean(kbar_SHIFT);
    s2(j) = mean(s2_SHIFT);
    C(j) = ( 2*kbar(j) - s2(j) ) ./ (N .* D(j)).^2;
end

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Optimal Bin Size Selection
[optC,nC]=min(C); optD = D(nC);

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Analytical Solutions
%OUP
%V = 2*(s^2)./(g.^2).*(g.*D - (1-exp(-g.*D)) )./D./D; %OUP
%V = s^2./(g.*D).^2.*(1 - cos(g.*D)); % SIN
V = s^2./(g.*D).^2.*(-1 + exp(-(g*D).^2) + sqrt(pi)*g.*D.*erf(g.*D) ); %GAUSS
E = mu./D./N;
Ch = E-V;
[optCh,nCh]=min(Ch); anaoptD = D(nCh);

figure;
%%%%%%%% Cost Function
subplot(1,1,1); plot(D,C,'r.');
hold on; plot(D,Ch,'b');
axis square; grid on; title('Cost Function'); xlabel('\Delta');
legend('Numerical','Analytical');


%%%%%%%% Intensity Process, Raster Plots and Histogram 
figure; set(gcf,'Color',[1 1 1]); 
subplot(3,1,1); plot(tt,y); xlabel('Time [s]'); axis off;
title(strcat( 'N=',num2str(N),' T=',num2str(T),' \mu=',num2str(mu), ...
	' \gamma=',num2str(g),' \sigma=',num2str(s),' Nc=',num2str(Nc) ));
subplot(3,1,2); spy(X); axis tight; axis fill; axis fill; axis off;
subplot(3,1,3); bar(mean(EventCount(X(1:N,1:L),bin(nC),dt)),1,'r'); 
axis tight; axis off;


function [RASTER,COL] = EventCount(x,n,dt)
%[RASTER,COL]=EventCount(x,n,dt)
% This program returns binned histogram of signal z. 
% Each bin size is given by n blocks,
% and actual time window is n*dt.
[m,L]= size(x);
COL = floor(L/n);
w = zeros(m,COL);
for k = 1: COL
		w(:,k) = sum( x(:,n*(k-1)+1:n*k), 2) ./ (n*dt);
end
RASTER = w;

function y = StochProcess_Gauss(T,dt,mu,s,g)
% function y = gausscorr(T,dt,mu,s,g)
% This program produces the stochastic process 
% characterized by a mean 'mu' and the correlation
%L = 20000; mu = 10; s = 4; g = 100; dt = 0.0001;
L = round(T/dt);
Lf = round(1/g/dt*5); %L/100;	
LL = L+Lf;
t = [-Lf/2+1:Lf/2]*dt;

eta = sqrt(sqrt(pi)/g*s*s);
W = mu*dt + eta*sqrt(dt)*randn(1,LL);

%filter function
%h = t.*g.*g.*exp(-g*t); %n=2 alpha
h = sqrt(2/pi)*g*exp(-2*g*g.*t.*t);

y_buf = conv(W,h);
y = y_buf(Lf+1:Lf+L);






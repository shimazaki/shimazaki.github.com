%function [optW, C, W] = sskernel2d(x,W)
% Copyright (c) 2010, Hideaki Shimazaki All rights reserved.
% http://2000.jukuin.keio.ac.jp/shimazaki
% This is beta version. Use it at your own risk. 

clear all; close all;
load oldfaithful.txt
x = oldfaithful;            % [N,2] vector of N samples of 2-d data.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Parameters Settings
x(:,1) = (x(:,1) - min(x(:,1)))/(max(x(:,1))-min(x(:,1)));
x(:,2) = (x(:,2) - min(x(:,2)))/(max(x(:,2))-min(x(:,2)));

N_total = length(x(:,1));   % Total number of samples.

W = logspace(-2.2,-.5,50);  % Bandwidths to be searched.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Compute a Cost Function
tau = triu( ones(N_total,1)*x(:,1)' - x(:,1)*ones(1,N_total), 1);
idx = triu( ones(N_total,N_total), 1);
TAU1 = tau(logical(idx)) .^2;

tau = triu( ones(N_total,1)*x(:,2)' - x(:,2)*ones(1,N_total), 1);
TAU2 = tau(logical(idx)) .^2;

TAU = TAU1+TAU2;

C = zeros(1,length(W));

for k = 1: length(W)
	w = W(k);
	%C(k) = N_total/w + 2/w*sum(sum(2*exp(-TAU/4/w/w) - 2*sqrt(2)*exp(-TAU/2/w/w) )); %1d 
    C(k) = N_total/w/w + 2/w/w*sum(sum(exp(-TAU/4/w/w) - 4*exp(-TAU/2/w/w) )); %2d
end
%C = C/2/sqrt(pi); %1d
C = C/4/pi; %2d

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Compute a Cost Function (Standard ver.)
%ker = @(x,w) 1/(2*pi*w*w) * exp(-sum(x.^2,2)/2/w/w);
%kercorr = @(x,w) 1/(4*pi*w*w) * exp(-sum(x.^2,2)/4/w/w);
%C2 = zeros(1,length(W));

%for k = 1: length(W)
%	w = W(k);
%    C2(k) = 0;
%	for i = 1: N_total
%        for j = 1: N_total
%            C2(k) = C2(k) + kercorr(x(i,:)-x(j,:),w);
%            if i ~= j
%                C2(k) = C2(k) - 2*ker(x(i,:)-x(j,:),w);
%            end
%        end
%    end
%end

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Selection of Optimal Bandwidth
[optC,nC]=min(C); optW = W(nC)


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Plots
subplot(1,2,1); plot(W,C); %hold on; plot(W,C2,'r.');

xlabel('Bandwidth, w'); ylabel('C(w)'); 
axis square; grid on; title('Cost function')

subplot(2,2,2); plot(x(:,1),x(:,2),'k.');
axis square; grid on; title('Data')

subplot(2,2,4);
gn = 100; % # of grids
x_grid = linspace(0,1,gn);
y_grid = linspace(0,1,gn);
Z = zeros(gn,gn); X = Z; Y = Z; 

gauss2d = @(x,w) 1/(2*pi*w*w) * exp(-sum(x.^2,2)/2/w/w);

for i = 1: length(x_grid)
    for j = 1: length(y_grid)
        d = ones(N_total,1)*[x_grid(i) y_grid(j)] - x;
        Z(i,j) = mean( gauss2d(d,optW) );
        
        X(i,j) = x_grid(i);
        Y(i,j) = y_grid(j);
    end
    
end

surf(X,Y,Z); shading flat;
xlabel('x'); ylabel('y'); axis square;
title('Optimized Kernel Desnsity Estimate');

set(gca,'CameraTarget',[.5 .5 0]); 
set(gca,'CameraPosition',[.5 .5 100]);

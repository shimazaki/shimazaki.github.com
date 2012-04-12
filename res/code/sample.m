%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% 2006 Author Hideaki Shimazaki
% Department of Physics, Kyoto University
% shimazaki at ton.scphys.kyoto-u.ac.jp
% Please feel free to use/modify/distribute this program.
%
% Data: the duration for eruptions of  
% the Old Faithful geyser in Yellowstone National Park (in minutes)
clear all;
x = [4.37 3.87 4.00 4.03 3.50 4.08 2.25 4.70 1.73 4.93 1.73 4.62 ...
     3.43 4.25 1.68 3.92 3.68 3.10 4.03 1.77 4.08 1.75 3.20 1.85 ...
     4.62 1.97 4.50 3.92 4.35 2.33 3.83 1.88 4.60 1.80 4.73 1.77 ...
     4.57 1.85 3.52 4.00 3.70 3.72 4.25 3.58 3.80 3.77 3.75 2.50 ...
     4.50 4.10 3.70 3.80 3.43 4.00 2.27 4.40 4.05 4.25 3.33 2.00 ...
     4.33 2.93 4.58 1.90 3.58 3.73 3.73 1.82 4.63 3.50 4.00 3.67 ...
     1.67 4.60 1.67 4.00 1.80 4.42 1.90 4.63 2.93 3.50 1.97 4.28 ...
     1.83 4.13 1.83 4.65 4.20 3.93 4.33 1.83 4.53 2.03 4.18 4.43 ...
     4.07 4.13 3.95 4.10 2.27 4.58 1.90 4.50 1.95 4.83 4.12];

x_min = min(x);
x_max = max(x);

N_MIN = 4;              % Minimum number of bins (integer)
                        % N_MIN must be more than 1 (N_MIN > 1).
N_MAX = 50;             % Maximum number of bins (integer)

N = N_MIN:N_MAX;                      % # of Bins
D = (x_max - x_min) ./ N;             % Bin Size Vector


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Computation of the Cost Function
for i = 1: length(N)
	edges = linspace(x_min,x_max,N(i)+1);	% Bin edges

	ki = histc(x,edges);            % Count # of events in bins
	ki = ki(1:end-1);
	
	k = mean(ki);                   % Mean of event count
	v = sum( (ki-k).^2 )/N(i);      % Variance of event count
	
	C(i) = ( 2*k - v ) / D(i)^2;    % The Cost Function

end


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Optimal Bin Size Selectioin
[Cmin idx] = min(C);                    
optD = D(idx);                         % *Optimal bin size
edges = linspace(x_min,x_max,N(idx)+1);  % Optimal segmentation


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Display an Optimal Histogram and the Cost Function
subplot(1,2,1); hist(x,edges); axis square;
subplot(1,2,2); plot(D,C,'k.',optD,Cmin,'r*'); axis square;
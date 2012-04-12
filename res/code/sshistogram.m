function optD = sshist(x)
% function optD = Fbin(x)
% x: data
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% 2006 Author Hideaki Shimazaki
% Department of Physics, Kyoto University
% shimazaki at ton.scphys.kyoto-u.ac.jp

SN = 20;

x_min = min(x);
x_max = max(x);

N_MIN = 2;              % Minimum number of bins (integer)
                       % N_MIN must be more than 1 (N_MIN > 1).
N_MAX = 100;             % Maximum number of bins (integer)

N = N_MIN:N_MAX;                      % # of Bins
D = (x_max - x_min) ./ N;             % Bin Size Vector


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Computation of the Cost Function
C = zeros(length(N),SN-1);
for i = 1: length(N)

       shift = linspace(0,D(i),SN);
       %shift = 0;
       for p = 1 : SN
               edges = linspace(x_min+shift(p)-D(i)/2,x_max+shift(p)-D(i)/2,N(i)+1);   % Bin edges
               %edges = linspace(x_min+shift(p),x_max+shift(p),N(i)+1);        % Bin edges

               ki = histc(x,edges);            % Count # of events in bins
               ki = ki(1:end-1);

               k = mean(ki);                   % Mean of event count
               v = sum( (ki-k).^2 )/N(i);      % Variance of event count

               C(i,p) = ( 2*k - v ) / D(i)^2;    % The Cost Function
       end

end
CC = mean(C,2);
%CC = reshape(C',1,length(N)*(SN));
%DD = reshape(ones(SN,1)*D,1,length(N)*(SN));

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Optimal Bin Size Selectioin
[Cmin idx] = min(CC);
%opt_i = ceil(idx/SN);
%opt_p = mod(idx,SN)+1;
optD = D(idx);                         % *Optimal bin size
%optD = D(opt_i);                         % *Optimal bin size
edges = linspace(x_min,x_max,N(idx));  % Optimal segmentation
%edges = linspace(x_min+shift(opt_p),x_max+shift(opt_p),N(opt_i));  % Optimal segmentation


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Display an Optimal Histogram and the Cost Function
%subplot(1,2,1); hist(x,edges); axis square;

%hc = histc(x,edges);
%subplot(1,2,1); bar(edges,hc,'hist'); axis square;
%subplot(1,2,2); plot(D,CC,'.-',optD,Cmin,'r*'); axis square;
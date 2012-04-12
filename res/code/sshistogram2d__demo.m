% Demo sshist 2d
% function optD = sshist2d(x,y)
% (x,y): data
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% 2006 Author Hideaki Shimazaki
% Department of Physics, Kyoto University
% shimazaki at ton.scphys.kyoto-u.ac.jp

clear all;

switch 1
    case 1
        n = 500; d = 2;
        x = [randn(1,n)-1 0.5*randn(1,2*n)+1];
        y = [randn(1,n)  0.8*randn(1,2*n)+.1];
        x_min = -3 ; x_max = 3;
    case 2
        load bramblecanes 
        x = x(1:359); y = y(1:359); %newly emergent
        %x = x(360:744); y = y(360:744);
        n = length(x)
        x_min = 0 ; x_max = 1;
end


N_MIN = 3;								% Minimum number of bins
N_MAX = 50;								% Maximum number of bins

N = N_MIN:N_MAX;						% # of Bins
D = (x_max - x_min) ./ N;               % Bin Size Vector

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Computation of the Cost Function
for i = 1: length(N)
    x_edges = linspace(x_min,x_max,N(i)+1);	% Bin edges
    y_edges = linspace(x_min,x_max,N(i)+1);	


    ki = zeros(N(i),N(i));
    for p = 1 : N(i)
        for q = 1: N(i)
            ki(p,q) = sum( ( x >= x_edges(p) ) .* (x < x_edges(p+1))...
                     .*( y >= y_edges(q) ) .* (y < y_edges(q+1)) );					
        end
    end
    
    clear kii;
    kii = reshape(ki,1,N(i)^2);
    
	k = mean(kii);						% Mean of event count					
	v = mean( (kii-k).^2 );             % Variance of event count
    
	C(i) = ( 2*k - v ) / (n^2*D(i)^4);	% The Cost Function
   
end

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Optimal Bin Size Selectioin
[Cmin idx] = min(C);
optD = D(idx);
x_edges = linspace(x_min,x_max,N(idx)+1);
y_edges = linspace(x_min,x_max,N(idx)+1);
ki = zeros(N(idx),N(idx));
for p = 1 : N(idx)
    for q = 1: N(idx)
        ki(p,q) = sum( ( x >= x_edges(p) ) .* (x < x_edges(p+1))...
                     .*( y >= y_edges(q) ) .* (y < y_edges(q+1)) );					
    end
end

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Display an Optimal Histogram and the Cost Function
subplot(1,2,1); plot(D,C,'k.',optD,Cmin,'r*'); axis square;
colormap(1-gray); 
xlabel('Bin size'); title('Cost function'); 

subplot(1,2,2); plot(x,y,'k.'); 
pcolor(ki); shading flat; %bar3(ki);
axis square; title('Optimized 2-d histogram'); 


disp('Optimal bin size (edge length):'); disp(optD);




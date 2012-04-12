
load mnist_all.mat 
colormap(gray);

[m,n] = size(test0);
test0 = logical(test0 > 128); %1-128,129-256
for i = 1: 1
    image(64*reshape(test0(i,1:28*28),28,28)');
    drawnow;
end

fid = fopen('mnist0.txt','w');
for i = 1:1;m
    x = test0(i,:);
    fprintf(fid,'%d ', x);
    fprintf(fid,'\n');
end
fclose(fid);
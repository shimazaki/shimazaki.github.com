function phpcreatefile(filepath)
% Open the file
fid = fopen(filepath, 'wt');
for i = 1:100
    % Create random number
    randNumber = [num2str(rand(1)) '\n'];
    % Write number to file
    fprintf(fid, randNumber);
end
% Close file
fclose(fid);
% Quit MATLAB
quit force
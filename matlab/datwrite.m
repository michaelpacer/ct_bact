
times{1} = [3,30,40];
times{2} = [10,17];
times{3} = 45;

% set1 cause:
% cf{1} = @(x) 1/4*exp(-x/4);
% cf{2} = @(x) 1/2*exp(-x/2);
% cf{3} = @(x) exp(-x);

% set1 prev:
% pf{1} = @(x) 1/4*exp(-x/32);
% pf{2} = @(x) 1/2*exp(-x/16);
% pf{3} = @(x) exp(-x/8);

% set2 cuase:
cf{1} = @(x) 1/8*exp(-x/4);
cf{2} = @(x) 1/4*exp(-x/4);
cf{3} = @(x) 1/2*exp(-x/4);

% set2 prev:
pf{1} = @(x) 1/4*exp(-x/4);
pf{2} = @(x) 1/2*exp(-x/4);
pf{3} = @(x) exp(-x/4);

data = cell(1,9);
k = 0;
for i=1:3
    for j=1:3
        if length(times{i}) == 3;
            mat = {cf{j},cf{j},cf{j}};
        elseif length(times{i}) == 2;
            mat = {cf{j},cf{j}};
        else
            mat = {cf{j}};
        end
        k = k+1;
        filename = strcat('data',num2str(k));
        data{k} = CTBactLumDataGen4(times{i},mat,{},[],filename,'plot','write');
        close all;
    end
end

k = 9;
for i=1:3
    for j=1:3
        if length(times{i}) == 3;
            mat = {pf{j},pf{j},pf{j}};
            mat2 = [1,1,1];
        elseif length(times{i}) == 2;
            mat = {pf{j},pf{j}};
            mat2 = [1,1];
        else
            mat = {pf{j}};
            mat2 = 1;
        end
        k = k+1;
        filename = strcat('data',num2str(k));
        data{k} = CTBactLumDataGen4(times{i},{},mat,mat2,filename,'plot','write');
        close all;
    end
end
function [ eventTimes ] = CTBactLumDataGen( cpTimes, causeFns, prevFns, thinParams, filename, varargin)
%SUMMARY:
% [ eventTimes ] = CTBactLumDataGen4( cpTimes, causeFns, prevFns, thinParams, varargin )
%   This function outputs the eventTimes of luminescence in a cell array
%   indexed by bacterial culture. It also generates a JS friendly data set 
%   for the CTBactLum experiment. The experiment is 60s long.
%   DETAIL: cpTimes = row vector of causal THEN preventative event
%           occurrances e.g. [0,15,33] specifying causes @ 0,15 and a
%           preventative event at t=33 seconds.
%           causeFns = cell array of function handles for delay functions
%           of causal events, e.g. {@(x) exp(-x), @(x) 1+0*x}
%           prevFns = cell array like causeFns, but preventative
%           thinParams = row vector of thinning parameters, one for each
%           preventative function, determining thinning strength.
%       NOTE: eventTimes are rounded up to nearest 20 millisecond mark.

%% Input Handling
causeTimes = cpTimes(1:length(causeFns));
prevTimes = cpTimes(length(causeFns)+1:end);

% set defaults for optional inputs
optargs = {'nowrite' 'noplot'};
for i=1:length(varargin)
    if strcmp(varargin(i),'write')
        optargs(1) = varargin(i);
    end
    if strcmp(varargin(i),'plot')
        optargs(2) = varargin(i);
    end
end

% Place optional args in memorable variable names
[writevar plotvar] = optargs{:};

%% Generate Process Trajectories with Causes

    %set up a base rate path function so we can generate 2 base
    %rate paths
    function [base] = GenBrPaths()
    %Create base rate function (brFn) for 60s interval and generate
    %base rate occurences. With br 1/10, we expect each bacteria to 
    %light once every 5 seconds.
    brFn = @(x) 1/5+x*0;
    base = cell(1,40);
    for i = 1:40
        base{i} = NonHomPoisson(brFn,[0,60]);
        if not(isempty(base{i}))
            base{i} = floor(base{i}*100);
            for j=1:length(base{i})
                if mod(base{i}(j),2)
                    base{i}(j)= (base{i}(j)+1);
                end
            end
            base{i} = base{i}/100;
        end
    end
    end

    % set up a cause rate path function
    function [cEventTimes] = CausePaths()
    % Apply cause at time 0 rate function to all 40 cultures and generate
    % proposed eventTimes. Take 0 to mean no pp event.
    cEventTimes = cell(1,length(causeTimes));
    for r=1:length(causeTimes)
        temp = cell(1,40);
        for i = 1:40
            temp{i} = NonHomPoisson(causeFns{r},[0,(60-causeTimes(r))]);
            if not(isempty(temp{i}))
                temp{i} = floor(temp{i}*100);
                for j=1:length(temp{i})
                    if mod(temp{i}(j),2)
                        temp{i}(j)= (temp{i}(j)+1);
                    end
                end
                temp{i} = temp{i}/100+causeTimes(r);
            end
        end
        cEventTimes{r}=temp;
    end
    end

base = GenBrPaths();
cEventTimes = CausePaths();

% Collate cEventTimes and base so we have "complete" sample paths
eventTimes = cell(1,40);
for i=1:40
    for r=1:length(causeTimes)
        eventTimes{i} = horzcat(eventTimes{i}, cEventTimes{r}{i});
    end
    eventTimes{i} = sort(horzcat(eventTimes{i},base{i}));
end

%% Thinning
% if preventative causes are present, thin
if not(isempty(prevTimes))
    % we can manipulate eventTimesCopy based on event times and not have to
    % worry about wierd issues from loops changing indexing.
    eventTimesCopy = eventTimes;
    for i=1:40 % i.e. every cell trajectory
% disp(strcat('eventTimes{i} =', mat2str(eventTimes{1})));            
% disp('--------------------------------------')
        for j=1:length(eventTimes{i}) % length of each particular trajectory
            selector = (eventTimes{i}(j)>prevTimes); % determine which preventative causes are present at each time
% disp(strcat('eventTimes element =', num2str(eventTimesCopy{i}(j)))); disp(strcat('selector =',mat2str(selector)))
            probCutOff = 1; % initialize probability cut off which will be used for thinning.
            for k=1:length(prevFns)
                tempFn = prevFns{k}; % call current prev fn "tempFn"
% disp(strcat('tempFn =',func2str(tempFn)))
                if selector(k)==1; % if this prev fn is present at time from trajectory modify probCutOff
                    tempFnVal = feval(tempFn,eventTimesCopy{i}(j)-prevTimes(k));
                    probCutOff = probCutOff.*(1-thinParams(k).*tempFnVal);
% disp('selected for thinning')
% disp(strcat('val passed to tempFn =',num2str(eventTimesCopy{i}(j)-prevTimes(k))))
% disp(strcat('tempFnVal =',num2str(tempFnVal)))
                end
            end
            probCutOff = 1-probCutOff;
% disp(strcat('probCutOff = ',num2str(probCutOff)))
            if probCutOff > 0;
               l=rand;
% disp('rand = '); disp(l)
                if l <= probCutOff;
                    eventTimesCopy{i}(j) = -1;
                end
            end
            clear 'probCutOff'
% disp('-----------------------------------------------')
        end
        eventTimesCopy{i} = sort(eventTimesCopy{i});
% disp('eventTimesCopy{1} = '); disp(eventTimesCopy{1});
        m = find(eventTimesCopy{i}==-1,1,'last');
% disp('m ='); disp(m)
% disp('isempty m ='); disp(isempty(m));
        if not(isempty(m))
            eventTimesCopy{i} = eventTimesCopy{i}(m+1:end);
        end
% disp('eventTimesCopy{1} = ');disp(eventTimesCopy{i});
    end
    eventTimes = eventTimesCopy;
end

%% Generate additional independant Base Rate Trajectories
indBase = GenBrPaths();

%% Plotting
if strcmp(plotvar,'plot')
    fig = figure;
    title('Sample trajectories from "eventTimes", Rate Functions')
    xlabel('Time (s)')
    ylabel('Trajectory #, Fn. Values')
    hold on;
    %plot causeFns
    if not(isempty(causeTimes))
        l=length(causeTimes);
        for r=1:l
            x = 0:0.5:(60-causeTimes(r));
            plot(x+causeTimes(r),causeFns{r}(x)); axis([0,60,0,4]);
        end
    end
    %plot prevFns
    if not(isempty(prevTimes))
    m=length(prevTimes);
    for r=1:m
        x = 0:0.5:(60-prevTimes(r));
        plot(x+prevTimes(r),prevFns{r}(x),'color','r'); axis([0,60,0,4]);
    end
    end
    %plot eventTimes
    for r=1:3
        plot(eventTimes{r},r*ones(length(eventTimes{r})),'or'); axis([0,60,0,4]);
    end
    plot(0:60,brFn(0:60)); axis([0,60,0,4]);
    hold off;
end

%% Output Formatting for JS
% create a formatting function
    function [nextUpStr, eventTimesStr] = format( eventTimes )
    % generate nextUp list to tell JS which bact to light given the next time
    nextUp = {};
    for i=1:40
        if isempty(eventTimes{i})
            list(i) = inf;
        else
            list(i) = eventTimes{i}(1); 
        end
    end
    eventTimesCopy = eventTimes;
    while min(list)<inf
        minIndex = find(list==min(list));
        for k=1:length(minIndex)
            if length(eventTimesCopy{minIndex(k)})==1
                list(minIndex(k)) = inf;
            else
                list(minIndex(k)) = eventTimesCopy{minIndex(k)}(2);
                eventTimesCopy{minIndex(k)}(1) = [];
            end
            nextUp{length(nextUp)+1} = minIndex(k);
        end
    end
    
    % create a str version of nextUp for JS
    temp = [];
    nextUpStr = num2str(nextUp{1});
    for i=2:length(nextUp)
        temp = num2str(nextUp{i});
        nextUpStr(end+1) = ',';
        for j=1:length(temp)
            nextUpStr(end+1) = temp(j);
        end
    end
    % this last nextUp value is a workaround for an indexing issue I don't
    % care to fix in javascript:
    nextUpStr = strcat('[',nextUpStr,',1]');
    
    % collate all eventTimes into eventTimesList, to be read sequentially per nextUp
    temp = [];
    for i=1:40
        temp = [temp eventTimes{i}];
    end
    temp = sort(temp);
    eventTimesList = temp;
    clear('temp')
    
    % format timeList matrix as JS friendly eventTimestr
    temp = [];
    eventTimesStr = num2str(eventTimesList(1),2);
    for i=2:length(eventTimesList)
        temp = num2str(eventTimesList(i));
        if not(eventTimesList(i)==eventTimesList(i-1));
            eventTimesStr(end+1) = ']';
            eventTimesStr(end+1) = ',';
            eventTimesStr(end+1) = '[';
            for j=1:length(temp)
                eventTimesStr(end+1) = temp(j);
            end
        else
            eventTimesStr(end+1) = ',';
            for j=1:length(temp)
                eventTimesStr(end+1) = temp(j);
            end
        end
    end
    clear('temp');
    % the 100 is a workaround for a javascript indexing issue I don't want
    % to deal with fixing
    eventTimesStr = strcat('[[',eventTimesStr,'],[100]',']');
    end

if strcmp(writevar,'write')
    disp(strcat('Please note the write function occassionally makes a strange error which is as of yet unfixed.',...
        'Said error is a clustering mistake in the formatting of the times string which yields something',...
        'of the form [...[a],[b,b],[c],[c]...] where a,b, and c are numbers. This error manifests as an',...
        'abrupt discontinuation of the animation in the html page and can be rectified by going to the times',...
        'in the file around which this stopping occurs and manually taking [c],[c] to [c,c].'))
    
    % format data
    [nextUpStrP, eventTimesStrP] = format(eventTimes);
    [nextUpStrBR, eventTimesStrBR] = format(indBase);
    
    cpTimesStr = '[';
    for i=1:length(cpTimes)-1
        cpTimesStr = strcat(cpTimesStr,num2str(cpTimes(i)),',');
    end
    cpTimesStr = strcat(cpTimesStr,num2str(cpTimes(end)),']');
        
    % create a unique identifier
%     temp = num2str(now);
%     a = num2str(rand);
%     a = a(end-2:end);
%     temp = strcat(temp(end-2:end),a);
    
    % make file names save data, print figures, give heads up
%     dataFileName = strcat('data',temp,'.js');
    dataFileName = strcat(filename,'.js');
    figureFileName = strcat(filename, 'Fig', '.jpeg');
    clear('temp');
    
    % save data to file
    fileID = fopen(dataFileName,'w');
    formatSpec = strcat('/*This file was created using the base rate function',func2str(brFn),...
        'and the cause functions');
    for i=1:length(causeTimes);
        formatSpec = strcat(formatSpec, func2str(causeFns{i}), 'at time', num2str(causeTimes(i)),',');
    end
    formatSpec = strcat(formatSpec, 'as well as the preventative functions');
    for i=1:length(prevTimes)
        formatSpec = strcat(formatSpec, func2str(prevFns{i}),'at time',num2str(prevTimes(i)),...
            'with parameter', num2str(thinParams(i)),',');
    end
    formatSpec = strcat(formatSpec, '*/','\n \n var dTimes=',cpTimesStr,';','\n var lightOrderP=%s; \n var eTimesP=%s;',...
        '\n var lightOrderBR=%s; \n var eTimesBR=%s;');
    fprintf(fileID,formatSpec,nextUpStrP,eventTimesStrP,nextUpStrBR,eventTimesStrBR);
    fclose(fileID);
    disp(strcat('written:',dataFileName))

    % save figure
    if exist('fig','var')
        print(fig,'-djpeg',figureFileName);
        disp(strcat('saved:',figureFileName))    
    end
end
end


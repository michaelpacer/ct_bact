function [ output_args ] = write_ct_bact_lum_data( input_args )
%WRITE_CT_BACT_LUM_DATA Summary of this function goes here
%   Detailed explanation goes here


%% Output Formatting for JS
% create a formatting function
    function [nextUpStr, event_timesStr] = format( event_times )
    % generate nextUp list to tell JS which bact to light given the next time
    nextUp = {};
    for i=1:40
        if isempty(event_times{i})
            list(i) = inf;
        else
            list(i) = event_times{i}(1); 
        end
    end
    event_timesCopy = event_times;
    while min(list)<inf
        minIndex = find(list==min(list));
        for k=1:length(minIndex)
            if length(event_timesCopy{minIndex(k)})==1
                list(minIndex(k)) = inf;
            else
                list(minIndex(k)) = event_timesCopy{minIndex(k)}(2);
                event_timesCopy{minIndex(k)}(1) = [];
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
    
    % collate all event_times into event_timesList, to be read sequentially per nextUp
    temp = [];
    for i=1:40
        temp = [temp event_times{i}];
    end
    temp = sort(temp);
    event_timesList = temp;
    clear('temp')
    
    % format timeList matrix as JS friendly event_timestr
    temp = [];
    event_timesStr = num2str(event_timesList(1),2);
    for i=2:length(event_timesList)
        temp = num2str(event_timesList(i));
        if not(event_timesList(i)==event_timesList(i-1));
            event_timesStr(end+1) = ']';
            event_timesStr(end+1) = ',';
            event_timesStr(end+1) = '[';
            for j=1:length(temp)
                event_timesStr(end+1) = temp(j);
            end
        else
            event_timesStr(end+1) = ',';
            for j=1:length(temp)
                event_timesStr(end+1) = temp(j);
            end
        end
    end
    clear('temp');
    % the 100 is a workaround for a javascript indexing issue I don't want
    % to deal with fixing
    event_timesStr = strcat('[[',event_timesStr,'],[100]',']');
    end

    disp(strcat('Please note the write function occassionally makes a strange error which is as of yet unfixed.',...
        'Said error is a clustering mistake in the formatting of the times string which yields something',...
        'of the form [...[a],[b,b],[c],[c]...] where a,b, and c are numbers. This error manifests as an',...
        'abrupt discontinuation of the animation in the html page and can be rectified by going to the times',...
        'in the file around which this stopping occurs and manually taking [c],[c] to [c,c].'))
    
    % format data
    [nextUpStrP, event_timesStrP] = format(event_times);
    [nextUpStrBR, event_timesStrBR] = format(indBase);
    
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
    for i=1:length(cause_times);
        formatSpec = strcat(formatSpec, func2str(causeFns{i}), 'at time', num2str(cause_times(i)),',');
    end
    formatSpec = strcat(formatSpec, 'as well as the preventative functions');
    for i=1:length(prev_times)
        formatSpec = strcat(formatSpec, func2str(prevFns{i}),'at time',num2str(prev_times(i)),...
            'with parameter', num2str(thinParams(i)),',');
    end
    formatSpec = strcat(formatSpec, '*/','\n \n var dTimes=',cpTimesStr,';','\n var lightOrderP=%s; \n var eTimesP=%s;',...
        '\n var lightOrderBR=%s; \n var eTimesBR=%s;');
    fprintf(fileID,formatSpec,nextUpStrP,event_timesStrP,nextUpStrBR,event_timesStrBR);
    fclose(fileID);
    disp(strcat('written:',dataFileName))

    % save figure
    if exist('fig','var')
        print(fig,'-djpeg',figureFileName);
        disp(strcat('saved:',figureFileName))    
    end


end


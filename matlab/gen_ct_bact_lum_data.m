function [event_times] = gen_ct_bact_lum_data(rate_fn,ntraj,interval,cause_times,prev_times,cause_fns,prev_fns ...
                                             ,thin_params,verbose)
%[event_times] = gen_ct_bact_lum_data(rate_fn,ntraj,interval,cause_times,prev_times ...
%                                    ,cause_fns,prev_fns,thin_params,verbose)
%SUMMARY:
%   This function outputs the event_times of luminescence in a cell array
%   indexed by bacterial culture. It also generates a JS friendly data set 
%   for the CTBactLum experiment. The experiment is 60s long.
%
%INPUTS:
%   rate_fn     = Base rate event occurrance function.
%   ntraj       = Number of trajectories to generate
%   interval    = Time interval to inspect.
%   cause_times = Row vector of causal event occurrance times.
%   prev_times  = Row vector of preventative event occurrance times.
%   cause_fns   = cell array of fn handles, e.g. {@(x) exp(-x), @(x) 1+0*x}
%   prev_fns    = cell array like causeFns, but preventative
%   thin_params = row vec. of thinning strength parameters, one per preventative function.
%
%EXAMPLE:
%   rate = @(x) 0; ntraj = 3; interval = [0,20]; cause_times = [2,15];
%   prev_times = [4,18]; cause_fns = {@(x) exp(-x/2), @(x) 1}; 
%   prev_fns   = {@(x) exp(-x^2/2), @(x) 1}; thin_params = [1,1]; verbose = 1;
%
%   event_times = gen_ct_bact_lum_data(rate,ntraj,interval,cause_times,prev_times ...
%                                     ,cause_fns,prev_fns,thin_params,verbose);
%
%NOTE: event_times are rounded up to nearest 20 millisecond mark.

%----------------------------------------------------------------------------------------------%
% Generate pre-thinning process trajectories.
%----------------------------------------------------------------------------------------------%
base_event_times   = gen_br_traj(interval,ntraj,rate_fn);
caused_event_times = gen_caused_traj(cause_fns,cause_times);

% Collate caused_event_times and base_event_times so we have "complete" sample paths
event_times = cell(1,ntraj);
for traj_num = 1:ntraj
    for ith_ct = 1:length(cause_times)
        event_times{traj_num} = [event_times{traj_num}, caused_event_times{ith_ct}{traj_num}];
    end
    event_times{traj_num} = sort([event_times{traj_num}, base_event_times{traj_num}]);
end

%----------------------------------------------------------------------------------------------%
%                                   Thin the process trajectories.
% We cycle through events in each trajectory and ask "Does this event come after an occurrance
% of a preventative event?" If so, we probabilistically keep or remove it.
%----------------------------------------------------------------------------------------------%
if ~isempty(prev_times)
   for traj_num = 1:ntraj
      cur_traj = event_times{traj_num};
      nevents  = length(cur_traj);
      rm_msk   = zeros(1,nevents);
      
      vdisp('---------------------------------------------------',1,verbose)
      vdisp(['Pre-thinning event_times{' num2str(traj_num) '} :'],1,verbose)
      vdisp(['   ' mat2str(cur_traj,3)]                          ,1,verbose);
      
      for e_num = 1:nevents
         % Determine which preventative causes are present at each time
         cur_time = cur_traj(e_num);
         prev_indicator = cur_time > prev_times;
         
         % Init. probability cut off used for thinning.
         thin_prob = 0;
         for prev_fn_num = 1:length(prev_fns)
            cur_prev_fn   = prev_fns{prev_fn_num};
            cur_prev_time = prev_times(prev_fn_num);
            
            % If this prev fn is present @ current time, modify prob_cutoff
            if prev_indicator(prev_fn_num) == 1; 
               cur_prev_fn_val = cur_prev_fn(cur_time - cur_prev_time);
               thin_prob = thin_params(prev_fn_num) .* cur_prev_fn_val;              
            end
         end
         
         if thin_prob > 0;
            this_random_num = rand();
            if this_random_num <= thin_prob;
               rm_msk(e_num) = 1;
            end
         end
      end
      
      event_times{traj_num} = event_times{traj_num}(~rm_msk);
      
      vdisp(' '                                             ,1,verbose)
      vdisp(['Thinned event_times{' num2str(traj_num) '} :'],1,verbose)
      vdisp(['   ' mat2str(event_times{traj_num},3)]        ,1,verbose);
      
   end
end
%----------------------------------------------------------------------------------------------%
end



function [traj] = gen_br_traj(interval,ntraj,rate_fn)
   traj = cell(1,ntraj);
   for traj_num = 1:ntraj
      new_traj = gen_poisson(rate_fn,interval);
      if ~isempty(new_traj)
         new_traj = floor(new_traj*100);
            for ind = 1:length(new_traj)
               if mod(new_traj(ind),2)
                  new_traj(ind) = new_traj(ind) + 1;
               end
            end
            new_traj = new_traj/100;
      end
      traj{traj_num} = new_traj;
   end
end


 function [caused_event_times] = gen_caused_traj(cause_fns, cause_times)
 % Apply cause at time 0 rate function to all 40 cultures and generate
 % proposed event_times. Take 0 to mean no pp event.
 caused_event_times = cell(1,length(cause_times));
 for r=1:length(cause_times)
     temp = cell(1,40);
     for i = 1:40
         temp{i} = NonHomPoisson(cause_fns{r},[0,(60-cause_times(r))]);
         if not(isempty(temp{i}))
             temp{i} = floor(temp{i}*100);
             for j=1:length(temp{i})
                 if mod(temp{i}(j),2)
                     temp{i}(j)= (temp{i}(j)+1);
                 end
             end
             temp{i} = temp{i}/100+cause_times(r);
         end
     end
     caused_event_times{r}=temp;
 end
 end


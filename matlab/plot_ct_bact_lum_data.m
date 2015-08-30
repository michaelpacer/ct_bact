function [ output_args ] = plot_ct_bact_lum_data(  )
%PLOT_CT_BACT_LUM_DATA Summary of this function goes here
%   Detailed explanation goes here

fig = figure;
title('Sample trajectories from "event_times", Rate Functions')
xlabel('Time (s)')
ylabel('Trajectory #, Fn. Values')
hold on;
%plot causeFns
if not(isempty(cause_times))
   l=length(cause_times);
   for r=1:l
      x = 0:0.5:(60-cause_times(r));
      plot(x+cause_times(r),causeFns{r}(x)); axis([0,60,0,4]);
   end
end
%plot prevFns
if not(isempty(prev_times))
   m=length(prev_times);
   for r=1:m
      x = 0:0.5:(60-prev_times(r));
      plot(x+prev_times(r),prevFns{r}(x),'color','r'); axis([0,60,0,4]);
   end
end
%plot event_times
for r=1:3
   plot(event_times{r},r*ones(length(event_times{r})),'or'); axis([0,60,0,4]);
end
plot(0:60,brFn(0:60)); axis([0,60,0,4]);
hold off;

end


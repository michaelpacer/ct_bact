/*This file was created using the base rate function@(x)1/10+x*0and the cause functionsas well as the preventative functions@(x)1/4*exp(-x/32)at time10with parameter1,@(x)1/4*exp(-x/32)at time17with parameter1,*/
 
 var dTimes=[10,17];
 var lightOrderP=[36,32,29,19,38,26,8,20,30,23,32,6,28,8,5,12,17,5,37,39,23,23,31,24,29,29,22,15,21,30,37,30,37,13,34,32,32,18,40,7,10,4,11,17,22,17,9,38,19,23,35,24,22,37,20,33,20,1,13,14,23,32,34,5,17,25,25,17,11,3,35,37,16,34,35,17,16,21,2,11,4,5,2,5,4,20,14,32,20,23,25,33,24,18,3,3,30,2,26,22,5,30,1,37,26,40,22,4,3,7,16,26,5,38,7,16,27,13,16,36,16,13,3,27,14,1,17,37,11,28,39,17,39,20,18,19,7,15,37,40,4,10,7,12,31,33,40,28,35,8,10,36,25,14,36,23,18,40,30,29,5,1,35,3,35,14,30,13,26,2,30,11,24,40,16,36,21,27,21,3,22,3,21,3,7,13,10,18,10,39,1,10,1]; 
 var eTimesP=[[0.04],[0.28],[0.38],[0.54],[1.68],[2.02],[2.1],[2.2,2.2],[2.34],[3.4],[3.52],[3.82],[4.14],[4.4],[4.84],[5.16],[5.62,5.62,5.62],[5.74],[6.36],[6.44],[7.54],[7.62],[8],[8.08],[8.28],[8.42],[8.52],[8.76],[8.94],[9.06],[9.3],[9.42],[9.76,9.76],[10.04],[10.12],[10.18],[10.78],[11.14],[11.4],[11.54],[11.74],[11.98],[12.48],[12.82],[13.26],[13.64],[13.68],[14.36],[14.66],[15.94],[16.12],[16.3],[17.08],[17.8],[18.78],[19.42],[19.72],[20.38],[20.46],[21],[21.04],[21.7],[22.4],[23.22],[23.62],[24.34],[25.5],[25.78],[26.62],[27.24],[27.52],[27.9],[27.94],[28.08],[28.44],[28.72],[29.14],[29.56],[29.86,29.86],[29.88],[30.26],[30.34],[30.44],[30.74],[31.04],[31.86],[32.4],[32.42],[32.62],[33.04,33.04],[33.14],[33.48],[33.5],[33.56],[34.06],[36.86],[37.1,37.1],[37.32],[37.56],[37.6],[38.08],[38.48],[38.52],[39.02],[39.12],[39.2],[39.4],[39.5],[39.52],[39.64],[40.32],[40.46],[40.78],[40.9],[40.98],[41.2],[41.32],[41.36],[41.4],[41.74],[41.9],[42.08,42.08],[42.22],[43.1],[43.12],[43.5],[43.56],[43.58],[43.64],[43.7,43.7],[44.24],[44.7],[45],[46.04],[46.12],[46.26],[46.38],[46.42],[46.58],[47.38],[47.8],[47.92],[48.02],[48.36],[48.68,48.68],[48.9],[48.98],[49.56],[49.62],[50.62],[50.88],[50.9],[50.98],[51.04],[51.6],[52.3],[52.44],[52.52,52.52],[52.86],[53.38],[53.86],[54.3],[54.7],[55.16],[55.42],[55.7],[56.62],[56.96],[57],[57.1],[57.98],[58.06],[58.94],[59.1],[59.16],[59.34],[59.5],[59.56],[59.62],[59.78],[59.98],[100]];
 var lightOrderBR=[34,8,13,30,35,30,22,5,26,25,14,15,10,11,30,7,24,13,5,11,12,16,34,30,8,17,16,7,6,22,32,33,11,40,23,19,32,29,5,17,16,28,22,36,19,23,38,12,7,28,18,28,27,3,36,20,29,13,2,37,33,4,40,23,11,23,14,35,23,21,12,3,8,22,7,25,35,27,3,15,35,39,26,7,19,3,24,14,15,9,3,4,29,10,33,23,26,11,3,20,1,6,30,30,9,4,24,22,7,6,29,28,39,4,14,5,38,8,17,5,3,4,1,2,24,4,37,27,28,28,33,28,6,9,33,4,14,6,31,10,39,30,39,22,39,25,17,16,26,15,6,34,40,12,35,33,10,32,18,13,18,33,36,15,4,6,9,12,17,17,1,24,2,33,5,5,29,31,18,6,7,6,1,36,22,36,10,40,35,20,24,14,38,12,32,20,23,22,6,9,14,22,35,12,23,21,5,2,36,30,8,40,29,22,40,5,8,20,28,4,26,6,32,14,8,35,34,15,26,40,22,5,13,12,27,1]; 
 var eTimesBR=[[0.4],[0.42],[0.46],[1.2],[1.28],[1.76],[1.9],[2.6],[2.94],[3.22],[3.4],[3.42],[3.44],[3.78],[3.96],[4.1],[4.24],[4.6],[4.74],[4.78],[5.02],[5.04,5.04],[5.24],[5.34],[5.72],[5.76],[6.4],[6.64],[6.98],[7.12],[7.28],[7.3],[7.5],[7.82],[8.04],[8.92],[9.22],[9.24],[9.86],[9.98],[10.02],[10.44],[10.78],[10.86],[11],[11.08],[11.16],[11.22],[11.8],[11.88],[11.9],[11.94],[12],[12.74],[12.78],[13.26],[13.54],[13.96],[14.12],[14.86],[14.92],[14.94],[14.98],[15.04,15.04],[15.06],[15.26],[15.36],[15.88],[15.98],[16.74,16.74],[16.78],[16.98],[17.16],[17.36],[17.52],[17.9],[17.98],[18.1],[18.12],[18.32],[18.78],[18.9],[19.24,19.24],[19.48],[20.6],[20.9],[21.08],[21.34],[21.74],[21.76,21.76],[23.18],[23.24],[23.26],[23.48],[23.9],[24.02],[24.06],[24.52],[24.82],[25.06],[25.18],[26.14],[26.52],[26.64],[26.76],[26.96],[27.96],[28.08],[28.12,28.12],[28.8],[28.9],[29.24],[29.28],[29.72],[29.82],[30.14],[30.48,30.48],[30.82],[30.96],[31.06],[31.24,31.24],[31.38],[31.42],[31.66],[31.94],[32.3],[32.34],[32.5],[32.7],[33.04,33.04],[33.12],[33.16],[33.4],[33.54],[33.6],[33.62],[33.88],[34.04],[34.12],[34.24],[34.76],[35],[35.34],[35.4],[35.82,35.82],[36.7],[36.82],[36.9],[37],[37.18],[38.02],[38.34],[38.38],[38.8],[38.94],[39.04],[39.28],[39.64],[40.12],[40.82],[41.18],[41.38],[41.9],[42.76],[42.82],[42.9],[43.32],[43.52],[43.68],[43.8],[43.82],[43.9],[43.92],[44.14],[44.64],[44.66],[44.76],[45.44],[45.58],[45.7],[46.78],[46.9,46.9],[46.92],[47.76],[48.32],[48.9],[49.08],[49.38],[49.52],[49.6],[49.84],[49.9],[50],[50.16],[50.58],[50.7],[51.1],[51.58],[51.72],[52.14],[52.68],[53.16],[54.3],[54.86],[55.24],[55.66],[55.86],[56.1],[56.32],[56.38],[56.52],[56.68],[56.94],[57.1],[57.36],[57.64],[58.14],[58.4],[58.68],[59.04],[59.38],[59.76],[59.8],[59.96],[100]];
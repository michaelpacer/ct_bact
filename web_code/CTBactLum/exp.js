//<!--

//checks browser support for image el via object detection
//preloads images
if (document.images) {
	litImage = new Image(84,85);
	litImage.src = "Lit.jpg";
	
	normalImage = new Image(84,85);
	normalImage.src = "normal.jpg";
	
	indOnImage = new Image(84,85);
	indOnImage.src = "indOn.jpg";
	
	indOffImage = new Image(84,85);
	indOffImage.src = "indOff.jpg";
}
var dsc = new Array();
var eTimes = new Array();
var lightOrder = new Array();
var expCounter = 0;
var eTimesIndex = 0;
var dTimesIndex = 0;
var lightOrderIndex = 0;
var indexHolder = new Array();
var stopToggle = 0;
var	time = 0;
var elapsed = 0;
var clock = 0;
var randViewInd = Math.floor(2*Math.random());

//array sum and clock difference tracker
Array.prototype.sum = function() {return this.reduce(function(a,b){return a+b;});}
var tracker = new Array();

function begin(){
	eTimesIndex=0;
	lightOrderIndex = 0;
	stopToggle = 0;
	stopToggle = 0;
	start = new Date().getTime();
	time = 0;
	newTimer();
	document.getElementById('bb').style.display='none';
	expCounter++;
}

//switching of images is done by changing source
function checkTime(){
	var l = eTimes[eTimesIndex].length;
	var s = eTimes[eTimesIndex];
	if(elapsed===dTimes[dTimesIndex] && (randViewInd+expCounter)%2===0){
		document.getElementById('indicator').src='indOn.jpg';
		setTimeout("document.getElementById('indicator').src='indOff.jpg';",100);
		dTimesIndex++;
		}
	for (var i=0;i<=l;i++){
			if(elapsed===s[i]){
			indexHolder.push(eTimesIndex);
			light(lightOrder[lightOrderIndex]);
			setTimeout("lightOff()",80);
			eTimesIndex++;
			lightOrderIndex++;
		}
	}
	if(elapsed===60){
		if(expCounter%2===0){goTo('exp','interim2');}
		else{goTo('exp','interim1');}
		dsc.push(Math.round(100*tracker.sum()/tracker.length)/100);
		alert(dsc);
	}
}

function exPlay1(){
	exClock();
	function exClock(){
		clock=Math.round(clock*100+1)/100;
		if(clock==0.5){document.getElementById('exbact').src="lit.jpg";}
		if(clock==1){
			document.getElementById('exbact').src="normal.jpg";
			clock=0;
			return false;
		}
		t=setTimeout("exPlay1()",10);
	}
}

function exPlay2(){
	exClock();
	function exClock(){
		clock=Math.round(clock*100+1)/100;
		if(clock==0.5){document.getElementById('exInd').src="indOn.jpg";}
		if(clock==1){
			document.getElementById('exInd').src="indOff.jpg";
			clock=0;
			return false;
		}
		t=setTimeout("exPlay2()",10);
	}
}

function goTo(leave,show){
	if(show=='exp'){
		eTimesIndex = 0;
		lightOrderIndex = 0;
		stopToggle = 0;
		time = 0;
		elapsed = 0;
		clock = 0;
		document.getElementById('bb').style.display='inline';
		for(var i=1;i<=40;i++){document.getElementById('bact'+i).src="normal.jpg";}
		if((randViewInd+expCounter)%2===0){
			document.getElementById('expLabel').innerHTML='The cultures currently displayed have no radiation exposure';
			document.getElementById('indicator').style.display='none';
			lightOrder = lightOrderBR;
			eTimes = eTimesBR;
			alert("You are about to see a set of cultures with NO radiation exposure");
		}
		if((randViewInd+expCounter)%2===1){
			document.getElementById('expLabel').innerHTML='The cultures below are exposed to radiation when the indicator turns blue';
			document.getElementById('indicator').style.display='block';
			lightOrder = lightOrderP;
			eTimes = eTimesP;
			lightOrder = lightOrderP;
			eTimes = eTimesP;
			alert("You are about to see a set of cultures which is intermitently exposed to radiation.");
			}
	}
	window.scrollTo(0,0);
	if (leave == '') {document.getElementById(show).style.display='block';}
	else{
		stopToggle = 1;
		document.getElementById(leave).style.display='none';
		document.getElementById(show).style.display='block';
	}
}

function init(){
	goTo('','consent');
}

function light(i){
	document.getElementById('bact'+i).src="lit.jpg";
}

function newTimer(){
	checkTime();
    time += 20;
    elapsed = Math.floor(time / 10) / 100;
    var diff = (new Date().getTime() - start) - time;
	if(stopToggle===0){
	window.setTimeout(newTimer,(20 - diff));
	tracker.push(diff);
	}
}

function lightOff(){
	var itemNum = indexHolder[0];
	indexHolder.shift();
	document.getElementById('bact'+lightOrder[itemNum]).src="normal.jpg";
}

function validateForm() {
	var ans = new Array();
    ans[0] = document.forms["rateForm"]["rateFieldC"].value;
    ans[1] = parseInt(ans[0]);
	ans[2] = document.forms["rateForm"]["rateFieldP"].value;
    ans[3] = parseInt(ans[2]);
	ans[4] = document.forms["rateForm"]["rateFieldN"].value;
    ans[5] = parseInt(ans[4]);
	for(var j=0;j<=2;j++){
		if(ans[2*j]!=ans[2*j+1]){
			alert("Please fill in each field, using only numeric characters in your responses.");
			return false;
			}
		if(ans[2*j+1]>100 || ans[2*j+1]<-100){
			alert("You must provide individual ratings between 0 (no confidence) and 100 (total confidence)");
			return false;
			}
		}
	var sum = ans[1]+ans[3]+ans[5];
	if(sum!=100){alert("The sum of your responses is equal to "+sum+". Please revise your entries so they add up to 100"); return false;}
	document.forms["rateForm"]["responseDsc"].value=dsc;
	thisform.submit();
}

function toyForm() {
	var ans = new Array();
    ans[0] = document.getElementById('responseA').value;
    ans[1] = parseInt(ans[0]);
	ans[2] = document.getElementById('responseB').value;
    ans[3] = parseInt(ans[2]);
	ans[4] = document.getElementById('responseC').value;
    ans[5] = parseInt(ans[4]);
	for(var j=0;j<=2;j++){
		if(ans[2*j]!=ans[2*j+1]){
			alert("Please fill in each field, using only numeric characters in your responses.");
			return false;
			}
		if(ans[2*j+1]>100 || ans[2*j+1]<-100){
			alert("Please provide individual ratings between 0 (no confidence) and 100 (total confidence)");
			return false;
			}
		}
	var sum = ans[1]+ans[3]+ans[5];
	if(sum!=100){alert("The sum of your responses is equal to "+sum+". Please revise your entries so they add up to 100"); return false;}
	alert("Looks like you understand how the form works!")
}

//-->
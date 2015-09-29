/*
 * Requires:
 *     psiturk.js
 *     utils.js
 */

// Initalize psiturk object
var psiTurk = new PsiTurk(uniqueId, adServerLoc, mode);

var mycondition = condition;            // these two variables are passed by the psiturk server process
var mycounterbalance = counterbalance;  // they tell you which condition you have been assigned to
                                        // they are not used in the stroop code but may be useful to you

// All pages to be loaded
// Where does consent in this order? [DS]
var pages = [
	"instructions/instruct-desc.html",
	"instructions/instruct-ex-exp.html",
	"instructions/instruct-ex-form.html",
	"stage.html",
	"questionnaire.html"
];

//-----------------------------------------------------------------------------------
// [DS]
// image preloading should happen... 
// probably there is a psiTurk.preloadImages(images)
// var images = [];

// if (document.images) {
// 	litImage = new Image(84,85);
// 	litImage.src = "Lit.jpg";
	
// 	normalImage = new Image(84,85);
// 	normalImage.src = "normal.jpg";
	
// 	indOnImage = new Image(84,85);
// 	indOnImage.src = "indOn.jpg";
	
// 	indOffImage = new Image(84,85);
// 	indOffImage.src = "indOff.jpg";
// }
//-----------------------------------------------------------------------------------


psiTurk.preloadPages(pages);

var instructionPages = ["instructions/instruct-desc.html",
	                    "instructions/instruct-ex-exp.html",
	                    "instructions/instruct-ex-form.html",
	                    ];


/********************
* HTML manipulation
*
* All HTML files in the templates directory are requested 
* from the server when the PsiTurk object is created above. We
* need code to get those pages from the PsiTurk object and 
* insert them into the document.
********************/



/********************
* STROOP TEST       *
********************/
/********************************************************************************/
var StroopExperiment = function() {

	var wordon, // time word is presented
	    listening = false;

	// Stimuli for a basic Stroop experiment
	var stims = [
			["SHIP", "red", "unrelated"],
			["MONKEY", "green", "unrelated"],
			["ZAMBONI", "blue", "unrelated"],
			["RED", "red", "congruent"],
			["GREEN", "green", "congruent"],
			["BLUE", "blue", "congruent"],
			["GREEN", "red", "incongruent"],
			["BLUE", "green", "incongruent"],
			["RED", "blue", "incongruent"]
		];

	stims = _.shuffle(stims);

	var next = function() {
		if (stims.length===0) {
			finish();
		}
		else {
			stim = stims.shift();
			show_word( stim[0], stim[1] );
			wordon = new Date().getTime();
			listening = true;
			d3.select("#query").html('<p id="prompt">Type "R" for Red, "B" for blue, "G" for green.</p>');
		}
	};
	
	var response_handler = function(e) {
		if (!listening) return;

		var keyCode = e.keyCode,
			response;

		switch (keyCode) {
			case 82:
				// "R"
				response="red";
				break;
			case 71:
				// "G"
				response="green";
				break;
			case 66:
				// "B"
				response="blue";
				break;
			default:
				response = "";
				break;
		}
		if (response.length>0) {
			listening = false;
			var hit = response == stim[1];
			var rt = new Date().getTime() - wordon;

			psiTurk.recordTrialData({'phase':"TEST",
                                     'word':stim[0],
                                     'color':stim[1],
                                     'relation':stim[2],
                                     'response':response,
                                     'hit':hit,
                                     'rt':rt}
                                   );
			remove_word();
			next();
		}
	};

	var finish = function() {
	    $("body").unbind("keydown", response_handler); // Unbind keys
	    currentview = new Questionnaire();
	};
	
	var show_word = function(text, color) {
		d3.select("#stim")
			.append("div")
			.attr("id","word")
			.style("color",color)
			.style("text-align","center")
			.style("font-size","150px")
			.style("font-weight","400")
			.style("margin","20px")
			.text(text);
	};

	var remove_word = function() {
		d3.select("#word").remove();
	};

	
	// Load the stage.html snippet into the body of the page
	psiTurk.showPage('stage.html');

	// Register the response handler that is defined above to handle any
	// key down events.
	$("body").focus().keydown(response_handler); 

	// Start the test
	next();
};
/**************************************************************************************/



//------------------------------------------------------------//
// Below is the ct_bact experiment.
//
// A brief overview of experiment control flow:
// - begin()
//
//------------------------------------------------------------//
var experiment = function() {

	// Initialize some global vars:
	var eTimesIndex     = 0;	 		// event times index
	var lightOrderIndex = 0; 			// which light is going to be switched next?
	var stopToggle      = 0; 			// should the experiment keep going?
	var time            = 0; 			//
	var elapsed         = 0; 			//
	var offsets         = new Array();	// 

	Array.prototype.sum = function() {return this.reduce(function(a,b){return a+b;});}

	// Set up the default experiment imagery:
	document.getElementById('bb').style.display='inline';
	for(var i=1;i<=40;i++){
		document.getElementById('bact' + i).src="normal.jpg";
	}

	
	if((randViewInd+expCounter)%2===0){
		document.getElementById('expLabel').innerHTML='The cultures currently displayed have no radiation exposure';
		document.getElementById('indicator').style.display='none';
		lightOrder = lightOrderBR; 	// Set light order to base-rate light order
		eTimes     = eTimesBR;     	// Set event times to base-rate set
		alert("You are about to see a set of cultures with NO radiation exposure");
	}

	if((randViewInd+expCounter)%2===1){
		document.getElementById('expLabel').innerHTML='The cultures below are exposed to radiation when the indicator turns blue';
		document.getElementById('indicator').style.display='block';
		lightOrder = lightOrderP;	
		eTimes     = eTimesP;
		alert("You are about to see a set of cultures which is intermitently exposed to radiation.");
	}

	function beginTimeStepping(){
		eTimesIndex     = 0;
		lightOrderIndex = 0;
		keepIterating   = 1;
		start           = new Date().getTime();
		time            = 0;

		stepTime();											// Step through 20ms intervals & update images.
		document.getElementById('bb').style.display='none';	// Hide the bact. when sub-exp is over. 
		expCounter ++;										// Indicate we want to go to next sub exp.
	}

	function stepTime (){
		timeStepActions();								    // Update images or move screens
	    time    += 20;									    // update the wall time
	    elapsed  = Math.floor(time / 10) / 100;             // update the elapsed time
	    var diff = (new Date().getTime() - start) - time;   // find discrepancy to adjust
		
		if (keepIterating === 1) {
			window.setTimeout(stepTime,(20 - diff));		// Wait 20ms then stepTime again
		    offsets.push(diff);								// Keep the discrepancy. 
		}
	}

	// This fn. checks the current time, updates the image array, and
	// takes the user out of the experiment when 60 sec has passed.
	function timeStepActions(){
		var l = eTimes[eTimesIndex].length;
		var s = eTimes[eTimesIndex];

		if (elapsed === dTimes[dTimesIndex] && (randViewInd+expCounter)%2===0){
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
			if(expCounter%2===0){
				goTo('exp','interim2');
			}
			else{
				goTo('exp','interim1');
			}
			dsc.push(Math.round(100*tracker.sum()/tracker.length)/100);
			alert(dsc);
		}
	}


    // These two functions "turn the lights on and off."
	function light(i){
		document.getElementById('bact'+i).src="lit.jpg";
	}
	function lightOff(){
		var itemNum = indexHolder[0];
		indexHolder.shift();
		document.getElementById('bact'+lightOrder[itemNum]).src="normal.jpg";
	}

	var finish = function() {
	    currentview = new Questionnaire();
	};
};



/****************
* Questionnaire *
****************/

var Questionnaire = function() {

	var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

	record_responses = function() {

		psiTurk.recordTrialData({'phase':'postquestionnaire', 'status':'submit'});

		$('textarea').each( function(i, val) {
			psiTurk.recordUnstructuredData(this.id, this.value);
		});
		$('select').each( function(i, val) {
			psiTurk.recordUnstructuredData(this.id, this.value);		
		});

	};

	prompt_resubmit = function() {
		replaceBody(error_message);
		$("#resubmit").click(resubmit);
	};

	resubmit = function() {
		replaceBody("<h1>Trying to resubmit...</h1>");
		reprompt = setTimeout(prompt_resubmit, 10000);
		
		psiTurk.saveData({
			success: function() {
			    clearInterval(reprompt); 
                psiTurk.computeBonus('compute_bonus', function(){finish()}); 
			}, 
			error: prompt_resubmit
		});
	};

	// Load the questionnaire snippet 
	psiTurk.showPage('postquestionnaire.html');
	psiTurk.recordTrialData({'phase':'postquestionnaire', 'status':'begin'});
	
	$("#next").click(function () {
	    record_responses();
	    psiTurk.saveData({
            success: function(){
                psiTurk.computeBonus('compute_bonus', function() { 
                	psiTurk.completeHIT(); // when finished saving compute bonus, the quit
                }); 
            }, 
            error: prompt_resubmit});
	});
    
	
};

// Task object to keep track of the current phase
var currentview;

/*******************
 * Run Task
 ******************/
$(window).load( function(){
    psiTurk.doInstructions(
    	instructionPages, 						       // a list of pages you want to display in sequence
    	function() { currentview = new experiment(); } // what you want to do when you are done with instructions
    );
});



// Our old JS code:
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
var dsc             = new Array();
var eTimes          = new Array();
var lightOrder      = new Array();
var expCounter      = 0;
var eTimesIndex     = 0;
var dTimesIndex     = 0;
var lightOrderIndex = 0;
var indexHolder     = new Array();
var stopToggle      = 0;
var	time            = 0;
var elapsed         = 0;
var clock           = 0;
var randViewInd     = Math.floor(2*Math.random());

//array sum and clock difference tracker
Array.prototype.sum = function() {return this.reduce(function(a,b){return a+b;});}
var tracker = new Array();

function begin(){
	eTimesIndex     = 0;
	lightOrderIndex = 0;
	stopToggle      = 0;
	start           = new Date().getTime();
	time            = 0;
	newTimer();
	document.getElementById('bb').style.display='none';
	expCounter ++;
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
		eTimesIndex     = 0;
		lightOrderIndex = 0;
		stopToggle      = 0;
		time            = 0;
		elapsed         = 0;
		clock           = 0;

		document.getElementById('bb').style.display='inline';
		for(var i=1;i<=40;i++){document.getElementById('bact'+i).src="normal.jpg";}
		if((randViewInd+expCounter)%2===0){
			document.getElementById('expLabel').innerHTML='The cultures currently displayed have no radiation exposure';
			document.getElementById('indicator').style.display='none';
			lightOrder = lightOrderBR;
			eTimes     = eTimesBR;
			alert("You are about to see a set of cultures with NO radiation exposure");
		}
		if((randViewInd+expCounter)%2===1){
			document.getElementById('expLabel').innerHTML='The cultures below are exposed to radiation when the indicator turns blue';
			document.getElementById('indicator').style.display='block';
			lightOrder = lightOrderP;
			eTimes     = eTimesP;
			lightOrder = lightOrderP;
			eTimes     = eTimesP;
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

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

// All pages to be loaded after Ad page which, accepted, splashes to consent page. 
var pages = [
	"instruct-desc.html",
	"instruct-ex-exp.html",
	"instruct-ex-form.html",
	"exp.html",
	"postquestionnaire.html"
];

var images = ["/static/images/lit.jpg",
			  "/static/images/normal.jpg",
			  "/static/images/indOn.jpg",
			  "/static/images/indOff.jpg"
];

psiTurk.preloadPages(pages);
psiTurk.preloadImages(images);

var instructionPages = ["instruct-desc.html",
	                    "instruct-ex-exp.html",
	                    "instruct-ex-form.html",
	                    ];


/********************
* HTML manipulation
*
* All HTML files in the templates directory are requested 
* from the server when the PsiTurk object is created above. We
* need code to get those pages from the PsiTurk object and 
* insert them into the document.
********************/

//------------------------------------------------------------//
// Below is the ct_bact experiment.
//
// A brief overview of experiment control flow:
// - begin()
//
//------------------------------------------------------------//
var experiment = function() {
	psiTurk.showPage('exp.html');

	var dsc             = new Array();
	var eTimes          = new Array();
	var lightOrder      = new Array();
	var dTimesIndex     = 0;
	var tracker			= new Array();

	// Initialize some global vars:
	var eTimesIndex     = 0;	 		// event times index
	var lightOrderIndex = 0; 			// which light is going to be switched next?
	var stopToggle      = 0; 			// should the experiment keep going?
	var clock           = 0;
	var time            = 0; 			//
	var elapsed         = 0; 			//
	var offsets         = new Array();	//
	var expCounter      = 0;
	var keepIterating   = 1;
	var alertMsg        = ''


	if (Math.floor(2*Math.random()) == 0){ var condition = 'rad'} else { var condition = 'noRad'}

	Array.prototype.sum = function() {return this.reduce(function(a,b){return a+b;});}

	// Set up the default experiment imagery:
	document.getElementById('beginButton').style.display='inline';
	for(var i=1;i<=40;i++){
		document.getElementById('bact' + i).src="/static/images/normal.jpg";
	}

	addEvent(document.getElementById('beginButton'),'click',beginTimeStepping);	
	addEvent(document.getElementById('nextButton' ),'click',nextPage);

	function setupPage(){
		document.getElementById('interim1'   ).style.display = 'none'
		document.getElementById('exp'        ).style.display = 'block'
		document.getElementById('beginButton').style.display = 'block'

		if (condition == 'rad') {
			document.getElementById('expLabel').innerHTML='The cultures currently displayed have no radiation exposure';
			document.getElementById('indicator').style.display='none';
			lightOrder = lightOrderBR; 	// Set light order to base-rate light order
			eTimes     = eTimesBR;     	// Set event times to base-rate set
			condition  = 'noRad'		// Change condition for next time.
			alertMsg   = "You are about to see a set of cultures with NO radiation exposure";
		}

		if (condition == 'noRad') {
			document.getElementById('expLabel').innerHTML='The cultures below are exposed to radiation when the indicator turns blue';
			document.getElementById('indicator').style.display='block';
			lightOrder = lightOrderP;	
			eTimes     = eTimesP;
			condition  = 'rad'			// Change condition for next time.
			alertMsg   = "You are about to see a set of cultures which is intermitently exposed to radiation.";
		}

		alert(alertMsg)
	}

	function beginTimeStepping(){
		eTimesIndex     = 0;
		lightOrderIndex = 0;
		keepIterating   = 1;
		start           = new Date().getTime();
		time            = 0;

		stepTime();											// Step through 20ms intervals & update images.
		document.getElementById('beginButton').style.display='none';	// Hide the bact. when sub-exp is over. 
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

		if (elapsed === dTimes[dTimesIndex] && (condition == 'rad')) {
			document.getElementById('indicator').src='/static/images/indOn.jpg';
			setTimeout("document.getElementById('indicator').src='/static/images/indOff.jpg';",100);
			dTimesIndex++;
			}

		for (var i=0;i<=l;i++){
			if(elapsed===s[i]){
				blinkLight(lightOrder[lightOrderIndex]);
				eTimesIndex++;
				lightOrderIndex++;
			}
		}

		if( elapsed === 2) {
			keepIterating = 0
			if (expCounter < 2 ) {
				showInterim()
			} else {
				nextPage()
			}
		}
			//dsc.push(Math.round(100*tracker.sum()/tracker.length)/100);
			//alert(dsc);
	}


    // These two functions "turn the lights on and off."
	function blinkLight(i){
		var base_str = "document.getElementById(bact";
		var turn_off = base_str.concat(toString(i),").src='/static/images/normal.jpg';");

		document.getElementById('bact'+i).src="/static/images/lit.jpg";
		function lightOff() {document.getElementById('bact' + i).src="static/images/normal.jpg"}
		setTimeout(lightOff,80)
	}

	function showInterim(){
		//var interim_page = "interim".concat(toString(num),".html")
		document.getElementById('exp'     ).style.display = 'none'
		document.getElementById('interim1').style.display = 'block'
	}

	function nextPage(){
		if (expCounter < 2) {
			setupPage()
		} else {
	    	currentview = new Questionnaire();
		}
	}

	setupPage()
};



/****************
* Questionnaire *
****************/

var Questionnaire = function() {

	var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

	record_responses = function() {

		psiTurk.recordTrialData({'phase':'postquestionnaire', 'status':'submit'});

		$('input').each( function(i, val) {
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
	
	$("#submit").click(function () {
	    record_responses();
	    psiTurk.saveData({
            success: function(){
                psiTurk.computeBonus('compute_bonus', function() { 
                	psiTurk.completeHIT(); // when finished saving compute bonus, the quit
                }); 
            }, // for some reason when prompt_resubmit gets triggered below, replaceBody can't be found ...
            error: alert('error!') });//prompt_resubmit});
	});
    
	
};

function addEvent(element, evnt, funct){
  if (element.attachEvent)
   return element.attachEvent('on'+evnt, funct);
  else
   return element.addEventListener(evnt, funct, false);
}

// Task object to keep track of the current phase
var currentview;

/*******************
 * Run Task
 ******************/
$(window).load( function(){
    psiTurk.doInstructions(
    	instructionPages, 						       // a list of pages you want to display in function
    	function() { currentview = new experiment(); } // what you want to do when you are done with instructions
    );
});


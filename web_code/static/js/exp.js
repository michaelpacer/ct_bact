//------------------------------------------------------------//
// Below is the ct_bact experiment.
//
// A brief overview of experiment control flow:
// - begin()
//
//------------------------------------------------------------//
var experiment = function() {

	// Initialize some global vars:
	var dsc             = new Array();
	var eTimes          = new Array();
	var lightOrder      = new Array();
	var dTimesIndex     = 0;
	var tracker			= new Array();
	var eTimesIndex     = 0;	 		// event times index
	var lightOrderIndex = 0; 			// which light is going to be switched next?
	var clock           = 0;
	var time            = 0; 			// The actual time.
	var elapsed         = 0; 			// The elapsed time in the current experimental condition
	var offsets         = new Array();	// A record of timer discrepancy, for self correcting.
	var expCounter      = 0;			// Which experimental condition are we in?
	var keepIterating   = 1;			// Boolean, keep time stepping?
	var alertMsg        = ''			// Dynamically changed, a description of the exp. condition.
	var endTime			= 2             // This should be 60, but can be set low for debugging purposes...


	if (Math.floor(2*Math.random()) == 0){ var condition = 'rad'} else { var condition = 'noRad'}

	Array.prototype.sum = function() {return this.reduce(function(a,b){return a+b;});}

	// Set up the default experiment imagery:

	// addEvent(document.getElementById('beginButton'),'click',beginTimeStepping);	
	// addEvent(document.getElementById('nextButton' ),'click',nextPage);

	function setupPage(){
		for(var i=1;i<=40;i++){
			document.getElementById('bact' + i).src="/static/images/normal.jpg";
		}

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

		if( elapsed === endTime) {
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

	psiTurk.showPage('stage.html');

	$('#beginButton').click(beginTimeStepping)
	$('#nextButton').click(nextPage)

	setupPage()
};
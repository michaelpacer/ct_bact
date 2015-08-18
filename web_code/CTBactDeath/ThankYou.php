<?php	
session_start();

include("connect.php");
mysql_connect($host,$username,$password);
@mysql_select_db($database) or die( "Unable to select database");

// first check if we're still in the right session
if(!isset($_SESSION['workerID'])) {
	// error, this was either lost somehow in the session or the users never went to the consent page
	echo "ERROR: ";
	exit;
}

$workerID = $_SESSION['workerID'];

$ip_address = $_SESSION['ip_address'];
$foo = explode('.',$ip_address);
$last = $foo[3];

// generate validation code -- category|workerid
$validation_code = $experiment.$workerID."-".$last;

// record duration
$start_time = $_SESSION['start_time'];
$end_time = time();

$time_diff = $end_time - $start_time;
$total_time = date('i:s', $time_diff);

$response_p = $_POST['rateField'];
$response = mysql_real_escape_string($response_p);

$query = "update workers set validation_code='$validation_code',total_time='$total_time',response='$response' where id = '$workerID'";
$result = mysql_query($query);
?>

<html>
<head>
<style type="text/css">
h1 {font-size:1.5em;}
h2 {font-size:1.25em;}
p {font-family:Verdana, Geneva, sans-serif; text-indent:50px;}
form {font-family:Verdana, Geneva, sans-serif; text-indent:0px;}


<!-- style.display can be altered as an alternative to using DOM -->
.thanks {display:block;}
.debrief{display:none;}

.debrief, .thanks {margin-left:auto; margin-right:auto; width:706px;}
</style>

<script type="text/javascript">

function goToDebrief(){
	document.getElementById('thanks').style.display='none';
	document.getElementById('debrief').style.display='block';
}
	
</script>
</head>

<body>

<div id="thanks" class="thanks">
<!-- give thanks and validation -->
<h1>Thank you for your participation in this experiment!</h1>
<hr> <p> Your validation code for this experiment is: </p><br />
<center><hr width="25%"><h1><? echo $validation_code; ?></h1><hr width="25%"></center>
<br><p> Please copy and paste this code back in the input box on the Mechanical Turk HIT to receive credit for your
 work! </p>
<p> <font color=red>Please note that you can only participate in this experiment once, if you attempt to do another
 HIT, you will get an error message and will not be awarded any additional credit.</font></p>
<!-- give debriefing -->
<hr><input type="button" onClick="goToDebrief()" value="Debrief Me!">
</div>

<div id="debrief" class="debrief">
<h1> Debriefing </h1>
<p>The experiment you just participated in is part of an exploration of the properties of human assessments of causality.
While the existence and strength of simple causal relationships are quickly and accurately assessed by human beings, 
the process by which this is done is far from clear.</p>
<p>While this is a very difficult problem to solve, your input is helping us discover how people manage to do these tasks.
For related papers on this subject, please reference:</p>
<ol>
<li><i>(ref)</i></li><br/>
<li><i>(ref)</i></li>
</ol>
<p>If you have any questions about the study, feel free to contact Mike Pacer. He can be
reached at <a href="mailto:mpacer@berkeley.edu">mpacer@berkeley.edu</a>. If you 
would like us to send you the results of the study once it has been completed, make sure 
to provide the experimenter with an e-mail address.</p>
<p>If you have concerns about your rights as a participant in this experiment, please contact
UC Berkeley's Committee for Protection of Human Subjects at (510) 642-7461 or
<a href="mailto:subjects@berkeley.edu">subjects@berkeley.edu</a>.</p>
</div>



</body>
</html>

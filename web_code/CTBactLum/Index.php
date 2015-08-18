<?php
include("connect.php");
// this is the first page so we'll start the session here
session_start();

$ip_address = $_SERVER['REMOTE_ADDR'];
$_SESSION['ip_address'] = $ip_address;

mysql_connect($host,$username,$password);
@mysql_select_db($database) or die( "Unable to select database");

/* "RANDOM" EXP # GENERATION SECTION */
/* Note the indexing on bins wrt exp#: bin[0] is exp 1! */
$query = "SELECT exp_num, COUNT(responseC) FROM workers WHERE total_time>TIME('00:59') GROUP BY exp_num"; 
$result = mysql_query($query) or die(mysql_error());
$bins = array(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);

while($row = mysql_fetch_array($result)){
	$bins[$row['exp_num']-1] = $row['COUNT(responseC)'];
	// print_r($row);
	// echo "<br />";
}

	// echo "<br />";
	// echo "bins: ";
	// print_r($bins);
	// echo "<br />";
$needyCount = min($bins);
$needyBins = array();
for ($i=0;$i<=17;$i=$i+1) {
	if($bins[$i]==$needyCount) {
		array_push($needyBins,$i);
	}
}

$numNeedyBins = count($needyBins);
$randBin = rand(0,$numNeedyBins-1);
$experiment = $needyBins[$randBin]+1;

	// echo "<br />";
	// echo "<br />";
	// echo "numNeedyBins:";
	// echo $numNeedyBins;
	// echo "<br />";
	// echo "experiment:";
	// echo $experiment;

/* END */

$_SESSION['experiment'] = $experiment;

/*
// first just check to make sure the category wasn't fooled around with since it's in the url
$query = sprintf("select count(*) from experiments where exp_num = '%s'",mysql_real_escape_string($experiment));
$result = mysql_query($query);
while($row = mysql_fetch_array($result)) {
	$count = $row["count(*)"];
}
if($count == 0) {
	// the category provided in the url doesn't exist.. give error
	echo "We are sorry, but there is something wrong with the URL you provided. Please contact Mike Pacer at mpacer@berkeley.edu with the exact web URL that gave you this error.";
	exit(-1);
}*/


/* uncomment to engage in IP restricting
@mysql_select_db($ipdatabase) or die( "Unable to select database");

// second, must check to see if we have seen this IP address before
$query = sprintf("select count(*) from ips where ip = '%s'",mysql_real_escape_string($ip_address));
$result = mysql_query($query);
while($row = mysql_fetch_array($result)) {
	$count = $row["count(*)"];
}
	
if($count != 0) {
	// Worker was here before
	echo "<center><h3>Your IP has been logged as previously completing an experiment.</h3></center>";
	echo "<center><b>Unfortunately you can only participate in one experiment and you will not be given credit for another 
	HIT on Mechanical Turk. <br>Thank you for your 
	time though and please feel free to contact Mike Pacer at mpacer@berkeley.edu if you have any questions regarding the 
	research.</b></center>";
	exit(-1);
}

$query = sprintf("insert into ips(ip) values ('%s')",mysql_real_escape_string($ip_address));
$result = mysql_query($query);
*/

// if the category was fine and the worker is new, enter the details into workers table
mysql_connect($host,$username,$password);
@mysql_select_db($database) or die( "Unable to select database");

$query = sprintf("insert into workers(ip_address) values ('%s')",mysql_real_escape_string($ip_address));
$result = mysql_query($query);
$workerID = mysql_insert_id();
$_SESSION['workerID'] = $workerID;

$experiment = mysql_real_escape_string($experiment);
$query = "update workers set exp_num='$experiment' where id = '$workerID'";
$result = mysql_query($query);

$start_time = time();
$_SESSION['start_time'] = $start_time;

// Move to HTML
include("exp.html");
?>
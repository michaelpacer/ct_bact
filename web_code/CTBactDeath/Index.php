<?php
include("connect.php");

// this is the first page so we'll start the session here
session_start();

$ip_address = $_SERVER['REMOTE_ADDR'];
$_SESSION['ip_address'] = $ip_address;

mysql_connect($host,$username,$password);
@mysql_select_db($database) or die( "Unable to select database");
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

$start_time = time();
$_SESSION['start_time'] = $start_time;

// Move to HTML
include("ServBacteria.html");
?>
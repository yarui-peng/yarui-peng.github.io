<?php
$id=$_GET['id']??"";
if($id) {
	$projects = [
'Ongoing' => "$id/project/Ongoing.csv",
'Completed' => "$id/project/Completed.csv",
];
} 
?>

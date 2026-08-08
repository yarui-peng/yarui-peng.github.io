<?php
$id=$_GET['id']??"";
if($id) {
$content=glob("$id/*.html");
} else {
	$content=array_merge(glob("overview/*.html"),glob("[A-Z]*/*.html"));
	foreach($content as $value) {
		if(preg_match("/^[A-Z]/",$value)) {
			$links[]="?id=".dirname($value);
		} else {
			$links[]="";
		}
	}
}
?>

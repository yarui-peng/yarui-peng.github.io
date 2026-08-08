<?php
$id=$_GET['id']??"";
if($id) {
$gallery=glob("$id/gallery/*-*",GLOB_ONLYDIR);
}
?>

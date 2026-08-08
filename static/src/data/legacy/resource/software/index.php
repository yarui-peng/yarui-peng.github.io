<!DOCTYPE html>
<html>
  <head>  
<?php include $_SERVER['DOCUMENT_ROOT'].'/lib/e3da/php/header.php';?>	
<script src="/lib/node_modules/d3/dist/d3.min.js"></script>

  </head>
  <body class="home">
 <?php include $DocRoot.'/lib/e3da/php/navi.php';?>
<script src="/lib/e3da/js/csvtable.js"></script>
	
	<!-- Content Start -->
<div class="container-fluid">

<?php
$arr = array("CAD Tool" => "tool.csv", "Development Tool" => "dev.csv");
foreach ($arr as $k => $v) {
	$id=basename($v,".csv");

echo "<div class='card border-info mb-2'>";
echo "<h4 class='card-header text-white bg-info text-center'>$k</h4>";
echo "<div class='card-body'><div class='table-responsive'>";
echo "<div class='csvtables' id='$id' file='$v' ncol=3></div>";
echo "</div></div>";
echo "</div>";

}
?>

</div>

  </body>
</html>
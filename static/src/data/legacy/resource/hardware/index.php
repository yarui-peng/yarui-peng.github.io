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
$arr = array("Computing Server" => "server.csv", "Acceleration GPU" => "gpu.csv", "Student Workstation" => "workstation.csv", "Student Laptop" => "laptop.csv", "Miscellaneous" => "misc.csv");
foreach ($arr as $k => $v) {
	$id=basename($v,".csv");

echo "<div class='card border-info mb-2'>";
echo "<h4 class='card-header text-white bg-info text-center'>$k</h4>";
echo "<div class='card-body'><div class='table-responsive'>";
echo "<div class='csvtable' id='$id' file='$v'></div>";
echo "</div></div>";
echo "</div>";

}
?>

<div class='card border-info'>
<h4 class='card-header text-white bg-info text-center'>Note</h4>
<div class='card-body'><ul>
<li>A common <a href="/resource/ssh/E3DA.mxtsessions">Shared Connection</a> can be used in MobaXterm. Courtesy of <a href="https://www.mobatek.net/">Mobatek</a>.</li>
<li>Trust <a href="/server/e3da-ca.crt">E3DA CA Certificate</a> for ssl connection.</li>
</ul></div>

</div>

</div>

  </body>
</html>

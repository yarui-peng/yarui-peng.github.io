<!DOCTYPE html>
<html>
  <head>
<?php include $_SERVER['DOCUMENT_ROOT'].'/lib/e3da/php/header.php';?>
<link rel="stylesheet" href="/lib/node_modules/bootstrap-icons/font/bootstrap-icons.css">
  </head>
  <body class="home">
<?php include "$DocRoot/lib/e3da/php/navi.php";?>

	<!-- Content Start -->
	<div class="container text-justify">
<?php

function FormatPerson($dir) {
	$basedir=ucwords(basename($dir));
	$subdirs=array_filter(glob("$dir/*"), 'is_dir');

	if(!count($subdirs)) {
		return;
	}

	echo "<div class='card border-info mb-2'>";
	echo "<h4 id='$basedir' class='card-header'>$basedir</h4>";
	echo "<div class='card-body'><ul class='list-group list-group-flush'>";

	$bi=array("Email" => "envelope","CV" => "file-earmark-text","Website" => "house","Google" =>"journals");

	foreach ($subdirs as $subdir) {
		$id=basename($subdir);

		$bio="$subdir/bio";
		$photo="$subdir/bio.jpg";
		$csv="$subdir/info.csv";

		$Info=array('FirstName' => $id, 'LastName' => $basedir, 'CV' => "/~$id/CV.pdf", "Website" => "/~$id/", "Email" => "mailto:$id@uark.edu" );

		if ($Fin = fopen("$csv", "r")) {
			while (($fields = fgetcsv($Fin))) {
				if(count($fields)>1) {
					$Info[$fields[0]]=$fields[1];
				}
			}
			fclose($Fin);
		}

		if(isset($Info['Title'])){
			$name=implode(' ',array($Info['Title'],$Info['FirstName'],$Info['LastName']));
		} else {
			$name=implode(' ',array($Info['FirstName'],$Info['LastName']));
		}
		
		echo "<li id='$id' class='list-group-item my-2' style='min-height: 200px;'>";		
		
		
		echo "<img src='".(is_readable($photo)?"$photo":"/lib/myweb/no-photo.jpg")."' width='180px' class='border border-5 rounded-circle m-2 me-4' style='float: left;'>";	
		
		echo "<div class='card-title d-flex'><div class='me-auto h5'><b>$name</b></div><div class='btn-group' role='group'>";
		
		
		foreach ($Info as $key => $val) {
			if($val&&isset($bi[$key])) {
				echo "<a href='$val' class='btn btn-outline-info btn-sm' role='button'><i class='bi-$bi[$key]'></i>$key</a>";
			}
		}
		echo "</div></div>";
		
		
		if (is_readable($bio.".html")) {
			include $bio.".html";
		} elseif (is_readable($bio.".txt")) {
			$text=file_get_contents($bio.".txt");
			echo nl2p( (isset($Info['Time'])?chop($text)."<span class='badge bg-info float-end'>{$Info['Time']}</span>":$text));
		} else {
			echo "<p>$name is a member of E3DA Lab.</p>";
		}
		

		echo "</h6></li>";
		
	}
	
	echo "</ul></div>";
	
	$files=array_filter(glob("$dir/*.csv"), 'is_readable');
	echo "<div class='card-body'><div class='row'>";

	foreach ($files as $file) {
		$type=basename($file,".csv");
		echo "<div class='col-12 mt-1 mb-2'><h4 class='card-title'><b>$type</b></h4><ul class='list-group list-group-flush'>";

		if ($Fin = fopen("$file", "r")) {
			while (($fields = fgetcsv($Fin))) {
				$note=$fields[2];

				$Info=array('Name' => $fields[0], "Email" => "mailto:$fields[3]" );
				

			echo "<li class='list-group-item'><div class='d-flex'><div class='me-auto h5'>{$Info['Name']}</div><div class='btn-group float-end' role='group'>";

				foreach ($Info as $key => $val) {
					if($val&&isset($bi[$key])) {
						echo "<a href='$val' class='btn btn-outline-info btn-sm' role='button'><i class='bi-$bi[$key]'></i>$key</a>";
					}
				}
				
				echo "</div></div>";

				$files=glob("$dir/$type/{$Info['Name']}.{jpg,png}",GLOB_BRACE);
				$link=array_pop($files);
				if(is_readable($link)) {
					$note="<a href='$link'>$note</a>";
				}
				echo "<h6>$note<span class='badge bg-info float-end'>$fields[1]</span></h6></li>";
			}
			fclose($Fin);
		}
		echo "</ul></div>";

	}
	echo "</div></div>";
	
	echo "</div>";
}


function FormatAlumni($dir,$HasPub=0) {
	echo "<div class='card border-info mb-2'>";
	$basedir=ucwords(basename($dir));
	echo "<h4 id='$basedir' class='card-header'>$basedir</h4>";
	$files=array_filter(glob("$dir/*.csv"), 'is_readable');
	echo "<div class='card-body'><div class='row'>";

	foreach ($files as $file) {
		$type=basename($file,".csv");
		echo "<div class='col-12 mt-1 mb-2'><h4 class='card-title'><b>$type</b></h4><ul class='list-group list-group-flush'>";

		if ($Fin = fopen("$file", "r")) {
			while (($fields = fgetcsv($Fin))) {
				$user=$fields[0];
				$fname=$fields[1];
				$lname=$fields[2];
				$key=$fields[5];
				$note=$fields[6];
				$base="<b>$fname $lname</b><span class='badge bg-primary float-end'>$fields[4]</span>";
				echo '<li class="list-group-item"><h5>';
				$files=glob("$dir/$type/$user.{jpg,png}",GLOB_BRACE);
				$link=array_pop($files);
				if(is_readable($link)) {
					$base="<a href='$link'>$base</a>";
				}
				if($HasPub) {
					$year=preg_replace('/^.*(20\d\d).*$/','\1',$fields[3]);
					$link="/pub/?year=$year&&search=Thesis&&author=".urlencode($lname);
					$note="<a href='$link'>$note</a>";
				}
				echo "$base</h5><h6>$key: $note<span class='badge bg-info float-end'>$fields[3]</span></h6></li>";
			}
			fclose($Fin);
		}
		echo "</ul></div>";

	}
	echo "</div></div>";
	echo "</div>";
}
		
?>



<?php
$dirs = array_filter(glob('./{F,P,M}*',GLOB_BRACE), 'is_dir');
foreach ($dirs as $dir)
{
	FormatPerson($dir);
}

$dirs = array_filter(glob('./a*'), 'is_dir');
foreach ($dirs as $dir)
{
	FormatAlumni($dir,1);
}

$dirs = array_filter(glob('./f*'), 'is_dir');
foreach ($dirs as $dir)
{
	FormatAlumni($dir,0);
}
?>
	  </div>
	</div>
  </body>
</html>

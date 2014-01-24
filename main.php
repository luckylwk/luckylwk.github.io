<?php
$prefix = '';
?>
<!DOCTYPE html>
<html>

<head>
	
	<?php require_once($prefix . 'src_php/head.php'); ?>
	
	<script type='text/javascript'>
		function toggleContent( $id ){
			if( $('#' + $id ).is(':hidden') ){
				$('#' + $id ).slideDown();
				$('#' + $id ).next().html('hide');
			}
			else {
				$('#' + $id ).slideUp();
				$('#' + $id ).next().html('show');
			}
		}
	</script>
	
</head>

<body>

<!--<nav id="nav">
	<div class="wrapper">LWKY</div>
</nav>-->

<div id="pageContainer">
	
	<header>To gather my thoughts...</header>
	
	
	<section class="item">
		<div class="header">
			<div class="left" style="width:60px; height:60px; margin-right:10px; borde-radius:4px;"><img src="<?php echo $prefix; ?>src_img/icon_python.png" width="60"></div>
			<div class="title left">PYTHON (PROGRAMMING LANGUAGE)</div>
			<div class="clear"></div>
		</div>
		<div class="main" id="python_content">
			<a href="PYTHON/basics.php" class="itemLink">Python Basics</a>
			<a href="PYTHON/datatypes.php" class="itemLink">Data Types & Structures</a>
			<a href="#" class="itemLink inactive">Logic and Loops</a>
			<a href="#" class="itemLink inactive">Functions</a>
			<a href="#" class="itemLink inactive">Scripts</a>
		</div>
		<div class="footer" onClick="toggleContent('python_content');">show</div>
	</section>
	
	
	<section class="item">
		<div class="header">
			<div class="left" style="width:60px; height:60px; margin-right:10px; background:#eee;"><img src="<?php echo $prefix; ?>src_img/icon_crypto.jpg" width="60"></div>
			<div class="title left">CRYPTOGRAPHY</div>
			<div class="clear"></div>
		</div>
		<div class="main" id="crypto_content">
			<a href="#" class="itemLink inactive">bits, bytes and hex</a>
			<a href="#" class="itemLink inactive">cryptography basics</a>
			<a href="#" class="itemLink inactive">stream ciphers</a>
			<a href="CRYPTOGRAPHY/blockciphers.php" class="itemLink inactive">block ciphers</a>
		</div>
		<div class="footer" onClick="toggleContent('crypto_content');">show</div>
	</section>
	
	
	<section class="item">
		<div class="header">
			<div class="left" style="width:60px; height:60px; margin-right:10px; background:#eee;"></div>
			<div class="title left">RASPBERRY PI</div>
			<div class="clear"></div>
		</div>
		<div class="main" id="ml_content">
			<a href="RASPBERRYPI/config.php" class="itemLink inactive">Configuration & Set-up</a>
			<a href="#" class="itemLink inactive">Installing APACHE & PHP</a>
			<a href="#" class="itemLink inactive">Installing MySQL</a>
			<a href="#" class="itemLink inactive">Installing MongoDB</a>
			<a href="#" class="itemLink inactive">Installing Python Modules</a>
		</div>
		<div class="footer" onClick="toggleContent('ml_content');">show</div>
	</section>
	
	
	<section class="item">
		<div class="header">
			<div class="left" style="width:60px; height:60px; margin-right:10px; background:#eee;"></div>
			<div class="title left">DATA VISUALIZATION</div>
			<div class="clear"></div>
		</div>
		<div class="main" id="dataviz_content">
			<a href="#" class="itemLink inactive">Linear Regression</a>
			<a href="#" class="itemLink inactive">Logistic Regression</a>
			<a href="#" class="itemLink inactive">Neural Networks</a>
			<a href="#" class="itemLink inactive">Clustering</a>
		</div>
		<div class="footer" onClick="toggleContent('dataviz_content');">show</div>
	</section>
	
	
	<section class="item">
		<div class="header">
			<div class="left" style="width:60px; height:60px; margin-right:10px; background:#eee;"></div>
			<div class="title left">MACHINE LEARNING</div>
			<div class="clear"></div>
		</div>
		<div class="main" id="ml_content">
			<a href="#" class="itemLink inactive">Linear Regression</a>
			<a href="#" class="itemLink inactive">Logistic Regression</a>
			<a href="#" class="itemLink inactive">Neural Networks</a>
			<a href="#" class="itemLink inactive">Clustering</a>
		</div>
		<div class="footer" onClick="toggleContent('ml_content');">show</div>
	</section>
	

	<!--<div align="center">
		<img src="src-img/icon_linkedin.png" height="40" class="icon">
		<img src="src-img/icon_twitter.png" height="40" class="icon">
		<img src="src-img/icon_github.png" height="40" class="icon">
	</div>-->
	
</div>

</body>

</html>
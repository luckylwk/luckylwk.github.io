<?php
$prefix = '../';
?>
<!DOCTYPE html>
<html>

<head>
	
	<?php require_once($prefix . 'src_php/head.php'); ?>
	
</head>

<body>

<!--<nav id="nav">
	<div class="wrapper">LWKY</div>
</nav>-->

<div id="pageContainer">
	
	<section class="art" style="margin-top:20px;">
		<h1>APACHE & PHP</h1>
		<h2><a href="">RASPBERRY PI</a> /&nbsp; Last updated on friday january 24th, 2014</h2>
		<p>

<pre><code data-language="shell"># Get and install packages
$ sudo apt-get install apache2 php5 libapache2-mod-php5

$ sudo service apache2 restart
## OR
$ sudo /etc/init.d/apache2 restart
</code></pre>
<a href="http://www.wikihow.com/Make-a-Raspberry-Pi-Web-Server" class="codeLink">External Link</a>
Enter the I.P. address of your Raspberry Pi into your web browser. You should see a simple page that says "It Works!"
		</p>
		
	</section>
	
</div>

</body>

</html>
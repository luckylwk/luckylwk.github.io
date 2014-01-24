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
		<h1>CONFIGURATION & SET-UP</h1>
		<h2><a href="">RASPBERRY PI</a> /&nbsp; Last updated on friday january 24th, 2014</h2>
		<p>
Once the operating system finishes loading, you will need to log in. The default username is "pi", and the default password is "raspberry". First thing to do is change the password of the system.
<pre><code data-language="shell"># To change password.
$ passwd pi

# Housekeeping, update and upgrade system.
$ sudo apt-get update
$ sudo apt-get upgrade

# Set date/time
$ sudo date --set="30 December 2013 10:00:00"
</code></pre>
<a href="http://www.wikihow.com/Make-a-Raspberry-Pi-Web-Server" class="codeLink">External Link</a>

//ifconfig to check ip.

Now enable SSH and reboot (press return/enter after each line):
sudo mv /boot/boot_enable_ssh.rc /boot/boot.rc
sudo shutdown -r now
		</p>
		
	</section>
	
</div>

</body>

</html>
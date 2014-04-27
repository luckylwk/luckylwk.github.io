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
		<h1>BLOCK CIPHERS</h1>
		<h2><a href="">CRYPTOGRAPHY</a> /&nbsp; Last updated on tuesday december 31st, 2013</h2>
		<p>
			The definition from Wikipedia
		</p>
		<p class="quote">
			In cryptography, a <strong>block cipher</strong> is a deterministic algorithm operating on fixed-length groups of bits, called blocks, with an unvarying transformation that is specified by a <strong>symmetric key</strong>.
		</p>
		<p>
			As the wikipedia entry describes a block cipher deals with blocks of information that have a fixed number of bits (or size). The block is encrypted using a 'block-algo' that takes as an input the <strong>plain text message block M</strong> and the <strong>key k</strong>. The decryption of the cipher back to the plaintext is done using the same key and the same block-algorithm in reverse. This makes the key a <strong>symmetric key</strong> since its used in both the encryption and decryption of the information. <a href="http://en.wikipedia.org/wiki/Block_cipher" class="codeLink">BLOCK CIPHER (Wikipedia)</a>
		</p>
		<svg 	width="550" height="150" version="1.1" 
				style="display:block;margin:10px 0px; margin-left:50px;"
				xmlns="http://www.w3.org/2000/svg">
		
			<defs>
				<style type="text/css">
					.text { font-family: sans-serif; font-size: 12px; fill:white; }
					.line { stroke: #333; stroke-width:1; fill: none; }
					.marker { stroke:none; stroke-width:0; fill:black; }
				</style>
			</defs>
			
			<defs>
			    <marker id="markerCircle" markerWidth="8" markerHeight="8" refx="5" refy="5">
			        <circle cx="5" cy="5" r="3" class="marker"></circle>
			    </marker>
			    <marker id="markerSquare" markerWidth="8" markerHeight="8" refx="3" refy="3" orient="auto">
					<rect x="1" y="1" width="4" height="4" class="marker"></rect>
				</marker>
			    <marker id="markerArrow" markerWidth="13" markerHeight="13" refx="2" refy="6" orient="auto">
			        <path d="M2,2 L2,11 L10,6 L2,2" class="marker"></path>
			    </marker>
			</defs>
						
			<g>
				<rect 	x="10" y="10" rx="4" ry="4" width="130" height="50" 
						style="fill:green;stroke:black;stroke-width:1.5;opacity:0.9"></rect>
				<text 	x="20" y="30" class="text" >Message M - Block</text>
				<text 	x="20" y="45" class="text" >n bits</text>
				<path 	d="M140,35 L170,35 L190,35" class="line"
		     			style="marker-start:url(#markerCircle); marker-end:url(#markerArrow); "></path>
			</g>
			<g>
				<rect 	x="198" y="10" rx="4" ry="4" width="152" height="50" 
						style="fill:#800000;stroke:black;stroke-width:1.5;opacity:0.9"></rect>
				<text 	x="210" y="30" class="text" >Block-algo</text>
				<text 	x="210" y="45" class="text" >Encryption/Decryption</text>
			</g>
			<g>
				<rect 	x="408" y="10" rx="4" ry="4" width="132" height="50" 
						style="fill:green;stroke:black;stroke-width:1.5;opacity:0.9"></rect>
				<text 	x="420" y="30" class="text" >Cipher C - Block</text>
				<text 	x="420" y="45" class="text" >n bits</text>
				<path 	d="M350,35 L360,35 L400,35" class="line"
		     			style="marker-start:url(#markerCircle); marker-end:url(#markerArrow); "></path>
			</g>
			
			<g>
				<rect 	x="198" y="90" rx="4" ry="4" width="152" height="50" 
						style="fill:blue;stroke:black;stroke-width:1.5;opacity:0.9" ></rect>
				<text 	x="210" y="110" class="text" >Key K</text>
				<text 	x="210" y="125" class="text" >k bits</text>
				<path 	d="M274,90 L274,80 L274,68" class="line"
		     			style="marker-start:url(#markerCircle); marker-end:url(#markerArrow); " ></path>
			</g>
			
		</svg>
		<p>
			As shown in the figure the message M, cipher C and key K have fixed block widths. These are specified for AES and 3DES by NIST standards. <a href="http://en.wikipedia.org/wiki/National_Institute_of_Standards_and_Technology" class="codeLink">NIST</a><br/>
			<strong>3DES</strong> / n = 64 bits, k = 168 bits<br/>
			<strong>AES</strong> / n = 128 (160, 192, 224, & 256) bits, k = 128, 192, 256 (160, 224) bits<br/><br/>
			
			rounds and key expansion with image.
			basics... blocks. types: feistel (des, blowfish), lay-massey, rijndael (aes)<br/><br/>
			The block-cipher itself only deals with the encryption of a single block of data using a key. usually using key expansion to accompany each round.
			
		</p>
	</section>
	
	<section class="art" style="margin-top:40px;">
		<h1>DES</h1>
		<h2><a href="">CRYPTOGRAPHY</a> /&nbsp; Last updated on tuesday december 31st, 2013</h2>
		<p>
			Or as Wikipedia puts it.
		</p>
		<p class="quote">
			...
		</p>
		<p>
			lll
		</p>
		<a href="http://en.wikipedia.org/wiki/Stream_cipher" class="codeLink">STREAM CIPHER (Wikipedia)</a>
	</section>
	
	<section class="art" style="margin-top:40px;">
		<h1>AES</h1>
		<h2><a href="">CRYPTOGRAPHY</a> /&nbsp; Last updated on tuesday december 31st, 2013</h2>
		<p>
			Or as Wikipedia puts it. NIST standard. http://en.wikipedia.org/wiki/Advanced_Encryption_Standard Based on the rijndael cipher.
		</p>
		<p class="quote">
			...
		</p>
		<p>
			ECB
		</p>
		<object type="image/svg+xml" data="<?php echo $prefix; ?>src_svg/ECB.svg">Your browser does not support SVG</object>
		<p>
		
<pre><code data-language="python">
>>> from Crypto.Cipher import AES

# Key needs to be 16, 24 or 32 bytes (128, 192, 256 bits)
>>> key = b'KeyOfSixteenByte'
>>> len(key)
16

>>> cipher = AES.new(key, AES.MODE_ECB)

>>> string = 32*"a"
>>> cipher_text = cipher.encrypt(string).encode('hex')

# Check the two blocks of the encrypted text.
>>> cipher_text[:32]
'34040e6e4f092fd77431f59b2c1697ce'
>>> cipher_text[32:]
'34040e6e4f092fd77431f59b2c1697ce'		
</code></pre>
		</p>
		
		<a href="http://en.wikipedia.org/wiki/Stream_cipher" class="codeLink">STREAM CIPHER (Wikipedia)</a>
	</section>
	
</div>

</body>

</html>
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
		<h1>PYTHON BASICS</h1>
		<h2><a href="">PYTHON</a> /&nbsp; Last updated on thursday january 23rd, 2014</h2>
		<p>
To start the Python interpreter on Mac OSX just type 'python' in the Terminal (command line).
<pre><code data-language="python">$ python
Python 2.7.5 (default, Aug 25 2013, 00:04:04) 
[GCC 4.2.1 Compatible Apple LLVM 5.0 (clang-500.0.68)] on darwin
Type "help", "copyright", "credits" or "license" for more information.
>>> 
</code></pre>
The hashtag '#' is used in scripts (and all coding snippets on this site) to denote comments.
<pre><code data-language="python"># This is a comment.
# This will not be executed.
# It is just to clarify things or leave notes.
</code></pre>
The interpreter allows you to write code directly in Python. Lets start with some basic Maths.
<pre><code data-language="python">>>> 1+1
2
>>> 2*2
4
>>> 4/2
2
>>> 5-1
4
>>> 1+2*2
5
>>> 2*2*2-1
7
>>> (2*2)*(2-1)
4
</code></pre>
Lets try some more 'advanced' mathematical operations now. For this we need to import the math 'library' from python.
<pre><code data-language="python">// Import the math library.
>>> import math

>>> math.pow(2,3)
8
>>> math.sqrt(16)
4.0

// Exponentials/Logarithms
>>> math.exp(2)
7.38905609893065
>>> math.log(7.38905609893065)
2.0
// Math.log accepts two inputs, the 'x' and the 'base' (default base is 'e')
>>> math.log(7.38905609893065,2)
2.8853900817779268

// It allows you to easily call 'pi' and 'e'
>>> math.pi
3.141592653589793
>>> math.e
2.718281828459045
</code></pre>
Python hosts more calculation functions (e.g., sin, tan). For more information check the following link.
<a href="http://docs.python.org/2/library/math.html" class="codeLink">PYTHON LIBRARY: Math</a>



<br/><br/>At all times, in order to see all declared variables in the environment use the pprint(locals()). Note: pprint needs to be imported first.
<pre><code data-language="python">>>> import pprint
>>> pprint.pprint(locals())
{'__builtins__': <module '__builtin__' (built-in)>,
 '__doc__': None,
 '__name__': '__main__',
 '__package__': None,
 'music': ['Abba', 'Rolling Stones', 'Black Sabbath', 'Metallica'],
 'pprint': <module 'pprint' from '/System/Library/Frameworks/Python.framework/Versions/2.7/lib/python2.7/pprint.pyc'>,
 'str': 'Hello',
 'str2': 'World',
 'str3': 'Hello\nWorld',
 'str_var': 'Hello World',
 'test': 'helloworld',
 'var': 9}
</code></pre>
		</p>
		
	</section>
	
</div>

</body>

</html>
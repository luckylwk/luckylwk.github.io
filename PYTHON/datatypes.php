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
		<h1>PYTHON DATA TYPES</h1>
		<h2><a href="">PYTHON</a> /&nbsp; Last updated on thursday january 23rd, 2014</h2>
		<p>
A very quick (and not complete) overview of data-types in Python.
<pre><code data-language="python"># Declare some variables.
>>> a = 123                        # integer
>>> b = 123L                       # long integer
>>> c = 3.14                       # double float
>>> d = "hello"                    # string
>>> e = [0,1,2]                    # list
>>> f = (0,1,2)                    # tuple
>>> g = { 'Name':'Joe', 'Age':7 }  # dictionary
>>> h = True                       # boolean

# Check variable type using type()
>>> type(c)
type "float"
</code></pre>
You can use the numerical variables to do math or iterations. To print something you can use the 'print' command.
<pre><code data-language="python">>>> a = 123    # integer
>>> b = 123L   # long integer
>>> c = 3.14   # double float

# You can use numerical variables for maths.
>>> a * c
386.22
>>> b*2
246L    # long integer
>>> mult = a * c
>>> print "Multiplication is: ", mult
"Multiplication is 386.22"
</code></pre>
Python is very powerful in its handling of strings. It offers a great deal of functions to handle strings and manipulate them.
<pre><code data-language="python">>>> word = "Hello World"
>>> word
'Hello World'
>>> type(word)
type "str"

# Selecting specific characters or ranges in a string.
>>> word[0]
'H'
>>> word[0:]
'Hello World'
>>> word[0:5]
'Hello'
>>> word[4:]
'o World'

# Using negative indices to indicate counting from the end of the string.
>>> word[-2]
'l'
>>> word[-2:]
'ld'
>>> word[:-2]
'Hello Wor'
</code></pre>
Next to targeting specific areas in a string you also combine (concatenate) and manipulate strings easily using Python.
<pre><code data-language="python">>>> string_1 = "Hello"
>>> string_2 = "World!"

>>> string_1 + string_2  # Concatenate using a '+'
'HelloWorld!'
>>> string_1 + " " + string_2  # Adding a space in the string.
'Hello World!'

>>> print ' '.join( reversed( string_1 + " " + string_2 ) )
"! d l r o W   o l l e H"

# The following functions are depreciated in Python 3.x
>>> string_1.lower()
'hello'
>>> string_1.upper()
'HELLO'
>>> string_1.title()
'Hello'
</code></pre>
For more information on strings, string-handling and string-functions, check Python Library: <a href="http://docs.python.org/2/library/string.html" class="codeLink">PYTHON LIBRARY: Strings</a>
		</p>
	</section>
	
	<section class="art" style="margin-top:50px;">
		<h1>PYTHON DATA STRUCTURES</h1>
		<h2><a href="">PYTHON</a> /&nbsp; Last updated on thursday january 23rd, 2014</h2>
		<p>
<strong>Lists, Tuples, Dictionaries</strong><br/>
In other languages (like PHP) more commonly known as array's, but in Python defined as three different kind of data-structures. All of them are a collection of different values/variables. 
<pre><code data-language="python">>>> e = [0,1,2]                    # list
>>> f = (0,1,2)                    # tuple
>>> g = { 'Name':'Joe', 'Age':7 }  # dictionary
</code></pre>
The <strong>list</strong> is the simplest data structure in Python and is used to store a list of values. Lists are collections of values which, themselves, can be of various data-types: strings, numericals or even an other data-structure like a list. These can also be in the same list, as shown below. Each item in a list has an assigned 'index-value'. You can define a list using '[]' and separate the items using comma's. Indices start at 0 and in a list with 4 items that last index thus becomes 3.
<pre><code data-language="python">>>> var_list = [ "a", 1, 2.12, "hello" ]
>>> var_list
['a', 1, 2.12, 'hello']

# Select specific items in a list.
>>> var_list[1]
1
>>> var_list[3]
'hello'

# Get the number of items in a list.
>>> len(var_list)
4

# You can take a slice (sub-selection of a list). The result is a new list.
# Note that the indexing is for 1:3 is defined as 1 up till 3 (but not including 3!)
>>> var_list[1:3]
[1, 2.12]
</code></pre>
To manipulate lists you can use functions like 'append()', 'insert()' and 'remove()'. You can also change the item at a specific index by setting it to something different.
<pre><code data-language="python"># Add an item at the end of the list using 'append()'
>>> var_list.append('Appended!')
>>> var_list
['a', 1, 2.12, 'hello', 'Appended!']
>>> len(var_list)
5

# Add an item at a specific index of the list using 'insert()'
>>> var_list.insert(2, 1234L)
>>> var_list
['a', 1, 1234L, 2.12, 'hello', 'Appended!']
>>> len(var_list)
6

# Remove an item using by matching the specific element.
>>> var_list.remove("a")
>>> var_list
[1, 1234L, 2.12, 'hello', 'Appended!']

# Delete an item by specifying the index.
>>> del var_list[4]
>>> var_list
[1, 1234L, 2.12, 'hello']

# Change a specific item.
>>> var_list[1] = 567L
[1, 123L, 2.12, 'hello']
</code></pre>
Merging 'extend' two lists.
<pre><code data-language="python"># Merge two lists using 'extend()'
>>> var_list_2 = [ "world", 3 ]
>>> var_list.extend(var_list_2)
>>> print var_list
[1, 567L, 2.12, 'hello', 'world', 3]
</code></pre>
To sort a list there are two native functions: 'sort()' and 'sorted()'. Usually it makes more sense to use the latter as it does not transform the list itself.
<pre><code data-language="python"># Sort a list using 'sort()'
# Note! This changes the list.
>>> var_list.sort()
>>> var_list
[1, 2.12, 3, 567L, 'hello', 'world']

# Sort using 'sorted()', only outputs a sorted list, doesn't change it.
>>> var_list = [1, 123L, 2.12, 'hello', 'world', 3]
>>> sorted(var_list)
[1, 2.12, 3, 123L, 'hello', 'world']
>>> var_list
[1, 123L, 2.12, 'hello', 'world', 3]
</code></pre>
<a href="http://docs.python.org/2/tutorial/datastructures.html" class="codeLink">PYTHON LIBRARY: Data Structures</a><br/><br/>
The <strong>dictionary</strong> is another Python data-structure that allows you to collect data in a single variable. Dictionaries are also called 'associated array's' as they have a 'key' and a related 'value'.
<pre><code data-language="python">>>> var_dict = { 'Name':'Joe', 'Surname':'Doe', 'Age':7 }
>>> type(var_dict)
type "dict"
>>> len(var_dict)
3

# Access an item using its key.
>>> var_dict['Age']
7
>>> type(var_dict['Age'])
type "int"

# Add a key/value to a dictionary
>>> var_dict[0] = "test"
>>> var_dict
{0: 'test', 'Age': 7, 'Surname': 'Doe', 'Name': 'Joe'}
>>> len(var_dict)
4

# You can store another data-structure inside a data-structure
var_dict['email'] = ["email1", "email2"]

# Use 'items()' to go through the item sets.
>>> print var_dict.items()
[(0, 'test'), ('Age', 7), ('Surname', 'Doe'), ('Name', 'Joe'), ('email', ['email1', 'email2'])]

# Get the keys or values seperatly.
>>> var_dict.keys()
[0, 'Age', 'Surname', 'Name', 'email']
>>> var_dict.values()
['test', 7, 'Doe', 'Joe', ['email1', 'email2']]

# Check if the dictionary has a specific key, result is a boolean.
>>> var_dict.has_key("Country")
False
</code></pre>

		</p>
		
	</section>
	
</div>

</body>

</html>
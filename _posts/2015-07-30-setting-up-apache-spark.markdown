---
layout: post
comments: true
title:  "Setting up Apache Spark and IPython"
excerpt: "Some notes on how to get started with Apache Spark on Ubuntu. It includes configuring IPython to run using a standalone pySpark."
date:   2015-07-30 20:00:00
author: Luuk Derksen
mathjax: false
tags:
  - python
  - apache-spark
  - data-engineering
---


### Installing Spark/pySpark

To ensure that all the setup work can easily be replicated in a cloud-environment I have chosen to set everything up inside a Virtual Machine. For this we use [Vagrant](https://www.vagrantup.com/) and [VirtualBox](https://www.virtualbox.org/). In this post I will not go into too much detail on how both of these work or how they can be configured. I recommend you read some of the **Vagrant** documentation to learn more about how to, for example, assign more RAM or shared folders with your host machine.


### Setting up a Virtual Machine using Vagrant

Create a new folder on your machine that will be the home of your Vagrant file. Once the folder has been created cd into it and initialize a vagrant virtual machine. In this case I have chosen for a standard Ubuntu 14.04 distribution.

~~~bash
$ mkdir vagrant-spark
$ cd vagrant-spark/

$ vagrant init ubuntu/trusty64
~~~

The `Vagrantfile` has been created and can now be edited to change any configurations is you want to. We are going to change two small things in the `Vagrantfile` to ensure the rest of these notes will work. Open the Vagrantfile in a text editor, delete everything and paste in the following:

```
# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
  
  config.vm.box = "ubuntu/trusty64"
	
  # To share a folder on your drive add the following:
  # config.vm.synced_folder "<SYSTEM-PATH TO YOUR FOLDER>", "/home/vagrant/shared"

  config.vm.provider "virtualbox" do |vb|
      # Customize the amount of memory on the VM:
      vb.memory = "2048"
  end

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine. In the example below,
  # accessing "localhost:8080" will access port 80 on the guest machine.
  # config.vm.network "forwarded_port", guest: 80, host: 8080
  
  # Port forwarding for the IPython port
  config.vm.network "forwarded_port", guest: 8001, host: 8001

  # Spark port forwarding
  config.vm.network "forwarded_port", guest: 8080, host: 8080
  config.vm.network "forwarded_port", guest: 4040, host: 4040
  
end

```

To now start the VM we can use the command

~~~bash
$ vagrant up --provider=virtualbox
~~~

This will bring up the VM. To stop it when you want to you can use the `vagrant halt` command. For now, obviously, we will need to keep it up to make sure we can start setting it up and install Spark.

To do this we will need to work from within the VM itself, so now SSH in to the machine using

~~~bash
$ vagrant ssh
~~~


### Setting up (VM) Ubuntu

Install some basic things for Ubuntu to make sure some Python libraries will work.

~~~bash
$ sudo apt-get install git htop python-dev build-essential libatlas-base-dev gfortran libevent-dev libpng-dev libjpeg8-dev libfreetype6-dev
~~~


### Install Java

Make sure to install Java on the machine to enable Spark.

~~~bash
$ sudo apt-add-repository ppa:webupd8team/java
$ sudo apt-get update
$ sudo apt-get install oracle-java7-installer

$ java -version
~~~


### Install Scala (Optional)

Some of Spark's options are not available yet to be accessed and used through Python (e.g., GraphX and some MLLib modules), so we'll install Scala as well so we can work with those features at a later stage.

~~~bash
# Download the Scala tarball.
$ wget http://www.scala-lang.org/files/archive/scala-2.11.6.tgz

# Create a new folder to place the scala-installation in.
$ sudo mkdir /usr/local/src/scala

# Extract the contents into the newly created directory.
$ sudo tar xvf scala-2.11.6.tgz -C /usr/local/src/scala/

# Remove the tarball
$ rm scala-2.11.6.tgz
~~~

Open your bash-profile using `nano ~/.bash_profile` and add the following two lines:

~~~bash
# Scala environment variable and path.
export SCALA_HOME=/usr/local/src/scala/scala-2.11.6
export PATH=$SCALA_HOME/bin:$PATH
~~~



### Download and Install Apache Spark

First download and extract the Spark tarball.

~~~bash
$ cd $HOME

# Download the pre-built Spark tarball.
$ wget http://mirror.ox.ac.uk/sites/rsync.apache.org/spark/spark-1.4.0/spark-1.4.0-bin-hadoop2.6.tgz 

# Extract the contents to your HOME folder.
$ tar -xvf spark-1.4.0-bin-hadoop2.6.tgz

# Remove the tarball.
$ rm spark-1.4.0-bin-hadoop2.6.tgz
~~~

Since this is a pre-built version we should be able to run it out-of-the-box now.

~~~bash
$ cd spark-1.4.0-bin-hadoop2.6
$ ./bin/run-example SparkPi 10
~~~

This should give you some output like:

```
Using Spark's default log4j profile: org/apache/spark/log4j-defaults.properties
15/08/21 10:52:56 INFO SparkContext: Running Spark version 1.4.0
...
15/08/21 10:53:02 INFO Executor: Finished task 0.0 in stage 0.0 (TID 0). 736 bytes result sent to driver
15/08/21 10:53:02 INFO TaskSetManager: Starting task 1.0 in stage 0.0 (TID 1, localhost, PROCESS_LOCAL, 1446 bytes)
15/08/21 10:53:02 INFO Executor: Running task 1.0 in stage 0.0 (TID 1)
15/08/21 10:53:02 INFO TaskSetManager: Finished task 0.0 in stage 0.0 (TID 0) in 953 ms on localhost (1/10)
15/08/21 10:53:03 INFO Executor: Finished task 1.0 in stage 0.0 (TID 1). 736 bytes result sent to driver
...
15/08/21 10:53:03 INFO Executor: Running task 9.0 in stage 0.0 (TID 9)
15/08/21 10:53:03 INFO Executor: Finished task 9.0 in stage 0.0 (TID 9). 736 bytes result sent to driver
15/08/21 10:53:03 INFO TaskSetManager: Finished task 9.0 in stage 0.0 (TID 9) in 16 ms on localhost (10/10)
15/08/21 10:53:03 INFO DAGScheduler: ResultStage 0 (reduce at SparkPi.scala:35) finished in 1.457 s
15/08/21 10:53:03 INFO TaskSchedulerImpl: Removed TaskSet 0.0, whose tasks have all completed, from pool
15/08/21 10:53:03 INFO DAGScheduler: Job 0 finished: reduce at SparkPi.scala:35, took 1.991463 s
```

Assuming you got the output like the above your Spark configuration is working and we are ready to get going with Spark.

Before we continue to configure PySpark, Python and IPython we will add some environment variables to our system that tell it where Spark is installed and what its default configuration is.

Open your bash-profile using `nano ~/.bash_profile` and add the following two lines:

~~~bash
# Set the Spark Home as an environment variable.
export SPARK_HOME="$HOME/spark-1.4.0-bin-hadoop2.6"

# Define your Spark arguments for when running Spark.
export PYSPARK_SUBMIT_ARGS="--master local[2]"
~~~



### PySpark - Shell

Now that we have Spark working we can use Python to actually give it our instructions. Spark comes with a `pySpark` shell that we can use for that. Launch the shell using:

~~~bash
$ ./bin/pyspark
~~~

```
Python 2.7.6 (default, Mar 22 2014, 22:59:56)
[GCC 4.8.2] on linux2
Type "help", "copyright", "credits" or "license" for more information.
...
Welcome to
      ____              __
     / __/__  ___ _____/ /__
    _\ \/ _ \/ _ `/ __/  '_/
   /__ / .__/\_,_/_/ /_/\_\   version 1.4.0
      /_/

Using Python version 2.7.6 (default, Mar 22 2014 22:59:56)
SparkContext available as sc, HiveContext available as sqlContext.
>>> 
```

This brings you into the pySpark. You can now use python to use Spark. It has already created a `SparkContext` to work with/from.

~~~bash
>>> sc
<pyspark.context.SparkContext object at 0x7f05502a1750>
~~~

~~~python
data = [1, 2, 3, 4, 5]
dataRDD = sc.parallelize(data)
~~~

~~~bash
>>> dataRDD
ParallelCollectionRDD[0] at parallelize at PythonRDD.scala:396
~~~


### PySpark - IPython Configuration

First install `virtualenv` to allow us to work in a virtual environment.

~~~bash
# Install pip, the python package manager.
$ sudo apt-get install python-pip

# Install virtualenv
$ sudo pip install virtualenv

# Create a virtual environment.
$ virtualenv pyEnv
~~~

Now we will activate this environment so that we can install our Python libraries inside the virtual environment.

~~~bash
$ source pyEnv/bin/activate
~~~

Now we can install `IPython` within the virtual environment `pyEnv`. To install use the following command.

~~~bash
$ sudo pip install "ipython[notebook]"
~~~

We now have IPython installed within our virtual environment. The next thing is to configure IPython such that it runs with a pySpark kernel and we can actually start using Spark from within IPython. We are going to attempt doing this by creating an IPython profile specifically for Spark.

~~~bash
# Create a new IPython profile.
$ ipython profile create pyspark
~~~

Now that we have created the actual `pyspark` profile for IPython we will need to configure it. Most of the configurations can be done in the file `ipython_notebook_config.py`. Open this file (I am using `nano` for the editing):

~~~bash
$ nano ~/.ipython/profile_pyspark/ipython_notebook_config.py
~~~

It will have a long list of comments and configuration lines that are most likely commented out. We are going to change 3 specific configuration elements. The first we will change is the broadcasting ip-address. We will tell it to broadcast on any IP-address (mind: this is not secure for production environments!). To do this add the following line:

```
# c.NotebookApp.ip = 'localhost'
c.NotebookApp.ip = '*'
```

Since we are working on a (virtual) server we don't want IPython to open a browser as its default setting. To disable this add the following line:

```
# c.NotebookApp.open_browser = True
c.NotebookApp.open_browser = False
```

IPython has a default port it is always opening up for connection. We have chosen to use a different port. You can change this by adding the following line:

```
# c.NotebookApp.port = 8888
c.NotebookApp.port = 8001
```

Please mind, the above setting means that you have to have added port-forwarding to your `Vagrantfile` (we did in the beginning of this post). Your local system will actually need a port to forward to the IPython port to be able to see the notebooks.

The configuration of IPython is now done, but we need to make sure it actually creates a `SparkContext` on startup. We can do this by changing the IPython profile's setup file: `00-pyspark-setup.py`. Open this file in a text-editor:

~~~bash
$ nano ~/.ipython/profile_pyspark/startup/00-pyspark-setup.py
~~~

and paste the following Python script and save the contents afterwards.

~~~python
# Configure the necessary Spark environment
import os
import sys

# Set the spark_home variable
SPARKHOME = os.environ.get('SPARK_HOME', None)
sys.path.insert(0, SPARKHOME + "/python")

# Add the py4j to the path.
# You may need to change the version number to match your install
sys.path.insert(0, os.path.join(SPARKHOME, 'python/lib/py4j-0.8.2.1-src.zip'))

# Initialize PySpark to predefine the SparkContext variable 'sc'
execfile(os.path.join(SPARKHOME, 'python/pyspark/shell.py'))
~~~

To start IPython and have it use Spark we need to use quite a large command, so we'll create an alias for this in our `.bash_profile`. Open your bash-profile using `nano ~/.bash_profile` and add the following two lines:

~~~bash
# IPython alias for the use with SPARK.
alias IPYSPARK='PYSPARK_DRIVER_PYTHON=ipython PYSPARK_DRIVER_PYTHON_OPTS="notebook --profile=pyspark --ip=0.0.0.0" $SPARK_HOME/bin/pyspark'
~~~

After saving and closing make sure to reload the profile using `source ~/.bash_profile` so that all changes have taken effect. Now we can start IPython (using the Spark shell) using the just created alias:

~~~bash
$ cd $HOME
$ IPYSPARK
~~~

Now, on your local machine, open your webbrowser and navigate to `localhost:8001` and it should show the IPython notebook server. You are now good to go!

Some useful links:

* https://spark.apache.org/documentation.html
* https://spark.apache.org/docs/latest/programming-guide.html
* https://spark.apache.org/docs/latest/api/python/index.html
* http://blog.cloudera.com/blog/2014/08/how-to-use-ipython-notebook-with-apache-spark/
* http://ramhiser.com/2015/02/01/configuring-ipython-notebook-support-for-pyspark/
* http://ipython.org/ipython-doc/1/interactive/public_server.html
* https://docs.prediction.io/datacollection/analytics-ipynb/
* Scala & IPython (not working yet): https://github.com/alexarchambault/jupyter-scala
* Scala & IPython (not working yet): https://github.com/hohonuuli/sparknotebook



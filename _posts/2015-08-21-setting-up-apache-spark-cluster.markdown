---
layout: post
comments: true
title:  "Setting up an Apache Spark Cluster"
excerpt: "Some notes on how to set up an Apache Spark cluster across machines. It deals with the setup of the master/manager and worker machines."
date:   2015-08-21 20:00:00
mathjax: true
tags:
  - python
  - machine-learning
  - apache-spark
---

### Installing Spark/pySpark

We will not deal with the actual setup of Spark and IPython on each machine in this post. To get that done you can follow the [instructions in this blog-post](http://luckylwk.github.io/2015/07/30/setting-up-apache-spark/)

### Configuring the Spark Cluster Manager

The first thing we will need is for the **manager** machine to be able to SSH into the **worker** machines. To do this we need to create an SSH-keypair.

##### 1. Create SSH Keypair

Create an [SSH-keypair](https://golog.co/blog/article/SSH_-_Creating_and_using_SSH-keys) using the following commands:
	
~~~bash
# Move into the .ssh folder
$ cd ~/.ssh

# Create a keypair.
$ ssh-keygen -t rsa
~~~

When asked for a name, name it something appropriate, like: `sparkManagerKey`
	
##### 2. Worker Shortcuts

Open the SSH config file using `nano ~/.ssh/config` and paste the following configuration settings for the penguins:

~~~bash
Host worker.one
		HostName XXX.XXX.XXX.XXX
		Port 22
		User <USERNAME HERE>
		IdentityFile ~/.ssh/sparkManagerKey

Host worker.two
		HostName XXX.XXX.XXX.XXX
		Port 22
		User <USERNAME HERE>
		IdentityFile ~/.ssh/sparkManagerKey   
~~~

The benefit of doing this is that you can now refer to the worker machines using their given names. So if you want to SSH into one of the machines from your manager machine all you need to do is `ssh worker.one`. However, this will not work now as the worker machine does not accept any incoming SSH-connections from this machine yet. We'll deal with this in a second, first we'll finish setting up the manager machine.

##### 3. Configure the Spark Manager

Now we will need to configure the **manager** machine to know about its **workers**. Navigate into the spark installation folder and then go to the conf-directory (`cd $SPARK_HOME/conf`). There are a number of files present here with the extension `.template`. To look at the contents of the directory:
	
~~~bash
$ ls -la

drwxr-xr-x  2 spark.manager spark.manager 4096 Jun 19 17:06 .
drwxr-xr-x 13 spark.manager spark.manager 4096 Jun 19 17:06 ..
-rw-r--r--  1 spark.manager spark.manager  202 Jun  3 02:30 docker.properties.template
-rw-r--r--  1 spark.manager spark.manager  303 Jun  3 02:30 fairscheduler.xml.template
-rw-r--r--  1 spark.manager spark.manager  632 Jun  3 02:30 log4j.properties.template
-rw-r--r--  1 spark.manager spark.manager 5565 Jun  3 02:30 metrics.properties.template
-rw-r--r--  1 spark.manager spark.manager   80 Jun  3 02:30 slaves.template
-rw-r--r--  1 spark.manager spark.manager  507 Jun  3 02:30 spark-defaults.conf.template
-rwxr-xr-x  1 spark.manager spark.manager 3318 Jun  3 02:30 spark-env.sh.template
~~~

We'll copy the one named `slaves.template` and configure the workers there.

~~~bash
$ cp slaves.template slaves

$ nano slaves
~~~

When opened paste the following configuration.

~~~bash
# Slaves file.
worker.one
worker.two
~~~

Here you can see how nice it is to have 'shortcut' names for the workers. If we every want to change something about their configuration we only need to change the SSH config file and Spark will know instantly.
	
Next copy the **manager** `spark-env.sh` file and open it using 
	
~~~bash
$ cp spark-env.sh.template spark-env.sh

$ nano spark-env.sh
~~~

In this file there are a lot of configuration parameters that can be set. We only need a few for this specific occasion. Set the following parameters and make sure to replace `<MANAGER_IP_ADDRESS>` with the IP-address of your Spark **manager** machine:
	
~~~bash
SPARK_LOCAL_IP=<MANAGER_IP_ADDRESS>
SPARK_MASTER_IP=<MANAGER_IP_ADDRESS>
SPARK_WORKER_CORES=1
SPARK_WORKER_MEMORY=1000m
~~~
	
Note: The IP-address used here is the IP-address of the **manager** (or master) machine.

The last thing to do on the **manager** machine is changing the IPython startup command slightly. When starting IPython/Spark as the **master/manager**, the command is slightly different as we have to tell it that we are running it as a manager and not a standalone instance. Open up the `.bash_profile`:

~~~bash
$ nano ~/.bash_profile
~~~

and add the following line to it:

~~~bash
alias IPYSPARKMASTER='MASTER=spark://<MANAGER_IP_ADDRESS>:7077 PYSPARK_DRIVER_PYTHON=ipython PYSPARK_DRIVER_PYTHON_OPTS="notebook --profile=pyspark --ip=0.0.0.0" $SPARK_HOME/bin/pyspark'
~~~

Note: here again we are using the IP address of the **master/manager** where it states `<MANAGER_IP_ADDRESS>`.

Therefore rather than typing `IPYSPARK` (because this is the shortcut in the bash profile), we can later on start IPython in Spark-cluster mode using `IPYSPARKMASTER`.

These were all the configurations that need to be setup for the **master/manager**. We now need to configure the **workers** so they know what their role is and who is managing them.

### Configuring Spark Workers

The following instructions will deal with setting up the **worker** machines. Note that its best to complete the above instructions before setting up the workers as you will need bits and pieces from the above here.

##### 1. Add the Manager's SSH-Keypair

For the **manager** machine to be able to SSH into the **worker** machine the worker needs to first have its SSH key listed as an authorized key.

On the **manager** machine print the contents of the public key using

~~~bash
$ cat ~/.ssh/sparkManagerKey.pub
~~~

Copy the contents and, on the **worker** machine open the `authorized_keys` file in a text-editor

~~~bash
$ nano ~/.ssh/authorized_keys
~~~

Paste in the contents of the public-key you just copied on a new line and save-and-close the file.

Now your **worker** machine will accept SSH connections from the **manager** machine. You can try this by trying to connect from the manager machine using `ssh worker.one`.

##### 2. Create an alias for the Manager Machine

Add the IP address of the **manager** machine to the `.bash_profile` file
	
~~~bash
$ nano ~/.bash_profile
~~~

and paste in the following
	
~~~bash
# paste in the following:
alias SPARK_MANAGER_IP='<MANAGER_IP_ADDRESS>'
~~~

Note: here again we are using the IP address of the **master/manager** where it states `<MANAGER_IP_ADDRESS>`.

##### 3. Configuring the Spark Worker

On the **worker** machine navigate into the Spark configuration folder (`cd $SPARK_HOME/conf`).

Just like with the **manager** machine we need to configure the Spark environment for this **worker** machine. Copy the `spark-env.sh` and open it using a text-editor

~~~bash
$ cp spark-env.sh.template spark-env.sh

$ nano spark-env.sh
~~~

Now we need to add some configurations to this file so the **worker** machine knows about who to report to. Add the following lines
	
~~~bash
SPARK_MASTER_IP=SPARK_MANAGER_IP 
SPARK_WORKER_CORES=1
SPARK_WORKER_MEMORY=1000m
~~~

Note: the `SPARK_MANAGER_IP` alias was added before in the `~/.bash_profile`.

##### 4. Spark Worker Path

Since we are working from a **Vagrant** virtual machine this is where we run into a complication. The workers have a Spark installation similar to `/home/<MACHINE_NAME>/spark_installation`. However the **manager** machine is SSH-ing in as vagrant (or some other username) and is looking for `home/vagrant/spark_installation`. To work around this we will create a symbolic link inside the **worker** machine that reflects the **manager** machine's login and points to the actual installation path. So, in the workers create symbolic links for whatever the manager will do. 

~~~bash
$ sudo mkdir /home/<MANAGER_NAME>

$ sudo ln -s /home/<WORKER_NAME>/spark-1.4.0-bin-hadoop2.6/ /home/<MANAGER_NAME>/spark-1.4.0-bin-hadoop2.6
~~~
	
Note: in a production environment, make sure the same user is configured in all machines (this is the problem here)?


### Start the Cluster and use IPython

To run the cluster we need to go to the **manager** machine and run the following command from within the Spark folder `$SPARK_HOME`.

~~~bash
# Start the master and worker...
$ .sbin/start-all.sh
~~~

Now to start IPython we will want to nagivate to the folder we will want to start it from.

~~~bash
# Navigate to the HOME folder...
$ cd $HOME

# Start IPython.
$ IPYSPARKMASTER
~~~


1. go to `http://<master_ip_address or 127.0.0.1>:8001/tree` for pynotebooks
2. go to `http://<master_ip_address or 127.0.0.1>:8080` for overview GUI (starts working after start all)
3. go to `http://<master_ip_address or 127.0.0.1>:4040` to see jobs (starts working after the python kernel has started up)

When finished, quit the notebook and don't forget to stop all the services using: 

~~~bash
$ cd $SPARK_HOME

$ .sbin/stop-all.sh
~~~



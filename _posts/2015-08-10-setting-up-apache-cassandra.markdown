---
layout: post
comments: true
title:  "Setting up Apache Cassandra"
excerpt: "Some notes on how to get started with Apache Cassandra on Ubuntu. Both as a standalone database and as a replicated cluster."
date:   2015-08-10 20:00:00
mathjax: true
---

### Installing Apache Cassandra

* https://www.digitalocean.com/community/tutorials/how-to-install-cassandra-and-run-a-single-node-cluster-on-a-ubuntu-vps

Cassandra (as well as Spark) requires Java to be installed. See the Spark installation documents to install Java.

-
### Install & Setup Cassandra

Download the tarball and unzip it.

~~~bash
$ wget http://www.mirrorservice.org/sites/ftp.apache.org/cassandra/2.1.6/apache-cassandra-2.1.6-bin.tar.gz

$ tar -xvzf apache-cassandra-2.1.6-bin.tar.gz
~~~

Next, make sure that the folders Cassandra accesses, such as the log folder, exists and that Cassandra has the right to write on it:

~~~bash
$ sudo mkdir /var/lib/cassandra
$ sudo mkdir /var/log/cassandra
$ sudo chown -R $USER:$GROUP /var/lib/cassandra
$ sudo chown -R $USER:$GROUP /var/log/cassandra
~~~

In the `.bash_profile` add the following two lines:

~~~bash
$ nano ~/.bash_profile

# APACHE CASSANDRA Config.
export CASSANDRA_HOME=~/cassandra
export PATH=$PATH:$CASSANDRA_HOME/bin
~~~

Make sure to `source ~/.bash_profile` after this for the changes to take effect.


-
### Running Cassandra on a single machine

To start Cassandra now we can use:

~~~bash
# Starting it as a standalone process
$ sudo sh ~/apache-cassandra-2.1.6/bin/cassandra
~~~

This will start it in the foreground. Lets quit this using `CTRL+C`. To make sure we don't have it running in the foreground we can add two additional parameters `nohup` (disable all the stdout output) and `&` (push to background):

~~~bash
$ sudo nohup sh ~/apache-cassandra-2.1.6/bin/cassandra &
# Output looks something like:
[1] 1642
nohup: ignoring input and appending output to ‘nohup.out’
~~~

To stop it we first need to find out the process-id. We can do this using:

~~~bash
$ ps aux | grep cassandra
root      1704 36.5 29.8 1329036 1235776 pts/0 SLl  11:30   0:10 java -ea -javaagent:/home/fiordland/apache-cassandra-2.1.6/bin/../lib/jamm-0.3.0.jar -XX:+CMSClassUnloadingEnabled -XX:+UseThreadPriorities [...]
~~~

To kill this process use `sudo kill -9 <PID>` where the <PID> is 1704 in the example here.

While it is still running, lets connect locally using the CLI (command line interface):

~~~bash
# Starting the command-line-interface
$ sudo sh ~/apache-cassandra-2.1.6/bin/cassandra-cli
Connected to: "Test Cluster" on 127.0.0.1/9160
Welcome to Cassandra CLI version 2.1.6

The CLI is deprecated and will be removed in Cassandra 2.2.  Consider migrating to cqlsh.
~~~

Since this is depreciated we'll move to the new interface. Exit the CLI using `exit;`. Now start the CQLSH using:

~~~bash
# Starting the cassandra-query-language shell
$ sudo sh ~/apache-cassandra-2.1.6/bin/cqlsh
Connected to Test Cluster at 127.0.0.1:9042.
[cqlsh 5.0.1 | Cassandra 2.1.6 | CQL spec 3.2.0 | Native protocol v3]
~~~

~~~cql
cqlsh> describe cluster;

Cluster: Test Cluster
Partitioner: Murmur3Partitioner

cqlsh> describe schema;

cqlsh> describe keyspaces;

system_traces  system

cqlsh> describe tables;

Keyspace system_traces
----------------------
events  sessions

Keyspace system
---------------
peers             schema_triggers   batchlog                 local
range_xfers       sstable_activity  size_estimates           hints
schema_keyspaces  peer_events       compaction_history
schema_columns    schema_usertypes  compactions_in_progress
"IndexInfo"       paxos             schema_columnfamilies
~~~


-
### CQL - Cassandra Query Language?

* http://www.planetcassandra.org/create-a-keyspace-and-table/
* http://docs.datastax.com/en/cql/3.0/cql/cql_reference/insert_r.html
* http://docs.datastax.com/en/cql/3.0/cql/cql_reference/cqlsh.html

So there is nothing there. Lets quickly check out how to create a keyspace and tables and insert some data before moving on the setting up other nodes and initialising a cluster.

Creating a keyspace with the name `demo`:

~~~cql
cqlsh> CREATE KEYSPACE demo WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 1 };

cqlsh> describe keyspaces;

system_traces  system  demo
~~~

We can now use this keyspace and create some tables there

~~~cql
cqlsh> use demo;
cqlsh:demo>
~~~

~~~cql
cqlsh> CREATE TABLE users (
firstname text,
lastname text,
age int,
email text,
city text,
PRIMARY KEY (lastname));
~~~

~~~cql
cqlsh:demo> describe schema

CREATE KEYSPACE demo WITH replication = {'class': 'SimpleStrategy', 'replication_factor': '1'}  AND durable_writes = true;

CREATE TABLE demo.users (
    lastname text PRIMARY KEY,
    age int,
    city text,
    email text,
    firstname text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = '{"keys":"ALL", "rows_per_partition":"NONE"}'
    AND comment = ''
    AND compaction = {'min_threshold': '4', 'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32'}
    AND compression = {'sstable_compression': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99.0PERCENTILE';
~~~

[Insert a record](http://www.planetcassandra.org/insert-select-records/). Please not that for this table the `lastname` is the primary-key, so we cannot have more than 1 person with the same lastname.

~~~cql
cqlsh> INSERT INTO users (firstname, lastname, age, email, city) VALUES ('John', 'Smith', 46, 'johnsmith@email.com', 'Sacramento');
~~~


-
### Setting up the Cluster

First thing we need to do is generate `tokens` for all machines in the cluster. Create a new python file to do this (following [these](http://www.datastax.com/2012/01/how-to-set-up-and-monitor-a-multi-node-cassandra-cluster-on-linux) instructions):

~~~bash
$ nano apache-cassandra-2.1.6/tokens.py
~~~

Paste in the following python code [Note: Murmur3 codes](http://stackoverflow.com/questions/22006186/cassandra-tokens-and-org-apache-cassandra-exceptions-configurationexception-fo).

~~~python
#! /usr/bin/python
import sys
if (len(sys.argv) > 1):
    num=int(sys.argv[1])
else:
    num=int(raw_input("How many nodes are in your cluster? "))
# for i in range(0, num):
    # print 'token %d: %d' % (i, (i*(2**127)/num))
print [str(((2**64 / num) * i) - 2**63) for i in range(num)]
~~~

Run it to generate X-number of tokens.

~~~bash
$ python apache-cassandra-2.1.6/tokens.py

How many nodes are in your cluster? 2
token 0: 0
token 1: 4611686018427387904
~~~

Now we need to configure both machines so they recognize each other and there is one lead, or `seed` machine.

On both machines open the cassandra configuration file using

~~~bash
$ nano apache-cassandra-2.1.6/conf/cassandra.yaml
~~~

**MACHINE 1 (IP: 172.16.0.223)**

~~~
initial_token: 0

- seeds: 172.16.0.223 # ip address of 'seed node'

listen_address: 172.16.0.223
~~~

**MACHINE 2 (IP: 172.16.0.221)**

~~~
initial_token: 4611686018427387904

- seed: 172.16.0.223

listen_address: 172.16.0.221
~~~

Once you have saved both files. Start cassandra on both machines (maybe best to start machine 1 (seed-machine) first).

~~~bash
$ sudo nohup sh ~/apache-cassandra-2.1.6/bin/cassandra &
~~~

Check on both if the process is actually running and it did not error out somehow.

~~~bash
$ ps aux | grep cassandra
~~~

On Machine-1 now run the following command to see if it has picked up the other node in its network.

~~~bash
$ ./apache-cassandra-2.1.6/bin/nodetool status

Datacenter: datacenter1
=======================
Status=Up/Down
|/ State=Normal/Leaving/Joining/Moving
--  Address       Load       Tokens  Owns    Host ID                               Rack
UN  172.16.0.223  210.88 KB  256     ?       329edf4b-89b0-4d0d-bbbb-dd5f1962e936  rack1
UJ  172.16.0.221  46.81 KB   1       ?       6071a3bf-6dc3-4667-807e-925c2649d3e9  rack1

Note: Non-system keyspaces don't have the same replication settings, effective ownership information is meaningless
~~~

-
### TO DO

To check if it is actually working... create a keyspace,table,insert on one and check on the other. (using the `cqlsh` cli)

Notes on keyspaces and replication/networktopology: 
http://docs.datastax.com/en/cassandra/1.2/cassandra/architecture/architectureDataDistributeReplication_c.html

~~~
CREATE KEYSPACE "demoShared" WITH REPLICATION = {'class' : 'NetworkTopologyStrategy', '172.16.0.223': 2, '172.16.0.221': 3};
~~~



-
### NOT DONE

* SSL connection between databases? Connections are now plaintext? Or at least some default networking setting.
* [PySpark-Cassandra Connector](https://github.com/TargetHolding/pyspark-cassandra)
* [Python-Cassandra](https://github.com/datastax/python-driver)


-
### Other


From the [DOCs](https://wiki.apache.org/cassandra/FAQ#gui)

Is there a GUI admin tool for Cassandra?

* DataStax Opscenter, a management and monitoring tool for Cassandra with a web-based UI.
* Cassandra Cluster Admin, a PHP-based web UI.
* Toad for Cloud Databases, a desktop application and Eclipse plugin which support Cassandra.
* DBeaver, a desktop application, support Cassandra using JDBC driver.


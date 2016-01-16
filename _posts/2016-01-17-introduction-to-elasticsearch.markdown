---
layout: post
comments: true
title:  "Introduction to ElasticSearch"
excerpt: "ElasticSearch is an excellent way to organise and search un-structured and text-rich information. This tutorial runs through the installation of ElasticSearch on a machine and the basic steps for adding, searching and sorting documents."
date:   2016-01-16 13:00:00
author: Luuk Derksen
mathjax: false
tags:
  - elasticsearch
  - data-engineering
  - machine-learning
---


Some basic notes on installing ElasticSearch (2.1.1) and Sense and starting to use it to search text.

Although the [documentation](https://www.elastic.co/guide/en/elasticsearch/guide/current/getting-started.html) of Elastic is great I sometimes struggled to see the actual results of the queries and therefore wrote this little introduction-post.


### Installing ElasticSearch (2.1.1)

First download and unpack ElasticSearch:

```bash
$ cd ~/

$ wget https://download.elastic.co/elasticsearch/elasticsearch/elasticsearch-2.1.1.tar.gz

$ tar -xvzf elasticsearch-2.1.1.tar.gz

$ rm elasticsearch-2.1.1.tar.gz

$ mv elasticsearch-2.1.1/ elastic-elasticsearch-2.1.1/

$ cd elastic-elasticsearch-2.1.1
```

Next we need to install the licenses.

```bash
$ cd ~/elastic-elasticsearch-2.1.1/

$ sudo bin/plugin install license
-> Installing license...
Plugins directory [/home/vagrant/elasticsearch-2.1.1/plugins] does not exist. Creating...
Trying https://download.elastic.co/elasticsearch/release/org/elasticsearch/plugin/license/2.1.1/license-2.1.1.zip ...
Downloading .......DONE
Verifying https://download.elastic.co/elasticsearch/release/org/elasticsearch/plugin/license/2.1.1/license-2.1.1.zip checksums if available ...
Downloading .DONE
Installed license into /home/vagrant/elastic-elasticsearch-2.1.1/plugins/license
```

Install Kibana, the visualisation toolkit and something we will need to run the UI for elasticsearch (i.e., Sense).

```bash
$ cd ~/

$ wget https://download.elastic.co/kibana/kibana/kibana-4.3.1-linux-x64.tar.gz

$ tar -xvzf kibana-4.3.1-linux-x64.tar.gz

$ rm kibana-4.3.1-linux-x64.tar.gz

$ mv kibana-4.3.1-linux-x64/ elastic-kibana-4.3.1/

$ cd elastic-kibana-4.3.1/
```

```bash
$ ./bin/kibana plugin --install elastic/sense
Installing sense
Attempting to extract from https://download.elastic.co/elastic/sense/sense-latest.tar.gz
Downloading 318236 bytes....................
Extraction complete
Optimizing and caching browser bundles...
```

To summarise. We have installed **ElasticSearch**, **Kibana** and the **Sense** UI plugin.

Move back to your home directory using `cd ~/` to finally start using ElasticSearch.


### Starting the Service(s)

To start ElasticSearch we can run:

```
# Use the flag -d for background deamon.
$ ./elastic-elasticsearch-2.1.1/bin/elasticsearch -d 
```

To see what the process id is:

```bash
$ ps aux | grep elastic
vagrant   2134 60.5  8.6 1886424 177556 pts/0  Sl   15:57   0:04 /usr/bin/java -Xms256m -Xmx1g -Djava.awt.headless=true -XX:+UseParNewGC -XX:+UseConcMarkSweepGC -XX:CMSInitiatingOccupancyFraction=75 -XX:+UseCMSInitiatingOccupancyOnly -XX:+HeapDumpOnOutOfMemoryError -XX:+DisableExplicitGC -Dfile.encoding=UTF-8 -Djna.nosys=true -Des.path.home=/home/vagrant/elasticsearch-2.1.1 -cp /home/vagrant/elasticsearch-2.1.1/lib/elasticsearch-2.1.1.jar:/home/vagrant/elasticsearch-2.1.1/lib/* org.elasticsearch.bootstrap.Elasticsearch start -d
vagrant   2187  0.0  0.0  10432   668 pts/0    S+   15:57   0:00 grep elastic
```

To start Kibana we can run:

```bash
# To start Kibana, supress output and put it in a background process
$ nohup ./elastic-kibana-4.3.1/bin/kibana &
```

The URL we can use now to interface with ElasticSearch through a web-interface is:

* Sense on Kibana - http://127.0.0.1:5601/app/sense


### ElasticSearch via Command-Line

Since our database is now empty, lets start putting some information in. Before we do so a few pointers to get information about the database itself via the command line.

Run these from without the VM because the normal port is `9200`.

```bash
$ curl http://127.0.0.1:9200/_cat/health?v
# output:
epoch      timestamp cluster       status node.total node.data shards pri relo init unassign pending_tasks
1444212818 10:13:38  elasticsearch green           1         1      0   0    0    0        0             0
```

Nodes

```bash
$ curl http://127.0.0.1:9200/_cat/nodes?v
# output:
host                     ip        heap.percent ram.percent load node.role master name
vagrant-ubuntu-trusty-64 10.0.2.15            3          15 0.08 d         *      Fagin
```

Indices

```bash
$ curl http://127.0.0.1:9200/_cat/indices?v
# output:
health status index pri rep docs.count docs.deleted store.size pri.store.size
```

Creating an index named `news`

```bash
$ curl -XPUT http://127.0.0.1:9200/news?pretty
# output:
{
  "acknowledged" : true
}
```

```bash
$ curl http://127.0.0.1:9200/_cat/indices?v
# output:
health status index    pri rep docs.count docs.deleted store.size pri.store.size
yellow open   news     5   1          0            0       575b           575b
```

Similarly you can delete an index.

```bash
$ curl -XDELETE http://127.0.0.1:9200/news
```

### Indices, Types and Documents

Before moving on its a good idea to get a better understanding into the three main categories in ElasticSearch:

* **Index**: *An index is a collection of documents that have somewhat similar characteristics. For example, you can have an index for customer data, another index for a product catalog, and yet another index for order data. An index is identified by a name (that must be all lowercase) and this name is used to refer to the index when performing indexing, search, update, and delete operations against the documents in it. In a single cluster, you can define as many indexes as you want.*
    * Must read: [Index Management](https://www.elastic.co/guide/en/elasticsearch/guide/current/index-management.html). Read through the pages and pay close attention to: **analyzers** and **mapping**. Just like in relational databases you need to pay close attention to what analyzers and mapping you use for the data. Its a bit like thinking about what *type* of data you want to store and how it is searchable/sortable as text (sort by sentence, or bag-of-words etc).
* **Type**: *Within an index, you can define one or more types. A type is a logical category/partition of your index whose semantics is completely up to you. In general, a type is defined for documents that have a set of common fields. For example, let’s assume you run a blogging platform and store all your data in a single index. In this index, you may define a type for user data, another type for blog data, and yet another type for comments data.*
* **Document**: *A document is a basic unit of information that can be indexed. For example, you can have a document for a single customer, another document for a single product, and yet another for a single order. This document is expressed in JSON (JavaScript Object Notation) which is an ubiquitous internet data interchange format. Within an index/type, you can store as many documents as you want. Note that although a document physically resides in an index, a document actually must be indexed/assigned to a type inside an index.*


### Sense Interface

For this we will use the `Sense` Kibana-app. Go to [http://127.0.0.1:5601/app/sense](http://127.0.0.1:5601/app/sense) to open it. Since this runs on Kibana within the VM we can have it connect locally to `http://localhost:9200`

### Creating an Index with Mapping

To create a new index we can use `PUT /<INDEX-NAME>`.

```javascript
PUT /news
{
	"mappings": {
		"articles": {
			"properties": {
				"webTitle": {
					"type": "multi_field",
					"fields": {
						"webTitle": { 
							"type": 		"string",
							"analyzer": 	"standard"
						},
						"whitespace": { 
							"type": 		"string",
							"analyzer": 	"whitespace"
						},
						"english": { 
							"type": 		"string",
							"analyzer": 	"english"
						},
						"raw": { 
							"type": 		"string",   
							"index": 		"not_analyzed"
						}
					}
				}
			}
		}
	}
}
```

### Adding Documents

We'll now manually create a `document` in the `news` index. We give it a type `articles` and no `_id` so that will be automatically generated. To do this use the following 'query'.

```javascript
POST /news/articles
{
    "type": "liveblog",
    "sectionId": "politics",
    "webTitle": "Tory minister attacks BBC for its coverage of Elliott Johnson story - Politics live",
    "webPublicationDate": "2015-12-10T15:08:42Z",
    "id": "politics/blog/live/2015/dec/10/cameron-fails-to-win-support-of-polish-pm-for-his-plan-to-change-eu-benefit-rules-politics-live",
    "webUrl": "http://www.theguardian.com/politics/blog/live/2015/dec/10/cameron-fails-to-win-support-of-polish-pm-for-his-plan-to-change-eu-benefit-rules-politics-live",
    "apiUrl": "http://content.guardianapis.com/politics/blog/live/2015/dec/10/cameron-fails-to-win-support-of-polish-pm-for-his-plan-to-change-eu-benefit-rules-politics-live",
    "sectionName": "Politics"
}
```

The output will looks something like:

```javascript
{
   "_index": "news",
   "_type": "articles",
   "_id": "AVGMeZ9hbQL4kpTUdIf8",
   "_version": 1,
   "created": true
}
```

Adding an article without specifying an `_id` uses `POST`. If you want to insert one using a specific `_id` you can use the `PUT` request.

```javascript
PUT /{INDEX}/{TYPE}/{ID}
{
    "field1" : "text",
    "field2" : "text"
}
```

Lets add some more articles to make sure we have some stuff to work with from here.

```javascript
POST /news/articles
{
    "type": "liveblog",
    "sectionId": "business",
    "webTitle": "VW emissions scandal: misconduct, process failure and tolerance of rule-breaking blamed – as it happened",
    "webPublicationDate": "2015-12-10T14:59:44Z",
    "id": "business/live/2015/dec/10/volkswagen-vw-grilling-emissions-scandal-bank-of-england-business-live",
    "webUrl": "http://www.theguardian.com/business/live/2015/dec/10/volkswagen-vw-grilling-emissions-scandal-bank-of-england-business-live",
    "apiUrl": "http://content.guardianapis.com/business/live/2015/dec/10/volkswagen-vw-grilling-emissions-scandal-bank-of-england-business-live",
    "sectionName": "Business"
}

POST /news/articles 
{
    "type": "liveblog",
    "sectionId": "environment",
    "webTitle": "Paris talks: negotiators await new draft climate deal - live blog",
    "webPublicationDate": "2015-12-10T14:58:25Z",
    "id": "environment/blog/live/2015/dec/10/paris-climate-talks-cop21-draft-deal-negotiations-continue-live-blog",
    "webUrl": "http://www.theguardian.com/environment/blog/live/2015/dec/10/paris-climate-talks-cop21-draft-deal-negotiations-continue-live-blog",
    "apiUrl": "http://content.guardianapis.com/environment/blog/live/2015/dec/10/paris-climate-talks-cop21-draft-deal-negotiations-continue-live-blog",
    "sectionName": "Environment"
}

POST /news/articles
{
    "type": "article",
    "sectionId": "world",
    "webTitle": "Japanese PM's website hacked by whaling protesters",
    "webPublicationDate": "2015-12-10T14:40:35Z",
    "id": "world/2015/dec/10/japanese-pms-website-hacked-whaling-protesters",
    "webUrl": "http://www.theguardian.com/world/2015/dec/10/japanese-pms-website-hacked-whaling-protesters",
    "apiUrl": "http://content.guardianapis.com/world/2015/dec/10/japanese-pms-website-hacked-whaling-protesters",
    "sectionName": "World news"
}

POST /news/articles
{
    "type": "article",
    "sectionId": "politics",
    "webTitle": "Senior minister attacks Newsnight over Tory bullying claims coverage",
    "webPublicationDate": "2015-12-10T14:36:54Z",
    "id": "politics/2015/dec/10/nick-boles-minister-attacks-newsnight-tory-bullying-claims-lord-feldman",
    "webUrl": "http://www.theguardian.com/politics/2015/dec/10/nick-boles-minister-attacks-newsnight-tory-bullying-claims-lord-feldman",
    "apiUrl": "http://content.guardianapis.com/politics/2015/dec/10/nick-boles-minister-attacks-newsnight-tory-bullying-claims-lord-feldman",
    "sectionName": "Politics"
}
```

So we have now added 5 articles. Notice that 2 have the word **Tory** in there.


### Searching and Retrieving Documents

Retrieve an article by using the `_id`

```javascript
GET /{INDEX}/{TYPE}/{ID}
```

Usually you will try to actually search the database for matching articles. To return all documents you can 'search empty'. You can use the following ways to return everything for now...

```javascript
// Everything
GET /_all/_search

// Everything within news
GET /news/_search

// Everything within news/articles
GET /news/articles/_search
```

Because we don't have any more indices or types this will do for now.

Before looking at actually searching lets take a look at how to 'filter' the fields that we get back from a selected document. To retrieve only specific `fields` we can specify the exact fields we want back. You can use both a `POST` and a `GET` request for this.

```javascript
POST /news/articles/_search
{
    "fields" : [ "webTitle", "sectionName", "webPublicationDate" ]
}

GET /news/articles/_search?fields=webTitle,sectionName,webPublicationDate
```

So we know how to retrieve all documents in an index/type and how to specify what fields we want back. Lets look at searching! Some [documentation](https://www.elastic.co/guide/en/elasticsearch/reference/1.4/search-search.html) and [documentation](https://www.elastic.co/guide/en/elasticsearch/reference/1.4/_executing_searches.html)

We can search using queries with both POST and GET.

```javascript
POST /news/articles/_search 
{
    "fields" : ["webTitle", "sectionName", "webPublicationDate"],
    "query": { 
        "match": { "webTitle" : "Tory" } 
    }
}

GET /news/articles/_search?q=webTitle:Tory&fields= webTitle,sectionName,webPublicationDate
```

To search on multiple words but not on exact matches we can again use the `match` query.

```javascript
POST /news/articles/_search 
{
    "fields" : ["webTitle", "sectionName", "webPublicationDate"],
    "query": { 
        "match": { "webTitle" : "Tory Paris" } 
    }
}

GET /news/articles/_search?q=webTitle:Tory&fields= webTitle,sectionName,webPublicationDate
```

Exact matching of a string using `match_phrase`

```javascript
POST /news/articles/_search 
{
    "fields" : ["webTitle", "sectionName", "webPublicationDate"],
    "query": { 
        "match_phrase": { "webTitle" : "Tory newsnight" } 
    }
}
```

Boolean matching

```javascript
POST /news/articles/_search 
{
    "fields" : ["webTitle", "sectionName", "webPublicationDate"],
    "query": { 
        "bool": {
            "must": [
                { "match": { "webTitle" : "Tory" } },
                { "match": { "webTitle" : "newsnight" } }
            ]
        }
    }
}
```

There are more options: `should`, `must_not`.

### Sorting Documents

Sorting documents is both very easy and not so much. Lets start with the simple stuff. Some [documentation](https://www.elastic.co/guide/en/elasticsearch/reference/1.4/search-request-sort.html). Basic sorting can be done using POST and GET.

```javascript
POST /news/articles/_search
{
    "fields" : ["webTitle", "sectionName", "webPublicationDate"],
    "sort" : [
        { "webPublicationDate" : { "order" : "asc" } }
    ]
}

GET /news/articles/_search?sort=webPublicationDate:asc&fields= webTitle,sectionName,webPublicationDate
```

This allows us to sort on `webPublicationDate`. Any sorting that is not on strings is quite straightforward. Now lets try sorting the information based on the `webTitle` instead of the `webPublicationDate`.

'Normal' string searching happens on a text bag-of-words basis.

* https://www.elastic.co/guide/en/elasticsearch/guide/current/multi-fields.html
* https://www.elastic.co/guide/en/elasticsearch/guide/current/sorting-collations.html

supports both POST and GET requests.

```javascript
POST /news/articles/_search
{
    "fields" : ["webTitle", "sectionName", "webPublicationDate"],
    "sort" : [
        "webTitle",
        "_score"
    ]
}

GET /news/articles/_search?sort=webTitle,_score&fields=webTitle,sectionName,webPublicationDate
```

We can see it go wrong here already. It will sort on words like **and** and **attack**. It splits the sentence in a bag-of-words and uses the `min` or `max` of the list to select the word to use in the sorting. Ideally here we would like to sort based on the full title whilst still retaining the flexibility of searching on the bag-of-words title. This all has to do with the **mapping** of the documents.

### MAPPING

You can see the [mapping](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-get-field-mapping.html) of all content by 

```javascript
GET /news/_mapping

GET /_all/_mapping
```

This will give you something looking like

```javascript
{
   "news": {
      "mappings": {
         "articles": {
            "properties": {
               ...
               "webTitle": {
                  "type": "string"
               },
               ...
```

So an index (news) has mappings and each type (articles) will have its own mappings per field. To directly get the mapping for a single field you can use the  following query:

```javascript
GET /news/_mapping/articles/field/webTitle
```

giving

```javascript
webTitle": {
    "type": "string",
    "analyzer": "standard",
    "fields": {
      "english": {
        "type": "string",
        "analyzer": "english"
      },
      "raw": {
        "type": "string",
        "index": "not_analyzed"
      },
      "whitespace": {
        "type": "string",
        "analyzer": "whitespace"
      }
    }
  }
```

We can use the `webTitle.raw` for the sorting for example. Lets see how this works...

**Sorting continued**

To sort by the sentence, descending (note the `webTitle.raw`):

```javascript
POST /news/articles/_search
{
    "fields" : ["webTitle", "sectionName", "webPublicationDate"],
    "query": { 
        "bool": {
            "must": [
                { "match": { "webTitle" : "Tory" } }
            ]
        }
    },
    "sort" : [
        "_score",
        { "webTitle.raw" : { "order" : "desc" } }
    ]
}
```


### Aggregation

Aggregating counts/stats using `aggs`.

* https://www.elastic.co/guide/en/elasticsearch/reference/1.4/_executing_aggregations.html

Like a COUNT(*) GROUP BY 

```javascript
POST /news/articles/_search
{
    "size": 0,
    "aggs": {
        "group_by_state": {
            "terms": {
                "field": "sectionName"
            }
        }
    }
}
```
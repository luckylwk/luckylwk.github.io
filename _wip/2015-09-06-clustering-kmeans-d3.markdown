---
layout: post
comments: true
title:  "K-Means Clustering using D3"
excerpt: "..."
date:   2015-09-06 11:22:00
author: Luuk Derksen
mathjax: false
tags:
  - d3
  - visualisation
  - machine-learning
---

<style>
	#supercontainer {
		border: 2px solid #ccc;
		border-radius: 3px;
		padding: 10px;
	}
</style>
<script src="/js/jquery-1.11.3.min.js"></script>
<script src="/js/d3.v3.5.5.min.js"></script>

Building a similarity graph clustering using D3


<div id="supercontainer">
	<div>
		Chart dimensions are 20 by 10.
		Number of clusters to generate: <input name="nCentroids" value="3"/><br/>
		Number of points per cluster: <input name="nPoints" value="25"/><br/>
		Standard deviation of the points: <input name="stdPoints" value="1"/><br/>
		K-Means number of clusters to test: <input name="kMeans" value="3" /><br/>
		<button id="clickme">testing a button</button>
	</div>
	<div id="svg-placeholder" style="min-height:300px; width:100%;"><!-- SVG CONTAINER --></div>
	<script src="/js-blogs/kmeans-d3.js"></script>
	<script>
		$('#clickme').click( function () {
			$('#svg-placeholder').html('');
			kMeans();
		});
	</script>
</div>

---
layout: post
comments: true
title:  "Hexbin Heatmap using D3"
excerpt: "Javascript code to generate a hexbin-heatmap in D3 with histograms on both dimensions."
date:   2015-09-05 14:22:00
author: Luuk Derksen
mathjax: false
tags:
  - d3
  - visualisation
---

<div id="div-hexbin-hist"></div>
<script src="/js/d3.v3.5.5.min.js"></script>
<script src="/js/d3.hexbin.v0.min.js"></script>
<script src="/js-blogs/hexbin-heatmap-d3.js"></script>

The code for this visualisation.

~~~javascript
// Set the initial width, height and margins.
var margin = { top: 20, right: 20, bottom: 20, left: 30 },
	histogram = { height:100 }
    width = 700 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;


// Generate random datapoints.
var randomX = d3.random.normal(width / 2, 80),
    randomY = d3.random.normal(height / 2, 80),
    points = d3.range(20000).map( function () { return [ randomX(), randomY() ]; } );


// Set the color-scale.
var color = d3.scale.linear()
    .domain([0, 20])
    .range(["white", "steelblue"])
    .interpolate(d3.interpolateLab);


// Create the hexbin.
var hexbin = d3.hexbin().size([width, height]).radius(5);


// Create axis scales.
var xScale = d3.scale.identity().domain([0, width]);
var yScale = d3.scale.linear().domain([0, height]).range([height, 0]);


// Create axis functions.
var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .tickSize(2, -height);

var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")
    .tickSize(2, -width);


// Create and append the svg-element to the div.
var svg = d3.select("#div-hexbin-hist").append("svg").attr("id","hexbin-hist")
    .attr("width", width + 2*margin.left + margin.right + histogram.height )
    .attr("height", height + margin.top + 2*margin.bottom + histogram.height );


var gHex = svg.append("g").attr("class","hexbin")
    .attr("transform", "translate(" + margin.left + "," + (2*margin.bottom + histogram.height) + ")");

// Create clippath to clip the hexbins that fall outside the gHex.
gHex.append("clipPath")
    .attr("id", "clip")
  	.append("rect")
    .attr("class", "mesh")
    .attr("width", width)
    .attr("height", height);

gHex.append("g")
    .attr("clip-path", "url(#clip)")
  	.selectAll(".hexagon")
    .data( hexbin(points) )
  	.enter().append("path")
    .attr("class", "hexagon")
    .attr("d", hexbin.hexagon())
    .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; } )
    .style("fill", function (d) { return color(d.length); } );

// Append the yAxis & xAxis.
gHex.append("g").attr("class", "y axis").call(yAxis);
gHex.append("g").attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);


// Create histograms
var xScaleRight = d3.scale.linear()
	.domain([0, width])
	.range([0, height]);
// Create axis functions.
var xAxisRight = d3.svg.axis()
	.scale(xScaleRight)
	.orient("bottom")
	.tickSize(2);

// Add top histogram axis
var gHistTop = svg.append("g").attr("class","hist top")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
gHistTop.append("g").attr("class", "hist x axis")
    .attr("transform", "translate(0," + histogram.height + ")")
    .call( xAxis.tickSize(2) );

// Add bottom histogram axis.
var gHistRight = svg.append("g").attr("class","hist right")
	.attr("transform", "translate(" + (width + margin.left + margin.right) + "," + (histogram.height + margin.top + margin.bottom) + ")");
gHistRight.append("g").attr("class", "hist x axis")
    //.attr("transform", "translate(0," + (histogram.height) + ")rotate(90)")
    .attr("transform", "rotate(90)")
    .call( xAxisRight );

// Create histograms using d3.layout.histogram()
var histTop = d3.layout.histogram()
	.bins( xScale.ticks(50) )
	( points.map( function (d) { return d[0]; } ) );
var histRight = d3.layout.histogram()
	.bins( xScale.ticks(50) )
	( points.map( function (d) { return d[1]; } ) );

// Create scale for each hist.
var yScaleTop = d3.scale.linear()
	.domain([ 0, d3.max( histTop, function (d) { return d.y; } ) ])
	.range([ 0, histogram.height ]);
var yScaleRight = d3.scale.linear()
	.domain([ 0, d3.max( histRight, function (d) { return d.y; } ) ])
	.range([ 0, histogram.height ]);

// Draw top histogram.
var g1 = gHistTop.append("g").attr("class","hist chart");
g1.selectAll(".bars")
	.data( histTop )
	.enter().append("rect").attr("class","bar")
	.attr("x", function (d) { return d.x; } )
	.attr("y", function (d) { return histogram.height - yScaleTop(d.y); } )
	.attr("width", xScale( histTop[0].dx ) - 1)
	.attr("height", function (d) { return yScaleTop(d.y); } );

var g2 = gHistRight.append("g").attr("class","hist chart")
	.attr("transform", "translate(" + histogram.height + ",0)rotate(90)");
g2.selectAll(".bars")
	.data( histRight )
	.enter().append("rect").attr("class","bar")
	.attr("x", function (d) { return xScaleRight(d.x); } )
	.attr("y", function (d) { return histogram.height - yScaleRight(d.y); } )
	.attr("width", xScaleRight( histRight[0].dx ) - 1)
	.attr("height", function (d) { return yScaleRight(d.y); } );
~~~

<script>drawGraph();</script>
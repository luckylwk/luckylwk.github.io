---
layout: post
comments: true
title:  "Clustering using a similarity graph in D3"
excerpt: "..."
date:   2015-11-01 11:22:00
author: Luuk Derksen
mathjax: false
tags:
  - d3
  - visualisation
---

<style>
    .edge {
        stroke-width: 0.5px;
    }
    .setosa {
        fill: green;
        stroke: green;
    }
    .virginica {
        fill: red;
        stroke: red;
    }
    .versicolor {
        fill: blue;
        stroke: blue;
    }
    .unknown {
        stroke: #aaa;
    }
    .graph-container-generic {
        border: 1px solid #aaa;
        border-radius: 5px;
    }
</style>
<script src="/js/d3.v3.5.5.min.js"></script>

Building a similarity graph clustering using D3

using the iris dataset.

Data handling function...

~~~javascript
var class_key = 'Species',
    classes = [],
    features = [],
    n = 0;

// Read in the data, parse and pass on.
d3.csv("data-iris.csv", function (d,i) {
    // Get the keys (headers) of the columns.
    if( i === 0 ){
        features = Object.keys(d);
        features.splice( features.indexOf(class_key), 1 );
        n = features.length;
    }
    // Get the classes based on the class_key
    if( classes.indexOf(d[class_key]) == -1 ){
        classes.push(d[class_key]);
    }
    return d;
}, function (error, data) {
    // Pass the data to another function here...
} );
~~~

Now we can start creating something that draws a force-directed graph.

~~~javascript
function drawGraph1 (data) {
    // Draw a force-directed graph without edges 
    // and the nodes colored by species.
    // First we need to create the graph object.
    var graph = {
        "nodes": createNodes(data),
        "edges": [],
    }
    // Draw the force directed graph.
    createForceDirectedGraph(graph,"graph-container-1");
}

// Function to create the nodes array as it is needed for the force-directed graph.
function createNodes(data){
    nodes = [];
    for( var i=0; i<data.length; i++ ){
        var obj = {};
        obj["class"] = data[i][class_key];
        obj["points"] = [];
        for( var f=0; f<features.length; f++ ){
            obj[features[f]] = +data[i][features[f]];
            obj["points"].push(+data[i][features[f]]);
        }
        // Save the node index.
        obj["ix"] = i;
        // Create a degree of connectedness.
        obj["degree"] = 0;
        nodes.push(obj);
    }
    return nodes;
}
~~~

This will return us the following visualisation.

<div id="graph-container-1"></div>

Distance: Euclidean.
Data: Raw.

Now lets draw edges between all points. However, the length of the edge will depend on how closely they are related.


<div id="graph-container-2"></div>






<script src="/js-blogs/similarity-graph-d3.js"></script>

### Code: Force Directed Graph

~~~javascript
function createForceDirectedGraph (graph,svgID) {
    console.log("Graph Stats", graph.stats)
    var width = 700,
        height = 500;
    var svg = d3.select("#"+svgID)
        .append("svg")
        .attr("id","graph")
        .attr("class","graph-container-generic")
        .attr("width", width)
        .attr("height", height);
    var nodes = svg.append("g").attr("class","nodes");
    var edges = svg.append("g").attr("class","edges");
    //
    var force = d3.layout.force()
        .charge(-50)
        .linkDistance(function (d) { 
            return 700 * Math.max(0.05, (d.value-graph.stats.minDistance)/graph.stats.maxDistance ); 
        })
        .size([width, height]);
    force.nodes(graph.nodes)
        .links(graph.edges)
        .start();
    // draw nodes.
    var node = svg.selectAll(".node")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("class", function (d) { return "node " + d.class; } )
        .attr("r", function (d) {
            if( d.degree > 0 ){
                return Math.max(1,d.degree/10);
            }
            return 5;
        })
        .style("stroke","black")
        .style("stroke-width", function (d) {
            if( d.degree === 0 ){
                return 3;
            }
            return 0;
        })
        .call(force.drag);
    // draw edges.
    var edge = edges.selectAll(".edge")
        .data(graph.edges)
        .enter().append("line")
        .attr("class", function (d) { 
            cls = "unknown";
            if( d["source-class"] === d["target-class"] ){
                cls = d["source-class"];
            }
            return "edge " + cls; 
        })
        .style("opacity", function (d) {
            return 0.25 * Math.max(0.01, 1.0-(d.value-graph.stats.minDistance)/graph.stats.maxDistance );
        })
        .attr("data-weight", function (d) { return d.value; } );
    //
    force.on("tick", function() {
        edge.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    }); // end of on-tick.
} // end of function createForceDirectedGraph
~~~

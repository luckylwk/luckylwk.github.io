var class_key = 'Species',
    classes = [],
    features = [],
    n = 0;

// Read in the data, parse and pass on.
d3.csv("/assets/data-iris.csv", function (d,i) {
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
    drawGraph1(data);
    drawGraph2(data);
} );


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


function drawGraph2 (data) {
    // Draw a force directed graph with all edges a 
    // similar length and the nodes colored by species.
    // First we need to create the graph object.
    var graph = {
        "nodes": createNodes(data),
        "edges": [],
        "stats": {
            "minDistance": 999.0,
            "maxDistance": -999.0,
            "avgDistance": 0.0
        }
    } 
    //
    for( var i=0; i<graph.nodes.length; i++ ){
        for( var j=(i+1); j<graph.nodes.length; j++ ){
            // Calculate the similarity measure.
            dist = calculateSimilarityEuclidean(graph.nodes[i]["points"],graph.nodes[j]["points"]);
            if( dist < 0.75 ){
                graph.edges.push( {
                    'source': i,
                    'target': j,
                    'value': dist,
                    "source-class": graph.nodes[i]["class"],
                    "target-class": graph.nodes[j]["class"]
                } );
                graph.nodes[i]["degree"]++;
                graph.nodes[j]["degree"]++;
            }
            graph.stats.minDistance = Math.min(graph.stats.minDistance,dist);
            graph.stats.maxDistance = Math.max(graph.stats.maxDistance,dist);
            graph.stats.avgDistance += dist/(graph.nodes.length*(graph.nodes.length-1));
        }
    }
    // Draw the force directed graph.
    createForceDirectedGraph(graph,"graph-container-2");
}


// Helper functions

function calculateSimilarityEuclidean(x1,x2){
    var tmpSum = 0.0;
    for( var d=0; d<x1.length; d++ ){
        tmpSum = tmpSum + Math.pow(x1[d]-x2[d], 2);
    }
    return Math.sqrt(tmpSum);
}


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
        .charge(-25)
        .linkDistance(function (d) { 
            return 500 * Math.max(0.05, (d.value-graph.stats.minDistance)/graph.stats.maxDistance ); 
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

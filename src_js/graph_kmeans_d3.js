function start_kmeans( $div_id, $svg_id ){
    
    // Button handling for generating data around pivot-points.
    $('#btn_genData').click( gen_random );
    // Button handling for startig kmeans
    $('#btn_startKM').click( init_kmeans );
    
    var data = {
        'pivots':[],
        'datapoints':[],
        'kmeans':[],
        'kmeanscalc':[],
        'kcluster':[]
    };
          
    // Width and height
    var margin = { 'random':50 },
        padding = { 'top':10, 'bottom':30, 'left':30, 'right':10 };
	var width = 710, // Chart width. Includes axis.
	    height = 400; // Chart height. Includes axis.

    
	// Generate a dynamic, random dataset
	var numDataPoints = 3;	// Number of dummy data points to create
	for( var i=0; i<numDataPoints; i++ ){
		data.pivots.push( get_random('pivot') );
	}
    
    // Initialize Voronoi function object.
    // Clipextend specifies the absolute area on your graph.
    var voronoi = d3.geom.voronoi().clipExtent( [ [ 0, 0 ], [ width - padding.left - padding.right, height - padding.top - padding.bottom ] ] );

	// Create scale functions
	var xScale = d3.scale.linear()
	                     .domain( [ 0, width - padding.left - padding.right ] )
						 .range([ padding.left, width - padding.right ]);

	var yScale = d3.scale.linear()
						 //.domain( [ 0, d3.max( data.pivots, function(d){ return d[1]; }) + margin.random ] )
						 .domain( [ 0, height - padding.top - padding.bottom ] )
						 .range([ height - padding.bottom, 0 + padding.top ]);

	// Define X-axis
	var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(12);

	// Define Y-axis
	var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(8);

	// Create SVG element
	var svg = d3.select( '#' + $div_id ).append("svg").attr("id", $svg_id )
				.attr("width", width)
				.attr("height", height);
    
    // Create X axis
    svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + (height - padding.bottom) + ")").call(xAxis);

    // Create Y axis
    svg.append("g").attr("class", "y axis").attr("transform", "translate(" + padding.left + ",0)").call(yAxis);
    
    // Create chart-canvas for drawing.
    var chart = svg.append("g").attr("class","chart").attr("transform", "translate(" + padding.left + "," + padding.top + ")" );
    
	// Create circles
	chart.append("g").attr("class","circle pivot")
	    .selectAll("circle")
        .data( data.pivots ).enter().append("circle")
        //.attr("cx", function(d){ return xScale(d[0]); })
        //.attr("cy", function(d){ return yScale(d[1]); })
        .attr("transform", function(d) { return "translate(" + d[0] + "," + d[1] + ")"; })
        .attr("r", 5)
        .attr("data-x", function(d){ return d[0]; })
        .attr("data-y", function(d){ return d[1]; });
    
    // Create datapoints group.
    chart.append("g").attr("class","circle data");

    

    function get_random( type ){
        // Gives back x,y coordinates. X & Y specified from the bottom left as 0,0 in the graph.
        if( type=='pivot' ){
            tmp_x = Math.random() * ( width - padding.left - padding.right - 2*margin.random) + margin.random;
            tmp_y = Math.random() * ( height - padding.top - padding.bottom - 2*margin.random) + margin.random;
        }
        else if( type=='data' ){
            // Generate X-coor.
            tmp_x = xy_piv[0] + (Math.random()-0.5)*150;
            // Make sure the points fall within the graph.
            tmp_x = Math.max( 0, Math.min( tmp_x, width - padding.left - padding.right ) );
            // Generate Y-coor.
            tmp_y = xy_piv[1] + (Math.random()-0.5)*150;
            // Make sure the points fall within the graph.
            tmp_y = Math.max( 0, Math.min( tmp_y, height - padding.top - padding.bottom ) );
        }
        return [tmp_x, tmp_y];
    }
    
    function gen_random(){
        
        chart.select("g.pivot").transition().duration(500).style("opacity",0.05);
        
        for( var i=0; i<numDataPoints; i++ ){
            xy_piv = data.pivots[i];
            for( var j=0; j<5; j++ ){
                tmp_pair = get_random('data');
                data.datapoints.push( tmp_pair );
            }
        }
        
        chart.select("g.data").selectAll("circle")
            .data( data.datapoints ).enter().append("circle")
            .attr("class", function(d,i){ return "d" + i; } )
            .attr("transform", function(d){ return "translate(" + d[0] + "," + d[1] + ")"; } )
            .transition()
            //.delay( function(d,i){ return i/data.datapoints.length*250; } )
            .duration(300)
            .attr("data-x", function(d){ return d[0]; })
            .attr("data-y", function(d){ return d[1]; })
            .attr("r", 3);
            
    }
    
    function init_kmeans(){
        
        // Generate three random initialization points (n.clusters = 3).
        for( var i=0; i<numDataPoints; i++ ){
		    data.kmeans.push( get_random('pivot') );
		    data.kmeanscalc.push( [ 0, 0, 0 ] );
		}
		
		// Draw random clusters.
		chart.append("g").attr("class","circle kmeansinit")
		    .selectAll("circle")
            .data( data.kmeans ).enter().append("circle")
            .attr("class",function(d,i){ return "centroid km" + i; })
            .attr("transform", function(d){ return "translate(" + d[0] + "," + d[1] + ")"; } )
            .attr("r", 5)
            .attr("data-x", function(d){ return d[0]; })
            .attr("data-y", function(d){ return d[1]; });
        
        // Initialize Voronoi tessalation
        chart.append("g").attr("class","kmeansvoronoi")
            .selectAll("path")
            .data( voronoi(data.kmeans) )
            .enter().append("path")
            .attr("class", function(d,i){ return "km" + i + " vor" })
            .attr("d", function(d){ return "M" + d.join("L") + "Z"; } );
		
		// KMeans with 5 iterations.
		for( var r=0; r<10; r++ ){
		    // Run KMEANS using the specified index.
			run_kmeans_iter( r );
		}
		
    }
    
    function run_kmeans_iter( $idx ){
        
        // Fade out kmeans-init.
        if( $idx==0 ){
            svg.select("g.kmeansinit").transition().duration(500).style("opacity",0.2);
        }
        else {
            svg.select("g.kmeans" + $idx ).transition().duration(500).style("opacity",0.2);
        }
        
        // check each datapoint. assign a kmeans-cluster to it.
        for( var i=0; i<data.datapoints.length; i++ ){
            var cluster = 0,
                thisDist = 999999,
                minDist = 999999;
            // check each kmeans-cluster
            for( var k=0; k<data.kmeans.length; k++ ){
                if( i==0 ){
                    data.kmeanscalc[k] = [ 0,0,0 ]; // number of points
                }
                // calculate distance.
                thisDist = Math.sqrt( Math.pow( data.datapoints[i][0]-data.kmeans[k][0], 2 ) + Math.pow( data.datapoints[i][1]-data.kmeans[k][1] , 2 ) );
                if( k>0 ){
                    if( thisDist < minDist ){
                        cluster = k; // update cluster
                        minDist = thisDist; // update minimum distance.
                    }
                }
                else{
                    minDist = thisDist;
                }
            }
            // Update cluster selection for this point.
            data.kmeanscalc[cluster][0] += data.datapoints[i][0];
            data.kmeanscalc[cluster][1] += data.datapoints[i][1];
            data.kmeanscalc[cluster][2] += 1;
            data.kcluster[i] = cluster;
            svg.select(".d" + i).attr("class", "d" + i + " km" + cluster );
        }
        
        // update cluster center to average...
        for( var k=0; k<data.kmeanscalc.length; k++ ){
            data.kmeans[k][2] = data.kmeans[k][0];
            data.kmeans[k][3] = data.kmeans[k][1];
            // Calculate new centroid if any points have been assigned.
            if( data.kmeanscalc[k][2]>0 ){
                data.kmeans[k][0] = data.kmeanscalc[k][0] / data.kmeanscalc[k][2];
                data.kmeans[k][1] = data.kmeanscalc[k][1] / data.kmeanscalc[k][2];
            }
        }
        
        // create new kmeans cluster
        chart.append("g").attr("class","circle kmeans" + ($idx+1) )
		    .selectAll("circle")
            .data( data.kmeans ).enter().append("circle")
            .attr("class",function(d,i){ return "centroid km" + i; })
            .attr("transform", function(d){ return "translate(" + d[0] + "," + d[1] + ")"; } )
            .transition().delay( function(d,i){ return i*500; } ).duration(500)
            .attr("r", 5);
        
        chart.select("g.kmeans" + ($idx+1) )
            .selectAll("line")
            .data( data.kmeans ).enter().append("line")
            .attr("x1", function(d){ return d[0]; } )
            .attr("y1", function(d){ return d[1]; } )
            .transition().delay( function(d,i){ return i*500; } ).duration(500)
            .attr("x2", function(d){ return d[2]; } )
            .attr("y2", function(d){ return d[3]; } )
            .attr("class", function(d,i){ return "km" + i; } );
        
            
        chart.select(".kmeansvoronoi")
            .selectAll("path")
            .data( voronoi(data.kmeans) )
            .transition().delay(1500).duration(1000)
            .attr("d", function(d){ return "M" + d.join("L") + "Z"; } );
        
    }
    
    
}

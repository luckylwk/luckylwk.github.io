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
        padding = 30;
	var width = 700 - padding,
	    height = 400 - padding;

	// Generate a dynamic, random dataset
	var numDataPoints = 3;	// Number of dummy data points to create
	for( var i=0; i<numDataPoints; i++ ){
		data.pivots.push( get_random('pivot') );
	}
    
	// Create scale functions
	var xScale = d3.scale.linear()
	                     //.domain( [ 0, d3.max( data.pivots, function(d){ return d[0]; }) + margin.random ] )
						 .domain( [ 0, width ] )
						 .range([padding, width + padding]);

	var yScale = d3.scale.linear()
						 //.domain( [ 0, d3.max( data.pivots, function(d){ return d[1]; }) + margin.random ] )
						 .domain( [ 0, height ] )
						 .range([ height - padding, 0 ]);

	// Define X-axis
	var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(12);

	// Define Y-axis
	var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(8);

	// Create SVG element
	var svg = d3.select( $div_id ).append("svg").attr("id", $svg_id )
				.attr("width", width)
				.attr("height", height);

	// Create circles
	svg.append("g").attr("class","circle pivot")
	    .selectAll("circle")
        .data( data.pivots ).enter().append("circle")
        .attr("cx", function(d){ return xScale(d[0]); })
        .attr("cy", function(d){ return yScale(d[1]); })
        .attr("r", 5);
    
    // Create datapoints group.
    svg.append("g").attr("class","circle data");

    //Create X axis
    svg.append("g").attr("class", "xAxis axis").attr("transform", "translate(0," + (height - padding) + ")").call(xAxis);

    //Create Y axis
    svg.append("g").attr("class", "yAxis axis").attr("transform", "translate(" + padding + ",0)").call(yAxis);

    function get_random( type ){
        if( type=='pivot' ){
            tmp_x = Math.random() * (width - 2*margin.random) + margin.random;
            tmp_y = Math.random() * (height - 2*margin.random) + margin.random;
        }
        else if( type=='data' ){
            // Generate X-coor.
            tmp_x = xy_piv[0] + (Math.random()-0.5)*150;
            // Make sure the points fall within the graph.
            tmp_x = Math.max( 0, Math.min( tmp_x, width ) );
            // Generate Y-coor.
            tmp_y = xy_piv[1] + (Math.random()-0.5)*150;
            // Make sure the points fall within the graph.
            tmp_y = Math.max( 0, Math.min( tmp_y, height ) );
        }
        return [tmp_x, tmp_y];
    }
    
    function gen_random(){
        
        svg.select("g.pivot").transition().duration(500).style("opacity",0.1);
        
        for( var i=0; i<numDataPoints; i++ ){
            xy_piv = data.pivots[i];
            for( var j=0; j<5; j++ ){
                tmp_pair = get_random('data');
                data.datapoints.push( tmp_pair );
            }
        }
        
        svg.select("g.data").selectAll("circle")
            .data( data.datapoints ).enter().append("circle")
            .attr("class", function(d,i){ return "d" + i; })
            .attr("cx", function(d){ return xScale(d[0]); })
            .attr("cy", function(d){ return yScale(d[1]); })
            .transition().delay( function(d,i){ return i/data.datapoints.length*250; } ).duration(500)
            .attr("r", 3);
            
    }
    
    function init_kmeans(){
        
        // generate three random initialization points (n.clusters = 3).
        for( var i=0; i<numDataPoints; i++ ){
		    data.kmeans.push( get_random('pivot') );
		    data.kmeanscalc.push( [ 0, 0, 0 ] );
		}
		
		svg.append("g").attr("class","circle kmeansinit")
		    .selectAll("circle")
            .data( data.kmeans ).enter().append("circle")
            .attr("class",function(d,i){ return "centroid km" + i; })
            .attr("cx", function(d){ return xScale(d[0]); })
            .attr("cy", function(d){ return yScale(d[1]); })
            .transition().delay( function(d,i){ return i/data.kmeans.length*250; } ).duration(500)
            .attr("r", 5);
		
		
		for( var r=0; r<6; r++ ){
		    // Run KMEANS using the specified index.
			run_kmeans( r );
		}
		
    }
    
    function run_kmeans( $idx ){
        
        // Fade out kmeans-init.
        if( $idx==0 ){
            svg.select("g.kmeansinit").transition().duration(500).style("opacity",0.1);
        }
        else {
            svg.select("g.kmeans" + $idx ).transition().duration(500).style("opacity",0.1);
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
        svg.append("g").attr("class","circle kmeans" + ($idx+1) )
		    .selectAll("circle")
            .data( data.kmeans ).enter().append("circle")
            .attr("class",function(d,i){ return "centroid km" + i; })
            .attr("cx", function(d){ return xScale(d[0]); })
            .attr("cy", function(d){ return yScale(d[1]); })
            .transition().delay( function(d,i){ return i/data.kmeans.length*250; } ).duration(500)
            .attr("r", 5);
        
        
        svg.select("g.kmeans" + ($idx+1) )
            .selectAll("line")
            .data( data.kmeans ).enter().append("line")
            .attr("x1", function(d){ return xScale(d[2]); } )
            .attr("y1", function(d){ return yScale(d[3]); } )
            .attr("x2", function(d){ return xScale(d[0]); } )
            .attr("y2", function(d){ return yScale(d[1]); } )
            .attr("class", function(d,i){ return "km" + i; } );
        
    }
    
    
}
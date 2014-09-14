function mt_db_barChart( $div_id, $svg_id ){
    
    // Create a DATA obj. Has two sets of data labelled notional and trades.
    var data =  {   "notional": [
                        { "label":"JAN14", "idx":1, "value_1":20, "value_2":120 },
                        { "label":"FEB14", "idx":2, "value_1":10, "value_2":100 },
                        { "label":"MAR14", "idx":3, "value_1":81, "value_2":100 },
                        { "label":"APR14", "idx":4, "value_1":120, "value_2":131 },
                        { "label":"MAY14", "idx":5, "value_1":250, "value_2":111 },
                        { "label":"JUN14", "idx":6, "value_1":100, "value_2":191 },
                        { "label":"JUL14", "idx":7, "value_1":121, "value_2":71 },
                        { "label":"AUG14", "idx":8, "value_1":91, "value_2":230 },
                        { "label":"SEP14", "idx":9, "value_1":111, "value_2":100 },
                        { "label":"OCT14", "idx":10, "value_1":61, "value_2":91 },
                        { "label":"NOV14", "idx":11, "value_1":31, "value_2":88 },
                        { "label":"DEC14", "idx":12, "value_1":240, "value_2":180 }
                    ],
                    "trades": [
                        { "label":"JAN14", "idx":1, "value_1":5, "value_2":14 },
                        { "label":"FEB14", "idx":2, "value_1":0, "value_2":12 },
                        { "label":"MAR14", "idx":3, "value_1":9, "value_2":21 },
                        { "label":"APR14", "idx":4, "value_1":11, "value_2":8 },
                        { "label":"MAY14", "idx":5, "value_1":3, "value_2":4 },
                        { "label":"JUN14", "idx":6, "value_1":2, "value_2":5 },
                        { "label":"JUL14", "idx":7, "value_1":1, "value_2":3 },
                        { "label":"AUG14", "idx":8, "value_1":2, "value_2":7 },
                        { "label":"SEP14", "idx":9, "value_1":3, "value_2":7 },
                        { "label":"OCT14", "idx":10, "value_1":12, "value_2":8 },
                        { "label":"NOV14", "idx":11, "value_1":11, "value_2":21 },
                        { "label":"DEC14", "idx":12, "value_1":17, "value_2":14 }
                    ],
                    "sort":false,
                    "label":"notional"
                }; 
    var dataset = func_get_dataset(); // Get starting dataset. Always an ARRAY with OBJECTS.
    
    // Set width, height and margins.
    var margin = { top:10, right:10, bottom:20, left:40 },
        width = $($div_id).width() - margin.left - margin.right,
        height = 380 - margin.top - margin.bottom;

    // Create an svg object.
    var svg = d3.select( $div_id ).append("svg").attr("id", $svg_id )
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    // Create an xScale scaling function.
    // maps a dataset 'domain' to the graph width.
    // Calling xScale(INDEX) maps it to the xaxis value.
    var xScale = d3.scale.ordinal()
                    .domain( dataset.map( function(d){ return d.label; } ) )
                    .rangeRoundBands( [0, width], .1 );
    // Create yScale scaling function.
    var yScale = d3.scale.linear()
                    .domain( [ 0, d3.max( dataset, function(d){ return Math.max(d.value_1,d.value_2); } ) ] )
                    .range([height, 0]);
    
    // Create an axis and grid functions. They use the Scaling variables.
    var xAxis = d3.svg.axis().scale( xScale ).orient("bottom");
    var yAxis = d3.svg.axis().scale( yScale ).orient("left").ticks( 8,"" );
    var yGrid = d3.svg.axis().scale( yScale ).orient("left").ticks( 8,"" ).tickSize(-width, 0, 0).tickFormat("");
    
    // START DRAWING GRAPH
    // Add X-AXIS
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call( xAxis );
    // Add Y-AXIS and GRID
    svg.append("g").attr("class","y grid").call( yGrid );
    svg.append("g").attr("class", "y axis").call( yAxis )
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6).attr("dy", ".71em"); //.style("text-anchor", "end").text("Notional in USD millions");
    
    // ADD BAR-CHART BARS
    // First value_1
    svg.append("g").attr("class","bar1")
        .selectAll(".bar").data( dataset ).enter().append("rect").attr("class", "bar")
        .attr("x", function(d){ return xScale(d.label); })
        .attr("width", xScale.rangeBand()/2 )
        .attr("y", height ).attr("height", 0 )
        .transition().delay( function(d,i){ return i*200;} ).duration(300)
        .attr("y", function(d){ return yScale(d.value_1); })
        .attr("height", function(d){ return height - yScale(d.value_1); })
        .attr("data-num", function(d){ return d.value_1; })
        .attr("data-lab", function(d){ return d.label; });
    // Second value_2
    svg.append("g").attr("class","bar2")
        .selectAll(".bar").data( dataset ).enter().append("rect").attr("class", "bar")
        .attr("x", function(d){ return xScale(d.label)+xScale.rangeBand()/2; })
        .attr("width", xScale.rangeBand()/2 )
        .attr("y", height ).attr("height", 0 )
        .transition().delay( function(d,i){ return i*200;} ).duration(300)
        .attr("y", function(d){ return yScale(d.value_2); })
        .attr("height", function(d){ return height - yScale(d.value_2); })
        .attr("data-num", function(d){ return d.value_2; })
        .attr("data-lab", function(d){ return d.label; });
    
   
    $('.btn_bar').click( func_change );
    $('#' + $svg_id + ' .bar').each( func_label );
    
    
    function func_change(){
       
        // Change DATASET
        if( $(this).val()=='sort' ){
            if( data.sort==true ){
                data.sort = false;
            }
            else{
                data.sort = true;
            }
            // Remove or add 'sel' class from button.
            ( $(this).hasClass('sel') ) ? $(this).removeClass('sel') : $(this).addClass('sel');
        }
        else{
            data.label = $(this).val();
            $('.btn_bar.data').removeClass('sel');
            $(this).addClass('sel');
        }
        dataset = func_get_dataset();
        
        // CHANGE GRAPH
        // Change Y-AXIS and GRID
        yScale.domain( [ 0, d3.max( dataset, function(d){ return Math.max(d.value_1,d.value_2); } ) ] );
        svg.select(".y.axis").transition().duration(1000).call( yAxis );
        svg.select(".y.grid").transition().duration(1000).call( yGrid );
        // Change X-AXIS
        xScale.domain( dataset.map( function(d){ return d.label; } ) );
        svg.select(".x.axis").transition().duration(1000).call( xAxis );
        
        // Change BARS
        svg.select('.bar1').selectAll("rect").data( dataset )
            .transition().delay( function(d,i){ return i/dataset.length*200; } ).duration(500)
            .attr("x", function(d){ return xScale(d.label); })
            .attr("y", function(d){ return yScale(d.value_1); })
            .attr("height", function(d){ return height - yScale(d.value_1); })
            .attr("data-num", function(d){ return d.value_1; })
            .attr("data-lab", function(d){ return d.label; });
        svg.select('.bar2').selectAll("rect").data( dataset )
            .transition().delay( function(d,i){ return i/dataset.length*200; } ).duration(500)
            .attr("x", function(d){ return xScale(d.label)+xScale.rangeBand()/2; })
            .attr("y", function(d){ return yScale(d.value_2); })
            .attr("height", function(d){ return height - yScale(d.value_2); })
            .attr("data-num", function(d){ return d.value_2; })
            .attr("data-lab", function(d){ return d.label; });
       
    }
    
    // Function to change between datasets.
    function func_get_dataset(){
        tmp_data = data[data.label];
        if( data.sort==true ){
            tmp_data = tmp_data.sort( function(a,b){ return b.value_1+b.value_2-a.value_1-a.value_2; } );
        }
        else{
            tmp_data = tmp_data.sort( function(a,b){ return a.idx-b.idx; } );
        }
        return tmp_data;
    }
    
    // Function to show the tooltip.
    function func_label(){
    
        $(this).on('mouseenter', function(event){
            
            var xPos = parseFloat( d3.select(this).attr("x") ) + xScale.rangeBand()/4,
                yPos = height - parseFloat( d3.select(this).attr("height") ) - 40;
            
            d3.select("#svg_label")
                .style( "left", xPos + "px" ).style( "top",yPos + "px" ).style("display","block" )
                .select("#value").text( d3.select(this).attr("data-num") )
            
            d3.select("#svg_label").select("#label").text( d3.select(this).attr("data-lab") );
            
        }).on('mouseleave', function(event){
            
            d3.select("#svg_label").style({"display":"none"});
            
        });
        
    }    
    
}

function mt_db_pieChart( $div_id, $svg_id, $is_pie ){
    
    data =  {
                "2013":[
                    { "label":"yourfirm", "value":100 },
                    { "label":"firmno2", "value":50 },
                    { "label":"no3firm", "value":71 },
                    { "label":"no4firm", "value":0 },
                    { "label":"unknown", "value":0 }
                ],
                "2014":[
                    { "label":"yourfirm", "value":100 },
                    { "label":"firmno2", "value":50 },
                    { "label":"no3firm", "value":71 },
                    { "label":"no4firm", "value":31 },
                    { "label":"unknown", "value":61 }
                ],
                "label":"2014"    
            };
    
    // Initialize datasets.
    dataset = func_get_dataset();
    dataset_new = dataset; // to initialize set equal.
    
    var color = d3.scale.ordinal().range( ["#3399FF", "#5DAEF8", "#86C3FA", "#ADD6FB", "#D6EBFD"] );
    
    // Initialize width, height and radius (function of former two).
    var width = 340,
        height = 340,
        radius = Math.min( width, height ) / 2,
        radius_inner = ( $is_pie==true ) ? 0 : radius/2,
        radius_outer = radius - 5;
    
    // Create SVG chart.
    var svg = d3.select($div_id).append("svg").attr("id",$svg_id)
                .attr("width", width).attr("height", height)
                .append("g")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    
    // Create a PIE() function.
    //var pie =  d3.layout.pie().value( function(d){ return d.value; } ).sort( null );
    var pie =  d3.layout.pie().value( function(d){ return d.value; } ).sort( null )
                        .startAngle(0*Math.PI)
                        .endAngle(2*Math.PI);
    //console.log('PIE(dataset): ', pie(dataset) );
    
    // Create an ARC function.
    var arc = d3.svg.arc().innerRadius( radius_inner ).outerRadius( radius_outer );
    
    // comment
    var slices = svg.selectAll("path")
        .data( pie(dataset) )
        .enter().append("path").attr("class","slice")
        .attr("data-num", function(d){ return d.value; } )
        .attr("data-lbl", function(d){ return d.data.label; } )
        .attr("fill", function(d,i){ return color(i); } );
    
    slices.transition()
        .delay( function(d,i){ return 500*(1/dataset.length)*(i+1)*d.startAngle/(2*Math.PI); } )
        .duration( function(d,i){ return 500*(1/dataset.length)*(i+1); } )
        .each( function(d){ this._current = d; } ) // stores the initial angles.
        .attrTween('d', func_arcInit ); 
    
    // add text?
    //slices.append("text")
        //.attr("transform", function(d){ return "translate(" + arc.centroid(d) + ")"; })
        //.attr("text-anchor", "middle")
        //.text( function(d){ return d.data.label; } );
    
    
    $('.buttonclick').click( func_change );
    
    // function to change.
    function func_change(){
       
        if( data.label==$(this).val() ){
            // do nothing.
        }
        else{
            
            data.label = $(this).val();
            
            // dataset = current dataset used.
            dataset_new = func_get_dataset();
            
            
            // Set new information in slices.
            var slices = svg.selectAll("path").data( pie(dataset_new) );
            
            // Add new slices if needed.
            slices.enter().append("path").attr("class","slice")
                .attr("data-num", function(d){ return d.value; } )
                .attr("data-lbl", function(d){ return d.data.label; } )
                .attr("fill", function(d,i){ return color(i); } )
                .each( function(d,i){ this._current = d; } );
            
            slices.exit().transition().duration(350).attrTween( "d", func_arcTween ).remove();
            
            slices.transition().duration(350).attrTween("d", func_arcTween );
            
            // set dataset to new none.
            dataset = dataset_new;
           
        }

    }
    
    function func_get_dataset(){
        return data[data.label];
    }
    
    function func_arcInit( d ){
        var i = d3.interpolate( d.startAngle, d.endAngle );
        return function(t){
            d.endAngle = i(t);
            return arc(d);
        }
    }
    
    function func_arcTween( d ) {
		var i = d3.interpolate( this._current, d );
		this._current = i(0);
		return function(t) {
			return arc(i(t));
		};
	}
   
}
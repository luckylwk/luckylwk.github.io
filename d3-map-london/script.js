var width = 1000;
var height = 900;

var div = d3.select("#stats").append("div")
		    .attr("class", "tooltip")
		    .attr("id", "stats")
		    .style("opacity", 0.8);

var svg = d3.select("#viz").append("svg:svg").attr("viewBox", "0 0 1000 1000")
	
var update = function(num){

	d3.selectAll("g").remove();

	switch(num){
		
		case 0:
			var color = d3.scale.linear()
			.domain([150000, 350000])
	    	.range(["white", "#104E8B"])
	    	break;

	    case 1:
		    var color = d3.scale.linear()
			.domain([0, 400000])
	    	.range(["white", "#104E8B"]);
	    	break;

	    case 2:
		    var color = d3.scale.linear()
			.domain([0, 1000])
	    	.range(["white", "#104E8B"]);
	    	break;
	    	
    }

    d3.json("data_london.json", function(uk){

			//Gets the coordinate data from our dataset.
            var subunits = topojson.feature(uk, uk.objects.thenewestdict1);

            var random = function(d){
            		if (num == 0){
            			return color(d.properties.avghouseprice);	
            		};
            		if (num == 1){
            			return color(d.properties.population);
            		};
            		if (num == 2){
            			return color(d.properties.peoplepernewhome);
            		}};

            //Creates a projection which we can apply to the path.
            var projection = d3.geo.mercator()
                .center([-0.10,51.5171])
                .rotate([0,0])
                .scale(68000)
                .translate([width / 2, height / 2]);

            var path = d3.geo.path().projection(projection);

            svg.append("g")
            	.attr("class", "boroughs")
            	.selectAll("path")
            	.data(topojson.feature(uk, uk.objects.thenewestdict1).features)
            	.enter().append("path")
            	.attr("d", path)
            	.attr("fill", "white")
            	.attr("stroke", "white")
            	.attr("id", function(d){return d.properties.Name})
            	.transition()
	            	.duration(500)
	            	.attr("fill", random)
	            	.attr("stroke", "black")
	            	.attr("stroke-width", "0.35");

			 svg.selectAll("path")
			 	.data(topojson.feature(uk, uk.objects.thenewestdict1).features)
			 	.on("mouseover", function(d){
			 		div.html("<b>" + d.properties.Name  + "</b><br>" 
			 			+ "Population: " + d.properties.population + "<br>" +
			 			"Average house price: £" + d.properties.avghouseprice + "<br>"
			 			+ "Percent renting from landlord: " + d.properties.percentrent + "<br>"
			 			+ "New homes built 2011/2012: " + d.properties.numnewhomes + "<br>" + 
			 			"People per new home built: " + d3.round(d.properties.peoplepernewhome))});
});
    
};

update(0);


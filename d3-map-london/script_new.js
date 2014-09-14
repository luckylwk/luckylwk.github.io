d3.json("data_london.json", function(data){
    console.log(data);
});

/*
function drawMap( data_obj ){
    
    var width = 1000,
        height = 900;

    var div = d3.select("#stats").append("div")
    		    .attr("class", "tooltip")
    		    .attr("id", "stats")
    		    .style("opacity", 0.8);

    var svg = d3.select("#viz").append("svg:svg").attr("viewBox", "0 0 1000 1000");
    
    
}
*/

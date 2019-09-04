
$(function() {
	//load the data
	var data = jsoncourtdata;
	//grouped lists
    var num = d3.nest().key(function(d) {return d.Year;}).entries(data);
    e = num[0].values;
    var bycountry = d3.nest().key(function(d){return d.Country}).entries(e);
    b= bycountry[0].values;
    f= bycountry[1].values;
    renderDataVisualization();
        
//Assign variables and call method	
    $("#button").click(function(){
        e= num[0].values;
        var bycountry = d3.nest().key(function(d){return d.Country}).entries(e);
        b= bycountry[0].values;
        f= bycountry[1].values;
	    renderDataVisualization();
    })
	
	$("#button1").click(function(){
        e= num[1].values;
        var bycountry = d3.nest().key(function(d){return d.Country}).entries(e);
        b= bycountry[0].values;
        f= bycountry[1].values;
        renderDataVisualization();
	})

	$("#button2").click(function(){
        e= num[2].values;
        var bycountry = d3.nest().key(function(d){return d.Country}).entries(e);
        b= bycountry[0].values;
        f= bycountry[1].values;
        renderDataVisualization();
	})

	$("#button3").click(function(){
        e= num[3].values;
        var bycountry = d3.nest().key(function(d){return d.Country}).entries(e);
        b= bycountry[0].values;
        f= bycountry[1].values;
        renderDataVisualization();
	})

	$("#button4").click(function(){
        e= num[4].values;
        var bycountry = d3.nest().key(function(d){return d.Country}).entries(e);
        b= bycountry[0].values;
        f= bycountry[1].values;
        renderDataVisualization();
	})

	$("#button5").click(function(){
        e= num[5].values;
        var bycountry = d3.nest().key(function(d){return d.Country}).entries(e);
        b= bycountry[0].values;
        f= bycountry[1].values;
        renderDataVisualization();
	})

	
})

function renderDataVisualization(){
    d3.select("#svg").selectAll("*").remove();
    
	//List of groups
	var allGroup =["homewinrate","awaywinrate","total"];

	var margin = { top: 20, right: 80, bottom: 150, left: 180 },
	width = 1260 - margin.left - margin.right,
	height = 600 - margin.top - margin.bottom;
	
   // set the ranges
   var x = d3.scale.ordinal().rangeRoundBands([0, width], .20)
   .domain(e.map(function(d) { return d.Team; }));
   var y = d3.scale.linear().range([height, 0]).domain([0, 1]);
   
   //define the axis
   var xAxis = d3.svg.axis()
   .scale(x)
   .orient("bottom")

   var yAxis = d3.svg.axis()
   .scale(y)
   .orient("left")
   .ticks(10);

   // add the SVG element for chart 1
   var svg = d3.select("#svg").append("svg")
   .attr("width", width + margin.left + margin.right)
   .attr("height", height + margin.top + margin.bottom)
   .append("g")
   .attr("transform", 
	  "translate(" + margin.left + "," + margin.top + ")")

   // add hover events
   var tip = d3.tip()
   .attr('class', 'd3-tip')
   .offset([-10, 0])
   .html(function(d) {
   return "<strong>Total:</strong> <span style='color:red'>" + d.total + "</span>";
   }) 

   var hometip = d3.tip()
   .attr('class', 'd3-tip')
   .offset([-10, 0])
   .html(function(d) {
   return "<strong>Home win rate:</strong> <span style='color:red'>" + d.homewinrate + "</span>";
   }) 

   var awaytip = d3.tip()
   .attr('class', 'd3-tip')
   .offset([-10, 0])
   .html(function(d) {
   return "<strong>Away win rate:</strong> <span style='color:red'>" + d.awaywinrate + "</span>";
   }) 

   // add axis
   svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis)
  .selectAll("text")
  .style("text-anchor", "end")
  .attr("dx", "-.8em")
  .attr("dy", "-.55em")
  .attr("transform", "translate(-10,10)rotate(-45)");

  svg.append("g")
  .attr("class", "y axis")
  .call(yAxis)
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 5)
  .attr("dy", ".71em")
  .style("text-anchor", "end")
  .text("Rate");

   
  //add bar chart
  svg.selectAll("bar")
  .data(e)
  .enter().append("rect")
  .attr("class", "bar")
  .attr("x", function(d) { return x(d.Team); })
  .attr("width", x.rangeBand()/3.5)
  .attr("y", function(d) {return y(+d.total); })
  .attr("height", function(d) { return height - y(+d.total); })
  .attr("fill","#655F5F")
  .call(tip)
  .on('mouseover', tip.show)
  .on('mouseout', tip.hide);
 
  svg.selectAll("bar")
  .data(e)
  .enter().append("rect")
  .attr("class", "bar")
  .attr("transform","translate(22,0)")
  .attr("x", function(d) { return x(d.Team); })
  .attr("width", x.rangeBand()/3.5)
  .attr("y", function(d) { return y(d.homewinrate); })
  .attr("height", function(d) { return height - y(d.homewinrate); })
  .attr("fill","#FFD700")
  .call(hometip)
  .on('mouseover', hometip.show)
  .on('mouseout', hometip.hide);

  svg.selectAll("bar")
  .data(e)
  .enter().append("rect")
  .attr("class", "bar")
  .attr("transform","translate(-22,0)")
  .attr("x", function(d) { return x(d.Team); })
  .attr("width", x.rangeBand()/3.5)
  .attr("y", function(d) { return y(d.awaywinrate); })
  .attr("height", function(d) { return height - y(d.awaywinrate); })
  .attr("fill","#CD5C5C")
  .call(awaytip)
  .on('mouseover', awaytip.show)
  .on('mouseout', awaytip.hide);
}

//new
function groupByCon(clicked_id){
    d3.select("#svg").selectAll("*").remove();

	var margin = { top: 20, right: 80, bottom: 150, left: 180 },
	width = 1260 - margin.left - margin.right,
	height = 600 - margin.top - margin.bottom;
	
   // set the ranges
   var x = d3.scale.ordinal().rangeRoundBands([0, width], .20)
   .domain(e.map(function(d) { return d.Team; }));
   var y = d3.scale.linear().range([height, 0]).domain([0, 1]);
   
   //define the axis
   var xAxis = d3.svg.axis()
   .scale(x)
   .orient("bottom")

   var yAxis = d3.svg.axis()
   .scale(y)
   .orient("left")
   .ticks(10);

   // add the SVG element for chart 1
   var svg = d3.select("#svg").append("svg")
   .attr("width", width + margin.left + margin.right)
   .attr("height", height + margin.top + margin.bottom)
   .append("g")
   .attr("transform", 
	  "translate(" + margin.left + "," + margin.top + ")")

   // add hover events
   var tip = d3.tip()
   .attr('class', 'd3-tip')
   .offset([-10, 0])
   .html(function(d) {
   return "<strong>Total:</strong> <span style='color:red'>" + d.total + "</span>";
   }) 

   var hometip = d3.tip()
   .attr('class', 'd3-tip')
   .offset([-10, 0])
   .html(function(d) {
   return "<strong>Home win rate:</strong> <span style='color:red'>" + d.homewinrate + "</span>";
   }) 

   var awaytip = d3.tip()
   .attr('class', 'd3-tip')
   .offset([-10, 0])
   .html(function(d) {
   return "<strong>Away win rate:</strong> <span style='color:red'>" + d.awaywinrate + "</span>";
   }) 

   // add axis
   svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis)
  .selectAll("text")
  .style("text-anchor", "end")
  .attr("dx", "-.8em")
  .attr("dy", "-.55em")
  .attr("transform", "translate(-10,10)rotate(-45)");

  svg.append("g")
  .attr("class", "y axis")
  .call(yAxis)
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 5)
  .attr("dy", ".71em")
  .style("text-anchor", "end")
  .text("Rate");

  if ( clicked_id == "au"){
      var da = b;
  };
  if ( clicked_id == "nz"){
      var da = f;
  }
   
  //add bar chart
  svg.selectAll("bar")
  .data(da)
  .enter().append("rect")
  .attr("class", "bar")
  .attr("x", function(d) { return x(d.Team); })
  .attr("width", x.rangeBand()/3.5)
  .attr("y", function(d) {return y(+d.total); })
  .attr("height", function(d) { return height - y(+d.total); })
  .attr("fill","#655F5F")
  .call(tip)
  .on('mouseover', tip.show)
  .on('mouseout', tip.hide);
 
  svg.selectAll("bar")
  .data(da)
  .enter().append("rect")
  .attr("class", "bar")
  .attr("transform","translate(22,0)")
  .attr("x", function(d) { return x(d.Team); })
  .attr("width", x.rangeBand()/3.5)
  .attr("y", function(d) { return y(d.homewinrate); })
  .attr("height", function(d) { return height - y(d.homewinrate); })
  .attr("fill","#FFD700")
  .call(hometip)
  .on('mouseover', hometip.show)
  .on('mouseout', hometip.hide);

  svg.selectAll("bar")
  .data(da)
  .enter().append("rect")
  .attr("class", "bar")
  .attr("transform","translate(-22,0)")
  .attr("x", function(d) { return x(d.Team); })
  .attr("width", x.rangeBand()/3.5)
  .attr("y", function(d) { return y(d.awaywinrate); })
  .attr("height", function(d) { return height - y(d.awaywinrate); })
  .attr("fill","#CD5C5C")
  .call(awaytip)
  .on('mouseover', awaytip.show)
  .on('mouseout', awaytip.hide);
}




function refreshpage(){
	window.location.reload();
}

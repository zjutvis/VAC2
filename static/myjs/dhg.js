// a list of directional hypergraph edges
var dhgs = new Map();

dhgs.set("G1", [
    {name: "e1", sources: ["2","3"], targets: ["1"], projection:"p1"},
    {name: "e2", sources: ["2","4"], targets: ["1"], projection:"p2"},
    {name: "e3", sources: ["4","3"], targets: ["1"], projection:"p3"},
    {name: "e4", sources: ["1"], targets: ["2"], projection:"p4"},
    {name: "e5", sources: ["4","3"], targets: ["2"], projection:"p5"},
    {name: "e6", sources: ["2"], targets: ["3"], projection:"p6"},
    {name: "e7", sources: ["4"], targets: ["3"], projection:"p7"},
    {name: "e8", sources: ["3"], targets: ["4"], projection:"p8"},
//    {name: "e3", sources: ["b", "d"], targets: ["a"], projection:"p2"},
]);

var links = [];

// we convert the DHG list to a set of links
dhgs.forEach(function(edges, name) {
    edges.forEach(function(edge) {
	// three hidden nodes for projection placement
	inv1 = "inv1_" + edge.name;
	inv2 = "inv2_" + edge.name;
	inv3 = "inv3_" + edge.name;
//	console.log(edge, inv1,inv2,inv3)
//	links.push({source: inv1, target: inv2, type: "pointed", dhg: name});
//	links.push({source: inv2, target: inv3, type: "plain", dhg: name});
    if (edge.sources.length > 1){
        edge.sources.forEach(function(src) {
            links.push({source: src, target: inv1, type: "pointed", dhg: name, line_type: "curve", origin: edge.sources})});
        edge.targets.forEach(function(target) {
            links.push({source: inv1, target: target, type: "plain", dhg: name, line_type: "line"})});
    }else{
        links.push({source: edge.sources, target: edge.targets, type: "pointed", dhg: name, line_type: "line"})
    }
    });
});

var nodes = {};

links.forEach(function(link) {
    link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
    link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
    if(link.source.name.includes("inv") && !nodes[link.source.name].label)
	nodes[link.source.name].label = " ";
    // projection should have a visible label
    if(link.target.name.includes("inv2"))
	nodes[link.target.name].label =
	dhgs.get(link.dhg).filter(dhg => {return dhg.name === link.target.name.substring(5)})[0].projection;
});

var width = window.innerWidth,
    height = window.innerHeight;

var force = d3v3.layout.force()
    .nodes(d3v3.values(nodes))
    .links(links)
    .linkDistance(function(link, i) {
        if (link.type == 'plain'){
            return 0;
//            return (link.source.name.includes("inv") && link.target.name.includes("inv")) ? 0 : 5;
        }else{
            return 100;
//            return (link.source.name.includes("inv") && link.target.name.includes("inv")) ? 0 : 100;
        }
	})
    .chargeDistance(300)
    .charge(function(node) {
	return (node.name.includes("inv")) ? 0 : -3000;})
	.distance(function(d, i){
	    if(d.type == 'plain'){
	        return 0;
	    }else{
	        return 10;
	    }
	})
    .size([width, height])
    .on("tick", tick)
    .start();

var svg = d3v3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

// Per-type markers, as they don't inherit styles.
svg.append("defs").selectAll("marker")
    .data(["pointed"]) // arrows only on projections
  .enter().append("marker")
    .attr("id", function(d) { return d; })
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 10)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
  .append("path")
    .attr("d", "M0,-5L10,0L0,5");

function stringToColor(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var color = '#';
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}

var path = svg.append("g").selectAll("path")
    .data(force.links())
    .enter().append("path")
    .style("stroke", function(d) { return stringToColor(d.dhg + "freshmeat"); })
    .attr("class", function(d) { return "link " + d.type; })
    .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });
  
var circle = svg.append("g").selectAll("circle")
    .data(force.nodes().filter(n => { return !n.name.includes("inv")}))
  .enter().append("circle")
    .attr("r", 4)
    .attr('id', function(d){return 'c_' + d.name;})
    .call(force.drag);

var text = svg.append("g").selectAll("text")
    .data(force.nodes())
  .enter().append("text")
    .attr("x", 8)
    .attr("y", ".31em")
    .text(function(d) { return d.label ? d.label : d.name; }); // a label overrides name

// Use elliptical arc path segments to doubly-encode directionality.
function tick() {
  path.attr("d", linkArc);
  circle.attr("transform", transform);
  text.attr("transform", transform);
}

function linkArc(d) {
  var dx = d.target.x - d.source.x,
      dy = d.target.y - d.source.y,
      dr = Math.sqrt(dx * dx + dy * dy) * 1;
  if (d.line_type=="line"){
    return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
  }else{
//    console.log(d,this);
    var tx = 0;
    var ty = 0;
//    console.log(t2.split('('));
    for(var i = 0; i < d.origin.length; i++){
        var temp = d3v3.select("#c_" + d.origin[i]).node();
        var t2 = d3v3.select(temp).attr('transform') + '';
        var pos =t2.split('(')[1] + '';
//        console.log(pos.split(','))
        tx += parseFloat(pos.split(',')[0]);
        ty += parseFloat(pos.split(',')[1]);
    }
    tx /= d.origin.length;
    ty /= d.origin.length;
//    console.log(tx, ty);
    return "M" + d.source.x + "," + d.source.y + "Q" + tx + " " + ty + "," + d.target.x + " " + d.target.y;
  }
}

function transform(d) {
  return "translate(" + d.x + "," + d.y + ")";
}

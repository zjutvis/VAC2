// d3.select("#Brushview").style("top",500).style("position","absolute")

let centerwidth = 680,
    side12_width = 150,
    transition_width = 250,
    height = 620


var barchartVis = d3.select("#mcv-multicausalContainer")
    .append("div")
    .attr("id", "barchartDiv")
    .attr("width", 80)
    .attr("height", 680)
    .style("position", "absolute")
    .style("top", "0px")
    .style("left", "0px")


var barchartSvg = barchartVis.append("svg")
    .attr("id", "event_small_barchart_svg")
    .attr("width", 80)
    .attr("height", 680)


//左边的文字
var eventNameVis = d3.select("#mcv-multicausalContainer")
    .append("div").attr("id", "eventNameDiv")
    .attr("width", 70)
    .attr("height", 680)
    .style("position", "absolute")
    .style("top", "0px")
    .style("left", "85px")


var eventNameSvg = eventNameVis.append("svg")
    .attr("id", "event_name_svg")
    .attr("width", 70)
    .attr("height", 680)

//下面的柱状图
d3.select("#mcv-multicausalContainer")
    .append("div")
    .attr("id", "clearBarChartDiv")
    .attr("width", 150)
    .attr("height", 25)
    .style("position", "absolute")
    .style("top", "610px")
    .style("left", "0")

var clearBarChartSvg = d3.select("#clearBarChartDiv").append("svg")
    .attr("id", "clearBarChartSvg")
    .attr("width", 150)
    .attr("height", 25)

clearBarChartSvg.append("rect")
    .attr("width", 80)
    .attr("height", 25)
    .attr("x", 0)
    .attr("y", 0)
    .attr("rx", 4)
    .attr("ry", 4)
    .style("fill", "#fff")
    .style("stroke", "#c0c0c0")
    .style("stroke-width", 1.5)
    .on("click",function(d){
        d3.select("#interactiveBarChart").selectAll("*").remove()
    })

clearBarChartSvg.append("text")
    .text("Clear")
    .attr("x", 20)
    .attr("y", 2)
    .attr("dy", ".99em")
    .attr("text-anchor", "start") // set anchor y justification
    .style("fill", "#202020")
    .style("font-size", "14px")
    .style("font-family",' Arial, sans-serif')
    .style("font-weight",'normal')
    .on("click",function(d){
        d3.select("#interactiveBarChart").selectAll("*").remove()
    })

var interactiveBarChartVis = d3.select("#mcv-multicausalContainer")
    .append("div").attr("id", "interactiveBarChartDiv")
    .attr("width", 150)
    .attr("height", 100)
    .style("position", "absolute")
    .style("top", "640px")
    .style("left", "0")

var interactiveBarCharSvg = interactiveBarChartVis.append("svg")
    .attr("id", "interactiveBarChart")
    .attr("width", 150)
    .attr("height", 80)


//中间
var multilevelvis = d3.select("#mcv-multicausalContainer")
    .append("div").attr("id", "div__multilevel")
    .attr("width", 1500)
    .attr("height", 620)
    .style("position", "absolute")
    .style("top", "0px")
    .style("left", "160px")

//左边最小部分
multilevelvis.append("svg")
    .attr("width", side12_width)
    .attr("height", 620)
    .style("left", 0)
    .attr("id", "svg_multilevel_side1").style("position", "absolute")
// .attr("backgroud", "blue").style("border", "1px solid red")


// .attr("backgroud", "blue").style("border", "1px solid red")

//左边过渡部分
multilevelvis.append("svg")
    .attr("width", transition_width)
    .attr("height", 620)
    .style("left", side12_width)
    .attr("id", "svg_multilevel_transition1").style("position", "absolute")
    .attr()
// .attr("backgroud", "blue").style("border", "1px solid red")

//中间部分
multilevelvis.append("svg")
    .attr("width", centerwidth)
    .attr("height", 620)
    .style("left", side12_width + transition_width)
    .attr("id", "svg_multilevel_focus").style("position", "absolute")
// .attr("backgroud", "blue").style("border", "1px solid red")


//右边过渡部分
multilevelvis.append("svg")
    .attr("width", transition_width)
    .attr("height", 620)
    .style("left", side12_width + transition_width + centerwidth)
    .attr("id", "svg_multilevel_transition2").style("position", "absolute")
// .attr("backgroud", "blue").style("border", "1px solid red")

//右边最小部分
multilevelvis.append("svg")
    .attr("width", side12_width)
    .attr("height", 620)
    .style("left", 0)
    .attr("id", "svg_multilevel_side2").style("position", "absolute")
    // .attr("backgroud", "blue").style("border", "1px solid red")


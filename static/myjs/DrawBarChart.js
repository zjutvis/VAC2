function DrawBarChart(barchartdata) {
    d3.select("#interactiveBarChart").selectAll("*").remove()
    let svg_width = 150
    let svg_height = 80
    let margin_left_right = 5
    let margin_top_bottom = 5
    //背景
    d3.select("#interactiveBarChart")
        .append("rect")
        .attr("class", "interactiveBarChartBackground")
        .attr("width", svg_width - margin_left_right * 2)
        .attr("height", svg_height - margin_top_bottom * 2)
        .attr("x", margin_left_right)
        .attr("y", margin_top_bottom)
        .attr("rx", 2)
        .attr("ry", 2)
        .style("fill", "#fff")
        .style("stroke", "#c0c0c0")
        .style("stroke-width", 1.5)

    let currMost = 0;
    for (let i = 0; i < barchartdata.length; i++) {
        currMost = Math.max(currMost, barchartdata[i])
    }
    console.log(currMost)
    let interactivebarchartyscale = d3.scaleLinear()
        .domain([0, currMost])
        .range([0, svg_height - margin_top_bottom * 2]);

    let bar_width = (svg_width - margin_left_right * 2) / 30

    d3.select("#interactiveBarChart")
        .selectAll(".smallbarWithInteractive")
        .data(barchartdata)
        .enter()
        .append("rect")
        .attr("class", "smallbarWithInteractive")
        .attr("height", function (d) {
            return interactivebarchartyscale(d)
        })
        .attr("width", bar_width * 0.9)
        .attr("x", function (d, i) {
            return bar_width * (i + 0.05) + margin_left_right
        })
        .attr("y", function (d) {
            return svg_height - margin_top_bottom - interactivebarchartyscale(d)
        })
        .style("fill", "#c0c0c0")
        .style("stroke", "none")
        .style("opacity", 0.8)
    // .on("mouse",function(d){

    // })


    d3.select("#interactiveBarChart")
        .append("text")
        .attr("class", "mostForPropagation")
        .text(function (d, i) {
            return "max value : " + currMost
        })
        .attr("x", 10)
        .attr("y", margin_top_bottom)
        .attr("dy", ".99em")
        .attr("text-anchor", "start") // set anchor y justification
        .style("fill", "#202020")
        .style("font-size", "12px")
        .style("font-family", ' Arial, sans-serif')
        .style("font-weight", 'normal')

}
function DrawPieChart(gtemp, radiustemp, locationx, locationy, datatemp,colorScaletemp){
var pie = d3.pie().sort(d3.descending)
  .value(function(d) {return d.value; })
var entriesdata = []
datatemp.forEach(function(d,i){
    entriesdata.push({"key": i, "value":Math.abs(d),"flag": d > 0 ? true : false})
})
var data_ready = pie(entriesdata)
var path = gtemp
  .selectAll('piechart')
  .data(data_ready)
  .enter()
  .append('path')
  .attr('class', 'pie-path')
  .attr('d', d3.arc()
    .innerRadius(0)
    .outerRadius(radiustemp)
  )
  .attr('fill', function(d){
      if (d.data.flag)
          return(colorScaletemp(d.data.value))
      else
          return(colorScaletemp(0 - d.data.value))
  })
  .attr("stroke", "black")
  .style("stroke-width", "0.1px")
  // .style("opacity", 0.7)
    path.attr("transform", "translate("+locationx+","+locationy+")")
}

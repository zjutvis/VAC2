
var global_propagationpath

function DrawPrppagationGraph(divid, a) {
  d3.selectAll("#graphsandbox  > *").remove()   //清空所有元素

  let testGenerator = new TestCaseGenerator();
  let maxNodesPerRank = 4;
  let maxDepth = 7;

  let g = testGenerator.genRandomGraph("aae", maxNodesPerRank, maxDepth, 0.7, 0.3, 0.05)

  d3.select(".align-items-center")
    .style("height", "600").style("width", "240px")
  let svg = d3.select(".align-items-center")
    .select("#svg_DrawPropagationGraph")
    .attr("width", "80%")
    .attr("height", "600px")
  algorithm = new SimpleLp(g);
  algorithm.options.bendiness_reduction_active = true;
  algorithm.options.simplify_for_groups_enabled = true;
  algorithm.arrange();
  algorithm.apply_solution();

  // console.log(svghtml.getBBox().width)
  console.log(a)
  g.draw(svg, 60, 30);

  readfromJson = true;

  let sandboxOptions = {
    maxNodesPerRank: 4,
    maxDepth: 5,
    bendiness_reduction_active: true,
    crossing_reduction_active: true,
    children_prob: 0.7,
    random_edge_prob: 0.3,
    same_rank_edge_prob: 0.05,
    seed: "aae",
    autogroups: false
  }





  let genSandbox = () => {

    let grsandbox;

    //document.getElementById("grapherrorbutton").style.display = "none";
    try {
      // let t = document.getElementById("jsonDescription").innerHTML.replace("'", '"')
      //   console.log(JSON.parse(t))
      //   grsandbox = readFromJson(JSON.parse(t));
      grsandbox = readFromJson(a);
      global_propagationpath = grsandbox
    } catch (e) {
      document.getElementById("jsonerrorbutton").style.display = "block";
      // console.log(e);
    }
    if (sandboxOptions.autogroups) {
      addGroups(grsandbox);
    }

    d3.select("#graphsandbox").style('display', 'none')
    d3.select("#singlenodeerror").style('display', 'none')
    d3.select("#loadingspinner").style('display', 'block')

    let sandboxsvg = d3.select("#graphsandbox")
      .attr("width", "600px")
      .attr("height", "400px")


    try {
      algorithm = new SimpleLp(grsandbox);
      algorithm.options.bendiness_reduction_active = sandboxOptions.bendiness_reduction_active;
      algorithm.options.crossings_reduction_active = sandboxOptions.crossing_reduction_active;
      algorithm.options.keep_groups_rect = false;
      if (algorithm.options.bendiness_reduction_active) algorithm.options.simplify_for_groups_enabled = true;
      else algorithm.options.simplify_for_groups_enabled = false;

      if (sandboxOptions.bendiness_reduction_active || sandboxOptions.crossing_reduction_active || sandboxOptions.autogroups) {
        algorithm.arrange();
        algorithm.apply_solution();
        // document.getElementById("modelpre").innerHTML = algorithm.modelString;
        // for (let val in algorithm.result){
        //   document.getElementById("resultpre").innerHTML += val + ": " + Math.round(algorithm.result[val]) + "\n";
        // }
      }

      d3.select("#graphsandbox").attr("viewBox", "0 0 " + Math.max.apply(0, grsandbox.nodes.map(n => n.depth * 50 + 40)) + " " + Math.max.apply(0, grsandbox.nodes.map(n => n.y * 40 + 40)))
      // console.log()viewBox="0 0 300 300"

      d3.select("#graphsandbox").selectAll("*").remove();
      grsandbox.draw(sandboxsvg, 50, 40)

      setTimeout(function () {
        if (grsandbox.nodes.length > 1) d3.select("#graphsandbox").style('display', 'block')
        else {
          d3.select("#singlenodeerror").style('display', 'block')
        }
        d3.select("#loadingspinner").style('display', 'none')
      }, 500);
    } catch (e) {
      document.getElementById("grapherrorbutton").style.display = "block";
      console.log(e);
    }
  }

  genSandbox();
  var svgtemp = d3.select("#graphsandbox").attr("transform", "translate(-100 250) rotate(-90)")
  var defs = d3.selectAll("#graphsandbox").append("defs");
  var arrowMarker = defs.append("marker")
    .attr("id", "arrow")
    .attr("markerUnits", "strokeWidth")
    .attr("markerWidth", "10")
    .attr("markerHeight", "10")
    .attr("viewBox", "0 0 12 12")
    .attr("refX", "-1")
    .attr("refY", "6")
    .attr("orient", "auto");
  var arrow_path = "M14,2 L6,6 L14,10 L10,6 L14,2";
  // var arrow_path = "M10,2 L2,6 L10,10 L6,6 L10,2";
  //     viewBox	坐标系的区域
  // refX, refY	在 viewBox 内的基准点，绘制时此点在直线端点上（要注意大小写）
  // markerUnits	标识大小的基准，有两个值：strokeWidth（线的宽度）和userSpaceOnUse（图形最前端的大小）
  // markerWidth, markerHeight	标识的大小
  // orient	绘制方向，可设定为：auto（自动确认方向）和 角度值
  // id	标识的id号

  arrowMarker.append("path").attr("class", "propagationarrow")
    .attr("d", arrow_path)
    .attr("fill", "#A3B9B6");
  var edgepatyh = d3.selectAll(".edgepath")._groups[0]
  for (var i = 0; i < edgepatyh.length; i++) {
    svgtemp.append("path")
      .attr("d", edgepatyh[i].getAttribute("d"))
      .attr("fill", "none")
      // .attr("stroke","red")
      .attr("stroke-width", 1)
      .attr("class", "findpatharrow")
      .attr("id", "findpatharrow" + i)
      .attr("marker-start", "url(#arrow)")
    // .attr("marker-mid","url(#arrow)")
    // .attr("marker-end","url(#arrow)");
  }



  d3.selectAll("#graphsandbox").selectAll("text")
      .style("font-size","5px")
      .attr("transform","translate(0 0) rotate(90)")
  d3.selectAll("#graphsandbox").selectAll("rect")
      .style("stroke-width","0.5px")
  d3.selectAll("#graphsandbox").selectAll("path")
      .style("stroke-width","1px")


  let colorScale = d3.scaleSequential(d3.interpolatePRGn)
        .domain([-1, 1])

global_propagationpath.edges.forEach(function(d,i){
  d3.select("#graphsandbox").select("#circle_node_"+ d.nodes[1].eventname)
      .attr("fill",colorScale(d.strength/100)).attr("stroke","#000").attr("stroke-width",0.5)
  d3.select("#graphsandbox").select("#circle_node_"+ d.nodes[0].eventname)
      .attr("fill","white").attr("stroke","#bb2e25").attr("stroke-width",1.5)

})



}

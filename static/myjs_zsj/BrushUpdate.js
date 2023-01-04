function focusandcontextbrush(operation, div, obj, select_strengths_para = [-0.3, 0.3], select_max_causes = 4, vertical_order_para = "id", horizontal_order_para = "default",change_para) {
    console.log("order_method:" + order_method + " select_strengths:" + select_strengths + " causes_max:" + causes_max)
    var filterdatatemp = Draw12_Contex(operation, div, obj, obj["event2name"], 0.3, 3, select_strengths, causes_max, vertical_order, horizontal_order, change_para)  //绘制底下的

    let margin = { top: 25, right: 10, bottom: 0, left: 10 },
        padding = { top: 200, right: 10, bottom: 0, left: 10 },
        // width = document.getElementById("CausalityVis").offsetWidth
        width = 800,
        height = 100;

    var x = d3.scaleLinear().range([0, width]),
        y = d3.scaleLinear().range([height, 0]),
        // x2 = d3.scaleLinear().range([0, document.getElementById("CausalityVis").getAttribute("width")]),
        // y2 = d3.scaleLinear().range([document.getElementById("CausalityVis").getAttribute("height"), 0]);
        x2 = d3.scaleLinear().range([0, width]),
        y2 = d3.scaleLinear().range([200, 0]);

    var xAxis = d3.axisBottom(x),
        xAxis2 = d3.axisBottom(x2),
        yAxis = d3.axisLeft(y);

    var brush = d3.brushX()
        .extent([[0, 0], [width, height]])
        .on("brush", brushended)
    // .on("end", brushended)

    let svg_causalityBrushview = d3.select("#Brushview").append("svg")
        .attr("class", "svg_Brushview").style("position", "absolute")
        .attr("backgroud", "blue")
        .style("border", "1px solid #e1e1e1")
        .style("border-radius", "4px")
        .attr("width", width)
        .attr("height", height)
    svg_causalityBrushview.append("defs").append("clipPath")
        .attr("id", "clip").append("rect")
        .attr("width", width)
        .attr("height", height);

    // var focus = d3.select("#CausalityVis").select("svg").append("g")
    var focus = d3.select("Draw12_Contex").append("g")
        .attr("class", "focus")
    // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var context = svg_causalityBrushview.append("g")
        .attr("class", "context")

    console.log("initial ")
    console.log(width / 2)
    console.log(width * 5 / 8)
    context.append("g")
        .attr("class", "brush")
        .call(brush)
        // .call(brush.move, [width / 2, width * 5 / 8]);
        .call(brush.move, [brushleft, brushright]);
    // .call(brush.move, x.range());

    //create brush function redraw scatterplot with selection
    function brushed() {
        var selection = d3.event.selection;
        x.domain(selection.map(x2.invert, x2));
        focus.selectAll(".rect")
            .attr("x", function (d) { return x(d.x); })
            .attr("y", function (d) { return y(d.y); });
        focus.select(".axis--x").call(xAxis);
    }
    console.log(".........Brush End....................." + width)
    var brushflag = 0
    function brushended() {
        var selectioncenter = d3.event.selection;
        let transition_width = (selectioncenter[1] - selectioncenter[0]) * 0.5
        let x_array = []
        x_array.push(0)
        x_array.push(Math.max(0, selectioncenter[0] - transition_width))
        x_array.push(selectioncenter[0])
        x_array.push(selectioncenter[1])
        x_array.push(Math.min(width, selectioncenter[1] + transition_width))
        x_array.push(width)
        //console.log(x_array)
        brushleft = selectioncenter[0]
        brushright = selectioncenter[1]

        //console.log(".........Brush End............" + selectioncenter)

        brushflag = brushflag + 1
        let selectedgroups = d3.selectAll("#Draw12_Contex").selectAll(".line_group")._groups[0]
        //记录事件数量
        let event_count = (d3.selectAll("#Draw12_Contex").selectAll(".bottomLines")._groups[0]).length;

        if (brushflag != 0) {

            ////////////////////明天从这里开始写,提取数据
            //方法1.一组一组地复制path到另一个svg;  var node= document.getElementById("Draw12_Contex").cloneNode(true);document.getElementById("CausalityVis").appendChild(node);

            brusheddata_center = []

            brusheddata_side1 = []
            brusheddata_side2 = []

            brusheddata_transition1 = []
            brusheddata_transition2 = []

            brusheddataOriginal_center = []

            brusheddataOriginal_side1 = []
            brusheddataOriginal_side2 = []

            brusheddataOriginal_transition1 = []
            brusheddataOriginal_transition2 = []

            center_left = 0;
            for (let i = 0; i < selectedgroups.length; i++) {
                let gropup_x = parseFloat(d3.selectAll(selectedgroups[i])._groups[0]
                    .getAttribute("transform").split(",")[0].match(/\d+/g)[0])
                let group = selectedgroups[i]
                let line = filterdatatemp.filterdata.lineList[i]
                if (gropup_x >= x_array[0] && gropup_x < x_array[1]) {
                    brusheddata_side1.push(group)
                    brusheddataOriginal_side1.push(line)
                    center_left += 1;
                }
                else if (gropup_x >= x_array[1] && gropup_x < x_array[2]) {
                    brusheddata_transition1.push(group)
                    brusheddataOriginal_transition1.push(line)
                    center_left += 1;
                }
                else if (gropup_x >= x_array[2] && gropup_x < x_array[3]) {
                    brusheddata_center.push(group)
                    brusheddataOriginal_center.push(line)
                }
                else if (gropup_x >= x_array[3] && gropup_x < x_array[4]) {
                    brusheddata_transition2.push(group)
                    brusheddataOriginal_transition2.push(line)
                }
                else {
                    brusheddata_side2.push(group)
                    brusheddataOriginal_side2.push(line)
                }
            }

            //下面示意图的长度
            let bottom_all = d3.select("#Draw12_Contex").node().getBoundingClientRect().width
            let bottom_center = parseFloat(selectioncenter[1] - selectioncenter[0])
            let bottom_left = parseFloat(selectioncenter[0])
            let bottom_right = d3.select("#Draw12_Contex").node().getBoundingClientRect().width - selectioncenter[1]

            //上面focus——context的部分
            //总长度
            let svgmultilevelwidth = parseFloat(document.getElementById("div__multilevel").getAttribute("width"))

            //center
            let multilevelscale = d3.scalePow().exponent(1 / 4).domain([0, width]).range([0, svgmultilevelwidth * 7 / 8]);
            centerwidth = multilevelscale(selectioncenter[1] - selectioncenter[0]) //svgmultilevelwidth * ((selectioncenter[1]-selectioncenter[0])/width)

            //side
            let sidwidth = svgmultilevelwidth - centerwidth
            var side12_width1 = sidwidth * (bottom_left / (bottom_left + bottom_right)),
                side12_width2 = sidwidth * (bottom_right / (bottom_left + bottom_right))

            //transition
            let multilevelscale_left = d3.scalePow().exponent(1 / 2).domain([0, x_array[2]]).range([0, side12_width1]);
            var transition12_width1 = multilevelscale_left(x_array[2] - x_array[1])
            let multilevelscale_right = d3.scalePow().exponent(1 / 2).domain([0, x_array[5] - x_array[3]]).range([0, side12_width2]);
            var transition12_width2 = multilevelscale_right(x_array[4] - x_array[3])

            var mini_side12_width1 = side12_width1 - transition12_width1
            var mini_side12_width2 = side12_width2 - transition12_width2

            MultiLevel_Draw12_Side12("svg_multilevel_side1", 0, mini_side12_width1, brusheddata_side1, "blue", event_count, brusheddataOriginal_side1, nodes)
            MultiLevel_Draw12_Side12("svg_multilevel_transition1", mini_side12_width1, transition12_width1, brusheddata_side1, "blue", event_count, brusheddataOriginal_transition1, nodes)

            MultiLevel_Draw12_Focus_Center("svg_multilevel_focus", side12_width1, centerwidth, brusheddata_center, event_count, brusheddataOriginal_center, nodes)//比例和左距离和id

            MultiLevel_Draw12_Side12("svg_multilevel_transition2", centerwidth + side12_width1, transition12_width2, brusheddata_side2, "blue", event_count, brusheddataOriginal_transition2, nodes)
            MultiLevel_Draw12_Side12("svg_multilevel_side2", centerwidth + side12_width1 + transition12_width2, mini_side12_width2, brusheddata_side2, "blue", event_count, brusheddataOriginal_side2, nodes)

            //下面的，
            //let paohvisdata=getAnotherLineList(brusheddataOriginal_center)
            console.log('brusheddataOriginal_center')
            console.log(brusheddataOriginal_center)
            //console.log("another_paohvis")
            //console.log(paohvisdata)
            //DrawFocusacausality("svg_BottomFocusContainer_focus", 200+side12_width1, centerwidth, brusheddata_center, event_count, paohvisdata, nodes)//比例和左距离和id

            d3.selectAll(".gInteractionLine").remove()

            let wwwheight = 20
            var InteractionLine = d3.selectAll("#mcv-multicausalContainer")
                .append("svg")
                .attr("class", "gInteractionLine")
                .style("width", svgmultilevelwidth)
                .style("height", wwwheight)
                .style("top", "620px")
                .style("left", d3.select("#div__multilevel").style("left"))
                .style("position", "absolute")

            let wwwlag = document.getElementById("Brushview").offsetLeft - document.getElementById("div__multilevel").offsetLeft;
            let line1X1 = side12_width1,
                line1Y1 = 0,
                // line1X2 = document.getElementById(".selection").offsetLeft + bottom_left;
                line1X2 = wwwlag + bottom_left,
                line1Y2 = wwwheight

            let line2X1 = centerwidth + side12_width1,
                line2Y1 = 0,
                line2X2 = wwwlag + bottom_left + bottom_center,
                line2Y2 = wwwheight

            let line3X1 = side12_width1 - transition12_width1,
                line3Y1 = 0,
                line3X2 = wwwlag + bottom_left - (x_array[2] - x_array[1]),
                line3Y2 = wwwheight


            let line4X1 = centerwidth + side12_width1 + transition12_width2,
                line4Y1 = 0,
                line4X2 = wwwlag + bottom_left + bottom_center + (x_array[4] - x_array[3]),
                line4Y2 = wwwheight

            InteractionLine.append("line").attr("class", "InteractionLine")
                .style("stroke", "red").style("stroke-width", 1.5)
                .style("stroke-dasharray", "5,5")
                .attr("x1", line1X1)
                .attr("y1", line1Y1)
                .attr("x2", line1X2)
                .attr("y2", line1Y2);

            InteractionLine.append("line").attr("class", "InteractionLine")
                .style("stroke", "red").style("stroke-width", 1.5)
                .style("stroke-dasharray", "5,5")
                .attr("x1", line2X1)
                .attr("y1", line2Y1)
                .attr("x2", line2X2)
                .attr("y2", line2Y2);

            InteractionLine.append("line").attr("class", "InteractionLine")
                .style("stroke", "#3fc1c0").style("stroke-width",1)
                .style("stroke-dasharray", "5,5")
                .attr("x1", line3X1)
                .attr("y1", line3Y1)
                .attr("x2", line3X2)
                .attr("y2", line3Y2);
            InteractionLine.append("line").attr("class", "InteractionLine")
                .style("stroke", "#3fc1c0").style("stroke-width", 1)
                .style("stroke-dasharray", "5,5")
                .attr("x1", line4X1)
                .attr("y1", line4Y1)
                .attr("x2", line4X2)
                .attr("y2", line4Y2);

            InteractionLine.append("line")
                .attr("class", "InteractionLine")
                .style("stroke", "red")
                .style("stroke-width", 2)
                .style("stroke-dasharray", "5,5")
                .attr("x1", line3X2)
                .attr("y1", line3Y2)
                .attr("x2", line3X2)
                .attr("y2", line3Y2 + 100);

            InteractionLine.append("line")
                .attr("class", "InteractionLine")
                .style("stroke", "red")
                .style("stroke-width", 2)
                .style("stroke-dasharray", "5,5")
                .attr("x1", line4X2)
                .attr("y1", line4Y2)
                .attr("x2", line4X2)
                .attr("y2", line4Y2 + 100);

        }
        d3.selectAll(".target_center").attr("fill", "#f8f6f6").attr("stroke", "#f45252").attr("stroke-width", "2")
        d3.selectAll(".target").attr("fill", "#f8f6f6").attr("stroke", "#f45252").attr("stroke-width", "1")
        d3.selectAll(".target_slide").attr("fill", "#f8f6f6").attr("stroke", "#f45252").attr("stroke-width", "1")

    }
}

function Draw12_Contex(operation, div, dataset, event2namefortooltip, strength, method, select_strengths, select_max_causes, vertical_order_para, horizontal_order_para, change_para) {
    //获得因果关系的数据：包括单因果和多因果
    let graphdataset
    if (deletedIndexOfLinks === -1 & deletedIndexOfEntity === -1) {
        graphdataset = getCausalLink(operation, dataset, event2namefortooltip, strength, method, select_strengths, select_max_causes, vertical_order, horizontal_order, change_para)
    }
    else {
        graphdataset = getCausalLinkWithDelete(operation, dataset, event2namefortooltip, strength, method, select_strengths, select_max_causes, vertical_order, horizontal_order, change_para)
        deletedIndexOfLinks = -1;
        deletedIndexOfEntity = -1
        deletable = 0
        deletflagstatus = "none"
    }

    global_linelist = graphdataset
    //用lineList来绘制
    //事件序列数据集
    let sequencedataset = dataset["resultformat"]
    let lineList = graphdataset.lineList

    let divwidth = d3.select(div).node().getBoundingClientRect().width;
    let divheight = d3.select(div).node().getBoundingClientRect().height;
    let margin = { top: 2, right: 2, bottom: 2, left: 2 },//这是svg相对于div的偏移
        padding = { top: 2, right: 0, bottom: 2, left: 0 }
    let width = divwidth - margin.left - margin.right;
    let height = divheight - margin.top - margin.bottom - padding.top - padding.bottom;


    let x_lag = width / graphdataset.lineList.length
    let y_lag = height / graphdataset.nodes.length
    let fix_radius = Math.min(x_lag, y_lag) * 0.5 - 1    //椭圆轴的rx

    let colorScale = d3.scaleSequential(d3.interpolatePRGn)
        .domain([-1, 1])
    let radiusScale = d3.scaleLinear()
        .domain([0, 1])
        .range([fix_radius * 0.9, fix_radius * 0.95]);  //and和target节点半径取

    d3.select(div).selectAll("*").remove()
    let svg = d3.select(div)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("id", "Draw12_Contex")
        .style("position", "absolute");


    //绘制底部灰色线条
    let buttomLines = svg.selectAll(".bottomLines")
        .data(graphdataset.nodes)
        .enter()
        .append("rect")
        .attr("class", "bottomLines")
        .attr("id", function (d, i) {
            return "bottomLines" + d.id
        })
        .attr("x", padding.left)
        .attr("y", function (d, i) {
            return i * y_lag
        })
        .attr("height", y_lag - 1)
        .attr("width", width - (padding.right) - padding.left)
        .style("fill", function (d, i) {
            return d.color
        })
        .style("opacity", 0.12)
        .on("mouseover", function (d, i) {
            let select_event = d.name;
            d3.selectAll(".eventRect")
                .style("fill", function (d) {
                    if (select_event != d.eventname)
                        return "#F2F2F2"
                    else
                        return d.eventcolor
                })
                .attr("opacity", function (d) {
                    if (select_event != d.eventname)
                        return 0.8
                    else
                        return 1.0
                })
        })
        .on("mouseout", function (d) {
            let select_event = d.name;
            d3.selectAll(".eventRect")
                .attr("opacity", 0.4)
                .style("fill", function (d) {
                    return d.eventcolor
                })
        })

    let text_y = (620 - 20) / graphdataset.nodes.length

    let old_y
    var event_names = d3.select("#event_name_svg").selectAll("*").remove()
    d3.select("#event_name_svg")
        .selectAll(".eventNameBackground")
        .data(graphdataset.nodes)
        .enter()
        .append("rect")
        .attr("class", "eventNameBackground")
        .attr("id", function (d, i) {
            return d.name
        })
        .attr("width", 68)
        .attr("height", text_y * 0.6)
        .attr("x", 0)
        .attr("y", function (d, i) {
            return text_y * (0.2 + i)
        })
        .attr("rx", 2)
        .attr("ry", 2)
        .style("stroke", "#000")
        .style("stroke-width", "0.5px")
        .style("fill", function (d, i) {
            return d.color
        })
        .style("opacity", 0.1)
        .on("click", function (d, i) {
            //reorderingLineList()
            var clicked_name = d.name;
            if (writetosource === 1) {
                $("#input-select-source").val(clicked_name);
                console.log("clicked!!!")
                writetosource = 0
            }
            else {
                $("#input-select-target").val(clicked_name);
                writetosource = 1
            }

            d3.select("#Brushview").selectAll("*").remove()
            d3.select("#svg_multilevel_focus").selectAll("*").remove()
            d3.select("#svg_multilevel_side1").selectAll("*").remove()
            d3.select("#svg_multilevel_side2").selectAll("*").remove()
            d3.select("#svg_multilevel_transition1").selectAll("*").remove()
            d3.select("#svg_multilevel_transition2").selectAll("*").remove()
            d3.select("#event_name_svg").selectAll("*").remove()
            horizontal_order = 'click' + i;
            focusandcontextbrush("change", "#Brushview", global_obj, select_strengths, causes_max, vertical_order, horizontal_order, 'horizontal')
        })


    var event_names = d3.select("#event_name_svg")
        .selectAll(".eventNames")
        .data(graphdataset.nodes)
        .enter()
        .append("text")
        .attr("class", "eventNames")
        .attr("id", function (d, i) {
            return "eventname_" + d.name
        })
        .text(function (d, i) {
            return d.name
        })
        .attr("x", 3)
        .attr("y", function (d, i) {
            return i * text_y + 12
        })
        // .attr("text-anchor", "start")
        .attr("dy", ".99em")
        // .attr("transform", function (d, i) {
        //     // return "rotate(-30,100," + (i * text_y + 10) + ")"
        //     return "translate(0,100," + (i * text_y + 10) + ")"
        // })
        .style("fill", "#202020")
        .style("font-size", "12px")
        // .style("font-family",'"Arial Narrow", Arial, sans-serif')
        .style("font-family", ' Arial, sans-serif')
        .style("font-weight", 'normal')
        .on("click", function (d, i) {
            let select_event = d.name;
            d3.selectAll(".eventRect")
                .style("fill", function (d) {
                    if (select_event != d.eventname)
                        return "#F2F2F2"
                    else
                        return d.eventcolor
                })
                .attr("opacity", function (d) {
                    if (select_event != d.eventname)
                        return 0.8
                    else
                        return 1.0
                })
        })
        .on("mouseout", function (d) {
            let select_event = d.name;
            d3.selectAll(".eventRect")
                .attr("opacity", 0.4)
                .style("fill", function (d) {
                    return d.eventcolor
                })
        })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));




    function dragstarted(d) {
        console.log(order_method)
        d3.select(this).raise().classed("active", true);
        old_y = d3.select(this).node().getBoundingClientRect().y
    }
    function dragged(d) {
        if (vertical_order == 'manual'){
            console.log(order_method);
            //这里加上调整其它事件顺序的部分
            d3.select(this)
                .attr("x", d.x = d3.event.x)
                .attr("y", d.y = d3.event.y);
        }

    }
    function dragended(d) {
        if (vertical_order == 'manual'){
            console.log(order_method)
            //根据坐标判断向上还是向下移动
            // curr_y = d3.select()
            console.log(text_y)
            d3.select(this).raise().classed("eventNames", false);
            //下面的节点cy向下
            let curry = d3.select(this).node().getBoundingClientRect().y

            d3.select(this).raise().classed("active", false);
            d3.select(this).raise().classed("eventNames", true);
            console.log(d3.selectAll(".eventNames"))

            nodes = nodes.sort(function (a, b) {
                return d3.select("#eventname_" + a.name).node().getBoundingClientRect().y - d3.select("#eventname_" + b.name).node().getBoundingClientRect().y
            })

            for (let i = 0; i < nodes.length; i++) {
                old_new_order.set(nodes[i].order, i)
                nodes[i].order = i;
                event_order.set(nodes[i].id, nodes[i].order);
            }
            console.log(old_new_order)
            console.log(nodes)

            d3.select("#Brushview").selectAll("*").remove()
            d3.select("#svg_multilevel_focus").selectAll("*").remove()
            d3.select("#svg_multilevel_side1").selectAll("*").remove()
            d3.select("#svg_multilevel_side2").selectAll("*").remove()
            d3.select("#svg_multilevel_transition1").selectAll("*").remove()
            d3.select("#svg_multilevel_transition2").selectAll("*").remove()
            d3.select("#event_name_svg").selectAll("*").remove()
            focusandcontextbrush("change", "#Brushview", global_obj, select_strengths, causes_max, vertical_order, horizontal_order, "vertical")
        }
    }

    widthofcontextgroup = x_lag
    //为每条合并的因果链创建一个group
    let groups = svg.selectAll("g")
        .data(lineList)
        .enter()
        .append("g")
        .attr("class", "line_group")
        .attr("id", function (d, i) {
            return "line_group_" + i;
        })
        .attr("transform", (d, i) => "translate(" + (padding.left + i * x_lag) + ",0)");

    //添加path
    groups.append("path")
        .attr("class", "line_path")
        .attr("d", function (d) {
            return getDFromLine(d, x_lag, y_lag, fix_radius * 1.5)
        })
        .attr("stroke", "#C0C0C0")
        .attr("stroke-width", "0.5")
        .attr("fill", "none");

    //添加target节点
    groups.append("circle")
        .attr("class", "target")
        .attr("cx", 0.5 * x_lag)
        .attr("cy", function (d) {
            return (0.5 + d.target_order) * y_lag
        })
        .attr("r", fix_radius * 1.5)
        .attr("fill", "red")

    //添加source的or节点
    groups.selectAll(".or_nodes")
        .data(function (d) {
            // return Array.from(d.source_or_order_strength)
            return (d.source_or_order_strength)
        })
        .enter()
        .append("circle")
        .attr("class", "or")
        .attr("cx", 0.5 * x_lag)
        .attr("cy", function (d) {
            // return (d[0] + 0.5) * y_lag
            return (d.order + 0.5) * y_lag
        })
        .attr("r", fix_radius * 1.5)
        .attr("fill", function (d) {
            return colorScale(d.strength)
        });

    //添加source的and节点
    groups.selectAll(".and_nodes")
        .data(function (d) {
            return d.source_and_order
        })
        .enter()
        .append("circle")
        .attr("class", "and")
        .attr("cx", 0.5 * x_lag)
        .attr("cy", function (d) {
            return (d + 0.5) * y_lag
        })
        .attr("r", fix_radius * 1.5)
        .attr("fill", "#C0C0C0");

    // DrawSequenceGraph("#SequencesVis", dataset["resultformat"])

    //需要barchartdataset
    barchartdata(resultformat(dataset["resultformat"]))

    //创建div
    //创建g
    //每个g上面画一个barchart
    d3.select("#event_small_barchart_svg").selectAll("*").remove()
    var smallBarCharts = d3.select("#event_small_barchart_svg")
        .selectAll("g")
        .data(drawgraphdataset.barchartdataset)
        .enter()
        .append("g")
        .attr("class", "barchart_group")
        .attr("id", function (d, i) {
            return d.eventname
        })
        .attr("transform", (d, i) => "translate(0," + i * text_y + ")")
        .on("click", function(d, i){
            var clicked_name = d.eventname;
            if (writetosource === 1) {
                $("#input-select-source").val(clicked_name);
                console.log("clicked!!!")
                writetosource = 0
            }
            else {
                $("#input-select-target").val(clicked_name);
                writetosource = 1
            }
        });

    smallBarCharts
        .append("rect")
        .attr("class", "rectBackground")
        .attr("width", 80)
        .attr("height", text_y * 0.6)
        .attr("x", 0)
        .attr("y", text_y * 0.2)
        .attr("rx", 2)
        .attr("ry", 2)
        .style("fill", "#c0c0c0")
        .style("opacity", 0.2)


    let smallbarchartyscale = d3.scaleLinear()
        .domain([0, maxCountInAPeriod])
        .range([0, text_y * 0.6]);

    let smallbarwidth = 80 / 30;

    smallBarCharts
        .selectAll(".smallbar")
        .data(function (d) {
            return d.data
        })
        .enter()
        .append("rect")
        .attr("class", "smallbar")
        .attr("height", function (d) {
            if (d > 1) {
                return smallbarchartyscale(Math.log2(d));
            }
            else {
                return smallbarchartyscale(d);
            }
        })
        .attr("width", smallbarwidth * 0.9)
        .attr("x", function (d, i) {
            return smallbarwidth * (i + 0.05)
        })
        .attr("y", function (d) {
            if (d > 1) {
                return text_y * 0.8 - smallbarchartyscale(Math.log2(d));
            }
            else {
                return text_y * 0.8 - smallbarchartyscale(d);
            }
        })
        .style("fill", function (d) {
            return getColorByName(d3.select(this.parentNode).attr('id'), drawgraphdataset.nodes)
        })
        .style("stroke", "none")
        .style("opacity", 0.8)
        .on("click", function (d) {
            let currBars = d3.select(this.parentNode).selectAll(".smallbar")._groups[0]
            for (let i = 0; i < currBars.length; i++) {
                if (overviewBartChartData[i] === undefined) {
                    overviewBartChartData[i] = currBars[i].__data__
                }
                else {
                    overviewBartChartData[i] += currBars[i].__data__
                }
            }
            DrawBarChart(overviewBartChartData)
        })


    // // Add the line
    // smallBarCharts
    //     .selectAll(".smallbar")
    //     .data(function (d) {
    //         return d.data
    //     })
    //     .append("path")
    //     .datum(data)
    //     .attr("fill", "none")
    //     .attr("stroke", "steelblue")
    //     .attr("stroke-width", 1.5)
    //     .attr("d", d3.line()
    //         .x(function (d) { return x(d.date) })
    //         .y(function (d) { return y(d.value) })
    //     )



    return { "old_xlag": x_lag, "old_ylag": y_lag, "filterdata": graphdataset }

    //计算path
    function getDFromLine(currLine, x_lag, y_lag, fix_radius) {
        //把and-or 改成-> and-and
        let currLinetemp = currLine.node_group
        let count_or = 0
        let count_and = 0
        for (let [key, value] of currLinetemp.entries()) {
            if(value == "or") count_or++
            if(value == "and") count_and++
        }
        if(count_or == 1 && count_and == 1){
            for (let [key, value] of currLinetemp.entries()) {
            if(value == "or") currLinetemp.set(key,"and")
            }
        }
        // if(count_or == 1 && count_and == 0){
        //     for (let [key, value] of currLinetemp.entries()) {
        //     if(value == "or") currLinetemp.set(key,"and")
        //     }
        // }
        currLine.node_group = currLinetemp


        let d = ""
        let rx = fix_radius * 1.2
        let node_group = currLine.node_group;
        //从head开始 head两类：and/target or
        let isleft = 0;
        if (node_group.get(currLine.head_order) == "and" || node_group.get(currLine.head_order) == "target") {
            d += "m" + x_lag * 0.5 + "," + (currLine.head_order + 0.5) * y_lag  //m起始位置
                + " v" + 0.5 * y_lag
        }
        else {
            isleft++;
            d += "m" + x_lag * 0.5 + "," + (currLine.head_order * y_lag)//m起始位置
                + " a" + rx + " " + 0.5 * y_lag + " " + 0 + ",0," + isleft % 2 + " 0," + y_lag                                     //弧形

        }
        //中间的部分
        for (let i = currLine.head_order + 1; i < currLine.tail_order; i++) {
            curr_node_group = currLine.node_group.get(i);
            if (curr_node_group === "and" || curr_node_group === "no") {
                d += " v" + y_lag
            }
            else {
                isleft++;
                d += " a" + rx + "," + 0.5 * y_lag + " " + 0 + ",0," + isleft % 2 + " 0," + y_lag
            }
        }
        if (node_group.get(currLine.tail_order) == "and" || node_group.get(currLine.tail_order) == "target") {
            d += " v" + 0.5 * y_lag
        }
        else {
            isleft++;
            d += " a" + rx + "," + 0.5 * y_lag + " " + 0 + ",0," + isleft % 2 + " 0," + y_lag                                     //弧形
        }
        return d;
    }
}
// function ReDraw(){
//     graphdataset = getCausalLink(operation, dataset, event2namefortooltip, strength, method, select_strengths, select_max_causes, order_method)
//
// }
function DrawSequenceGraph(div, dataset) {
    d3.select(div).selectAll("svg").remove()
    let sequenceData = resultformat(dataset);
    //先决定有多少行
    let num_row = sequenceData.length;
    //画横线
    let margin = { top: 0, right: 0, bottom: 0, left: 0 },
        padding = { top: 10, right: 10, bottom: 0, left: 10 };
    let divwidth = document.getElementById("mcv-sequenceContainer").offsetWidth,
        divheight = document.getElementById("mcv-sequenceContainer").offsetHeight;
    let width = divwidth - margin.left - margin.right,
        height = 500;

    let y_lag = (height - 5) / num_row

    d3.select(div)
        .attr("width", divwidth)
        .attr("height", divheight)
        .style("overflow-y", "scroll")


    let svg = d3.select(div).append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(0,0)")

    let x_scale = d3.scaleLinear()
        .domain([0, 30.2])
        .range([padding.left, width - (padding.right)]);

    let background = svg.selectAll('.backgroundrect')
        .data(sequenceData)
        .enter()
        .append("rect")
        .attr("class", "backgroundrect")
        .attr("x", padding.left)
        .attr("width", width - padding.left - padding.right)
        .attr("y", function (d, i) {
            return y_lag * i - y_lag * 0.1
        })
        .attr("height", function (d, i) {
            return y_lag * 0.8
        })
        .attr("rx", 8)
        .attr("ry", 8)
        .style("fill", "#F2F2F2")

    let grps = svg.selectAll('g')
        .data(sequenceData)
        .enter()
        .append('g')
        .attr('transform', function (d, i) {
            return 'translate(' + padding.left + ',' + y_lag * i + ')'
        });

    // let lines = svg.selectAll('line')
    //     .data(sequenceData)
    //     .enter()
    //     .append("line")
    //     .attr("x1", padding.left)
    //     .attr("x2", width - (padding.right))
    //     .attr("y1", function (d, i) {
    //         return y_lag * i + 10
    //     })
    //     .attr("y2", function (d, i) {
    //         return y_lag * i + 10
    //     })
    //     .attr("stroke", "#32320f")
    //     .attr("stroke-width", 0.1)



    grps.selectAll(".eventRect")
        .data(function (d) {
            return d;
        })
        .enter()
        .append("rect")
        .attr("class", "eventRect")
        .attr("id", function (d) {
            return "ellipse_" + d.eventname
        })
        .attr("x", function (d) {
            return x_scale(d.eventtime) - 8
        })
        .attr("width", 16)
        .attr("y", function (d, i) {
            return y_lag * 0.1
        })
        .attr("height", function (d, i) {
            return y_lag * 0.8
        })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("opacity", 0.4)
        .style("fill", function (d) {
            return d.eventcolor
        })

}

function DrawLineGraph(div, dataset, event2namefortooltip) {
    d3.select(div).selectAll("svg").remove()
    //dataset:combinedCausalLink
    let combinedCausalLink = dataset;

    //link数量决定有多少列
    let num_column = combinedCausalLink.length;

    //事件数量决定有多少行
    let num_row;

    let event = [];
    let ii = 0;
    for (let i = 0; i < num_column; i++) {
        for (let j in combinedCausalLink[i]["source"]) {
            let source = combinedCausalLink[i]["source"][j]
            if (event.indexOf(source) == -1) {
                event.push(Number(source))
                event_color.set(event2namefortooltip[Number(source)], event_color_set[ii++]);
            }
        }
        for (let j in combinedCausalLink[i]["target"]) {
            let target = combinedCausalLink[i]["target"][j]
            if (event.indexOf(target) == -1) {
                event.push(Number(target));
                event_color.set(event2namefortooltip[Number(target)], event_color_set[ii++]);
            }
        }
    }
    num_row = event.length;
    //画横线

    let margin = { top: 25, right: 20, bottom: 0, left: 40 },
        padding = { top: 20, right: 10, bottom: 0, left: 140 },
        width = 1188 - margin.left - margin.right,
        height = 345.6 - margin.top - margin.bottom;

    let causalityVisSvg = d3.select(div)
        .append("svg").attr("class", "svg_multiplecausality")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)


    let g = causalityVisSvg.append("g")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    // {#var g = causalityVisSvg.append("g")#}
    // {#    .attr("transform", "translate(" + padding.left + "," + padding.top + ")");#}

    let scale = d3.scaleLinear()
        .domain([0, 1])
        .range([3, 6]);

    let y_lag = Math.floor((height - padding.top - padding.bottom) / (num_row - 1))

    //水平横线
    for (let i = 0; i < num_row; i++) {
        g.append("line")
            .attr("id", "line" + event[i])
            .attr("x1", padding.left)
            .attr("x2", width - (padding.right))
            .attr("y1", i * y_lag)
            .attr("y2", i * y_lag)
            .attr("stroke", "#b7b7a4")
            .attr("stroke-width", 2)

            .on("mouseover", function (d) {
                d3.selectAll("#ellipse_" + event2namefortooltip[event[i]])
                    .attr("width", function (d, i) {
                        return d3.select(this).attr("width") * 1.25;
                    })
                    .attr("height", function (d, i) {
                        return d3.select(this).attr("height") * 1.25;
                    })
                    .attr("opacity", 1.0)
                    .attr("stroke", "#FFF")
                    .attr("stroke-width", 1.5)
            })
            .on("mouseout", function (d) {
                d3.selectAll("#ellipse_" + event2namefortooltip[event[i]])
                    .attr("width", function (d, i) {
                        return d3.select(this).attr("width") * 0.8;
                    })
                    .attr("height", function (d, i) {
                        return d3.select(this).attr("height") * 0.8;
                    })
                    .attr("opacity", 0.7)
                    .attr("stroke", "none")
            })
    }

    //
    for (let i = 0; i < num_row; i++) {
        g.append("text")
            .attr("id", "event" + event[i])
            .text(event2namefortooltip[event[i]])
            .attr("x", margin.left)
            .attr("y", i * y_lag)
            .attr("dy", ".12em")           // set offset y position
            .attr("text-anchor", "middle") // set anchor y justification
            .style("fill", event_color.get(event2namefortooltip[event[i]]))   // fill the text with the colour black
            .on("mouseover", function (d) {
                d3.selectAll("#ellipse_" + event2namefortooltip[event[i]])
                    .attr("rx", function () {
                        return 1.25 * d3.select(this).attr("rx");
                    })
                    .attr("ry", function () {
                        return 1.25 * d3.select(this).attr("ry");
                    })
                    .attr("opacity", 1.0)
                    .attr("stroke", "#ffccac")
                    .attr("stroke-width", 1)
            })
            .on("mouseout", function (d) {
                d3.selectAll("#ellipse_" + event2namefortooltip[event[i]])
                    .attr("rx", function () {
                        return d3.select(this).attr("rx") * 0.8;
                    })
                    .attr("ry", function () {
                        return d3.select(this).attr("ry") * 0.8;
                    })
                    .attr("opacity", 0.7)
                    .attr("stroke", "none")
            })
    }


    let greenColorScale = d3.scaleSequential(d3.interpolatePRGn)
        .domain([-1, 1])
    // d3.scaleLinear().domain([-1,0,1]).range(["#ff9f1c","#ffffff", "#2ec4b6"])

    let pinkColorScale = d3.scaleSequential(d3.interpolatePRGn)
        .domain([-1, 1])
    let x_lag = Math.floor((width - padding.left - padding.right) / (num_column - 1))
    //画x轴上面的
    for (let i = 0; i < num_column; i++) {
        //横坐标
        let x = i * x_lag + padding.left
        //source
        for (let j in combinedCausalLink[i]["source"]) {
            let source = combinedCausalLink[i]["source"][j]
            //找到source所在的纵坐标
            let y = d3.select("#event" + source).attr("y")
            //颜色
            // let color = d3.interpolateOranges(combinedCausalLink[i]["strength"])


            g.append("circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("r", scale(Math.abs(combinedCausalLink[i]["strength"])))
                .attr("fill", greenColorScale(combinedCausalLink[i]["strength"]));
            //  .attr("stroke", "#b7b7a4")
        }
        //target
        for (let j in combinedCausalLink[i]["target"]) {
            let target = combinedCausalLink[i]["target"][j]
            //找到source所在的纵坐标
            let y = d3.select("#event" + target).attr("y")
            //颜色
            // let color = d3.interpolateOranges(combinedCausalLink[i]["strength"])

            g.append("path")
                .attr("d", d3.symbol().type(d3.symbolTriangle).size(Math.PI * Math.pow((scale(Math.abs(combinedCausalLink[i]["strength"]))), 2) - 5))
                .attr("transform", "translate(" + x + "," + y + ")")
                .attr("fill", pinkColorScale(combinedCausalLink[i]["strength"]));
            //  .attr("stroke", "#b7b7a4");

            // {#g.append("circle")#}
            // {#.attr("cx",x)#}
            // {#.attr("cy",y)#}
            // {#.attr("r" , 10)#}
            // {#.attr("fill" , color)#}
        }
    }
}

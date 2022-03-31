function MultiLevel_Draw12(div, dataset, event2namefortooltip, strength, method) {
    let gray_line_height = 30
    //获得因果关系的数据：包括单因果和多因果
    let graphdataset = getCausalLink(dataset, event2namefortooltip, strength, method)
    //用lineList来绘制
    //事件序列数据集
    let sequencedataset = dataset["resultformat"]
    let nodes = graphdataset.nodes
    let links = graphdataset.links
    let lineList = graphdataset.lineList
    // //准备画布
    let margin = { top: 10, right: 20, bottom: 20, left: 0 },//这是svg相对于div的偏移
        padding = { top: 20, right: 10, bottom: 0, left: 120 },  //相对于svg内部

        height = document.getElementById("mcv-multicausalContainer").offsetHeight - margin.left - margin.right - 300;

    width = document.getElementById("mcv-multicausalContainer").offsetWidth - margin.top - margin.bottom;

    //     width = 20000 - margin.left - margin.right,
    //     height = 600 - margin.top - margin.bottom;


    d3.select(div)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

    let svg = d3.select(div)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    let x_lag = 36
    //绘制底部灰色线条
    let buttomLines = svg.selectAll(".bottomLines")
        .data(nodes)
        .enter()
        .append("rect")
        .attr("class", "bottomLines")
        .attr("id", function (d, i) {
            return "bottomLines" + d.id
        })
        .attr("x", padding.left)
        .attr("y", function (d, i) {
            return i * gray_line_height + 2
        })
        .attr("height", 26)
        .attr("width", width - (padding.right) - padding.left)
        .style("fill", "#F2F2F2")
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
        // .on("mouseover", function (d, i) {
        //     d3.selectAll("#ellipse_" + d.name)
        //         .attr("rx", 3)
        //         .attr("ry", 4.5)
        //         .attr("opacity", 1.0)
        //         .attr("stroke", "#e7f515")
        //         .attr("stroke-width", 1.5)
        // })
        // .on("mouseout", function (d) {
        //     d3.selectAll("#ellipse_" + d.name)
        //         .attr("rx", 2)
        //         .attr("ry", 4)
        //         .attr("opacity", 0.7)
        //         .attr("stroke", "none")
        // })

    //绘制事件名称文本框
    var names = svg.selectAll(".eventNames")
        .data(nodes)
        .enter()
        .append("text")
        .attr("class", "eventNames")
        .attr("id", function (d, i) {
            return "eventname_" + d.name
        })
        .text(function (d, i) {
            return d.name
        })
        .attr("x", margin.left)
        .attr("y", function (d, i) {
            return i * gray_line_height + 2
        })
        .attr("dy", ".90em")
        .attr("text-anchor", "left")
        .style("fill", function (d, i) {
            return d.color
        })
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
        // .on("mouseover", function (d, i) {
        //     d3.selectAll("#ellipse_" + d.name)
        //         .attr("rx", 3)
        //         .attr("ry", 4)
        //         .attr("opacity", 1.0)
        //         .attr("stroke", "#e7f515")
        //         .attr("stroke-width", 1.5)
        // })
        // .on("mouseout", function (d) {
        //     d3.selectAll("#ellipse_" + d.name)
        //         .attr("rx", 2)
        //         .attr("ry", 3)
        //         .attr("opacity", 0.7)
        //         .attr("stroke", "none")
        // })

    let groups = svg.selectAll("g")
        .data(lineList)
        .enter()
        .append("g")
        .attr("class", "line_group")
        .attr("id", function (d, i) {
            return "line_group_" + i;
        })
        .attr("transform", (d, i) => "translate(" + (padding.left + i * x_lag) + ",0)");


        groups.append("rect")
        .attr("x", 0.5 * x_lag - 2)     //圆心x坐标-2
        .attr("y", function (d) {
            let temp = d.target_order * gray_line_height - 2
            if (d.target_order === d.head_order)     //如果是头部
                temp = temp + 17
            return temp
        })
        .attr("width", 4)
        .attr("height", function (d) {
            let temp = gray_line_height + 4
            if (d.target_order === d.head_order || d.target_order === d.tail_order)     //如果是头部或者尾部
                temp = temp * 0.5
            return temp
        })
        .attr("class", "target_line")
        .attr("fill", "#C0C0C0")

    groups.append("circle")
        .attr("class", "target_order")
        .attr("cx", 0.5 * x_lag)
        .attr("cy", function (d) {
            return (0.5 + d.target_order) * gray_line_height
        })
        .attr("r", 12)
        .attr("fill", "red")

    for (let i = 0; i < lineList.length; i++) {
        for (let j = 0; j < nodes.length; j++) {
            if (lineList[i].no_use_order.indexOf(j) != -1 && j >= lineList[i].head_order && j <= lineList[i].tail_order) {//这个节点是no_use节点，且应该绘制
                svg.select("#line_group_" + i)
                    .append("rect")
                    .attr("x", 0.5 * x_lag - 2)     //圆心x坐标-2
                    .attr("y", j * gray_line_height - 2)
                    .attr("width", 4)
                    .attr("height", gray_line_height + 4)
                    .attr("fill", "#C0C0C0")
            } else if (lineList[i].source_and_order.indexOf(j) != -1) {//这个节点是and关系节点，绘制
                if (j === lineList[i].head_order) {
                    svg.select("#line_group_" + i)
                        .append("rect")
                        .attr("x", 0.5 * x_lag - 2)     //圆心x坐标-2
                        .attr("y", (j + 0.5) * gray_line_height)
                        .attr("width", 4)
                        .attr("height", (gray_line_height + 4) * 0.5)
                        .attr("fill", "#C0C0C0")
                } else if (j === lineList[i].tail_order) {
                    svg.select("#line_group_" + i)
                        .append("rect")
                        .attr("x", 0.5 * x_lag - 2)     //圆心x坐标-2
                        .attr("y", j * gray_line_height - 2)
                        .attr("width", 4)
                        .attr("height", (gray_line_height + 4) * 0.5)
                        .attr("fill", "#C0C0C0")
                } else {
                    svg.select("#line_group_" + i)
                        .append("rect")
                        .attr("x", 0.5 * x_lag - 2)     //圆心x坐标-2
                        .attr("y", j * gray_line_height - 2)
                        .attr("width", 4)
                        .attr("height", gray_line_height + 4)
                        .attr("fill", "#C0C0C0")
                }
            }
        }
    }


    groups.selectAll(".or_arc")
        .data(function (d) {
            return Array.from(d.source_or_order_strength)
        })
        .enter()
        .append("path")
        .attr("transform", function (d) {
            return "translate(" + 0.5 * x_lag + "," + (d[0] + 0.5) * gray_line_height + ")"
        })
        .attr('d', d3.arc()
            .outerRadius(17)
            .innerRadius(14)
            .startAngle((d, i) => (i % 2) * Math.PI)
            .endAngle((d, i) => (i % 2 + 1) * Math.PI))
        .attr("fill", "#C0C0C0")





    let colorScale = d3.scaleSequential(d3.interpolatePRGn)
        .domain([-1, 1])
    let radiusScale = d3.scaleLinear()
        .domain([0, 1])
        .range([10, 12])

    groups.selectAll(".or_nodes")
        .data(function (d) {
            return Array.from(d.source_or_order_strength)
        })
        .enter()
        .append("circle")
        .attr("cx", 0.5 * x_lag)
        .attr("cy", function (d) {
            return (d[0] + 0.5) * gray_line_height
        })
        .attr("r", function (d) {
            return radiusScale(Math.abs(d[1]))
        })
        .attr("fill", function (d) {
            return colorScale(d[1])
        });
    groups.selectAll(".and_nodes")
        .data(function (d) {
            return d.source_and_order
        })
        .enter()
        .append("circle")
        .attr("cx", 0.5 * x_lag)
        .attr("cy", function (d) {
            return (d + 0.5) * gray_line_height
        })
        .attr("r", 12)
        .attr("fill", "#C0C0C0");

}



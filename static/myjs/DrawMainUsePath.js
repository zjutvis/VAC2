function DrawMainUsePath(div, dataset, event2namefortooltip, strength, method) {

    let gray_line_height = 30
    //获得因果关系的数据：包括单因果和多因果
    let graphdataset = getCausalLink(dataset, event2namefortooltip, strength, method)
    //用lineList来绘制

    // let nodes = graphdataset.nodes
    // let links = graphdataset.links
    // let lineList = graphdataset.lineList
    // //准备画布
    let margin = { top: 10, right: 20, bottom: 20, left: 0 },//这是svg相对于div的偏移
        padding = { top: 20, right: 10, bottom: 0, left: 120 },  //相对于svg内部

        height = document.getElementById("mcv-multicausalContainer").offsetHeight - margin.left - margin.right;

    // width = document.getElementById("mcv-multicausalContainer").offsetWidth - margin.top - margin.bottom;
    width = 2500 - margin.top - margin.bottom;
    console.log(height + " sdfa" + width)

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
            d3.selectAll("#ellipse_" + d.name)
                .attr("rx", 3)
                .attr("ry", 4.5)
                .attr("opacity", 1.0)
                .attr("stroke", "#e7f515")
                .attr("stroke-width", 1.5)
        })
        .on("mouseout", function (d) {
            d3.selectAll("#ellipse_" + d.name)
                .attr("rx", 2)
                .attr("ry", 4)
                .attr("opacity", 0.7)
                .attr("stroke", "none")
        })

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
            d3.selectAll("#ellipse_" + d.name)
                .attr("rx", 3)
                .attr("ry", 4)
                .attr("opacity", 1.0)
                .attr("stroke", "#e7f515")
                .attr("stroke-width", 1.5)
        })
        .on("mouseout", function (d) {
            d3.selectAll("#ellipse_" + d.name)
                .attr("rx", 2)
                .attr("ry", 3)
                .attr("opacity", 0.7)
                .attr("stroke", "none")
        })

    let groups = svg.selectAll("g")
        .data(lineList)
        .enter()
        .append("g")
        .attr("id", function (d, i) {
            return "line_group_" + i;
        })
        .attr("transform", (d, i) => "translate(" + (padding.left + i * x_lag) + ",0)");



    groups.append("path")
        .attr("d", function (d) {
            return getDFromLine(d, x_lag, 30)
        })
        .attr("stroke", "#C0C0C0")
        .attr("stroke-width", "5")
        .attr("fill", "none");

    function getDFromLine(currLine, x_lag, y_lag) {
        let d = ""
        let rx = 14
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
        console.log(d)
        return d;
    }




    let colorScale = d3.scaleSequential(d3.interpolatePRGn)
        .domain([-1, 1])
    let radiusScale = d3.scaleLinear()
        .domain([0, 1])
        .range([10, 12])

    groups.append("circle")
        .attr("class", "target")
        .attr("cx", 0.5 * x_lag)
        .attr("cy", function (d) {
            return (0.5 + d.target_order) * gray_line_height
        })
        .attr("r", 12)
        .attr("fill", "red")

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

    // DrawSequenceGraph("#SequencesVis", dataset["resultformat"])
}


//可视化：未经合并的，暂时不用
function Draw(div, dataset, event2namefortooltip, strength, method) {
    let gray_line_height = 30, circle_raidus = 4
    //获得因果关系的数据：包括单因果和多因果
    let graphdataset = getCausalLink(dataset, event2namefortooltip, strength, method)
    //事件序列数据集
    sequences = dataset["resultformat"]
    // let nodes = graphdataset.nodes
    // let links = graphdataset.links
    console.log(graphdataset.links)
    console.log(graphdataset.lineList)
    //准备画布
    let margin = { top: 10, right: 20, bottom: 20, left: 10 }, //这是svg相对于div的偏移
        padding = { top: 20, right: 10, bottom: 0, left: 120 },  //相对于svg内部
        width = 9000 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    d3.select(div)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

    let svg = d3.select(div).append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    // var yScale = d3.scaleBand()
    //     .range([0, gray_line_height*row_cnt])
    //     .domain(nodes.map(function (d) { return d.name; }))
    //     .padding(0.2);

    let x_lag = 10
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
            return i * gray_line_height + 3
        })
        .attr("height", 24)
        .attr("width", width - (padding.right) - padding.left)
        .style("fill", "#F2F2F2")
        .on("mouseover", function (d, i) {
            d3.selectAll("#ellipse_" + d.name)
                .attr("rx", 3)
                .attr("ry", 4.5)
                .attr("opacity", 1.0)
                .attr("stroke", "#e7f515")
                .attr("stroke-width", 1.5)
        })
        .on("mouseout", function (d) {
            d3.selectAll("#ellipse_" + d.name)
                .attr("rx", 2)
                .attr("ry", 4)
                .attr("opacity", 0.7)
                .attr("stroke", "none")
        })

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
            return i * gray_line_height + 3
        })
        .attr("dy", ".90em")
        .attr("text-anchor", "left")
        .style("fill", function (d, i) {
            return d.color
        })
        .on("mouseover", function (d, i) {
            d3.selectAll("#ellipse_" + d.name)
                .attr("rx", 3)
                .attr("ry", 4)
                .attr("opacity", 1.0)
                .attr("stroke", "#e7f515")
                .attr("stroke-width", 1.5)
        })
        .on("mouseout", function (d) {
            d3.selectAll("#ellipse_" + d.name)
                .attr("rx", 2)
                .attr("ry", 3)
                .attr("opacity", 0.7)
                .attr("stroke", "none")
        })


    for (let i = 0; i < links.length; i++) {
        for (let j = 0; j < nodes.length; j++) {
            svg.append("circle")
                .attr("class", "circle")
                .attr("cx", ((i + 0.5) * x_lag + padding.left))
                .attr("cy", (j + 0.5) * gray_line_height)
                .attr("r", x_lag * 0.4)
                .attr("fill", circlecolor(links[i], j));
        }
    }

    // DrawSequenceGraph("#SequencesVis", sequencedataset)
}

function circlecolorForLine(line, j) {
    // let colorScale = d3.scaleSequential(d3.interpolatePRGn)
    //     .domain([-1, 1])
    if (line.source_or_order_strength.has(j)) {  //属于or里面的
        return colorScale(line.source_or_order_strength.get(j))
    } else if (line.source_and_order.indexOf(j) > -1) { //属于and里面的
        return "#C0C0C0"
    } else if (line.target_order === j) {  //是target
        return "red"
    } else {
        return "#E3E2E2"
    }
}

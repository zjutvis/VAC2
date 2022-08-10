function MultiLevel_Draw12_Side12(svgid, left, widthtemp, selectedgroups, bordercolor, event_count, newLineList, nodes) {
    //MultilevelVis :  id : svg_multilevel_focus
    // console.log(newLineList)
    d3.selectAll("#" + svgid).remove()

    multilevelsvg = multilevelvis.append("svg")
        .attr("width", widthtemp)
        .attr("height", 620)
        .style("left", left)
        .attr("id", svgid)
        .style("position", "absolute")
        .attr("backgroud", "blue")
        .style("border", function () {
            if (svgid === "svg_multilevel_side1" || svgid === "svg_multilevel_side2")
                return "1px solid #e1e1e1"
            else
                return "1px solid #3fc1c0"
        })

    multilevelsvg
        .append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", "#fff")


    // for (let i = 0; i < selectedgroups.length; i++) {
    //     document.getElementById(svgid)
    //         .appendChild(document.getElementById(selectedgroups[i].id)
    //             .cloneNode(true));
    // }
    let margin = { top: 10, right: 0, bottom: 10, left: 0 },//这是svg相对于div的偏移
        padding = { top: 10, right: 0, bottom: 10, left: 0 }  //相对于svg内部

    let svgwidth = parseFloat(document.getElementById(svgid).getAttribute("width"))
    let svgheight = parseFloat(document.getElementById(svgid).getAttribute("height"))

    // let groupslist = d3.selectAll("#"+svgid).selectAll(".line_group")._groups[0]
    let groupslist = d3.selectAll("#" + svgid).selectAll(".line_group")._groups[0]
    let x_lag = (svgwidth) / newLineList.length
    let y_lag = (svgheight - 20) / event_count //TODO 分母是事件的数量

    // 
    let fix_radius = Math.min(x_lag, y_lag) * 0.5 * 0.95    //椭圆轴的rx
    // let fix_radius = 5    //椭圆轴的rx
    let colorScale = d3.scaleSequential(d3.interpolatePRGn)
        .domain([-1, 1])
    let radiusScale = d3.scaleLinear()
        .domain([0, 1])
        .range([fix_radius * 0.7, fix_radius * 0.75]);  //and和target节点半径取fix_radius-1


    let curx;
    //左边的绘制
    if (left === 0) {
        //绘制底部线条
        let buttomLines = d3.selectAll("#" + svgid)
            .selectAll(".bottomLinesOfLeft")
            .data(nodes)
            .enter()
            .append("rect")
            .attr("class", "bottomLinesOfLeft")
            .attr("id", function (d, i) {
                return "bottomLinesOfLeft" + d.id
            })
            .attr("x", 0)
            .attr("y", function (d, i) {
                return i * y_lag + (y_lag * 0.5 - fix_radius)
            })
            .attr("height", fix_radius * 2)
            .attr("width", widthtemp)
            .style("fill", function (d, i) {
                return d.color
            })
            .style("opacity", 0.2)
    }
    else {
        let buttomLines = d3.selectAll("#" + svgid)
            .selectAll(".bottomLinesOfRight")
            .data(nodes)
            .enter()
            .append("rect")
            .attr("class", "bottomLinesOfRight")
            .attr("id", function (d, i) {
                return "bottomLinesOfRight" + d.id
            })
            .attr("x", 0)
            .attr("y", function (d, i) {
                return i * y_lag + (y_lag * 0.5 - fix_radius)
            })
            .attr("height", fix_radius * 2)
            .attr("width", widthtemp)
            .style("fill", function (d, i) {
                return d.color
            })
            .style("opacity", 0.12)
            .on("click", function (d) {
                if (writetosource === 1) {
                    $("#input-select-source").val(d.name);
                    writetosource = 0
                }
                else {
                    $("#input-select-target").val(d.name);
                    writetosource = 1
                }

            })
    }


    // let gruopwidthandgap = (svgwidth -1) / groupslist.length,
    //     gruopgap = 0.05,
    //     width1 = gruopwidthandgap - gruopgap

    let groups = d3.selectAll("#" + svgid)
        .selectAll("g")
        .data(newLineList)
        .enter()
        .append("g")
        .attr("class", "line_group_slide")
        .attr("id", function (d, i) {
            return "line_group_center_" + i;
        })
        .attr("transform", (d, i) => "translate(" + (padding.left + i * x_lag) + ",0)");

    //添加path
    groups.append("path")
        .attr("class", "line_path_slide")
        .attr("d", function (d) {
            return getDFromLine(d, x_lag, y_lag, fix_radius)
        })
        .attr("stroke", "#C0C0C0")
        .attr("stroke-width", fix_radius * 0.2)
        .attr("fill", "none");

    //添加target节点
    groups.append("circle")
        .attr("class", "target_slide")
        .attr("cx", 0.5 * x_lag)
        .attr("cy", function (d) {
            return (0.5 + d.target_order) * y_lag
        })
        .attr("r", fix_radius * 0.7)
        .attr("fill", "red")

    //添加source的or节点
    groups.selectAll(".or_slide")
        .data(function (d) {
            return d.source_or_order_strength
        })
        .enter()
        .append("circle")
        .attr("class", "or_slide")
        .attr("cx", 0.5 * x_lag)
        .attr("cy", function (d) {
            return (d.order + 0.5) * y_lag
        })
        .attr("r", fix_radius * 0.7)
        .attr("fill", function (d) {
            return colorScale(d.strength)
        });

    //添加source的and节点
    groups.selectAll(".and_slide")
        .data(function (d) {
            return d.source_and_order
        })
        .enter()
        .append("circle")
        .attr("class", "and_slide")
        .attr("cx", 0.5 * x_lag)
        .attr("cy", function (d) {
            return (d + 0.5) * y_lag
        })
        .attr("r", fix_radius * 0.7)
        .attr("fill", "#C0C0C0");


    //计算path
    function getDFromLine(currLine, x_lag, y_lag, fix_radius) {
        let d = ""
        let rx = fix_radius
        let node_group = currLine.node_group;
        //从head开始 head两类：and/target or
        let isleft = 0;
        if (node_group.get(currLine.head_order) == "and" || node_group.get(currLine.head_order) == "target") {
            d += "m" + x_lag * 0.5 + "," + (currLine.head_order + 0.5) * y_lag  //m起始位置
                + " v" + 0.5 * y_lag
        }
        else {
            isleft++;
            d += "m" + x_lag * 0.5 + "," + (currLine.head_order * y_lag + 0.5 * y_lag - rx)//m起始位置
                + " a" + rx + " " + rx + " " + 0 + ",0," + isleft % 2 + " 0," + 2 * rx
                + " v" + (0.5 * y_lag - rx)                                   //弧形

        }
        //中间的部分
        for (let i = currLine.head_order + 1; i < currLine.tail_order; i++) {
            curr_node_group = currLine.node_group.get(i);
            if (curr_node_group === "and" || curr_node_group === "no" || curr_node_group === "target" || curr_node_group === "target") {
                d += " v" + y_lag
            }
            else {
                isleft++;
                // d += " a" + rx + "," + 0.5 * y_lag + " " + 0 + ",0," + isleft % 2 + " 0," + y_lag
                d += " v" + (0.5 * y_lag - rx)
                    + " a" + rx + " " + rx + " " + 0 + ",0," + isleft % 2 + " 0," + 2 * rx
                    + " v" + (0.5 * y_lag - rx)
            }
        }
        if (node_group.get(currLine.tail_order) == "and" || node_group.get(currLine.tail_order) == "target") {
            d += " v" + 0.5 * y_lag
        }
        else {
            isleft++;
            d += " v" + (0.5 * y_lag - rx) +
                " a" + rx + "," + rx + " " + 0 + ",0," + isleft % 2 + " 0," + 2 * rx                                     //弧形
        }
        return d;
    }

}
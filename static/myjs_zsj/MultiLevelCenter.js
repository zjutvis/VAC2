function MultiLevel_Draw12_Focus_Center(svgid, left, widthtemp, selectedgroups, event_count, newLineList, nodes) {
    //MultilevelVis :  id : svg_multilevel_focus
    d3.selectAll("#" + svgid).remove()
    let multilevelcentersvg = multilevelvis.append("svg")
        .attr("width", widthtemp)
        .attr("height", 620)
        .style("left", left)
        .attr("id", svgid)
        .style("position", "absolute")
        .attr("backgroud", "blue")
        .style("border", "1px solid red")

    multilevelcentersvg
        .append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", "#fff")


    let margin = { top: 10, right: 0, bottom: 10, left: 0 },//这是svg相对于div的偏移
        padding = { top: 10, right: 0, bottom: 10, left: 0 }  //相对于svg内部

    let svgwidth = parseFloat(document.getElementById(svgid).getAttribute("width"))
    let svgheight = parseFloat(document.getElementById(svgid).getAttribute("height"))

    // let groupslist = d3.selectAll("#"+svgid).selectAll(".line_group")._groups[0]
    let groupslist = d3.selectAll("#" + svgid).selectAll(".line_group")._groups[0]
    let x_lag = (svgwidth - 30) / newLineList.length
    let y_lag = (svgheight - 20) / event_count //TODO 分母是事件的数量


    let colorScale = d3.scaleSequential(d3.interpolatePRGn)
        .domain([-1, 1])
    let fix_radius = Math.min(x_lag, y_lag) * 0.5 * 0.95    //椭圆轴的rx

    let radiusScale = d3.scaleLinear()
        .domain([0, 1])
        .range([fix_radius * 0.8, fix_radius * 0.85]);  //and和target节点半径取fix_radius-1

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
        .style("opacity", 0.1)
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
        .on("click", function (d) {
            if (writetosource === 1) {
                $("#input-select-source").val(d.name);
                console.log("clicked!!!")
                writetosource = 0
            }
            else {
                $("#input-select-target").val(d.name);
                writetosource = 1
            }

        })

    let old_x
    let old_i;
    let groups = d3.selectAll("#" + svgid)
        .selectAll("g")
        .data(newLineList)
        .enter()
        .append("g")
        .attr("class", "line_group_center")
        .attr("id", function (d, i) {
            return "line_group_center_" + i;
        })
        .attr("transform", (d, i) => "translate(" + (padding.left + i * x_lag) + ",0)")
    let wasMoved = false;
    groups
        .call(d3.drag()
            .on("start", function (d, i) {
                d3.select(this).raise().classed("active", true);
                old_i = i;
            })
            .on("drag", function (d, i) {
                wasMoved = true;
            })
            .on("end", function (d, j) {
                if (wasMoved) {
                    // 新的位置
                    var new_x = d3.event.x;
                    var temp_g_list = [];
                    for (var i = 0; i < d3.select(this.parentNode).selectAll(".line_group_center")._groups[0].length; i++) {
                        if (new_x <= parseFloat(d3.select(d3.select(this.parentNode).selectAll(".line_group_center")._groups[0][i]).attr('transform').split("(")[1].split(',')[0])) {
                            temp_g_list.push(i);
                            break;
                        }
                    }
                    console.log(old_i, temp_g_list);
                    horizontalDragStart = old_i;
                    if (temp_g_list.length === 0) {
                        horizontalDragEnd = d3.select(this.parentNode).selectAll(".line_group_center")._groups[0].length - 1;
                    } else {
                        horizontalDragEnd = temp_g_list[0];
                    }
                    focusandcontextbrush("change", "#Brushview", global_obj, select_strengths, causes_max, vertical_order, horizontal_order)
                }

            })
        )

    //     .call(d3.drag()
    //         .on("start", dragstartedgroup)
    //         .on("drag", draggedgroup)
    //         .on("end", dragendedgroup));

    // function dragstartedgroup(d) {
    //     console.log("drag")
    //     d3.select(this).raise().classed("active", true);
    //     // old_x = d3.select(this).node().getBoundingClientRect().x
    //     old_x = d3.event.x
    //     console.log(old_x)
    // }
    // function draggedgroup(d) {
    //     d3.select(this)
    //         .attr("x", d.x = d3.event.x)
    //         .attr("y", d.y = d3.event.y);

    // }
    // function dragendedgroup(d) {
    //     //根据坐标判断向左还是向右移动
    //     // curr_y = d3.select()

    //     d3.select(this).raise().classed("line_group_center", false);

    //     let currx = d3.select(this).node().getBoundingClientRect().x
    //     console.log( d3.event.x)
    //     if (currx < old_x) //向左移动了
    //     {
    //         // d3.selectAll(".line_group_center")
    //         //     .attr("y", function (d) {
    //         //         console.log(d3.select("#eventname_" + d.name).node().getBoundingClientRect().y)
    //         //         if (parseFloat(d3.select("#eventname_" + d.name).node().getBoundingClientRect().y) > parseFloat(curry)
    //         //             && parseFloat(d3.select("#eventname_" + d.name).node().getBoundingClientRect().y) < parseFloat(old_y))
    //         //             return parseFloat(d3.select("#eventname_" + d.name).attr("y")) + text_y;
    //         //         else
    //         //             return d3.select("#eventname_" + d.name).attr("y")
    //         //     })
    //         //     .attr("transform", function (d) {
    //         //         if (parseFloat(d3.select("#eventname_" + d.name).node().getBoundingClientRect().y) > parseFloat(curry)
    //         //             && parseFloat(d3.select("#eventname_" + d.name).node().getBoundingClientRect().y) < parseFloat(old_y))
    //         //             return "rotate(-30,100," + (d3.select("#eventname_" + d.name).attr("y")) + ")"
    //         //         else
    //         //             return "rotate(-30,100," + (d3.select("#eventname_" + d.name).attr("y")) + ")"
    //         //     })

    //         // console.log(d3.selectAll(".eventNames"))

    //         // for (let i = 0; i < d3.selectAll(".eventNames")._groups[0].length; i++) {
    //         //     if ((d3.select("#" + d3.selectAll(".eventNames")._groups[0][i].id)).node().getBoundingClientRect().y > parseFloat(curry)) {
    //         //         d3.select(this)
    //         //             .attr("x", 100)
    //         //             .attr("y", d3.select("#" + d3.selectAll(".eventNames")._groups[0][i].id).attr("y") - text_y)
    //         //             .attr("transform", "rotate(-30,100," + (d3.select("#" + d3.selectAll(".eventNames")._groups[0][i].id).attr("y") - text_y) + ")");
    //         //         break;
    //         //     }

    //         // }
    //     }
    //     else {   //向下移动了
    //         // d3.selectAll(".eventNames")
    //         //     .attr("y", function (d) {
    //         //         console.log(d3.select("#eventname_" + d.name).node().getBoundingClientRect().y)
    //         //         if (parseFloat(d3.select("#eventname_" + d.name).node().getBoundingClientRect().y) < parseFloat(curry)
    //         //             && parseFloat(d3.select("#eventname_" + d.name).node().getBoundingClientRect().y) > parseFloat(old_y))
    //         //             return parseFloat(d3.select("#eventname_" + d.name).attr("y")) - text_y;
    //         //         else
    //         //             return d3.select("#eventname_" + d.name).attr("y")
    //         //     })
    //         //     .attr("transform", function (d) {
    //         //         if (parseFloat(d3.select("#eventname_" + d.name).node().getBoundingClientRect().y) < parseFloat(curry)
    //         //             && parseFloat(d3.select("#eventname_" + d.name).node().getBoundingClientRect().y) > parseFloat(old_y))
    //         //             return "rotate(-30,100," + (d3.select("#eventname_" + d.name).attr("y")) + ")"
    //         //         else
    //         //             return "rotate(-30,100," + (d3.select("#eventname_" + d.name).attr("y")) + ")"
    //         //     })

    //         // console.log(d3.selectAll(".eventNames"))

    //         // for (let i = 0; i < d3.selectAll(".eventNames")._groups[0].length; i++) {
    //         //     if ((d3.select("#" + d3.selectAll(".eventNames")._groups[0][i].id)).node().getBoundingClientRect().y > parseFloat(curry)) {
    //         //         d3.select(this)
    //         //             .attr("x", 100)
    //         //             .attr("y", d3.select("#" + d3.selectAll(".eventNames")._groups[0][i].id).attr("y") - text_y)
    //         //             .attr("transform", "rotate(-30,100," + (d3.select("#" + d3.selectAll(".eventNames")._groups[0][i].id).attr("y") - text_y) + ")");
    //         //         break;
    //         //     }
    //         // }

    //     }
    //     d3.select(this).raise().classed("active", false);
    //     d3.select(this).raise().classed("eventNames", true);
    //     console.log(d3.selectAll(".eventNames"))


    //     // nodes = nodes.sort(function (a, b) {
    //     //     return d3.select("#eventname_" + a.name).node().getBoundingClientRect().y - d3.select("#eventname_" + b.name).node().getBoundingClientRect().y
    //     // })

    //     // for (let i = 0; i < nodes.length; i++) {
    //     //     old_new_order.set(nodes[i].order, i)
    //     //     nodes[i].order = i;
    //     //     event_order.set(nodes[i].id, nodes[i].order);
    //     // }
    //     // console.log(old_new_order)
    //     // console.log(nodes)

    //     d3.select("#Brushview").selectAll("*").remove()
    //     d3.select("#svg_multilevel_focus").selectAll("*").remove()
    //     d3.select("#svg_multilevel_side1").selectAll("*").remove()
    //     d3.select("#svg_multilevel_side2").selectAll("*").remove()
    //     d3.select("#svg_multilevel_transition1").selectAll("*").remove()
    //     d3.select("#svg_multilevel_transition2").selectAll("*").remove()
    //     d3.select("#event_name_svg").selectAll("*").remove()
    //     focusandcontextbrush("change", "#Brushview", global_obj, select_strengths, causes_max, vertical_order, horizontal_order)
    // }

    //添加path
    groups.append("path")
        .attr("class", "line_path_center")
        .attr("d", function (d) {
            return getDFromLine(d, x_lag, y_lag, fix_radius)
        })
        .attr("stroke", "#C0C0C0")
        .attr("stroke-width", fix_radius * 0.2)
        .attr("fill", "none");

    //添加target节点
    groups.append("circle")
        .attr("class", "target_center")
        .attr("cx", 0.5 * x_lag)
        .attr("cy", function (d) {
            return (0.5 + d.target_order) * y_lag
        })
        .attr("r", fix_radius * 0.7)
        .attr("fill", "red")
        .on("mouseover", function (d, i) {
            d3.select(this.parentNode)
                .selectAll('circle')
                .each(function (d, i) {
                    var text_g = d3.select(this.parentNode.parentNode)
                        .append('g')
                        .attr('id', 'text-g');
                    var tx = d3.select(this.parentNode).attr('id').split('_').pop() * x_lag;
                    var ty = parseInt(d3.select(this).attr('cy'));
                    if ('target_order' in d) {
                        var name = getEventNameByOrder(d.target_order, drawgraphdataset.nodes);
                    } else {
                        var name = getEventNameByOrder(d.order, drawgraphdataset.nodes);
                    }
                    text_g.append('rect')
                        .attr('x', tx + 30)
                        .attr('y', ty)
                        .attr('width', name.length * 7)
                        .attr('height', '20')
                        .style('fill', 'white')
                        .style('opacity', '0.8')
                        .attr('rx', '5');
                    text_g.append('text')
                        .text(name)
                        .attr('x', tx + 32)
                        .attr('y', ty + 15)
                        .style('fill', '#202020')
                        .style("font-family", ' Arial, sans-serif')
                        .style("font-weight", 'normal');
                });
            if (d3.select(this.parentNode).select('.pie-path')) {
                var text_g = d3.select(this.parentNode.parentNode)
                    .append('g')
                    .attr('id', 'text-g');
                var tx = (parseInt(d3.select(this.parentNode).attr('id').split('_')[3]) + 0.5) * x_lag;
                if (d.source_and_order.length > 0) {
                    var ty = parseInt(d3.select(this.parentNode)
                        .select('.pie-path').attr('transform').split(',')[1].split(')')[0]);
                    var ind = Math.floor((ty - 20) / 40);
                    var name = getEventNameByOrder(ind, drawgraphdataset.nodes);
                    text_g.append('rect')
                        .attr('x', tx + 15)
                        .attr('y', ty)
                        .attr('width', name.length * 7)
                        .attr('height', '20')
                        .style('fill', 'white')
                        .style('opacity', '0.8')
                        .attr('rx', '5');
                    text_g.append('text')
                        .text(name)
                        .attr('x', tx + 18)
                        .attr('y', ty + 15)
                        .style('fill', '#202020')
                        .style("font-family", ' Arial, sans-serif')
                        .style("font-weight", 'normal');
                }
            }

        })
        .on("mouseout", function (d, i) {
            d3.select(this.parentNode.parentNode)
                .selectAll('#text-g')
                .remove();
        });

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-2, 0])
        .html(function (d) {
            let tempppplink = drawgraphdataset.links[d.idinlinks]
            let tipstring = "Delete a causal link:<br>causes: "
            for (let i = 0; i < tempppplink.source_order.length; i++) {
                tipstring += (getEventNameByOrder(tempppplink.source_order[i], nodes) + " ")
            }
            tipstring += "<br>result:" + getEventNameByOrder(tempppplink.target_order, nodes) +
                "<br>strength: "
            if (tempppplink.strength < 0) {
                tipstring += ((tempppplink.strength * 100).toFixed(2) + "%  Inhibiting<br>");
            }
            else {
                tipstring += ((tempppplink.strength * 100).toFixed(2) + "%  Impelling<br><br>");
            }
            return tipstring + "<button id='confirmbnt' class='confirmbnt'>Confirm</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button  id='cancelbnt' class='confirmbnt'>Cancel</button>"
        });



    //添加source的or节点
    groups.selectAll(".or_center")
        .data(function (d) {
            return d.source_or_order_strength
        })
        .enter()
        .append("circle")
        .attr("class", "or_center")
        .attr("cx", 0.5 * x_lag)
        .attr("cy", function (d) {
            return (d.order + 0.5) * y_lag
        })
        .attr("r", function (d) {
            return radiusScale(Math.abs(d.strength))
        })
        .attr("fill", function (d) {
            return colorScale(d.strength)
        })
        .on("mouseover", function (d, i) {
            d3.select(this.parentNode)
                .selectAll('circle')
                .each(function (d, i) {
                    var text_g = d3.select(this.parentNode.parentNode)
                        .append('g')
                        .attr('id', 'text-g');
                    var tx = d3.select(this.parentNode).attr('id').split('_').pop() * x_lag;
                    var ty = parseInt(d3.select(this).attr('cy'));
                    if ('target_order' in d) {
                        var name = getEventNameByOrder(d.target_order, drawgraphdataset.nodes)
                    } else {
                        var name = getEventNameByOrder(d.order, drawgraphdataset.nodes) + ": " +
                            (d.strength * 100).toFixed(2) + "%";
                    }
                    text_g.append('rect')
                        .attr('x', tx + 30)
                        .attr('y', ty)
                        .attr('width', (name.length) * 7)
                        .attr('height', '20')
                        .attr('fill', 'white')
                        .attr('opacity', '0.8')
                        .attr('rx', '5');
                    text_g.append('text')
                        .text(name)
                        .attr('x', tx + 32)
                        .attr('y', ty + 15)
                        .style('fill', '#202020')
                        .style("font-family", ' Arial, sans-serif')
                        .style("font-weight", 'normal');
                });
            if (d3.select(this.parentNode).select('.pie-path')) {
                var text_g = d3.select(this.parentNode.parentNode)
                    .append('g')
                    .attr('id', 'text-g');
                var tx = (parseInt(d3.select(this.parentNode).attr('id').split('_')[3]) + 0.5) * x_lag;
                if (d3.select(this.parentNode)._groups[0][0].__data__.source_and_order.length > 0) {
                    var ty = parseInt(d3.select(this.parentNode)
                        .select('.pie-path').attr('transform').split(',')[1].split(')')[0]);
                    var ind = Math.floor((ty - 20) / 40);
                    var name = getEventNameByOrder(ind, drawgraphdataset.nodes);
                    text_g.append('rect')
                        .attr('x', tx + 15)
                        .attr('y', ty)
                        .attr('width', name.length * 7)
                        .attr('height', '20')
                        .style('fill', 'white')
                        .style('opacity', '0.8')
                        .attr('rx', '5');
                    text_g.append('text')
                        .text(name)
                        .attr('x', tx + 18)
                        .attr('y', ty + 15)
                        .style('fill', '#202020')
                        .style("font-family", ' Arial, sans-serif')
                        .style("font-weight", 'normal');
                }
            }

        })
        .on("mouseout", function (d, i) {
            d3.select(this.parentNode.parentNode)
                .selectAll('#text-g')
                .remove();
        })
        .on("click", function (d, i) {
            if (deletable === 1)//可以删除的状态
            {
                // if (d.defaultPrevented)
                //     return;
                console.log("deletable" + deletable)
                console.log(d)
                tip.show(d);
                //确认删除，获得将要删除的link的id：deletedIndexOfLinks
                d3.select("#confirmbnt").on("click", function () {
                    console.log("confirm delete")
                    tip.hide(d);
                    d3.selectAll(".d3-tip").remove();
                    deletedIndexOfLinks = d.idinlinks
                    console.log(drawgraphdataset.links[deletedIndexOfLinks])
                    focusandcontextbrush("filter", "#Brushview", global_obj, select_strengths, causes_max, vertical_order, horizontal_order)
                });
                //取消删除，关闭提示，可以点击另一个节点选择是否删除
                d3.select("#cancelbnt").on("click", function () {
                    console.log("cancel")
                    tip.hide(d);
                    d3.selectAll(".d3-tip").remove();
                    deletedIndexOfLinks = -1
                    deletable = 0
                });
            }
        })



    ///////.....这里画piechart
    let gtemp_All = groups._groups[0]
    let radius = fix_radius * 0.9
    for (let k = 0; k < gtemp_All.length; k++) {
        let datagroup = gtemp_All[k].__data__
        for (let kk = 0; kk < datagroup.source_and_order.length; kk++) {
            let datatemp = Array.from(datagroup.source_or_order_strength.map(a => a.strength))
            let apiechartdata = []
            // let datatemp = datagroup.source_or_order_strength;  //强度的数据
            datatemp.forEach(function (d) {
                apiechartdata.push(d)
            })
            let drawing = d3.select("#" + gtemp_All[k].id + ".line_group_center")
            let dtemp = datagroup.source_and_order[kk],
                cxtemp = 0.5 * x_lag,
                cytemp = (dtemp + 0.5) * y_lag

            DrawPieChart(drawing, radius, cxtemp, cytemp,
                apiechartdata, colorScale)
            // DrawPieChart(gtemp, radiustemp, locationx, locationy, datatemp,colorScaletemp)
        }

    }
    d3.selectAll(".pie-path")
        .each(function (d, i) {
        })
        .on('mouseover', function (d, i) {
            var ind = Math.floor((d3.select(this).node().getBoundingClientRect().y - 20) / 40);
            var name = getEventNameByOrder(ind, drawgraphdataset.nodes);
            var text_g = d3.select(this.parentNode.parentNode)
                .append('g')
                .attr('id', 'text-g');
            var tx = (parseInt(d3.select(this.parentNode).attr('id').split('_')[3]) + 0.5) * x_lag;;
            var ty = parseInt(d3.select(this).attr('transform').split(',')[1].split(')')[0]);
            text_g.append('rect')
                .attr('x', tx + 15)
                .attr('y', ty - 10)
                .attr('width', name.length * 7)
                .attr('height', '20')
                .style('fill', 'white')
                .style('opacity', '0.8')
                .attr('rx', '5');
            text_g.append('text')
                .text(name)
                .attr('x', tx + 18)
                .attr('y', ty + 5)
                .style('fill', '#202020')
                .style("font-family", ' Arial, sans-serif')
                .style("font-weight", 'normal');
            d3.select(this.parentNode)
                .selectAll('circle')
                .each(function (d, i) {
                    var text_g = d3.select(this.parentNode.parentNode)
                        .append('g')
                        .attr('id', 'text-g');
                    var tx = d3.select(this.parentNode).attr('id').split('_').pop() * x_lag;
                    var ty = parseInt(d3.select(this).attr('cy'));
                    if ('target_order' in d) {
                        var name = getEventNameByOrder(d.target_order, drawgraphdataset.nodes);
                    } else {
                        var name = getEventNameByOrder(d.order, drawgraphdataset.nodes) + ": " +
                            (d.strength * 100).toFixed(2) + "%";
                    }
                    text_g.append('rect')
                        .attr('x', tx + 30)
                        .attr('y', ty)
                        .attr('width', name.length * 7)
                        .attr('height', '20')
                        .style('fill', 'white')
                        .style('opacity', '0.8')
                        .attr('rx', '5');
                    text_g.append('text')
                        .text(name)
                        .attr('x', tx + 32)
                        .attr('y', ty + 15)
                        .style('fill', '#202020')
                        .style("font-family", ' Arial, sans-serif')
                        .style("font-weight", 'normal');
                });
        })
        .on("mouseout", function (d, i) {
            d3.select(this.parentNode.parentNode)
                .selectAll('#text-g')
                .remove();
        });


    d3.selectAll("#" + svgid).call(tip)


    // //计算path
    // function getDFromLine(currLine, x_lag, y_lag, fix_radius) {
    //     let d = ""
    //     let rx = fix_radius
    //     let node_group = currLine.node_group;
    //     //从head开始 head两类：and/target or
    //     let isleft = 0;
    //     if (node_group.get(currLine.head_order) == "and" ) {
    //         d += "m" + x_lag * 0.5 + "," + (currLine.head_order + 0.5) * y_lag  //m起始位置
    //             + " v" + 0.5 * y_lag
    //     }
    //     else if(node_group.get(currLine.head_order) == "target") {
    //         d += "m" + x_lag * 0.5 + "," + (currLine.head_order + 0.5) * y_lag  //m起始位置
    //             + " v" + rx    //到箭头顶点
    //             + " l-1,2 l1,-1 l1,1 l-1,-2" 
    //             +" v"+(y_lag*0.5-rx) 
    //     }
    //     else {
    //         isleft++;
    //         d += "m" + x_lag * 0.5 + "," + (currLine.head_order * y_lag + 0.5 * y_lag - rx)//m起始位置
    //             + " a" + rx + " " + rx + " " + 0 + ",0," + isleft % 2 + " 0," + 2 * rx
    //             + " v" + (0.5 * y_lag - rx)                                   //弧形                                  //弧形

    //     }

    //     //中间的部分
    //     for (let i = currLine.head_order + 1; i < currLine.tail_order; i++) {
    //         curr_node_group = currLine.node_group.get(i);
    //         if (curr_node_group === "target" ) {
    //             d+= " v" + (y_lag*0.5-rx)
    //              +" l-1,-2 l1,1 l1,-1 l-1,2"
    //              + " v" + rx*2
    //              +" l-1,2 l1,-1 l1,1 l-1,-2" 
    //             d += " v" + (y_lag*0.5-rx) 
    //         }
    //         else if (curr_node_group === "and" || curr_node_group === "no" ) {
    //             d += " v" + y_lag
    //         }
    //         else {
    //             isleft++;
    //             // d += " a" + rx + "," + 0.5 * y_lag + " " + 0 + ",0," + isleft % 2 + " 0," + y_lag
    //             d += " v" + (0.5 * y_lag - rx)
    //                 + " a" + rx + " " + rx + " " + 0 + ",0," + isleft % 2 + " 0," + 2 * rx
    //                 + " v" + (0.5 * y_lag - rx)
    //         }
    //     }

    //     if (node_group.get(currLine.tail_order) == "and") {
    //         d += " v" + 0.5 * y_lag
    //     }
    //     else if(node_group.get(currLine.tail_order) == "target") {
    //         d += " v" + (0.5 * y_lag-rx)
    //          + " l-1,-2 l1,1 l1,-1 l-1,2"
    //     }
    //     else {
    //         isleft++;
    //         d += " v" + (0.5 * y_lag - rx) +
    //             " a" + rx + "," + rx + " " + 0 + ",0," + isleft % 2 + " 0," + 2 * rx                                     //弧形
    //     }

    //     return d;
    // }

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
            d += "m" + x_lag * 0.5 + "," + (currLine.head_order * y_lag)//m起始位置
                + " a" + rx + " " + 0.5 * y_lag + " " + 0 + ",0," + isleft % 2 + " 0," + y_lag                                     //弧形

        }
        if (currLine.head_order == currLine.target_order) {
            d += " v" + -0.2 * y_lag + " l" + 0.1 * rx + "," + 0.2 * rx + " l" + -0.1 * rx + "," + -0.06 * rx + " l" + -0.1 * rx + "," + 0.06 * rx + " l" + 0.1 * rx + "," + -0.2 * rx + " v" + 0.2 * y_lag;
        }
        //中间的部分
        for (let i = currLine.head_order + 1; i < currLine.tail_order; i++) {
            curr_node_group = currLine.node_group.get(i);
            if (curr_node_group === "target") {
                d += " v" + y_lag * 0.5 + " v" + -0.3 * y_lag + " l" + -0.1 * rx + "," + -0.2 * rx + " l" + 0.1 * rx + ',' + 0.06 * rx + " l" + 0.1 * rx + ',' + -0.06 * rx + " l" + -0.1 * rx + "," + 0.2 * rx + " v" + 0.3 * y_lag + " v" + -y_lag * 0.5;
            }
            if (curr_node_group === "and" || curr_node_group === "no" || curr_node_group === "target") {
                d += " v" + y_lag
            }
            else {
                isleft++;
                d += " a" + rx + "," + 0.5 * y_lag + " " + 0 + ",0," + isleft % 2 + " 0," + y_lag
            }
            if (curr_node_group === 'target') {
                d += " v" + -0.2 * y_lag + " l" + 0.1 * rx + "," + 0.2 * rx + " l" + -0.1 * rx + ',' + -0.06 * rx + " l" + -0.1 * rx + ',' + 0.06 * rx + " l" + 0.1 * rx + "," + -0.2 * rx + " v" + 0.2 * y_lag;
            }
        }
        if (node_group.get(currLine.tail_order) == "and" || node_group.get(currLine.tail_order) == "target") {
            d += " v" + 0.5 * y_lag
        }
        else {
            isleft++;
            d += " a" + rx + "," + 0.5 * y_lag + " " + 0 + ",0," + isleft % 2 + " 0," + y_lag                                     //弧形
        }
        if (currLine.tail_order == currLine.target_order) {
            d += " v" + -0.3 * y_lag + " l" + -0.1 * rx + "," + -0.2 * rx + " l" + 0.1 * rx + "," + 0.06 * rx + " l" + 0.1 * rx + "," + -0.06 * rx + " l" + -0.1 * rx + "," + 0.2 * rx + " v" + 0.2 * y_lag;
        }

        return d;
    }
}


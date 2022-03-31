//预留给各个事件对应的颜色
var event_color_set = [
    "#9a494e",
    "#c2b748",
    "#9aa5cb",
    "#cd8646",
    "#96cb4f",
    "#aba0ce",
    "#d473b5",
    "#89b6ad",
    "#e31a1c",
    "#ea8b42",
    "#cab2d6",
    "#6a3d9a",
    "#ffff99",
    "#b15928",
    "#4e79a7",
    "#59a14f",
    "#9c755f",
    "#f28e2b",
    "#bab0ac",
    "#e15759",
    "#b07aa1",
    "#76b7b2"
];

//event_order key->事件在原始数据中分配的id value->在前端显示的上下次序
var event_order = new Map();

//event_color key->事件在原始数据中分配的id value->根据在前端显示的上下次序分配的属于该事件的颜色
var event_color = new Map();

// order_array range(0,nodes.length)
var order_array = [];

//全局变量，记录前端查询记录
var all_query_history = []

//全局激励和抑制的颜色映射
var colorScale = d3.scaleSequential(d3.interpolatePRGn).domain([-1, 1])

//数据：对应的拆分为全局的
//全局变量global_nodes：用到的所有事件"id":事件原始的id "name": 事件名称, "color": 事件对应的颜色,"order": 前端分配的上下次序
var nodes = []

//全局变量global_links：包括所有的单因果和多因果，数据组成："source": (Array), "target": (int), "strength": (-1,1),"source_order": (Array), "target_order": (int), "isfirst": 0
var links = []

//全局变量global_links_Set：为了去重，保留第一个strength
var links_Set = new Set()

//全局变量global_dhgs：关于绘制点线图的：包含隐藏节点
var dhgs = []

//全局变量global_lineList：前端绘制用到的合并之后的数据
var lineList = []

//全局变量sequences：记录所有序列
var sequences

//交互：增加一条查询
function add_query() {
    // 如果有查询结果
    all_query_history.push("history")
    // if(all_query_history.length = 4){
    //     // 大于等于四条绘制向上、向下的箭头

    // }
    let tempDiv = document.createElement("div");
    tempDiv.setAttribute("id", "query_history_" + all_query_history.length);
    tempDiv.setAttribute("style", "width:140px;height:20px");
    tempDiv.innerHTML = '<div class="query-history-tag"><p class="p2">' + all_query_history.length + '</p></div>';
    document.getElementById("query-history-list").appendChild(tempDiv);
}

//可视化：左侧的颜色轴
function colorScalePicker(div) {
    let background_margin = { top: 5, right: 5, bottom: 5, left: 15 },
        slider_margin = { top: 8, right: 2, bottom: 1, left: 12 },
        // padding = { top: 5, right: 5, bottom: 5, left: 5 }
        rect_width = 140,
        rect_height = 10

    let container_svg = d3.select(div)
        .attr("width", rect_width + background_margin.left + background_margin.right)
        .attr("height", rect_height + background_margin.top + background_margin.bottom)
        .append("svg")
        .attr("width", rect_width + background_margin.left + background_margin.right)
        .attr("height", rect_height + background_margin.top + background_margin.bottom)
        .attr("id", "container_svg")
        .attr("transform", "translate(" + 0 + "," + 0 + ")")

    // 颜色过渡背景
    let color_axis = d3.scaleSequential(d3.interpolatePRGn).domain([0, rect_width])

    let background_svg = d3.select("#container_svg")
        .append("g")
        .attr("width", rect_width)
        .attr("height", rect_height)
        .attr("transform", "translate(" + background_margin.left + "," + background_margin.top + ")")

    let slider_svg = d3.select("#container_svg")
        .append("g")
        .attr("width", rect_width + 6)
        .attr("height", rect_height + 8)
        .attr("transform", "translate(" + slider_margin.left + "," + slider_margin.top + ")")

    let rects = background_svg.selectAll(".colorRect")
        .data(d3.range(rect_width), function (d) {
            console.log(d)
            return d;
        })
        .enter()
        .append("rect")
        .attr("class", "colorRect")
        .attr("x", function (d, i) { return i - 2; })
        .attr("y", 0)
        .attr("width", 1)
        .attr("height", rect_height)
        .style("fill", function (d, i) {
            console.log(color_axis(d))
            return color_axis(d)
        })
        .style("stroke", "none")

    console.log(rects)



    // //比例尺上的拖动
    let axis_strength = d3.scaleLinear()
        .domain([-1, 1])
        .range([0, rect_width])

    var sliderSimple = d3
        .sliderBottom()
        .min(-1)
        .max(1)
        .width(140)
        .tickFormat(d3.format('.2%'))
        .ticks(0)
        .default([-1, 1])
        .displayValue(true)
        .on('onchange', val => {
            console.log(val);
            // 这里写拖动滑块后值变化后的操作
            //val为数组[l,r]，代表左右区间
        });


    slider_svg.call(sliderSimple);
    d3.select('p#value-simple').text(d3.format('.2%')(sliderSimple.value()));

}


//数据处理：初始化所有要用到的数据，将nodes，links，lineList存为全局变量
function getCausalLink(dataset, event2namefortooltip, strength, sort_method) {

    let ii = 0;
    console.log("dataset")
    console.log(dataset["single"]["event2index"])
    console.log(dataset["single"]["index2event"])

    //存储事件nodes
    for (let key in dataset["single"]["event2index"]) {
        event_color.set(key, event_color_set[ii])
        event_order.set(key, ii);
        nodes.push({
            "id": parseInt(key),
            "name": event2namefortooltip[key],
            "color": event_color.get(key),
            "order": event_order.get(key)
        })
        ii++;
    }
    for (let i = 0; i < nodes.length; i++)
        order_array.push(i)

    //存储因果边links
    //单因果i：事件索引
    for (let i = 0; i < dataset["single"]["evaluation"]["mean_a"].length; i++) {
        let sourceid = parseInt(dataset["single"]["index2event"][i.toString()])
        for (let j = 0; j < dataset["single"]["evaluation"]["mean_a"][i].length; j++) {
            let source = [];
            let source_order = [];
            let targetid = parseInt(dataset["single"]["index2event"][j.toString()])
            //这个参数是计算出来的所有事件多因果
            if (sourceid != targetid && Math.abs(dataset["single"]["evaluation"]["mean_a"][i][j]) > strength) {
                source.push(sourceid);
                source_order.push(event_order.get(sourceid.toString()))
                let set_item = { "source": source, "target": targetid }
                if (!links_Set.has(set_item)) {
                    links_Set.add(set_item)
                    links.push({
                        "source": source, "target": targetid, "strength": dataset["single"]["evaluation"]["mean_a"][i][j],
                        "source_order": source_order, "target_order": event_order.get(targetid.toString()), "isfirst": 0
                    })
                }
            }
        }
    }
    //当有combined结果的时候
    if (dataset["statuscode"] == "ok200") {
        let obj = dataset["combine"]
        for (let i = 0; i < obj.length; i++) {
            let row_index
            let column_index
            let source = [];
            let source_order = []
            let targetid;
            for (let j = 0; j < obj[i]["candidate_events"].length; j++) {
                source.push(Number(obj[i]["candidate_events"][j]))
                source_order.push(event_order.get(obj[i]["candidate_events"][j]))
                row_index = obj[i]["result_candidate"]["event2index"][obj[i]["candidate_events"][j]]
            }
            targetid = Number(obj[i]["target_event"])
            column_index = obj[i]["result_candidate"]["event2index"][obj[i]["target_event"]]
            let strength = obj[i]["result_candidate"]["evaluation"]["mean_a"][row_index][column_index]
            let set_item = { "source": source, "target": targetid }
            if (!links_Set.has(set_item)) {
                links_Set.add(set_item)
                links.push({
                    "source": source, "target": targetid, "strength": strength,
                    "source_order": source_order.sort(), "target_order": event_order.get(targetid.toString()), "isfirst": 0
                })
            }
        }
    }

    //links排序
    links = sortLinks(links, sort_method)

    //暂时没用到的绘制hypergraph的
    for (let i = 0; i < 5; i++) {
        if (links[i].target_order != 0)
            break;
        let name = "e" + i
        let sources = []
        for (let j = 0; j < links[i].source_order.length; j++) {
            sources.push(links[i].source_order[j].toString())
        }
        let targets = []
        targets.push(links[i].target_order.toString())
        let projection
        if (links[i].strength > 0) {
            projection = "excite"
        } else {
            projection = "inhibit"
        }
        dhgs.push({
            "name": name, "sources": sources, "targets": targets, "projection": projection
        })
    }


    console.log("links' size")
    console.log(links.length)

    //将links合并为lineList
    console.log("convert links to lineList")
    lineList = convertLinkToList(links)
    return { "nodes": nodes, "links": links, "dhgs": dhgs, "lineList": lineList }
}

//数据处理：排列links
function sortLinks(links, sort_method) {
    //第一种排序方式 target-因果强度
    if (sort_method === 1) {
        links.sort(
            function (a, b) {
                if (a.target_order === b.target_order) {
                    return b.strength - a.strength;
                }
                return a.target_order - b.target_order;
            });
    } else if (sort_method == 2) {
        //第二种排序方式  target-原因数量-因果强度
        links.sort(
            function (a, b) {
                if (a.target_order === b.target_order) {
                    if (a.source_order.length == b.source_order.length)
                        return b.strength - a.strength;
                    return a.source_order.length - b.source_order.length;
                }
                return a.target_order - b.target_order;
            });
    } else {
        //第三种排序方式  target-原因数量-原因id
        links.sort(
            function (a, b) {
                if (a.target_order === b.target_order) {
                    if (a.source_order.length == b.source_order.length) {
                        for (let i = 0; i < a.source_order.length; i++) {
                            if (a.source_order[i] === b.source_order[i]) {
                                continue;
                            } else {
                                return a.source_order[i] - b.source_order[i];
                            }
                        }
                        // return b.strength - a.strength;
                    }
                    return a.source_order.length - b.source_order.length;
                }
                return a.target_order - b.target_order;
            });
    }
    return links;
}

//数据处理：根据排序后的links进行合并得到lineList
function convertLinkToList(links) {
    // let lineList = [];
    links[0].isfirst = 1;
    for (let i = 1; i < links.length; i++) {
        if (links[i].source_order.length != links[i - 1].source_order.length || (links[i].target_order != links[i - 1].target_order)) {
            links[i].isfirst = 1;
            continue;
        } else {
            let n = links[i].source_order.length;
            for (let j = 0; j < n - 1; j++) {
                if (links[i].source_order[j] != links[i - 1].source_order[j]) {
                    links[i].isfirst = 1;
                    break;
                }
            }
        }
    }
    for (let i = 0; i < links.length; i++) {
        if (links[i].isfirst == 1) { //第一条结果
            let source_and_order = []
            if (links[i].source_order.length > 1) {
                for (let j = 0; j < links[i].source_order.length - 1; j++) {
                    source_and_order.push(links[i].source_order[j])
                }
            }
            let source_or_order_strength = new Map();
            source_or_order_strength.set(links[i].source_order[links[i].source_order.length - 1], links[i].strength)
            // source_or_order_strength.push({"order":links[i].source_order[links[i].source_order.length-1] , "strength":links[i].strength})
            lineList.push({
                "source_or_order_strength": source_or_order_strength,
                "source_and_order": source_and_order,
                "target_order": links[i].target_order
            })
        } else { //非第一条
            lineList[lineList.length - 1].source_or_order_strength.set(links[i].source_order[links[i].source_order.length - 1], links[i].strength)
        }
    }
    for (let i = 0; i < lineList.length; i++) {
        let node_group = new Map(); //为每个node分组，属于no_use或者target或者or或者and
        let d = []
        let head_order = order_array.length - 1;
        let tail_order = 0;
        for (let j = 0; j < order_array.length; j++) {
            if (j === lineList[i].target_order          //为目标点
                || lineList[i].source_and_order === null     //属于and
                || lineList[i].source_and_order.indexOf(j) != -1
                || Array.from(lineList[i].source_or_order_strength.keys()).indexOf(j) != -1) {        //属于or
                if (j < head_order)
                    head_order = j;
                if (j > tail_order)
                    tail_order = j;
                continue;
            } else {
                node_group.set(j, "no")
                d.push(j)
            }
        }
        node_group.set(lineList[i].target_order, "target");
        if (lineList[i].source_and_order != null) {
            for (let tempnode in lineList[i].source_and_order) {
                node_group.set(lineList[i].source_and_order[tempnode], "and")
            }
        }
        console.log(lineList[i].source_or_order_strength.keys())
        for (let [tempnode, strength] of lineList[i].source_or_order_strength) {
            node_group.set(tempnode, "or")
        }
        lineList[i].no_use_order = d;
        lineList[i].head_order = head_order;
        lineList[i].tail_order = tail_order;
        lineList[i].node_group = node_group;
    }
    console.log("convert")
    console.log(lineList)
    return lineList;
}

//可视化：绘制主要视图
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


function circlecolor(link, j) {
    var colorScale = d3.scaleSequential(d3.interpolatePRGn).domain([-1, 1])
    if (link.source_order.indexOf(j) == -1 && link.target_order != j) {
        return "#E3E2E2"
    } else if (link.source_order.indexOf(j) != -1) {
        return colorScale(link.strength)
    } else {
        return "red"
    }
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

//可视化：
function DrawDH(div, dataset, event2namefortooltip, strength, method) {
    let graphdataset = getCausalLink(dataset, event2namefortooltip, strength, method)
    let data = graphdataset.dhgs
    let dhgs = new Map();

    dhgs.set("G2", data);
    let links = [];

    // we convert the DHG list to a set of links
    dhgs.forEach(function (edges, name) { //遍历每一个超图
        edges.forEach(function (edge) { //遍历当前超图的每一条边
            // three hidden nodes for projection placement
            inv1 = "inv1_" + edge.name; //每条边都生成三种inv node？
            inv2 = "inv2_" + edge.name;
            inv3 = "inv3_" + edge.name;
            links.push({ source: inv1, target: inv2, type: "pointed", dhg: name }); //inv1 - point - inv2
            links.push({ source: inv2, target: inv3, type: "plain", dhg: name }); //inv2 - plain - inv3
            edge.sources.forEach(function (src) {
                links.push({ source: src, target: inv1, type: "plain", dhg: name })
            }); //形成（source1 , source2 ）->inv1 -> inv2 -> inv3 ->(target1,target2)
            edge.targets.forEach(function (target) {
                links.push({ source: inv3, target: target, type: "plain", dhg: name })
            });
        });
    });

    let nodes = {};

    links.forEach(function (link) {
        link.source = nodes[link.source] || (nodes[link.source] = { name: link.source });
        link.target = nodes[link.target] || (nodes[link.target] = { name: link.target });
        if (link.source.name.includes("inv") && !nodes[link.source.name].label)
            nodes[link.source.name].label = " ";
        // projection should have a visible label
        if (link.target.name.includes("inv2"))
            nodes[link.target.name].label =
                dhgs.get(link.dhg).filter(dhg => {
                    return dhg.name === link.target.name.substring(5)
                })[0].projection;
    });

    //准备画布
    let margin = { top: 5, right: 5, bottom: 5, left: 5 }, //这是svg相对于div的偏移
        padding = { top: 0, right: 0, bottom: 0, left: 0 },  //相对于svg内部
        width = 871 - margin.left - margin.right,
        height = 475 - margin.top - margin.bottom;


    // var width = window.innerWidth,
    //     height = window.innerHeight;

    let force = d3v3.layout.force()
        .nodes(d3v3.values(nodes))
        .links(links)
        .linkDistance(function (link) {
            return (link.source.name.includes("inv") && link.target.name.includes("inv")) ? 0 : 30;
        })
        .chargeDistance(300)
        .charge(function (node) {
            return (node.name.includes("inv")) ? -100 : -400;
        })
        .size([width, height])
        .on("tick", tick)
        .start();

    d3v3.select(div)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

    let svg = d3v3.select(div).append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    // console.log(force)
    // console.log("nodes")
    // console.log(nodes)
    // console.log("links")
    // console.log(links)

    // Per-type markers, as they don't inherit styles.
    svg.append("defs").selectAll("marker")
        .data(["pointed"]) // arrows only on projections
        .enter().append("marker")
        .attr("id", function (d) {
            return d;
        })
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 10)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5");

    function stringToColor(str) {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        var color = '#';
        for (var i = 0; i < 3; i++) {
            var value = (hash >> (i * 8)) & 0xFF;
            color += ('00' + value.toString(16)).substr(-2);
        }
        return color;
    }

    let path = svg.append("g").selectAll("path")
        .data(force.links())
        .enter().append("path")
        .style("stroke", function (d) {
            return stringToColor(d.dhg + "freshmeat");
        })
        .attr("fill", "none")
        .attr("class", function (d) {
            return "link " + d.type;
        })
        .attr("marker-end", function (d) {
            return "url(#" + d.type + ")";
        });

    let circle = svg.append("g").selectAll("circle")
        .data(force.nodes().filter(n => {
            return !n.name.includes("inv")
        }))
        .enter().append("circle")
        .attr("r", 4)
        .call(force.drag);

    let text = svg.append("g").selectAll("text")
        .data(force.nodes())
        .enter().append("text")
        .attr("x", 8)
        .attr("y", ".31em")
        .text(function (d) {
            return d.label ? d.label : d.name;
        }); // a label overrides name

    // Use elliptical arc path segments to doubly-encode directionality.
    function tick() {
        path.attr("d", linkArc);
        circle.attr("transform", transform);
        text.attr("transform", transform);
    }

    function linkArc(d) {
        var dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y,
            dr = Math.sqrt(dx * dx + dy * dy) * 4;
        return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
    }

    function transform(d) {
        return "translate(" + d.x + "," + d.y + ")";
    }
}

function resultformat(resultformat) {
    //处理resultformat成d3需要的格式
    let sequence = []
    for (let i = 0; i < resultformat.length; i++) {
        let tempsequence = []
        for (let j = 0; j < resultformat[i]["day"].length; j++) {
            let tempevent = {}
            tempevent.eventname = resultformat[i]["events"][j]
            tempevent.eventindex = resultformat[i]["marks"][j]
            tempevent.eventtime = resultformat[i]["day"][j]
            tempevent.eventcolor = event_color.get(tempevent.eventindex)
            tempsequence[j] = tempevent;
        }
        sequence.push(tempsequence)
    }
    return sequence
}

function DrawCausalityDAG(div, dataset, event2namefortooltip) {
    let margin, width, height, svg;
    if (div == "#OverviewVis") {
        margin = { top: 10, right: 5, bottom: 10, left: 5 },
            width = 871.2 - margin.left - margin.right,
            height = 475.2 - margin.top - margin.bottom;
        svg = d3.select(div)
            .append("svg")
            .attr("id", "OverviewSvg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
    }


    var graph = { "nodes": dataset.nodes, "links": dataset.links }
    console.log(dataset.nodes.length)
    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svg.append("svg:defs").selectAll("marker")
        .data(["end"])      // Different link/path types can be defined here
        .enter().append("svg:marker")    // This section adds in the arrows
        .attr("class", "arrow1")
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -1.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("class", "arrow")

    const R = 6;
    const simulation = d3.forceSimulation()
        .nodes(graph.nodes)
        .alphaDecay(0.8)
        .force('link', d3.forceLink(graph.links).id(d => d.id).distance(0).strength(1))
        .force('charge', d3.forceManyBody().strength(-120))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide().radius(R + 1).iterations(2))

        .on('tick', ticked)


    simulation.force('link')
        .links(graph.links);


    let path = svg.selectAll('line')
        .data(graph.links)
        .enter().append('path')
        .style('stroke', function (d) {
            if (d.value > 0)
                return "#469d89"
            else
                return "#b6838d"
        })

    path
        .attr('class', 'link')
        .attr("stroke-width", function (d) {
            return Math.abs(d.value * 2)
        })
        .attr("id", function (d) {
            return "linkid" + d.source.id + "_" + d.target.id
        })
        .attr("marker-end", "url(#end)")
        .attr('fill', 'none')
        .on('mouseover.tooltip', function (d) {
            tooltip.transition()
                .duration(300)
                .style("opacity", .8);
        })
        .on("mouseout.tooltip", function () {
            tooltip.transition()
                .duration(100)
                .style("opacity", 0);
        })
        .on('mouseout.fade', fade(1))
        .on("mousemove", function () {
            tooltip.style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY + 10) + "px");
        })
        .on('mouseout', function () {
            path.attr("marker-end", "url(#end)")
        })
        .on('mouseover', function (d) {
            fade(0.1)
        })


    let node = svg.selectAll('.node')
        .data(graph.nodes)
        .enter().append('g')
        .attr('class', 'node')
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append('circle')
        .attr('r', R).attr("fill", function (d) {
            return myColor[d.group];
        })
        .attr("id", function (d) {
            return "event_" + d.id
        })

        .on('mouseover.fade', fade(0.1))
        .on("mouseout.tooltip", function () {
            tooltip.transition()
                .duration(100)
                .style("opacity", 0);
        })
        .on('mouseout.fade', fade(1))
        .on('mouseout', function () {
            path.attr("marker-end", "url(#end)")
        })
        .on("mousemove", function () {
            tooltip.style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY + 10) + "px");
        })
        .on('dblclick', releasenode)

    node.append('text')
        .attr('dx', 12)
        .attr('dy', '.35em')
        .text(d => event2namefortooltip[d.id]);


    function ticked() {


        path.attr("d", function (d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" +
                d.source.x + "," +
                d.source.y + "A" +
                dr + "," + dr + " 0 0,1 " +
                d.target.x + "," +
                d.target.y;
        });

        node.attr("transform", function (d) {
            if (d.x < 0) {
                d.x = R
            }
            if (d.y < 0) {
                d.y = R
            }
            if (d.x > width) {
                d.x = width - R
            }
            if (d.y > height) {
                d.y = height - R
            }
            return "translate(" + d.x + "," + d.y + ")"
        })
        // .attr('transform', d => `translate(${d.x},${d.y})`);
    }

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        //d.fx = null;
        //d.fy = null;
    }

    function releasenode(d) {
        d.fx = null;
        d.fy = null;
    }

    const linkedByIndex = {};
    graph.links.forEach(d => {
        linkedByIndex[`${d.source.index},${d.target.index}`] = 1;
    });

    function isConnected(a, b) {
        return linkedByIndex[`${a.index},${b.index}`] || linkedByIndex[`${b.index},${a.index}`] || a.index === b.index;
    }

    function fade(opacity) {
        return d => {
            node.style('stroke-opacity', function (o) {
                const thisOpacity = isConnected(d, o) ? 1 : opacity;
                this.setAttribute('fill-opacity', thisOpacity);
                return thisOpacity;
            });

            path.style('stroke-opacity', o => (o.source === d || o.target === d ? 1 : opacity))
                .attr("marker-end", o => (o.source === d || o.target === d ? "url(#end)" : null))
            svg.select('.marker').style('fill-opacity', o => (o.source === d || o.target === d ? 1 : opacity))

        };
    }

}


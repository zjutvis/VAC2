//数据处理：初始化所有要用到的数据，将nodes，links，lineList存为全局变量    水平排序垂直排序分开
function getCausalLink(operation, dataset, event2namefortooltip, strength, sort_method, select_strengths, select_max_causes, vertical_order, horizontal_order, change_para) {
    if (operation === "initial") {
        //流程：存储node，存储link，link排序，根据node和link聚类，根据聚类结果为node分配color，将link合并为lineList
        //ii:记录事件个数
        let ii = 0;
        //聚类结果需要的变量
        let node_data = [];
        let edge_data = [];
        let rows, columns;
        let arr = [];

        //存储事件nodes
        for (let key in dataset["single"]["event2index"]) {
            // event_color.set(key, event_color_set[ii])
            event_order.set(key, ii);
            nodes.push({
                "id": parseInt(key),
                "name": event2namefortooltip[key],
                "color": event_color.get(key),
                "order": event_order.get(key)
            })
            node_data.push(parseInt(key))
            ii++;
        }
        for (let i = 0; i < nodes.length; i++)
            order_array.push(i)

        console.log(event_color)
        console.log(nodes)
        //存储因果边links
        //单因果i：事件索引
        for (let i = 0; i < dataset["single"]["evaluation"]["mean_a"].length; i++) {
            let sourceid = parseInt(dataset["single"]["index2event"][i.toString()])
            for (let j = 0; j < dataset["single"]["evaluation"]["mean_a"][i].length; j++) {
                let source = [];
                let source_order = [];
                let targetid = parseInt(dataset["single"]["index2event"][j.toString()])
                //这个参数是计算出来的所有事件多因果
                if (sourceid != targetid && Math.abs(dataset["single"]["evaluation"]["mean_a"][i][j]) >= 0.3) {
                    source.push(sourceid);
                    source_order.push(event_order.get(sourceid.toString()))
                    let set_item = { "source": source, "target": targetid }
                    if (!links_Set.has(set_item)) {
                        links_Set.add(set_item)
                        links.push({
                            "source": source,
                            "target": targetid,
                            "strength": dataset["single"]["evaluation"]["mean_a"][i][j],
                            "source_order": source_order,
                            "target_order": event_order.get(targetid.toString()),
                            "isfirst": 0
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
                if (!links_Set.has(set_item) && Math.abs(strength) >= 0.3) {
                    links_Set.add(set_item)
                    links.push({
                        "source": source,
                        "target": targetid,
                        "strength": strength,
                        "source_order": source_order.sort(function(a,b){return a-b}),
                        "target_order": event_order.get(targetid.toString()),
                        "isfirst": 0
                    })
                }
            }
        }

        //links排序
        links = sortLinks(links, sort_method)

        rows = nodes.length
        columns = nodes.length
        //edge_data和node_data聚类
        for (let r = 0; r < rows; r++) {
            arr[r] = Array.apply(null, Array(columns)).map(function (i) {
                return 0;
            });
        }
        for (let j = 0; j < links.length; j++) {//如果小于0则不继续划分 建立个flag 最多存在100条边，将两点之后间的weight固定
            let x = links[j].source_order[0];
            let y = links[j].target_order;
            if (links[j].strength > 0 && arr[x][y] === 0) {
                arr[x][y] = 1;
                edge_data.push({
                    "source": node_data[links[j].source_order[0]],//有很多个点融合？所以取第几个都是一样？
                    "target": links[j].target,
                    "weight": Math.round(links[j].strength * 100)
                })
            }
        }
        var community = jLouvain().nodes(node_data).edges(edge_data);
        // 聚类结果exp{0: 0, 1: 1, 2: 2, 3: 3, 4: 2, 5: 0, 6: 4, 7: 5, 8: 0, 9: 6, 10: 0, 11: 7, 12: 8, 13: 9, 14: 10, 15: 11, 16: 12, 17: 12, 18: 13, 19: 14, 20: 15, 21: 16, 22: 17, 23: 18, 24: 19, 25: 20, 26: 21, 27: 22, 28: 23, 29: 12, 30: 24, 31: 25, 32: 12, 33: 2, 34: 26, 35: 26, 36: 15, 37: 26, 38: 0, 39: 5, 40: 0, 41: 16, 42: 17, 43: 11, 44: 11, 45: 27, 46: 28, 47: 28, 48: 28, 49: 24, 50: 0, 51: 0, 52: 16, 53: 15, 54: 29, 55: 6, 56: 29, 57: 27, 58: 27, 59: 0, 60: 23, 61: 23, 62: 6, 63: 27, 64: 30, 65: 30, 66: 11, 67: 11, 68: 11, 69: 17, 70: 17, 71: 10, 72: 10, 73: 3}
        var community_assignment_result = community();
        console.log('Resulting Community Data', community_assignment_result);

        //将links合并为lineList
        console.log("convert links to lineList")
        lineList = convertLinkToList(links)

        drawgraphdataset.nodes = nodes;
        drawgraphdataset.links = links;
        drawgraphdataset.lineList = lineList;
        drawgraphdataset.community_assignment_result = community_assignment_result;
        console.log("links' size")
        console.log(drawgraphdataset.links.length)
        console.log("lineList' size")
        console.log(drawgraphdataset.lineList.length)
        console.log(drawgraphdataset.lineList)
        return drawgraphdataset
    }

    else if (operation === "change") {      //operation:"change"    改变order
        //vertical_order的操作
        if (change_para === 'vertical'){
            if (vertical_order === "id") {
                // links.filter(link => (link.strength <= select_strengths[0] || link.strength >= select_strengths[1]))
                let singlecausality = links.filter(link => (link.source.length ==1))
                //尽量紧凑
                let neworder = [nodes[0]]
                for(let t = 0 ; t < nodes.length; t ++ ){
                    //target
                    if(!neworder.some(node => ( node.id == nodes[t].id ))){
                        neworder.push(  nodes.find(node => (node.id == nodes[t].id )) )
                    }


                    //source
                    var sourcetemp = singlecausality.filter(link =>(link.target == nodes[t].id))
                    for(let p = 0 ; p < sourcetemp.length; p ++ ){
                        //if( neworder.some(node => node.id == singlecausality[p].target ) ) { //target一致
                            if(!neworder.some(node => (node.id == sourcetemp[p].source[0]))){//且不存在该元素
                                neworder.push(  nodes.find(node => (node.id == sourcetemp[p].source[0])) ) //因为已经filter length ==1,所以[0]
                            }
                       // }
                    }
                }
                // neworder.forEach(function(d,i){
                //     d.order = i
                // })
                // console.log("new order ")
                // console.log(neworder)


                nodes = neworder

                for (let i = 0; i < nodes.length; i++) {
                    old_new_order.set(nodes[i].order, i)
                    nodes[i].order = i;
                    event_order.set(nodes[i].id, nodes[i].order);
                }
                drawgraphdataset.nodes = nodes;
                //把link的id改过来
                for (let i = 0; i < links.length; i++) {
                    links[i].isfirst = 0;
                    for (let j = 0; j < links[i].source_order.length; j++) {
                        links[i].source_order[j] = old_new_order.get(links[i].source_order[j])
                    }
                    links[i].target_order = old_new_order.get(links[i].target_order)
                    links[i].source_order = links[i].source_order.sort(function(a,b){return a-b})
                }


                //links排序
                links = sortLinks(links, sort_method)
                drawgraphdataset.links = links.filter(link => (link.strength <= select_strengths[0] || link.strength >= select_strengths[1]))
                for (let i = 0; i < drawgraphdataset.links.length; i++) {
                    drawgraphdataset.links[i].isfirst = 0
                }
                drawgraphdataset.lineList = (convertLinkToList(drawgraphdataset.links)).filter(line => ((line.source_and_order.length + 1) <= select_max_causes))
                drawgraphdataset.links = restoreLinksFromLineList(drawgraphdataset.lineList)



            }
            else if (vertical_order === "alphabetical") {
                //给nodes按照字母排序
                nodes = nodes.sort(function (a, b) { return a.name.localeCompare(b.name) })
                for (let i = 0; i < nodes.length; i++) {
                    old_new_order.set(nodes[i].order, i)
                    nodes[i].order = i;
                    event_order.set(nodes[i].id, nodes[i].order);
                }
                drawgraphdataset.nodes = nodes;
                //把link的id改过来
                for (let i = 0; i < links.length; i++) {
                    links[i].isfirst = 0;
                    for (let j = 0; j < links[i].source_order.length; j++) {
                        links[i].source_order[j] = old_new_order.get(links[i].source_order[j])
                    }
                    links[i].target_order = old_new_order.get(links[i].target_order)
                    links[i].source_order = links[i].source_order.sort(function(a,b){return a-b})
                }


                //links排序
                links = sortLinks(links, sort_method)
                drawgraphdataset.links = links.filter(link => (link.strength <= select_strengths[0] || link.strength >= select_strengths[1]))
                for (let i = 0; i < drawgraphdataset.links.length; i++) {
                    drawgraphdataset.links[i].isfirst = 0
                }
                drawgraphdataset.lineList = (convertLinkToList(drawgraphdataset.links)).filter(line => ((line.source_and_order.length + 1) <= select_max_causes))
                drawgraphdataset.links = restoreLinksFromLineList(drawgraphdataset.lineList)
            }
            else if (vertical_order === "manual") {
                drawgraphdataset.nodes = nodes;
                //把link的id改过来
                for (let i = 0; i < links.length; i++) {
                    links[i].isfirst = 0;
                    for (let j = 0; j < links[i].source_order.length; j++) {
                        links[i].source_order[j] = old_new_order.get(links[i].source_order[j])
                    }
                    links[i].target_order = old_new_order.get(links[i].target_order)
                    links[i].source_order = links[i].source_order.sort(function(a,b){return a-b})
                }

                //links排序
                links = sortLinks(links, sort_method)

                drawgraphdataset.links = links.filter(link => (link.strength <= select_strengths[0] || link.strength >= select_strengths[1]))
                for (let i = 0; i < drawgraphdataset.links.length; i++) {
                    drawgraphdataset.links[i].isfirst = 0
                }
                drawgraphdataset.lineList = (convertLinkToList(drawgraphdataset.links)).filter(line => ((line.source_and_order.length + 1) <= select_max_causes))
                drawgraphdataset.links = restoreLinksFromLineList(drawgraphdataset.lineList)
            }
            else {//cluster
                nodes = nodes.sort(function (a, b) {
                    return cluster_order.indexOf(a.id) - cluster_order.indexOf(b.id)
                })
                console.log(nodes)
                for (let i = 0; i < nodes.length; i++) {
                    old_new_order.set(nodes[i].order, i)
                    nodes[i].order = i
                    event_order.set(nodes[i].id, nodes[i].order);
                }
                console.log(old_new_order)
                drawgraphdataset.nodes = nodes;
                //把link的id改过来
                for (let i = 0; i < links.length; i++) {
                    links[i].isfirst = 0;
                    for (let j = 0; j < links[i].source_order.length; j++) {
                        links[i].source_order[j] = old_new_order.get(links[i].source_order[j])
                    }
                    links[i].target_order = old_new_order.get(links[i].target_order)
                    links[i].source_order = links[i].source_order.sort(function(a,b){return a-b})
                }

                //links排序
                links = sortLinks(links, sort_method)

                drawgraphdataset.links = links.filter(link => (link.strength <= select_strengths[0] || link.strength >= select_strengths[1]))
                for (let i = 0; i < drawgraphdataset.links.length; i++) {
                    drawgraphdataset.links[i].isfirst = 0
                }
                drawgraphdataset.lineList = (convertLinkToList(drawgraphdataset.links)).filter(line => ((line.source_and_order.length + 1) <= select_max_causes))
                drawgraphdataset.links = restoreLinksFromLineList(drawgraphdataset.lineList)
            }
        }
        //horizontal_order的操作
        else {
            if (horizontal_order === "number") {
                drawgraphdataset.links = drawgraphdataset.links.filter(link => (link.strength <= select_strengths[0] || link.strength >= select_strengths[1]))
                for (let i = 0; i < drawgraphdataset.links.length; i++) {
                    drawgraphdataset.links[i].isfirst = 0
                }
                drawgraphdataset.lineList = (convertLinkToList(drawgraphdataset.links)).filter(line => ((line.source_and_order.length + 1) <= select_max_causes))
                drawgraphdataset.lineList = drawgraphdataset.lineList.sort(function (a, b) { return a.source_and_order.length - b.source_and_order.length })
                drawgraphdataset.links = restoreLinksFromLineList(drawgraphdataset.lineList)

            }
            else if (horizontal_order === "strength") {
                drawgraphdataset.links = links.filter(link => (link.strength <= select_strengths[0] || link.strength >= select_strengths[1]))
                for (let i = 0; i < drawgraphdataset.links.length; i++) {
                    drawgraphdataset.links[i].isfirst = 0
                }
                drawgraphdataset.lineList = (convertLinkToList(drawgraphdataset.links)).filter(line => ((line.source_and_order.length + 1) <= select_max_causes))

                drawgraphdataset.lineList = drawgraphdataset.lineList.sort(
                    function (a, b) {
                        let a_value_arr = Array.from(a.source_or_order_strength.map(a => a.strength))
                        let b_value_arr = Array.from(b.source_or_order_strength.map(a => a.strength))
                        return (a_value_arr.filter(d => d > 0).length - a_value_arr.filter(d => d < 0).length) - (b_value_arr.filter(d => d > 0).length - b_value_arr.filter(d => d < 0).length)
                    })
                drawgraphdataset.links = restoreLinksFromLineList(drawgraphdataset.lineList)
            }
            else if (horizontal_order.substr(0, 5) === "click") {
                drawgraphdataset.lineList = reorderingLineList(drawgraphdataset.lineList, parseInt(horizontal_order.substr(5)))
            }
            else if (horizontal_order === 'manual') {
                console.log(center_left, horizontalDragEnd, horizontalDragStart);
                if (horizontalDragStart < horizontalDragEnd) {
                    var horizontal_temp = drawgraphdataset.lineList[center_left + horizontalDragStart];
                    for (var i = center_left + horizontalDragStart; i < center_left + horizontalDragEnd; i++) {
                        drawgraphdataset.lineList[i] = drawgraphdataset.lineList[i + 1];
                    }
                    drawgraphdataset.lineList[center_left + horizontalDragEnd] = horizontal_temp;
                } else {
                    var horizontal_temp = drawgraphdataset.lineList[center_left + horizontalDragStart];
                    for (var i = center_left + horizontalDragStart; i > center_left + horizontalDragEnd; i--) {
                        drawgraphdataset.lineList[i] = drawgraphdataset.lineList[i - 1];
                    }
                    drawgraphdataset.lineList[center_left + horizontalDragEnd] = horizontal_temp;
                }
            } else {      //"default"
            }
        }
    }

    else if (operation === "filter") {   //operation:"filter"    过滤数据
        drawgraphdataset.links = links.filter(link => (link.strength <= select_strengths[0] || link.strength >= select_strengths[1]))
        for (let i = 0; i < drawgraphdataset.links.length; i++) {
            drawgraphdataset.links[i].isfirst = 0
        }
        drawgraphdataset.lineList = (convertLinkToList(drawgraphdataset.links)).filter(line => ((line.source_and_order.length + 1) <= select_max_causes))
        drawgraphdataset.links = restoreLinksFromLineList(drawgraphdataset.lineList)
    }
    else {
    }
    console.log("links.length" + links.length)
    console.log("drawgraphdataset.links.length" + drawgraphdataset.links.length)
    console.log("lineList.length" + lineList.length)
    console.log("drawgraphdataset.lineList.length" + drawgraphdataset.lineList.length)
    return drawgraphdataset
}

//数据处理：初始化所有要用到的数据，将nodes，links，lineList存为全局变量    水平排序垂直排序分开
function getCausalLinkWithDelete(operation, dataset, event2namefortooltip, strength, sort_method, select_strengths, select_max_causes, vertical_order, horizontal_order) {
    //给的是drawdata里面的数据 但是要保证从link删除

    if (deletflagstatus === "circle") {
        links = links.filter(function (item) {
            return item.source_order.length != drawgraphdataset.links[deletedIndexOfLinks].source_order.length ||
                item.strength != drawgraphdataset.links[deletedIndexOfLinks].strength || item.target_order != drawgraphdataset.links[deletedIndexOfLinks].target_order
        });
        if (deletedIndexOfLinks != -1) {
            // console.log("will delete")
            // console.log(links.splice(deletedIndexOfLinks, 1));
            console.log(drawgraphdataset.links.splice(deletedIndexOfLinks, 1));
        }
    }
    else if (deletflagstatus === "entity") {
        // links = links.filter(obj=>
        //     obj.target_order !== deletedIndexOfEntity
        // )
        //  links = links.filter(obj=>
        //     !obj.source_order.includes(deletedIndexOfEntity)
        // )
        links = links.filter(obj =>
        (!obj.source_order.includes(deletedIndexOfEntity)
            & (obj.target_order !== deletedIndexOfEntity))
        )
    }

    drawgraphdataset.links = links
    console.log("drawgraphdataset.links.length" + drawgraphdataset.links.length)
    drawgraphdataset.links = (drawgraphdataset.links).filter(link => (link.strength <= select_strengths[0] || link.strength >= select_strengths[1]))
    console.log("drawgraphdataset.links.length" + drawgraphdataset.links.length)
    for (let i = 0; i < drawgraphdataset.links.length; i++) {
        drawgraphdataset.links[i].isfirst = 0
    }
    drawgraphdataset.lineList = (convertLinkToList(drawgraphdataset.links)).filter(line => ((line.source_and_order.length + 1) <= select_max_causes))
    drawgraphdataset.links = restoreLinksFromLineList(drawgraphdataset.lineList)
    //horizontal_order的操作
    if (horizontal_order === "number") {
        drawgraphdataset.lineList = drawgraphdataset.lineList.sort(function (a, b) { return a.source_and_order.length - b.source_and_order.length })
        drawgraphdataset.links = restoreLinksFromLineList(drawgraphdataset.lineList)
    }
    else if (horizontal_order === "strength") {
        drawgraphdataset.lineList = drawgraphdataset.lineList.sort(
            function (a, b) {
                // let a_value_arr = Array.from(a.source_or_order_strength.values())
                // let b_value_arr = Array.from(b.source_or_order_strength.values())
                let a_value_arr = Array.from(a.source_or_order_strength.map(a => a.strength))
                let b_value_arr = Array.from(b.source_or_order_strength.map(a => a.strength))
                return (a_value_arr.filter(d => d > 0).length - a_value_arr.filter(d => d < 0).length) - (b_value_arr.filter(d => d > 0).length - b_value_arr.filter(d => d < 0).length)
            })
        drawgraphdataset.links = restoreLinksFromLineList(drawgraphdataset.lineList)
    }
    else {      //"default"

    }
    console.log("links.length" + links.length)
    console.log("drawgraphdataset.links.length" + drawgraphdataset.links.length)
    console.log("lineList.length" + lineList.length)
    console.log("drawgraphdataset.lineList.length" + drawgraphdataset.lineList)
    return drawgraphdataset
}

//数据处理：初始化所有要用到的数据，将nodes，links，lineList存为全局变量    水平排序垂直排序分开
function getCausalLinkWithDeleteEntity(operation, dataset, event2namefortooltip, strength, sort_method, select_strengths, select_max_causes, vertical_order, horizontal_order) {
    //给的是drawdata里面的数据 但是要保证从link删除

    //deletedIndexOfEntity,删除一行数据
    // for(var deletedIndexOfEntityitem in deletedIndexOfEntity){
    //         links = links.filter(function (item) {
    //     return item.source_order.length != drawgraphdataset.links[deletedIndexOfEntityitem].source_order.length ||
    //         item.strength != drawgraphdataset.links[deletedIndexOfEntityitem].strength || item.target_order != drawgraphdataset.links[deletedIndexOfEntityitem].target_order
    // });
    // }
    if (deletedIndexOfEntity != -1) {
        for (var i = 0; i < drawgraphdataset.links.length; i++) {
            if (drawgraphdataset.links[i].target_order == deletedIndexOfEntity) {
                drawgraphdataset.links.splice(i, 1);
            }
        }
    }


    drawgraphdataset.links = links
    console.log("drawgraphdataset.links.length" + drawgraphdataset.links.length)
    drawgraphdataset.links = (drawgraphdataset.links).filter(link => (link.strength <= select_strengths[0] || link.strength >= select_strengths[1]))
    console.log("drawgraphdataset.links.length" + drawgraphdataset.links.length)
    for (let i = 0; i < drawgraphdataset.links.length; i++) {
        drawgraphdataset.links[i].isfirst = 0
    }
    drawgraphdataset.lineList = (convertLinkToList(drawgraphdataset.links)).filter(line => ((line.source_and_order.length + 1) <= select_max_causes))
    drawgraphdataset.links = restoreLinksFromLineList(drawgraphdataset.lineList)
    //horizontal_order的操作
    if (horizontal_order === "number") {
        drawgraphdataset.lineList = drawgraphdataset.lineList.sort(function (a, b) { return a.source_and_order.length - b.source_and_order.length })
        drawgraphdataset.links = restoreLinksFromLineList(drawgraphdataset.lineList)
    }
    else if (horizontal_order === "strength") {
        drawgraphdataset.lineList = drawgraphdataset.lineList.sort(
            function (a, b) {
                // let a_value_arr = Array.from(a.source_or_order_strength.values())
                // let b_value_arr = Array.from(b.source_or_order_strength.values())
                let a_value_arr = Array.from(a.source_or_order_strength.map(a => a.strength))
                let b_value_arr = Array.from(b.source_or_order_strength.map(a => a.strength))
                return (a_value_arr.filter(d => d > 0).length - a_value_arr.filter(d => d < 0).length) - (b_value_arr.filter(d => d > 0).length - b_value_arr.filter(d => d < 0).length)
            })
        drawgraphdataset.links = restoreLinksFromLineList(drawgraphdataset.lineList)
    }
    else {      //"default"

    }
    console.log("links.length" + links.length)
    console.log("drawgraphdataset.links.length" + drawgraphdataset.links.length)
    console.log("lineList.length" + lineList.length)
    console.log("drawgraphdataset.lineList.length" + drawgraphdataset.lineList)
    return drawgraphdataset
}


function reorderingLineList(templineList, clickorder) {
    var temp = [];
    for (var i = 0; i < templineList.length; i++) {
        if (templineList[i].node_group.get(clickorder) === 'target') {
            temp.push(templineList[i])
        }
    }
    for (var i = 0; i < templineList.length; i++) {
        if (templineList[i].node_group.get(clickorder) === 'or' || templineList[i].node_group.get(clickorder) === 'and') {
            temp.push(templineList[i])
        }
    }
    for (var i = 0; i < templineList.length; i++) {
        if (templineList[i].node_group.get(clickorder) === 'no') {
            temp.push(templineList[i])
        }
    }
    return temp;
}
//从用户选择的数据中生成同paohvis的数据
function getAnotherLineList(brusheddataOriginal_center) {
    let another_paohvis = []
    for (let i = 0; i < brusheddataOriginal_center.length; i++) {
        //如果是单因果绑定的，不管
        //如果是多因果绑定的，展开
        //展开方式1：改变数据结构，对单因果和多因果都沿用同一种数据结构，每个节点都有strength信息
        //展开方式2：将source or order分发，单因果不变，多因果只有分发出来的节点带有strength信息，在绘制时
        //展开方式3：单因果不变，多因果展开到

        //展开方式1：改变数据结构
        //head_order
        //no_use_order
        //node_group
        //source_and_order
        //source_or_order_strength
        //tail_order
        //target_order
        //is_single
        if (brusheddataOriginal_center[i].source_and_order.length === 0) {
            let node_group = brusheddataOriginal_center[i].node_group;
            for (let j = 0; j < order_array.length; j++) {
                if (node_group.get(j) == 'or')
                    node_group.set(j, "and")
            }

            another_paohvis.push({
                'head_order': brusheddataOriginal_center[i].head_order,
                'no_use_order': brusheddataOriginal_center[i].no_use_order,
                'node_group': node_group,
                'source_and_order_strength': brusheddataOriginal_center[i].source_or_order_strength,
                'tail_order': brusheddataOriginal_center[i].tail_order,
                'target_order': brusheddataOriginal_center[i].target_order,
                'is_single': 1,
            })
        } else {
            //方法一
            for (let j = 0; j < brusheddataOriginal_center[i].source_or_order_strength.length; j++) { //由j条多因果聚合在一起的
                //公共的部分

                let source_and_order_strength = [];
                source_and_order_strength.push(brusheddataOriginal_center[i].source_or_order_strength[j]);
                for (let k = 0; k < brusheddataOriginal_center[i].source_and_order.length; k++) {
                    source_and_order_strength.push({
                        'order': brusheddataOriginal_center[i].source_and_order[k],
                        'strength': brusheddataOriginal_center[i].source_or_order_strength[j].strength,
                        'idinlinks': brusheddataOriginal_center[i].source_or_order_strength[j].idinlinks
                    })
                }
                let target_order = brusheddataOriginal_center[i].target_order;
                let node_group = new Map(); //为每个node分组，属于no_use或者target或者and
                let d = []
                let head_order = order_array.length - 1;
                let tail_order = 0;
                for (let j = 0; j < order_array.length; j++) {
                    if (j === target_order          //为目标点
                        || Array.from(source_and_order_strength.map(a => a.order)).indexOf(j) != -1) {        //属于and
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
                node_group.set(target_order, "target");

                for (let k = 0; k < Array.from(source_and_order_strength.map(a => a.order)).length; k++) {
                    node_group.set(source_and_order_strength.map(a => a.order)[k], "and")
                }
                another_paohvis.push({
                    'head_order': head_order,
                    'no_use_order': d,
                    'node_group': node_group,
                    'source_and_order_strength': source_and_order_strength,
                    'tail_order': tail_order,
                    'target_order': target_order,
                    'is_single': 0
                })

            }
        }
    }
    return another_paohvis;
}

function restoreLinksFromLineList(templineList) {
    let templinks = []
    let ii = 0;
    for (let i = 0; i < templineList.length; i++) {
        for (let j = 0; j < templineList[i].source_or_order_strength.length; j++) {
            let templinksource = []
            templinksource = [...templineList[i].source_and_order]
            templinksource.push(templineList[i].source_or_order_strength[j].order)
            if (j === 0) {
                templinks.push({
                    "isfirst": 1, "source_order": templinksource, "target_order": templineList[i].target_order,
                    "strength": templineList[i].source_or_order_strength[j].strength
                })
            }
            else {
                templinks.push({
                    "isfirst": 0, "source_order": templinksource, "target_order": templineList[i].target_order,
                    "strength": templineList[i].source_or_order_strength[j].strength
                })
            }
            drawgraphdataset.lineList[i].source_or_order_strength[j].idinlinks = ii
            ii++;
        }
    }
    return templinks
}
//数据处理：根据排序后的links进行合并得到lineList
function convertLinkToList(templinks) {
    let new_lineList = []
    templinks[0].isfirst = 1;
    for (let i = 1; i < templinks.length; i++) {
        if (templinks[i].source_order.length != templinks[i - 1].source_order.length || (templinks[i].target_order != templinks[i - 1].target_order)) {
            templinks[i].isfirst = 1;
            continue;
        } else {
            let n = templinks[i].source_order.length;
            for (let j = 0; j < n - 1; j++) {
                if (templinks[i].source_order[j] != templinks[i - 1].source_order[j]) {
                    templinks[i].isfirst = 1;
                    break;
                }
            }
        }
    }
    for (let i = 0; i < templinks.length; i++) {
        if (templinks[i].isfirst == 1) { //第一条结果
            let source_and_order = []
            if (templinks[i].source_order.length > 1) {
                for (let j = 0; j < templinks[i].source_order.length - 1; j++) {
                    source_and_order.push(templinks[i].source_order[j])
                }
            }
            // let source_or_order_strength = new Map();
            // source_or_order_strength.set(templinks[i].source_order[templinks[i].source_order.length - 1], templinks[i].strength)
            let source_or_order_strength = []
            source_or_order_strength.push({ "order": templinks[i].source_order[templinks[i].source_order.length - 1], "strength": templinks[i].strength, "idinlinks": i })
            new_lineList.push({
                "source_or_order_strength": source_or_order_strength,
                "source_and_order": source_and_order,
                "target_order": templinks[i].target_order
            })
        } else { //非第一条
            // new_lineList[new_lineList.length - 1].source_or_order_strength.set(templinks[i].source_order[templinks[i].source_order.length - 1], templinks[i].strength)
            new_lineList[new_lineList.length - 1].source_or_order_strength.push({ "order": templinks[i].source_order[templinks[i].source_order.length - 1], "strength": templinks[i].strength, "idinlinks": i })
        }
    }

    for (let i = 0; i < new_lineList.length; i++) {
        let node_group = new Map(); //为每个node分组，属于no_use或者target或者or或者and
        let d = []
        let head_order = order_array.length - 1;
        let tail_order = 0;
        for (let j = 0; j < order_array.length; j++) {
            if (j === new_lineList[i].target_order          //为目标点
                || new_lineList[i].source_and_order === null     //属于and
                || new_lineList[i].source_and_order.indexOf(j) != -1
                || Array.from(new_lineList[i].source_or_order_strength.map(a => a.order)).indexOf(j) != -1) {        //属于or
                // || Array.from(new_lineList[i].source_or_order_strength.keys()).indexOf(j) != -1) {        //属于or
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
        node_group.set(new_lineList[i].target_order, "target");
        if (new_lineList[i].source_and_order != null) {
            for (let tempnode in new_lineList[i].source_and_order) {
                node_group.set(new_lineList[i].source_and_order[tempnode], "and")
            }
        }

        // for (let [tempnode, strength] of new_lineList[i].source_or_order_strength) {
        //     node_group.set(tempnode, "or")
        // }

        for (let k = 0; k < Array.from(new_lineList[i].source_or_order_strength.map(a => a.order)).length; k++) {
            node_group.set(new_lineList[i].source_or_order_strength.map(a => a.order)[k], "or")
        }

        new_lineList[i].no_use_order = d;
        new_lineList[i].head_order = head_order;
        new_lineList[i].tail_order = tail_order;
        new_lineList[i].node_group = node_group;
    }
    lineList = new_lineList
    return new_lineList;
}


//数据处理：处理resultformat成d3需要的格式
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
    let barchartdataset = barchartdata(sequence)
    return sequence
}
function barchartdata(sequence_para) {
    for (let i = 0; i < sequence_para.length; i++) {
        for (let j = 0; j < sequence_para[i].length; j++) {
            let temp_day = Math.floor(sequence_para[i][j].eventtime);
            max_date = Math.max(max_date, temp_day + 1)
        }
    }
    let event_barchart = []
    for (let i = 0; i < drawgraphdataset.nodes.length; i++) {
        let tempcount = []
        for (let i = 0; i < max_date; i++) {
            tempcount.push(0)
        }
        event_barchart.push({ "eventname": drawgraphdataset.nodes[i].name, "data": tempcount })
    }
    for (let i = 0; i < sequence_para.length; i++) {
        for (let j = 0; j < sequence_para[i].length; j++) {
            let temp_name = sequence_para[i][j].eventname;
            let temp_day = Math.floor(sequence_para[i][j].eventtime);

            for (let k = 0; k < event_barchart.length; k++) {
                if (event_barchart[k].eventname === temp_name) {
                    event_barchart[k].data[temp_day]++
                    maxCountInAPeriod = Math.max(maxCountInAPeriod, event_barchart[k].data[temp_day])
                }
            }
        }
    }
    maxCountInAPeriod = Math.log2(maxCountInAPeriod)
    drawgraphdataset.barchartdataset = event_barchart
    return event_barchart
}

//交互：增加一条查询
function add_query() {

    let query_source = document.getElementById("input-select-source").value
    let query_target = document.getElementById("input-select-target").value
    let query_source_order;
    let query_target_order;
    //如果输入的是名称
    if (parseInt(query_source).toString() == "NaN") {
        query_source_order = getEventOrderByName(query_source, nodes)
        query_target_order = getEventOrderByName(query_target, nodes)
    }
    //如果输入的是索引
    else {
        query_source_order = getEventOrderById(parseInt(query_source), nodes)
        query_target_order = getEventOrderById(parseInt(query_target), nodes)
    }
    let tempgraph = getDijPath(drawgraphdataset, query_source, query_target)
    console.log(tempgraph)
    all_query_history.push("history")
    if (tempgraph.nodes === null && tempgraph.edges === null) {
        let newDiv = document.createElement("div");
        newDiv.setAttribute("id", "propagation" + all_query_history.length);
        newDiv.setAttribute("style", "width:20px;height:20px");
        newDiv.innerHTML = '<div class="query-history-tag"><p class="p6">' + all_query_history.length + '</p></div>';
        document.getElementById("query-history-list").appendChild(newDiv);


        let newCannotFound = document.createElement("div");
        newCannotFound.setAttribute("id", "newCannotFound" + all_query_history.length)
        newCannotFound.setAttribute("class", "newCannotFound")
        newCannotFound.innerHTML = '<p class="p8"> No propagation</p>'
            + '<p class="p8">from <span style="color: red">' + query_source + '</span></p>'
            + '<p class="p8"> to <span style="color: red">' + query_target + '</span></p>'
            + '<p class="p8"> in <span style="color: red">' + searchArea + '</span>'
            + ' causality data</p>';
        document.getElementById("query-history-list").appendChild(newCannotFound);
    }
    else {
        DrawPrppagationGraph("align-items-center", tempgraph)
        let newDiv = document.createElement("div");
        newDiv.setAttribute("id", "propagation" + all_query_history.length);
        newDiv.setAttribute("style", "width:20px;height:20px");
        newDiv.innerHTML = '<div class="query-history-tag"><p class="p6">' + all_query_history.length + '</p></div>';

        document.getElementById("query-history-list").appendChild(newDiv);


        let newPropagation = document.getElementById("graphsandbox").cloneNode(true);
        console.log(newPropagation)
        newPropagation.setAttribute("width", "180")
        newPropagation.setAttribute("height", "100")
        newPropagation.setAttribute("margin-left", "20px")
        newPropagation.setAttribute("transform", "rotate(-180)")
        newPropagation.setAttribute("id", "smallpropagation" + all_query_history.length)
        newPropagation.setAttribute("class", "smallpropagation")
        newPropagation.setAttribute("style", "display:true")
        document.getElementById("query-history-list").appendChild(newPropagation);
        d3.select("#smallpropagation" + all_query_history.length).selectAll("g").selectAll("text")
            .attr("transform", "rotate(180)")
            .style("font-size", "6px")
            .style("font-weight", "bold")
        d3.select("#smallpropagation" + all_query_history.length).style("display", "true")
    }


    // //第一个text的内容为target，前面的text的内容为source
    // console.log(d3.select("#smallpropagation" + all_query_history.length).selectAll("g").selectAll("text"))

    // let eventnamesforpropagation = d3.select("#smallpropagation" + all_query_history.length).selectAll("g").selectAll("text")._groups

    // let eventnamesforpropagation_all = []
    // let eventnamesforpropagation_target = eventnamesforpropagation[0][0].innerHTML
    // eventnamesforpropagation_all.push(eventnamesforpropagation_target)
    // let eventnamesforpropagation_source = []
    // for (let i = 1; i < eventnamesforpropagation.length; i++) {
    //     eventnamesforpropagation_source.push(eventnamesforpropagation[i][0].innerHTML)
    //     eventnamesforpropagation_all.push(eventnamesforpropagation[i][0].innerHTML)
    // }

    // console.log(eventnamesforpropagation_all)
    // let newBarChartsDiv = document.createElement("div");
    // newBarChartsDiv.setAttribute("id", "newBarChartsDiv" + all_query_history.length)
    // let g_width = 180
    // let g_height = 100

    // document.getElementById("query-history-list").appendChild(newBarChartsDiv);
    // let newBarChartSvg = d3.select("#newBarChartsDiv" + all_query_history.length)
    //     .append("svg")
    //     .attr("width", function () {
    //         return g_width * eventnamesforpropagation_all.length + "px"
    //     })
    //     .attr("height", "100px")

    // let newBarCharts = newBarChartSvg
    //     .selectAll("g")
    //     .data([...drawgraphdataset.barchartdataset].filter(d => eventnamesforpropagation_all.includes(d.eventname)))
    //     .enter()
    //     .append("g")
    //     .attr("class", "barchart_group")
    //     .attr("id", function (d, i) {
    //         return d.eventname
    //     })
    //     .attr("transform", (d, i) => "translate(" + i * g_width + ",0)")
    // // .attr("width","180")
    // // .attr("height","100")

    // let margin_top_bottom = 5
    // let margin_left_right = 10
    // newBarCharts
    //     .append("rect")
    //     .attr("class", "rectBackgroundForPropagation")
    //     .attr("width", g_width - margin_left_right * 2)
    //     .attr("height", g_height - margin_top_bottom * 2)
    //     .attr("x", margin_left_right)
    //     .attr("y", margin_top_bottom)
    //     .attr("rx", 2)
    //     .attr("ry", 2)
    //     .style("fill", "#c0c0c0")
    //     .style("opacity", 0.2)

    // newBarCharts
    //     .append("text")
    //     .attr("class", "eventNameForPropagation")
    //     .text(function (d, i) {
    //         return d.eventname
    //     })
    //     .attr("x", 80)
    //     .attr("y", margin_top_bottom)
    //     .attr("dy", ".99em")
    //     .attr("text-anchor", "middle") // set anchor y justification
    //     .style("fill", "#202020")
    //     .style("font-size", "12px")
    //     .style("font-family", ' Arial, sans-serif')
    //     .style("font-weight", 'normal')


    // let smallbarchartyscale = d3.scaleLinear()
    //     .domain([0, maxCountInAPeriod])
    //     .range([0, g_height - margin_top_bottom * 2])

    // let smallbarwidth = (g_width - margin_left_right * 2) / 30;

    // newBarCharts
    //     .selectAll(".smallbarForPropagation")
    //     .data(function (d) {
    //         return d.data
    //     })
    //     .enter()
    //     .append("rect")
    //     .attr("class", "smallbarForPropagation")
    //     .attr("height", function (d) {
    //         if (d > 1) {
    //             return smallbarchartyscale(Math.log2(d));
    //         }
    //         else {
    //             return smallbarchartyscale(d);
    //         }
    //     })
    //     .attr("width", smallbarwidth * 0.9)
    //     .attr("x", function (d, i) {
    //         return smallbarwidth * (i + 0.05) + margin_left_right
    //     })
    //     .attr("y", function (d) {
    //         if (d > 1) {
    //             return g_height - margin_top_bottom - smallbarchartyscale(Math.log2(d));
    //         }
    //         else {
    //             return g_height - margin_top_bottom - smallbarchartyscale(d);
    //         }
    //     })
    //     .style("fill", function (d) {
    //         return getColorByName(d3.select(this.parentNode).attr('id'), drawgraphdataset.nodes)
    //     })
    //     .style("stroke", "none")
    //     .style("opacity", 0.8)
}

// //交互：增加一条查询
// function add_query() {
//     let query_source = document.getElementById("input-select-source").value
//     let query_target = document.getElementById("input-select-target").value
//     let query_source_order;
//     let query_target_order;
//     //如果输入的是名称
//     if (parseInt(query_source).toString() == "NaN") {
//         query_source_order = getEventOrderByName(query_source, nodes)
//         query_target_order = getEventOrderByName(query_target, nodes)
//     }
//     //如果输入的是索引
//     else {
//         query_source_order = getEventOrderById(parseInt(query_source), nodes)
//         query_target_order = getEventOrderById(parseInt(query_target), nodes)
//     }
//     let tempgraph = getDijPath(drawgraphdataset, query_source, query_target)
//     DrawPrppagationGraph("align-items-center", tempgraph)
//     //nametoorder

//     // 如果有查询结果
//     all_query_history.push("history")
//     let newDiv = document.createElement("div");
//     newDiv.setAttribute("id", "propagation" + all_query_history.length);
//     newDiv.setAttribute("style", "width:20px;height:20px");
//     newDiv.innerHTML = '<div class="query-history-tag"><p class="p2">' + all_query_history.length + '</p></div>';

//     document.getElementById("query-history-list").appendChild(newDiv);

//     //编号

//     //propagation

//     let newPropagation = document.getElementById("graphsandbox").cloneNode(true);
//     console.log(newPropagation)
//     newPropagation.setAttribute("width", "180")
//     newPropagation.setAttribute("height", "100")
//     newPropagation.setAttribute("margin-left", "20px")
//     newPropagation.setAttribute("transform", "rotate(-180)")
//     newPropagation.setAttribute("id", "smallpropagation" + all_query_history.length)
//     newPropagation.setAttribute("class", "smallpropagation")
//     newPropagation.setAttribute("style", "display:true")
//     document.getElementById("query-history-list").appendChild(newPropagation);
//     d3.select("#smallpropagation" + all_query_history.length).selectAll("g").selectAll("text")
//         .attr("transform", "rotate(180)")
//         .style("font-size", "6px")
//         .style("font-weight", "bold")
//     d3.select("#smallpropagation" + all_query_history.length).style("display", "true")

//     // let
//     //第一个text的内容为target，前面的text的内容为source
//     console.log(d3.select("#smallpropagation" + all_query_history.length).selectAll("g").selectAll("text"))

//     let eventnamesforpropagation = d3.select("#smallpropagation" + all_query_history.length).selectAll("g").selectAll("text")._groups

//     let eventnamesforpropagation_all = []
//     let eventnamesforpropagation_target = eventnamesforpropagation[0][0].innerHTML
//     eventnamesforpropagation_all.push(eventnamesforpropagation_target)
//     let eventnamesforpropagation_source = []
//     for (let i = 1; i < eventnamesforpropagation.length; i++) {
//         eventnamesforpropagation_source.push(eventnamesforpropagation[i][0].innerHTML)
//         eventnamesforpropagation_all.push(eventnamesforpropagation[i][0].innerHTML)
//     }

//     console.log(eventnamesforpropagation_all)
//     let newBarChartsDiv = document.createElement("div");
//     newBarChartsDiv.setAttribute("id", "newBarChartsDiv" + all_query_history.length)
//     let g_width = 180
//     let g_height = 100

//     document.getElementById("query-history-list").appendChild(newBarChartsDiv);
//     let newBarChartSvg = d3.select("#newBarChartsDiv" + all_query_history.length)
//         .append("svg")
//         .attr("width", "180px")
//         .attr("height", function () {
//             return g_height * eventnamesforpropagation_all.length + "px"
//         })

//     let newBarCharts = newBarChartSvg
//         .selectAll("g")
//         .data([...drawgraphdataset.barchartdataset].filter(d => eventnamesforpropagation_all.includes(d.eventname)))
//         .enter()
//         .append("g")
//         .attr("class", "barchart_group")
//         .attr("id", function (d, i) {
//             return d.eventname
//         })
//         .attr("transform", (d, i) => "translate(0," + i * g_height + ")")
//     // .attr("width","180")
//     // .attr("height","100")

//     let margin_top_bottom = 5
//     let margin_left_right = 10
//     newBarCharts
//         .append("rect")
//         .attr("class", "rectBackgroundForPropagation")
//         .attr("width", g_width - margin_left_right * 2)
//         .attr("height", g_height - margin_top_bottom * 2)
//         .attr("x", margin_left_right)
//         .attr("y", margin_top_bottom)
//         .attr("rx", 2)
//         .attr("ry", 2)
//         .style("fill", "#c0c0c0")
//         .style("opacity", 0.2)

//     newBarCharts
//         .append("text")
//         .attr("class", "eventNameForPropagation")
//         .text(function (d, i) {
//             return d.eventname
//         })
//         .attr("x", 80)
//         .attr("y", margin_top_bottom)
//         .attr("dy", ".99em")
//         .attr("text-anchor", "middle") // set anchor y justification
//         .style("fill", "#202020")
//         .style("font-size", "12px")
//         .style("font-family",' Arial, sans-serif')
//         .style("font-weight",'normal')


//     let smallbarchartyscale = d3.scaleLinear()
//         .domain([0, maxCountInAPeriod])
//         .range([0, g_height - margin_top_bottom * 2])

//     let smallbarwidth = (g_width - margin_left_right * 2) / 30;

//     newBarCharts
//         .selectAll(".smallbarForPropagation")
//         .data(function (d) {
//             return d.data
//         })
//         .enter()
//         .append("rect")
//         .attr("class", "smallbarForPropagation")
//         .attr("height", function (d) {
//             if (d > 1) {
//                 return smallbarchartyscale(Math.log2(d));
//             }
//             else {
//                 return smallbarchartyscale(d);
//             }
//         })
//         .attr("width", smallbarwidth * 0.9)
//         .attr("x", function (d, i) {
//             return smallbarwidth * (i + 0.05) +margin_left_right
//         })
//         .attr("y", function (d) {
//             if (d > 1) {
//                 return g_height - margin_top_bottom  - smallbarchartyscale(Math.log2(d));
//             }
//             else {
//                 return  g_height - margin_top_bottom  - smallbarchartyscale(d);
//             }
//         })
//         .style("fill", function (d) {
//             return getColorByName(d3.select(this.parentNode).attr('id'), drawgraphdataset.nodes)
//         })
//         .style("stroke", "none")
//         .style("opacity", 0.8)



// }

//根据提供的名称找到order
function getEventOrderByName(name, arr) {
    let filterArray = arr.filter(function (v) {
        return v.name === name
    })
    if (filterArray.length) {
        return filterArray[0].order
    }
}

//根据提供的名称找到order
function getEventOrderById(id, arr) {
    let filterArray = arr.filter(function (v) {
        return v.id === id
    })
    if (filterArray.length) {
        return filterArray[0].order
    }
}

function getEventNameByOrder(order, arr) {
    let filterArray = arr.filter(function (v) {
        return v.order === order
    })
    if (filterArray.length) {
        return filterArray[0].name
    }
}
function getEventIdByOrder(order, arr) {
    let filterArray = arr.filter(function (v) {
        return v.order === order
    })
    if (filterArray.length) {
        return filterArray[0].id
    }
}

//根据id找到name
function getEventNameById(id, arr) {
    let filterArray = arr.filter(function (v) {
        return v.id === id
    })
    if (filterArray.length) {
        return filterArray[0].name
    }
}

//根据id找到name
function getColorByName(name, arr) {
    let filterArray = arr.filter(function (v) {
        return v.name === name
    })
    if (filterArray.length) {
        return filterArray[0].color
    }
}

function getDijPath(graphdataset, startname, endname) {
    // console.log(graphdataset)
    let nodes = [];//多个点
    let paths = [];
    let node = [];//单个点
    var source_target = new Map();//存储键值对
    var nodes_flag = new Set();
    var nodes_index = new Map();
    for (let i = 0; i < graphdataset.nodes.length; i++)
        node.push({
            "index": graphdataset.nodes[i].order,
            "value": graphdataset.nodes[i].id
        })

    let n = 0;
    let tempsinglelinks;
    if (searchArea === "individual") {
        tempsinglelinks = graphdataset.links.filter(link => (link.source_order.length == 1));
    }
    else if (searchArea === "combined") {
        tempsinglelinks = graphdataset.links.filter(link => (link.source_order.length > 1));
    }
    else {
        tempsinglelinks = graphdataset.links;
    }

    for (let j = 0; j < tempsinglelinks.length; j++) {//存放nodes
        let value_array = [];
        if (Array.isArray(tempsinglelinks[j].source_order))//如果是数组
            value_array = tempsinglelinks[j].source_order;
        else
            value_array.push(tempsinglelinks[j].source_order);
        let tarvalue_array = [];
        if (Array.isArray(tempsinglelinks[j].target_order))//如果是数组
            tarvalue_array = tempsinglelinks[j].target_order;
        else
            tarvalue_array.push(tempsinglelinks[j].target_order);

        for (let i = 0; i < value_array.length; i++) {
            let tempppppp = []
            tempppppp.push(value_array[i])
            if (!(nodes_flag.has(tempppppp.toString()))) {
                nodes.push({//多个点看成一个点
                    "index": n,
                    "value": tempppppp,//可能会出现 2 [2]
                    "r": 10
                })
                nodes_index.set(tempppppp.toString(), n);
                nodes_flag.add(tempppppp.toString());//节点是否存在
                n++;
            }
        }

        if (value_array.length > 1 && !(nodes_flag.has(value_array.toString()))) {
            nodes.push({//多个点看成一个点
                "index": n,
                "value": value_array,//可能会出现 2 [2]
                "r": 10
            })
            nodes_index.set(value_array.toString(), n);
            nodes_flag.add(value_array.toString());//节点是否存在
            n++;
        }

        for (let i = 0; i < tarvalue_array.length; i++) {
            let tempppppp = []
            tempppppp.push(tarvalue_array[i])
            if (!(nodes_flag.has(tempppppp.toString()))) {
                nodes.push({//多个点看成一个点
                    "index": n,
                    "value": tempppppp,//可能会出现 2 [2]
                    "r": 10
                })
                nodes_index.set(tempppppp.toString(), n);
                nodes_flag.add(tempppppp.toString());//节点是否存在
                n++;
            }
        }

        if (tarvalue_array.length > 1 && !(nodes_flag.has(tarvalue_array.toString()))) {
            nodes.push({//多个点看成一个点
                "index": n,
                "value": tarvalue_array,
                "r": 10
            })
            nodes_index.set(tarvalue_array.toString(), n);
            nodes_flag.add(tarvalue_array.toString());
            n++;
        }
    }
    console.log(nodes_index)
    for (let k = 0; k < tempsinglelinks.length; k++) {//如果小于0则不继续划分
        if ((source_target.get(tempsinglelinks[k].source_order) !== tempsinglelinks[k].target_order)) {
            source_target.set(tempsinglelinks[k].source_order, tempsinglelinks[k].target_order);
            let value_array = [];
            if (Array.isArray(tempsinglelinks[k].source_order))//如果是数组
                value_array = tempsinglelinks[k].source_order;
            else
                value_array.push(tempsinglelinks[k].source_order);
            let tarvalue_array = [];
            if (Array.isArray(tempsinglelinks[k].target_order))//如果是数组
                tarvalue_array = tempsinglelinks[k].target_order;
            else
                tarvalue_array.push(tempsinglelinks[k].target_order);
            for (let a = 0; a < value_array.length; a++)//如果跟nodes同时push会导致搜不到节点
            {

                let valuesingle_array = [];
                valuesingle_array.push(value_array[a]);
                let source_array = [];
                source_array.push(value_array.toString())
                paths.push({
                    "source": nodes_index.get(valuesingle_array.toString()),//按单个节点存入 匹配后读取source_array
                    //"source": nodes_index.get(value_array.toString()),//索引
                    "target": nodes_index.get(tarvalue_array.toString()),//用索引值
                    //"target_value":graphdataset.links[j].target_order,
                    "distance": tempsinglelinks[k].strength * 100,//放大一百倍
                    "array_index": nodes_index.get(value_array.toString()),
                    "array_value": value_array.toString()
                })
            }
        }
    }

    var sp1 = new ShortestPathCalculator(nodes, paths);
    // var startname='Kossacks_for_Sanders'//21 在此输入起点
    // var endname='thewalkingdead'//3 在此输入终点
    // console.log(getOrderByName(startname,graphdataset.nodes))
    // var route = sp1.findRoute(0,graphdataset.nodes.length-1);
    // var route = sp1.findRoute(startnode,endnote);//输入节点index
    let startnode = nodes_index.get(getOrderByName(startname, graphdataset.nodes).toString());//根据初始索引值value找key
    let endnode = nodes_index.get(getOrderByName(endname, graphdataset.nodes).toString());//根据初始索引值value找key
    var route = sp1.findRoute(startnode, endnode);//输入节点index
    if (route.mesg === "OK" && route.distance === 0) {
        return { "nodes": null, "edges": null };
    }
    if (route.mesg === "No path found") {
        return { "nodes": null, "edges": null };
    }
    var resulttemp = sp1.formatResult();


    var path_nodes = [];
    var path_edges = [];
    var path_nodes_temp = [];

    // path_nodes.push({ "id": getEventIdByOrder(resulttemp[0].start[0],graphdataset.nodes), "eventname": getEventNameByOrder(resulttemp[0].start[0], graphdataset.nodes) })
    // let currCnt = document.getElementById("combinedNumber").innerText;
    let currCnt = causes_max;

    if (currCnt == 1) {
        for (let i = 0; i < resulttemp.length; i++) {
            for (let ii = 0; ii < resulttemp[i].start.length; ii++) {
                let nodeid = getEventIdByOrder(resulttemp[i].start[ii], graphdataset.nodes)
                if (!path_nodes_temp.includes(nodeid)) {
                    path_nodes.push({ "id": nodeid, "eventname": getEventNameByOrder(resulttemp[i].start[ii], graphdataset.nodes) })
                    path_nodes_temp.push(nodeid)
                }
                path_edges.push({ "nodes": [getEventIdByOrder(resulttemp[i].end[0], graphdataset.nodes), getEventIdByOrder(resulttemp[i].start[ii], graphdataset.nodes)], "strength": resulttemp[i].strength })
            }
            let nodeid = getEventIdByOrder(resulttemp[i].end[0], graphdataset.nodes)
            if (!path_nodes_temp.includes(nodeid)) {
                path_nodes.push({ "id": nodeid, "eventname": getEventNameByOrder(resulttemp[i].end[0], graphdataset.nodes) })
                path_nodes_temp.push(nodeid)
            }
        }
        let path_nodes_reverse_order = []
        for (let i = path_nodes.length - 1; i >= 0; i--) {
            path_nodes_reverse_order.push(path_nodes[i])
        }
        path_nodes = path_nodes_reverse_order
    } else {
        //明天从这里开始......resulttemp.....是输出....
        for (let i = 0; i < resulttemp.length; i++) {
            path_nodes.push({ "id": getEventIdByOrder(resulttemp[i].end[0], graphdataset.nodes), "eventname": getEventNameByOrder(resulttemp[i].end[0], graphdataset.nodes) })
            for (let ii = 0; ii < resulttemp[i].start.length; ii++) {
                path_nodes.push({ "id": getEventIdByOrder(resulttemp[i].start[ii], graphdataset.nodes), "eventname": getEventNameByOrder(resulttemp[i].start[ii], graphdataset.nodes) })
                path_edges.push({ "nodes": [getEventIdByOrder(resulttemp[i].end[0], graphdataset.nodes), getEventIdByOrder(resulttemp[i].start[ii], graphdataset.nodes)], "strength": resulttemp[i].strength })
            }
        }
    }


    return { "nodes": path_nodes, "edges": path_edges };

    // let path_nodes = []
    // let path_edges = []
    // for (let j = result.length - 1; j > 0; j--) {
    //     path_nodes.push({ "id": result[j], "eventname": getEventNameById(result[j], graphdataset.nodes) })
    //     path_edges.push({ "nodes": [result[j], result[j - 1]] })
    // }
    // path_nodes.push({ "id": result[0], "eventname": getEventNameById(result[0], graphdataset.nodes) })
    // console.log('result', result);
    // return { "nodes": path_nodes, "edges": path_edges };

}

function findKey(obj, value, compare = (a, b) => a === b) {
    return Object.keys(obj).find(k => compare(obj[k], value))
}
function getNameByOrder(order, arr) {//graphdataset.nodes
    return arr.find(item => item.order === order).name
}
function getOrderByName(name, arr) {//graphdataset.nodes
    return arr.find(item => item.name === name).order
}

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
    } else if (sort_method === 2) {
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
                    if (a.source_order.length === b.source_order.length) {
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
let find_negative_vertical_space = (g) => {
    let minVal = Infinity;

    for (d of g.tables){
        let tmpval = g.tableIndex[d.depth].indexOf(d) * table_vert_space + d.verticalAttrOffset * attr_height;
        if (tmpval < minVal) minVal = tmpval;
    }

    return minVal
}

let drawGraph = (svg, g, algorithm = undefined) => {
    let line = d3.line()
        .curve(d3.curveBasis);

    let straightline = d3.line()

    table_vert_space = g.baseRowDistance * attr_height

    let negative_vert_space = find_negative_vertical_space(g) // TODO: temporary fix

    visg = svg.append('g')
        .attr('transform', 'translate(20, ' + (20 - negative_vert_space) + ')')

    svg.append('defs')
        .append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', [0, 0, 10, 10])
        .attr('refX', 5)
        .attr('refY', 5)
        .attr('markerWidth', 10)
        .attr('markerHeight', 10)
        .attr('orient', 'auto-start-reverse')
        .append('path')
        .attr('d', d3.line()([[0, 0], [0, 10], [10, 5]]))
        .attr('stroke', 'black');

    // // temp grid indicator
    // for (let i in [ ... Array(10).keys()]){
    //     visg.append('path')
    //         .attr('stroke-width', 1)
    //         .attr('stroke', '#ccc')
    //         .attr('fill', 'none')
    //         .style("stroke-dasharray", ("5, 3"))
    //         .attr('d', straightline([[0, attr_height*g.baseRowDistance*i], [1000, attr_height*g.baseRowDistance*i]]))
    // }

    // *****
    // tables
    // *****
    tablegroups = visg.selectAll(".tables")
        .data(g.tables.filter(t => t.type != "aux"))
        .enter()
        .append('g')
        .attr('class', 'tablegroup')
        .attr('id', d => 'tablegroup_' + d.name)
        .style('visibility', d => d.visibility)
        .attr('transform', d => 
            "translate(" + (d.depth*depth_distance) + "," 
            + (g.tableIndex[d.depth].indexOf(d) * table_vert_space + d.verticalAttrOffset * attr_height) + ")" )

    tablegroups.append('rect')
        .attr('width', table_width)
        .attr('height', d => d.attributes.length * attr_height + header_height)  
        .attr('fill', d => d.type == "groupheader"? "#eee" : 'black')
        .attr('stroke', 'gray')
        .on('click', d => console.log(d))

    tablegroups.append('text')
        .attr('x', table_width/2)
        .attr('y', attr_height/2 + 5)
        .attr('text-anchor', 'middle')
        .attr('fill', d => d.type == "groupheader"? "black" : 'white')
        .attr('font-size', '0.7em')
        .attr("font-family", "Arial")
        .text(d => d.header /*+ " w:" + d.weight*/)
    
    // *****
    // attributes
    // *****
    attrgroups = tablegroups.selectAll('.attrs')
        .data(d => d.attributes)
        .enter()
        .append('g')
        .attr('transform', (d, i) => "translate(0, " + (header_height + (i)*attr_height) + ")")
        
    attrgroups.append("rect")
        .attr("width", table_width)
        .attr("height", attr_height)
        .attr("fill", d => d.type == "constraint"? "#FFFF73" : "#ccc")
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .on('click', d => console.log(d))

    attrgroups.append('text')
        .attr('x', table_width/2)
        .attr('y', attr_height/2 + 3)
        .attr('text-anchor', 'middle')
        .attr('font-size', '0.7em')
        .attr("font-family", "Arial")
        .text(d => d.attr /*+ " w:" + d.weight*/) 

    let get_1st_coord = (d) => 
        [d.leftTable.depth * depth_distance + table_width,
        d.leftTable.attributes.indexOf(d.leftAttribute)*attr_height + header_height + attr_height/2 + g.tableIndex[d.leftTable.depth].indexOf(d.leftTable)*table_vert_space + d.leftTable.verticalAttrOffset*attr_height]
   
    let get_2nd_coord = (d) => {
        if (d.leftTable.depth != d.rightTable.depth)
            return [d.rightTable.depth * depth_distance, 
                d.rightTable.attributes.indexOf(d.rightAttribute)*attr_height + header_height + attr_height/2 + g.tableIndex[d.rightTable.depth].indexOf(d.rightTable)*table_vert_space + d.rightTable.verticalAttrOffset*attr_height]
        else return [d.leftTable.depth * depth_distance + table_width,
            d.rightTable.attributes.indexOf(d.rightAttribute)*attr_height + header_height + attr_height/2 + g.tableIndex[d.rightTable.depth].indexOf(d.rightTable)*table_vert_space + d.rightTable.verticalAttrOffset*attr_height]    
    }

    // *****
    // groups
    // *****
    g.updateGroupCoords()
    visg.selectAll('.grouprects') 
        .data(g.groups)
        .enter()
        .append('path')
        .attr('class', 'grouplines')
        .attr('stroke-width', 2)
        .attr('stroke', 'black')
        .attr('fill', 'none')
        .style("stroke-dasharray", ("5, 3"))
        .attr('d', d => { return straightline(d.coords) })


    // *****
    // edges
    // *****
    edges = visg.selectAll('.edges')
        .data(g.edges)
        .enter()
        .append('path')
        .attr('stroke', 'black')
        .attr('fill', 'none')
        .attr('marker-end', d => d.type == "directed"? 'url(#arrow)' : "")
        .attr('d', d => {
            first = get_1st_coord(d)
            second = get_2nd_coord(d)

            let curveFactor = 0.2;
            if (d.leftTable.depth == d.rightTable.depth) curveFactor = ((Math.abs(d.leftTable.weight - d.rightTable.weight)/3))*0.18

            return line(
                [first, 
                [first[0] + depth_distance*curveFactor, first[1]],
                [second[0] + (d.leftTable.depth == d.rightTable.depth ? 1 : -1)*depth_distance*curveFactor, second[1]],
                second]
            )
        })

    edgeLabels = visg.selectAll('.edgeLabels')
        .data(g.edges.filter(e => e.label != undefined))
        .enter()
        .append('text')
        .text(e => e.label)
        .style('font-size', 'small')
        .style('text-anchor', 'middle')
        .attr('transform', d => {
            first = get_1st_coord(d)
            second = get_2nd_coord(d)
            return 'translate(' + (first[0]/2 + second[0]/2 + (d.leftTable.depth == d.rightTable.depth ? 1 : 0)*depth_distance*0.16) + ',' + (-2 + first[1]/2 + second[1]/2) + ')';
        })

    d3.select(svg.node().parentNode)
        .append('div').append('text')
        .text('crossings: ' + g.getEdgeCrossings() + ', tables: ' + g.tables.length + ', edges: ' + g.edges.length)
        .style('font-family', 'Arial')
        .attr('class', 'crossing_count')

    if (algorithm != undefined && algorithm.elapsedTime != undefined){
        d3.select(svg.node().parentNode)
            .append('div').append('text')
            .text('time: ' + algorithm.elapsedTime + 'ms')
            .style('font-family', 'Arial')
            .attr('class', 'crossing_count')

        if (algorithm.solveTime != undefined){
            d3.select(svg.node().parentNode)
                .append('div').append('text')
                .text('solve time: ' + algorithm.solveTime + 'ms')
                .style('font-family', 'Arial')
                .attr('class', 'crossing_count')
        }

        if (algorithm.model != undefined){
            d3.select(svg.node().parentNode)
                .append('div').append('text')
                .text('constraints: ' + algorithm.model.subjectTo.split("\n").length)
                .style('font-family', 'Arial')
                .attr('class', 'crossing_count')
          
            d3.select(svg.node().parentNode)
                .append('div').append('text')
                .text('variables: ' + algorithm.model.bounds.split("\n").length)
                .style('font-family', 'Arial')
                .attr('class', 'crossing_count')
        }
       
        if (algorithm.iterations != undefined){

            d3.select(svg.node().parentNode)
                .append('text')
                .text('⏹️')

            d3.select(svg.node().parentNode)
                .append('text')
                .text('⏪')
                .on('click', () => {
                    algorithm.cur_iteration--;
                    algorithm.apply_iteration(algorithm.cur_iteration);

                    svg.selectAll('.tablegroup')
                        .transition()
                        .duration(750)
                        .attr('transform', d => 
                        'translate(' + (d.depth*depth_distance) + ' ,  ' + (algorithm.g.tableIndex[d.depth].indexOf(d) * table_vert_space)  + ' )')

                    // d3.selectAll
                    // .attr('transform', d => 
                    //     // "translate(" + (d.depth*depth_distance) + "," 
                    //     // + algorithm.g.tableIndex[d.depth].indexOf(d) * table_vert_space + ")" )
                    //     "translate(0, 0)"
                    //     )
                })

            d3.select(svg.node().parentNode)
                .append('text')
                .text(algorithm.cur_iteration)
            
            d3.select(svg.node().parentNode)
                .append('text')
                .text('⏩')
                .on('click', () => {

                })

            d3.select(svg.node().parentNode)
                .append('text')
                .text('▶️')
        }
    }
}

let drawGraphSimple = (svg, g, algorithm = undefined) => {
    let line = d3.line()
        .curve(d3.curveBasis);

    let straightline = d3.line()

    if (algorithm.options.bendiness_reduction_active == false){
        for (let d of g.nodeIndex){
            for (let node of d){
                node.y = d.indexOf(node);
            }
        }

        for (let group of g.groups){
            for (let group2 of g.groups){
                if (group == group2) continue;
                if (group.nodes[0].depth != group2.nodes[0].depth) continue;
                if (group.nodes[0].y < group2.nodes[0].y) {
                    for (let node of group2.nodes){
                        node.y += 2;
                    }
                }
            }
        }
    }

    visg = svg.append('g')
        .attr('transform', 'translate(20, ' + (20) + ')')

    for (group of g.groups){
        let topmax = Math.min.apply(0, group.nodes.map(n => n.y))
        let topnode = group.nodes.find(n => n.y == topmax)

        for (let node of group.nodes){
            node.y += 1
        }

        visg.append('rect')
            .attr('y', (topnode.y-1) * attr_height)
            .attr('x', topnode.depth * depth_distance)
            .attr('width', table_width)
            .attr('height', attr_height)
            .attr('fill', '#000')

        visg.append('text')
            .attr('y', (topnode.y-1) * attr_height + attr_height/2 + 3)
            .attr('x', topnode.depth * depth_distance + table_width/2)
            .attr('text-anchor', 'middle')
            .attr('font-size', 'x-small')
            .attr('fill', 'white')
            .text(group.id)
    }

    for (node of g.nodes){
        visg.append('rect')
            .attr('y', node.y * attr_height)
            .attr('x', node.depth * depth_distance)
            .attr('width', table_width)
            .attr('height', attr_height)
            .attr('fill', '#ccc')
            .attr('stroke', '#fff')
            .attr('stroke-width', '1')

        visg.append('text')
            .attr('y', node.y * attr_height + attr_height/2 + 3)
            .attr('x', node.depth * depth_distance + table_width/2)
            .attr('text-anchor', 'middle')
            .attr('font-size', 'x-small')
            .text(node.id)
    }

    for (edge of g.edges){
        visg.append('path')
            .attr('stroke', 'black')
            .attr('fill', 'none')
            .attr('d', d => {
                first = [edge.nodes[0].depth * depth_distance + table_width, edge.nodes[0].y * attr_height + attr_height/2]
                second = [edge.nodes[1].depth * depth_distance, edge.nodes[1].y * attr_height + attr_height/2]
                return line(
                    [first, 
                    [first[0] + depth_distance*0.2, first[1]],
                    [second[0] + (edge.nodes[0].depth == edge.nodes[1].depth ? 1 : -1)*depth_distance*0.2, second[1]],
                    second]
                )
            })  
    }

    if (algorithm != undefined && algorithm.elapsedTime != undefined){
        d3.select(svg.node().parentNode)
            .append('div').append('text')
            .text('time: ' + algorithm.elapsedTime + 'ms')
            .style('font-family', 'Arial')
            .attr('class', 'crossing_count')

        if (algorithm.solveTime != undefined){
            d3.select(svg.node().parentNode)
                .append('div').append('text')
                .text('solve time: ' + algorithm.solveTime + 'ms')
                .style('font-family', 'Arial')
                .attr('class', 'crossing_count')
        }

        d3.select(svg.node().parentNode)
            .append('div').append('text')
            .text('constraints: ' + algorithm.model.subjectTo.split("\n").length)
            .style('font-family', 'Arial')
            .attr('class', 'crossing_count')
          
        d3.select(svg.node().parentNode)
            .append('div').append('text')
            .text('variables: ' + algorithm.model.bounds.split("\n").length)
            .style('font-family', 'Arial')
            .attr('class', 'crossing_count')
    }

}
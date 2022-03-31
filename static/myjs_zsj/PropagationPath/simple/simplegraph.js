class SimpleGraph {
    constructor(){
        this.nodes = [];
        this.edges = [];
        this.nodeIndex = [];
        this.edgeIndex = [];
        this.groups = [];

        this.fakeNodeCount = 0;
        this.groupIdCounter = 0;

        this.inclusion_graph = this.build_inclusion_graph();
        this.keep_groups_rect = true;
    }

    addNode(node){
        // if (this.nodes.name.find(n => n.name == node.name) != undefined) 
        // fix when it becomes a problem
        if (node.id == undefined) {
            node.id = node.name;
        }
        // node.eventname = node.eventname
        this.nodes.push(node);
        this.addLevelsToNodeIndex(node.depth);
        this.nodeIndex[node.depth].push(node);
    }

    addNodes(nodeArr){
        for (let node of nodeArr) this.addNode(node);
    }

    addLevelsToNodeIndex(depth){
        while (this.nodeIndex.length <= depth){
            this.nodeIndex.push([]);
        }
    }

    addEdge(edge){
        this.edges.push(edge);
    }

    addGroup(group){
        if (group.id == undefined) group.id = this.groupIdCounter++;
        this.groups.push(group);
    }

    addAnchors(){
        for (let e of this.edges){
            if (Math.abs(e.nodes[0].depth - e.nodes[1].depth) > 1) {
                let minDepth = Math.min(e.nodes[0].depth, e.nodes[1].depth)
                let maxDepth = Math.max(e.nodes[0].depth, e.nodes[1].depth)
                let newanchors = [];

                for (let i = minDepth + 1; i<maxDepth; i++){
                    let n = {depth: i, name: 'a' + this.fakeNodeCount++, type: 'fake',eventname:"aa"};
                    this.addNode(n);
                    newanchors.push(n);
                }

                let firstEdge = {nodes:[e.nodes[0], newanchors[0]]};
                let lastEdge = {nodes:[newanchors[newanchors.length - 1], e.nodes[1]]};  

                if (e.value != undefined){
                    firstEdge.value = e.value;
                    lastEdge.value = e.value;
                }

                this.addEdge(firstEdge);
                this.addEdge(lastEdge);

                for (let i = 1; i < newanchors.length; i++){
                    let newEdge = {nodes: [newanchors[i-1], newanchors[i]]}; 
                    if (e.value != undefined) newEdge.value = e.value;
                    
                    this.addEdge(newEdge);
                }
            }
        }

        this.edges = this.edges.filter(e => Math.abs(e.nodes[0].depth - e.nodes[1].depth) <= 1);

        // note: this is important
        this.groups = this.groups.sort((a, b) => a.nodes.length > b.nodes.length? 1 : -1)

        for (let g of this.groups){
            let minRank = Math.min.apply(0, g.nodes.map(n => n.depth))
            let maxRank = Math.max.apply(0, g.nodes.map(n => n.depth))
            let maxNodesInRank = 0;
            for (let r = minRank; r <= maxRank; r++){
                if (g.nodes.filter(n => n.depth == r).length > maxNodesInRank) maxNodesInRank = g.nodes.filter(n => n.depth == r).length;
            }
            for (let r = minRank; r <= maxRank; r++){
                while (g.nodes.filter(n => n.depth == r).length < maxNodesInRank){
                    let n = {depth: r, name: 'a' + this.fakeNodeCount++, type: 'fake',eventname:"aa"};
                    for (let gr of this.groups){
                        if (g.nodes.every(val => gr.nodes.includes(val)) && gr != g) gr.nodes.push(n);
                    }
                    g.nodes.push(n);
                    this.addNode(n);
                }
            }
        }

        let maxNodesInRank = Math.max.apply(0, this.nodeIndex.map(n => n.length))
        for (let r in this.nodeIndex){
            if (this.groups.length == 0) continue;
            while (this.nodeIndex[r].length < maxNodesInRank){
                this.addNode({depth: r, name: 'a' + this.fakeNodeCount++, type: 'fake',eventname:"aa"});
            }
        }
    }

    draw(svg, nodeXDistance = 50, nodeYDistance = 50){

        let getNodeCoordX = (node) => (20 + nodeXDistance * (node.depth));
        let getNodeCoordY = (node) => {
            if (node.y != undefined) return 20 + node.y * nodeYDistance;
            else return parseFloat(20 + this.nodeIndex[node.depth].indexOf(node) * nodeYDistance)
        };
        let line = d3.line().curve(d3.curveBasis);
        let colors = ['#303E3F', '#A3B9B6'];

        for (let group of this.groups){
            if (!this.keep_groups_rect){
                if (group.nodes == undefined || group.nodes.length == 0) continue;
                let ranksInGroup = [...new Set(group.nodes.map(n => n.depth).sort())]
                let includes_groups = this.inclusion_graph_flat.find(n => n.id == group.id).children.some(c => c.type == 'group')
                let vmargin = includes_groups? nodeYDistance*.5 : nodeYDistance*.4;
                let hmargin = includes_groups? nodeXDistance*.5 : nodeXDistance*.4;
                
                let arr1 = []
                let arr2 = []
                
                for (let i in ranksInGroup){
                    let rank = ranksInGroup[i];
                    let nodesInRank = group.nodes.filter(n => n.depth == rank)
                    nodesInRank.sort((a, b) => {
                        return getNodeCoordY(a) < getNodeCoordY(b)? 1 : -1
                    })

                    if (i == 0) {
                        for (let j in nodesInRank){
                            let node = nodesInRank[j];
                            arr1.push([20 + nodeXDistance * (rank) - hmargin, getNodeCoordY(node)]);
                        }
                    }

                    let top = Math.min.apply(0, nodesInRank.map(n => getNodeCoordY(n)));
                    let bottom = Math.max.apply(0, nodesInRank.map(n => getNodeCoordY(n)));

                    arr1.push([20 + nodeXDistance * (rank) - 5, top - vmargin]);
                    arr1.push([20 + nodeXDistance * (rank) + 5, top - vmargin]);
                    arr2.push([20 + nodeXDistance * (rank) - 5, bottom + vmargin])
                    arr2.push([20 + nodeXDistance * (rank) + 5, bottom + vmargin])

                    if (i == ranksInGroup.length - 1) {
                        for (let j in nodesInRank.reverse()){
                            let node = nodesInRank[j];
                            arr1.push([20 + nodeXDistance * (rank) + hmargin, getNodeCoordY(node)]);
                        }
                    }
                }

                arr1 = arr1.concat(arr2.reverse())

                let line2 = d3.line().curve(d3.curveBasisClosed)//.curve(d3.curveCatmullRomClosed.alpha(0.1))

                svg.append('path')
                    .attr('fill',  d3.schemeTableau10[group.id%d3.schemeTableau10.length])
                    .attr('fill-opacity', 0.2)
                    .attr('stroke-opacity', 0.4)
                    .attr('d', line2(arr1))
                    .attr('stroke-width', 2)
                    .attr('stroke-dasharray', '3 3')
                    .attr('stroke', group.color? group.color : d3.schemeTableau10[group.id%d3.schemeTableau10.length])
            } else {
                let top = Math.min.apply(0, group.nodes.map(n => getNodeCoordY(n)));
                let bottom = Math.max.apply(0, group.nodes.map(n => getNodeCoordY(n)));
                let left = Math.min.apply(0, group.nodes.map(n => getNodeCoordX(n)));
                let right = Math.max.apply(0, group.nodes.map(n => getNodeCoordX(n)));

                let groupMargin = 5;
                for (let gr of this.groups){
                    if (group.nodes.every(n => gr.nodes.includes(n)) && gr != group) groupMargin -= 3;
                }

                svg.append('rect')
                    .attr('stroke', group.color? group.color : d3.schemeTableau10[group.id%d3.schemeTableau10.length])
                    .attr('x', left - 10 - groupMargin)
                    .attr('y', top - 8 - groupMargin)
                    .attr('fill-opacity', 0.2)
                    .attr('stroke-opacity', 0.4)
                    .attr('width', right - left + 20 + groupMargin*2)
                    .attr('height', bottom - top + 16 + groupMargin*2)
                    .attr('fill',  group.color? group.color : d3.schemePaired[group.id*4%d3.schemePaired.length])
                    .attr("rx", 12)
                    .attr("ry", 12)
                    .attr('stroke-width', 2)
                    .attr('stroke-dasharray', '3 3')
            }
        }

        for (let edge of this.edges){
            svg.append('path')
                .attr('class', 'edgepath')
                .attr('fill', 'none')
                .attr('id',() => {
                    return 'path_to_'+edge.nodes[0].eventname
                })
                // .attr('stroke', 'black')
                // .attr('stroke-width', 2)
                .attr('stroke', colors[1])
                .attr('stroke-width', 3)
                .attr('d', () => {
                    let m = 0;
                    let s1 = 0;
                    let s2 = 0;
                    if (edge.nodes[0].depth == edge.nodes[1].depth) m = nodeXDistance*.2 + (Math.abs(getNodeCoordY(edge.nodes[0]) - getNodeCoordY(edge.nodes[1]))/(nodeYDistance/4));
                    else {
                        s1 = nodeXDistance*.4;
                        s2 = -nodeXDistance*.4;
                    }
                    return line([
                        [getNodeCoordX(edge.nodes[0]), getNodeCoordY(edge.nodes[0])], 
                        [getNodeCoordX(edge.nodes[0]) + m + s1, getNodeCoordY(edge.nodes[0])], 
                        [getNodeCoordX(edge.nodes[1]) + m + s2, getNodeCoordY(edge.nodes[1])],
                        [getNodeCoordX(edge.nodes[1]), getNodeCoordY(edge.nodes[1])]
                    ])
                })
        }

        for (let depth in this.nodeIndex){
            for (let node of this.nodeIndex[depth]){
                // console.log(node)
                let g = svg.append('g')
                    .attr('transform', 'translate(' + (getNodeCoordX(node)) + ',' + getNodeCoordY(node) +')')
                    .attr('opacity', () => {return node.type == "fake"? 0.3 : 1})

                g.append('circle')
                    .datum(node)
                    .attr('class', 'node')
                    .attr('id',function (d,i){
                        return 'circle_node_'+node.eventname;
                    })
                    // .attr('fill', '#ccc')
                    // .attr('stroke', 'black')
                    // .attr('stroke-width', 2)
                    .attr('r', 5)
                    .attr('cx', 0)
                    .attr('cy', 0)
                    // .attr('stroke', '#303E3F')
                    .attr('stroke-width', 0)
                    .attr('fill', node.color? node.color : colors[0])

                g.append('text')
                    .text(node.eventname)
                    .attr('id',function (d,i){
                        return 'text_node_'+node.eventname;
                    })
                    .attr('text-anchor', 'middle')
                    .style("font-family", "Arial")
                    .attr('y', -10)
                    .attr('fill', colors[0])
                    .style('font-size', '8px')
                    .style("font-weight", "bold")
            }
        }

        // d3.select("#circle_node_target").remove();
        // d3.select("#text_node_target").remove();
        // d3.select("#path_to_target").remove();
    }

    build_inclusion_graph(){
        let root = {
            id: 'root',
            children: [],
            parent: undefined,
            depth: 0
        }

        let nodes = [];
        this.groups = this.groups.sort((a, b) => a.nodes.length < b.nodes.length? 1 : -1)

        for (let group of this.groups){
            let newnode;

            if (nodes.find(gr => gr.id == group.id) == undefined) {
                newnode = {id: group.id, type: 'group', children: [], size: group.nodes.length, parent: undefined}
                nodes.push(newnode);
            } else {
                newnode = nodes.find(gr => gr.id == group.id)
            }

            let parentGroups = this.groups.filter(gr => group.nodes.every(e => gr.nodes.includes(e)) && gr != group)

            if (parentGroups.length == 0) {
                newnode.parent = root;
                root.children.push(newnode);
            } else {
                let minP = Math.min.apply(0, parentGroups.map(gr => gr.nodes.length))
                let minPid = parentGroups.find(gr => gr.nodes.length == minP)
                
                let newnewnode;

                if (nodes.find(gr => gr.id == minPid.id) == undefined){
                    newnewnode = {id: minPid, type: 'group', children: [], size: minPid.nodes.length, parent: undefined};
                    nodes.push(newnewnode);
                } else newnewnode = nodes.find(gr => gr.id == minPid.id);

                newnewnode.children.push(newnode);
                newnode.parent = newnewnode;
            }
        }

        for (let node of this.nodes){
            let parentGroups = this.groups.filter(gr => gr.nodes.includes(node))
            let minP = Math.min.apply(0, parentGroups.map(gr => gr.nodes.length))
            let minPid = parentGroups.find(gr => gr.nodes.length == minP)

            let newNode = {id: node.id, type: 'node',eventname:node.eventname}
            nodes.push(newNode);
            if (parentGroups.length < 1) {
                newNode.parent = root;
                root.children.push(newNode);
            } else {
                newNode.parent = nodes.find(gr => gr.id == minPid.id)
                newNode.parent.children.push(newNode);
            }
        }

        let assignDepth = (curnode) => {
            if (curnode.children == undefined || curnode.children.length == 0) return;
            for (let node of curnode.children){
                node.depth = curnode.depth + 1;
                assignDepth(node);
            }
        }
        assignDepth(root);

        this.inclusion_graph_flat = nodes;

        return root;
    }
}

try {
    module.exports = exports = SimpleGraph;
 } catch (e) {}
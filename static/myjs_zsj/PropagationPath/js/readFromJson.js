let readFromJson = (data) => {
    let g = new SimpleGraph();

    for (let n of data.nodes){
        console.log(n)
        g.addNode({depth: 0, name: n.id , eventname:n.eventname})
    }

    for (let e of data.edges){
        let n1 = g.nodes.find(n => n.id == e.nodes[0])
        let n2 = g.nodes.find(n => n.id == e.nodes[1])

        if (n1 == undefined || n2 == undefined) continue;

        g.addEdge({nodes: [n1, n2], strength: e.strength});
    }

    let moveToDepth = (node, newDepth) => {
        g.nodeIndex[node.depth].splice(g.nodeIndex[node.depth].indexOf(node), 1);
        node.depth = newDepth;
        while (g.nodeIndex.length <= node.depth) g.nodeIndex.push([]);
        g.nodeIndex[node.depth].push(node);
    }

    startnode = g.nodes[0];
    // startnode = g.nodes.find(n => n.id == "u1");
    startnode.visited = true;
    curIndex = 0;
    while(g.nodeIndex[curIndex] != undefined){
        if (curIndex == 0){
            for (let node of g.nodes){
                if (node == startnode) continue;
                moveToDepth(node, node.depth + 1)
            }
        } else {
            let edgeSet = g.edges.filter(e => (e.nodes[0].depth < curIndex && e.nodes[1].depth == curIndex) || (e.nodes[1].depth < curIndex && e.nodes[0].depth == curIndex))
            let nodeSet = g.nodeIndex[curIndex].filter(n => edgeSet.find(e => e.nodes[0] == n || e.nodes[1] == n) == undefined)
            for (let node of nodeSet){
                moveToDepth(node, node.depth+1)
            }
        }
        curIndex++;
        if (curIndex == 100) break;
    }

    for (let edge of g.edges){
        if (edge.nodes[0].depth > edge.nodes[1].depth){
            edge.nodes = [edge.nodes[1], edge.nodes[0]];
        }
    }

    g.addAnchors();

    return g;
}


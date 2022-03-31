addGroups = (graph) => {

    let H = [];
    let Vs = [];
    let Vg = [];
    let Es = [];
    let Eg = [];
    
    for (let node of graph.nodes){
        Vs.push({id : node.id, subnodes: [node]})
    }

    for (let node of graph.nodes){
        Vg.push({id : node.id, subnodes: [node]})
    }

    for (let edge of graph.edges){
        Es.push({nodes: edge.nodes})
    }

    for (let edge of graph.edges){
        Eg.push({nodes: edge.nodes})
    }

    let twoHops = (n1, n2) => {
        let edgesFromN1 = Es.filter(e => e.nodes.map(n => n.id).includes(n1.id))
        for (let edge of edgesFromN1){
            if (edge.nodes[0].id == n2.id || edge.nodes[1].id == n2.id) return true;
            let othernode = edge.nodes.find(n => n.id != n1.id)
            let edgesFromOtherNode = Es.filter(e => e.nodes.map(n => n.id).includes(othernode.id))
            if (edgesFromOtherNode.find(e => e.nodes.map(n => n.id).includes(n2.id))) return true;
        }
    }

    let getNeighbors = (n1) => {
        let edgeset = Es.filter(e => n1.subnodes.some(n => e.nodes.map(nn => nn.id).includes(n.id))).map(n => n.nodes).flat();
        let nodeset = edgeset.filter(n => Vs.map(nn => nn.id).includes(n.id) && !n1.subnodes.map(nn => nn.id).includes(n.id));
        let nodeset2 = Vs.filter(n => nodeset.map(nn => nn.id).includes(n.id));
        return [... new Set(nodeset2)];
    }

    let calcPi = (n1, n2) => {
        let res = [];
        let c = n1.subnodes.concat(n2.subnodes)

        for (let i=0; i<c.length; i++){
            for (let j=i+1; j<c.length; j++){
                res.push([c[i], c[j]])
            }
        }
        // console.log(n1.id, n2.id, res)
        return res;
    }

    let calcA = (n1, n2) => {
        let res = [];

        let n1sn = n1.subnodes.map(n => n.id)
        let n2sn = n2.subnodes.map(n => n.id)

        // if (n1.id.includes("u8u9u2")) console.log(n1sn, n2sn)

        res = Eg.filter(e => (n1sn.includes(e.nodes[0].id) && n2sn.includes(e.nodes[1].id)) || 
            (n1sn.includes(e.nodes[1].id) && n2sn.includes(e.nodes[0].id)))

        // if (n1.id == "u3u4") console.log("a:", n1.id, n2.id, res)

        return res;
    }

    let calcCNode = (n1) => {
        let res = 0
        let n1Neighbors = getNeighbors(n1);

        // if (n1.id == "u3u4") console.log(n1Neighbors)
        
        for (let n2 of n1Neighbors){
            let PIn1n2 = calcPi(n1, n2)
            let An1n2 = calcA(n1, n2)

            // if (n1.id.includes("u8u9")) console.log("PI:", PIn1n2, n1.id, n2.id)
            // if (n1.id.includes("u8u9")) console.log("A:", An1n2, n1.id, n2.id)

            res += Math.min(PIn1n2.length - An1n2.length + 1, An1n2.length)
        }

        // console.log(n1.id, res)
        return res;
    }

    let s = (n1, n2) => {
        let cn1 = calcCNode(n1);
        let cn2 = calcCNode(n2);
        let cn3node = {id: n1.id + n2.id, subnodes: []};
        for (let node of n1.subnodes) cn3node.subnodes.push(node)
        for (let node of n2.subnodes) cn3node.subnodes.push(node)
        let cn3 = calcCNode(cn3node);
        // if (n1.id == "u3") console.log(n1.id, n2.id, cn1, cn2, cn3)
        return (cn1 + cn2 - cn3)/(cn1 + cn2)
    }

    for (let i=0; i<Vs.length; i++){
        for (let j=i+1; j<Vs.length; j++){
            if (!twoHops(Vs[i], Vs[j])) continue;
            let sc = s(Vs[i], Vs[j]);
            if (sc > 0) H.push({nodes: [Vs[i], Vs[j]], score: sc})
        }
    }

    // console.log(H)

    do {
        // console.log("H", H.map(h => h.nodes[0].id + " - " + h.nodes[1].id))

        let maxHval = Math.max.apply(0, H.map(el => el.score));
        let maxH = H.find(el => el.score == maxHval);
        let w = {id: maxH.nodes[0].id + "" + maxH.nodes[1].id, subnodes: []}
        // w.subnodes.push(w)

        for (let subnode of maxH.nodes[0].subnodes) w.subnodes.push(subnode)
        for (let subnode of maxH.nodes[1].subnodes) w.subnodes.push(subnode)
        H.splice(H.indexOf(maxH), 1)

        let elemsToBeRemoved = [];
        for (let h of H){
            if (h.nodes[0].subnodes.map(n => n.id).every(nid => maxH.nodes[0].subnodes.map(n => n.id).includes(nid)) ||
                h.nodes[1].subnodes.map(n => n.id).every(nid => maxH.nodes[0].subnodes.map(n => n.id).includes(nid)) ||
                h.nodes[0].subnodes.map(n => n.id).every(nid => maxH.nodes[1].subnodes.map(n => n.id).includes(nid)) ||
                h.nodes[1].subnodes.map(n => n.id).every(nid => maxH.nodes[1].subnodes.map(n => n.id).includes(nid))
            ) elemsToBeRemoved.push(h);
        }

        for (let elem of elemsToBeRemoved) H.splice(H.indexOf(elem), 1)

        // // console.log(w, maxH);
        // console.log("w-subnodes:", w.subnodes.map(n => n.id))

        // // console.log("aaa", Vs.map(n => n.id))

        // console.log("removing: ", maxH.nodes[0].id, Vs.indexOf(maxH.nodes[0]), maxH.nodes[1].id, Vs.indexOf(maxH.nodes[1]), "score:", maxH.score)
        // console.log("adding: ", w.id)
        Vs.splice(Vs.indexOf(maxH.nodes[0]), 1);
        Vs.splice(Vs.indexOf(maxH.nodes[1]), 1);
        
        Vs.push(w);

        // for (let neighbor of getNeighbors(w)){
        //     Es.push({nodes: [w, neighbor]})
        // }

        // console.log(Vs.map(n => n.id)

        for (let elem of elemsToBeRemoved) H.splice(H.indexOf(elem), 1)

        for (let node of Vs){
            // console.log(maxH.nodes)
            // console.log(Vs, pnodes[0])
            if (maxH.nodes.some(n => twoHops(node, n))){
                // console.log("node, maxH: ", node, maxH.nodes.map(n => n.id))
                // trova un elemento in h che abbia almeno uno dei due nodi contenuto in un subnodo di node
                let h1 = H.find(el =>
                    el.nodes.some(nn => node.subnodes.map(n => n.id).includes(nn.id)) &&
                    el.nodes.some(nn => maxH.nodes[0].subnodes.map(n => n.id).includes(nn.id))
                )
                let h2 = H.find(el =>
                    el.nodes.some(nn => node.subnodes.map(n => n.id).includes(nn.id)) &&
                    el.nodes.some(nn => maxH.nodes[1].subnodes.map(n => n.id).includes(nn.id))
                )                    
                // console.log("candidates for deletion", h1, h2)
                if (h1 != undefined) H.splice(H.indexOf(h1), 1)
                if (h2 != undefined) H.splice(H.indexOf(h2), 1)
                // console.log("score: ", s(w, node))
                if (s(w, node) > 0 && node.id != w.id) H.push({nodes: [w, node], score: s(w, node)})
            }
        }

    
        // console.log(Vs.map(n => n.id))
    } while (H.length > 0);

   for (let node of Vs){
       let group = {nodes:[]}
       for (let subnode of node.subnodes){
           group.nodes.push(graph.nodes.find(n => n.id == subnode.id))
       }
       graph.addGroup(group);
   }
}

try {
    module.exports = exports = addGroups;
 } catch (e) {}
importScripts('../lib/glpk.min.js');
// importScripts('../lib/lodash.js');
importScripts('LPFormulation.js');
importScripts('LPBendinessCombinedPlusGroups.js');
importScripts('Gansner.js');
importScripts('Sweep.js');
importScripts('Graph.js');
importScripts('GraphGenerator.js');
importScripts('Edge.js');
importScripts('../simple/simpleLp.js');
importScripts('../simple/simplegraph.js');

onmessage = function(e) {
    //console.log('Message received from main script ' + e.data.cmd);

    if (e.data.cmd == 'lp_simple') {
        let g = new SimpleGraph()

        for (let table of e.data.graph.tables){
            let groupNodes = []
            for (let attr of table.attributes){
                let n = {depth: table.depth, name: attr.name, id: attr.name}
                g.addNode(n);
                groupNodes.push(n);
            }
            g.addGroup({nodes: groupNodes, id: table.name})
        }

        for (let edge of e.data.graph.edges){
            let n1 = g.nodes.find(n => n.id == edge.att1.name)
            let n2 = g.nodes.find(n => n.id == edge.att2.name)
            g.addEdge({nodes: [n1, n2]})
        }

        let algorithm = new SimpleLp(g)
        algorithm.options.bendiness_reduction_active = false;
        algorithm.options.simplify_for_groups_enabled = true;
        algorithm.arrange()
        algorithm.apply_solution();
        // console.log(algorithm.modelString)
        postMessage({'graph': g, 'algorithm': algorithm})

    } if (e.data.cmd == 'lp_simple_bend') {
        let g = new SimpleGraph()

        for (let table of e.data.graph.tables){
            let groupNodes = []
            for (let attr of table.attributes){
                let n = {depth: table.depth, name: attr.name, id: attr.name}
                g.addNode(n);
                groupNodes.push(n);
            }
            g.addGroup({nodes: groupNodes, id: table.name})
        }

        for (let edge of e.data.graph.edges){
            let n1 = g.nodes.find(n => n.id == edge.att1.name)
            let n2 = g.nodes.find(n => n.id == edge.att2.name)
            g.addEdge({nodes: [n1, n2]})
        }

        let algorithm = new SimpleLp(g)
        algorithm.options.bendiness_reduction_active = true;
        algorithm.options.simplify_for_groups_enabled = true;
        algorithm.arrange()
        algorithm.apply_solution();

        // console.log(g, algorithm);

        postMessage({'graph': g, 'algorithm': algorithm})

    } else if (e.data.cmd == 'lp'){
        let algorithm = new LPFormulation(e.data.graph)
        algorithm.arrange()

        postMessage({'graph': e.data.graph, 'algorithm': algorithm})

    } else if (e.data.cmd == 'gansner'){
        e.data.graph = new Graph(e.data.graph)

        for (i in e.data.graph.edges){
            e1 = e.data.graph.edges[i]
            e2 = new Edge(e1.leftTable, e1.att1, e1.rigthTable, e1.att2)
            e.data.graph.edges[i] = e2
        }

        for (i in e.data.graph.edgeIndex){
            for (j in e.data.graph.edgeIndex[i]){
                e1 = e.data.graph.edgeIndex[i][j]
                e2 = new Edge(e1.leftTable, e1.att1, e1.rightTable, e1.att2)
                e.data.graph.edgeIndex[i][j] = e2
            }
        }

        let algorithm = new Gansner(e.data.graph)
        algorithm.arrange()

        postMessage({'graph': e.data.graph, 'algorithm': algorithm})
    } else if (e.data.cmd == 'sweep'){
        e.data.graph = new Graph(e.data.graph)

        for (i in e.data.graph.edges){
            e1 = e.data.graph.edges[i]
            e2 = new Edge(e1.leftTable, e1.att1, e1.rigthTable, e1.att2)
            e.data.graph.edges[i] = e2
        }

        for (i in e.data.graph.edgeIndex){
            for (j in e.data.graph.edgeIndex[i]){
                e1 = e.data.graph.edgeIndex[i][j]
                e2 = new Edge(e1.leftTable, e1.att1, e1.rightTable, e1.att2)
                e.data.graph.edgeIndex[i][j] = e2
            }
        }

        let algorithm = new Sweep(e.data.graph)
        algorithm.arrange()

        postMessage({'graph': e.data.graph, 'algorithm': algorithm})
    }
  }
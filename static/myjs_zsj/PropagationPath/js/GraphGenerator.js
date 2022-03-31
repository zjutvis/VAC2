class GraphGenerator {
    constructor(depth=3, seed="hello", tableDistribution = [2,3], attributeDistribution=[1, 5], sameEdgeDistribution=0.05, randomEdgeDistribution=0.05){
        this.d = depth;
        this.s = 3;
        this.jd = 0.1;
        this.v = randomEdgeDistribution;
        this.js = sameEdgeDistribution;
        this.attributeCounter = 0;
        this.seed = seed;

        this.tableDistribution = tableDistribution;
        this.attributeDistribution = attributeDistribution;

        // random number generators
        this.rng = new Math.seedrandom(this.seed);
        this.tableDist = () => tableDistribution[0] + Math.round(this.rng() * (tableDistribution[1] - tableDistribution[0]))
        this.attrDist = () => attributeDistribution[0] + Math.round(this.rng() * (attributeDistribution[1] - attributeDistribution[0]))
    }

    generate(){
        let g = new Graph()
        g.baseRowDistance = this.attributeDistribution[1] + 2;

        for (var i=1; i<this.d; i++){
            g.newLayer()
            for (var j=0; j<this.tableDist(); j++){
                g.addTable(this.generateTable(i, j))
            }
        }

        this.generateProjections(g);
        this.generateJoins(g);
        
        g.ensureUniqueEdges();

        return g;
    }

    generateTable(depth, index){
        let name = "T" + depth + "y" + index
        var newTable = new Table(name, name, false, depth);

        for (var i=0; i<this.attrDist(); i++){
            newTable.addAttribute("a" + this.attributeCounter);
            this.attributeCounter += 1;
        }

        return newTable
    }

    generateProjections(g){
        let layer1 = g.tableIndex[1];
        let layer1attrs = [];
        let selectTable = new Table("select", "SELECT", true, 0)
        let projectedAttrs = [];
        let projected = [];
        let projectedCount = 0;

        for (let t of layer1){
            let attrs = t.attributes;
            let strictIndex = Math.floor(this.rng()*attrs.length)
            let strict = attrs[strictIndex]
            projectedAttrs.push(strict)
            projected.push(strict)

            for (let attr of attrs){
                if (attr != strict){
                    layer1attrs.push(new Attribute(t, attr))
                }
            }
            projectedCount++;
        }

        let countProjections = this.s * (layer1attrs.length + projectedCount)

        g.addTable(selectTable)

        for (; projectedCount<countProjections; projectedCount++){
            let attrIndex = Math.floor(this.rng()*layer1attrs.length)
            let attr = layer1attrs[attrIndex]
            layer1attrs.splice(attrIndex, 1)
        }

        for (let attr of projectedAttrs){
            let newAttr = new Attribute(selectTable, "a" + this.attributeCounter++)
            newAttr.mutable = false;
            selectTable.attributes.push(newAttr)
            g.addEdge(new Edge(selectTable, newAttr, attr.table, attr))
        }
    
        // weird. not finished.
    }

    generateInterLayerJoins(g){
        for (var i = 1; i < this.d; i++){
            let leftLayer = g.tableIndex[i];
            let rightLayer = g.tableIndex[i + 1];

            let leftLayerAttrs = [];
            let rightLayerAttrs = [];

            for (let table of leftLayer){
                let attrs = table.attributes;
                for (let attr of attrs){
                    leftLayerAttrs.push(new Attribute(table, attr))
                }
            }

            for (let table of rightLayer){
                if (leftLayerAttrs.length == 0) break;
                let attrs = table.attributes;

                let strict = attrs[Math.floor(this.rng()*attrs.length)]
                
                let leftIndex = Math.floor(this.rng()*leftLayerAttrs.length)
                let left = leftLayerAttrs[leftIndex]
                leftLayerAttrs.splice(leftIndex, 1)

                g.addEdge(new Edge(left.table, left.attr, table, strict))

                left.diffEdges++;
                strict.diffEdges++;

                for (let attr of attrs){
                    if (attr != strict)
                        rightLayerAttrs.push(new Attribute(table, attr))
                }
            }

            for (let left of leftLayerAttrs){
                if (rightLayerAttrs.length == 0) break;
                if (this.rng() < this.jd){
                    let rightIndex = Math.floor(this.rng()*rightLayerAttrs.length)
                    let right = rightLayerAttrs[rightIndex]
                    rightLayerAttrs.splice(rightIndex, 1)

                    g.addEdge(new Edge(left.table, left.attr, right.table, right.attr))

                    left.diffEdges++;
                    right.diffEdges++;
                }
            }
        }
    }

    generateInLayerJoins(g){
        for (var i=1; i<this.d; i++){
            let layer = g.tableIndex[i];

            for (let t1 of layer){
                let attrs1 = [];
                let attrs2 = [];

                for (let attr of t1.attributes){
                    attrs1.push(new Attribute(t1, attr))
                }

                for (let t2 of layer){
                    if (t1 == t2) continue;
                    for (let attr of t2.attributes){
                        if (attr.sameEdges == 0)
                            attrs2.push(new Attribute(t2, attr))
                    }
                }

                for (let attr1 of attrs1){
                    if (attrs2.length == 0) break;
                    if (this.rng() < this.js){
                        let attr2index = Math.floor(this.rng()*attrs2.length)
                        let attr2 = attrs2[attr2index]
                        attrs2.splice(attr2index, 1)
                        
                        g.addEdge(new Edge(attr1.table, attr1.attr, attr2.table, attr2.attr))

                        attr1.sameEdges++;
                        attr2.sameEdges++;
                    }
                }
            }
        }
    }

    generateRandomJoins(g){
        let leftAttrs = [];

        for (let i=1; i<this.d; i++){
            let currAttrs = g.tableIndex[i].map(t => t.attributes).flat().filter(a => g.edges.find(e => e.rightAttribute == a) == undefined)
            let rightAttrs = g.tableIndex[i + 1].map(t => t.attributes).flat()
            
            for (let ta of currAttrs){
                if (this.rng() < this.v){
                    let ratio = leftAttrs.length / (leftAttrs.length + rightAttrs.length)
                    
                    if (this.rng() < ratio){
                        let tmpIndex = Math.floor(this.rng()*leftAttrs.length)
                        let other = leftAttrs[tmpIndex]
                        leftAttrs.splice(tmpIndex, 1)
                        g.addEdge(new Edge(other.table, other, ta.table, ta))
                    } else {

                    }
                }
            }

            leftAttrs = currAttrs.filter(a => g.edges.find(e => e.leftAttribute == a) == undefined);
            currAttrs = [];
            rightAttrs = [];
        }
    }

    generateJoins(g){
        this.generateInterLayerJoins(g);
        this.generateInLayerJoins(g);
        this.generateRandomJoins(g);
    }
}

try {
    module.exports = exports = GraphGenerator;
 } catch (e) {}
class GansnerSameRank {
    constructor(graph){
        this.g = graph;
        this.max_iterations = 6;
        this.elapsedTime = 0;

        this.iterations = [];
        this.cur_iteration = 0;
    }

    apply_iteration(iter_num){
        this.applyArrangement(this.iterations[iter_num]);
    }

    quicksort(array) {
        if (array.length <= 1) {
          return array;
        }
      
        var pivot = array[0];
        
        var left = []; 
        var right = [];
      
        for (var i = 1; i < array.length; i++) {
          array[i] < pivot ? left.push(array[i]) : right.push(array[i]);
        }
      
        return quicksort(left).concat(pivot, quicksort(right));
      };

    median(array) {
        array = array.sort();
        if (array.length % 2 === 0) {
          return (array[array.length/2] + array[(array.length / 2) - 1]) / 2;
        }
        else return array[(array.length - 1) / 2]; 
      }

    applyArrangement(cloneGraph){
        //console.log(cloneGraph);
        for (let table of cloneGraph.tables){
            let table2 = this.g.tables.find(t => t.name == table.name)
            table2.weight = table.weight;
            table2.assignedWeight = table.assignedWeight;

            for (let attribute of table.attributes){
                let attribute2 = table2.attributes.find(a => a.name == attribute.name)
                attribute2.weight = attribute.weight
                attribute2.assignedWeight = attribute.assignedWeight
            }
        }
    }

    arrange(){
        let startTime = new Date().getTime()

        this.g.setExactWeights();

        let best_crossings = this.g.getEdgeCrossings()

        for (let i=0; i<this.max_iterations; i++){
            this.cur_iteration = i;
            let cloneGraph = _.cloneDeep(this.g)
            
            if (i%2 == 0) {
                this.arrangeLeft(cloneGraph)
            } else this.arrangeRight(cloneGraph)

            this.transpose(cloneGraph);

            let cur_crossings = cloneGraph.getEdgeCrossings()
            
            if (cur_crossings <= best_crossings) {
                this.applyArrangement(cloneGraph)
                best_crossings = cur_crossings
            }

            this.iterations[this.cur_iteration] = _.cloneDeep(cloneGraph);
        }

        this.elapsedTime = new Date().getTime() - startTime;
    }

    arrangeLeft(g){
        console.log('Left')
        let tmpWeightsTables = {};
        let tmpAttributeWeights = {};

        for (let i=1; i<=g.maxDepth + 1; i++){
            let layerTables = g.tableIndex[i];
            let layerEdges = g.edgeIndex[i-1];

            for (let t in layerTables){
                let table = layerTables[t];

                let weights = layerEdges
                    .filter(e => e.rightTable == table && !this.isSameRankEdge(e))
                    .map(e => parseFloat(e.leftTable.weight))
       
                let val = this.median(weights);
                if (!isNaN(val)) tmpWeightsTables[table.name] = val;
                tmpAttributeWeights[table.name] = {};

                for (let attribute of table.attributes){
                    let tableWeights = layerEdges
                        .filter(e => e.rightAttribute == attribute  && !this.isSameRankEdge(e))
                        .map(e => parseFloat(e.leftTable.weight))

                    let attributeWeights = layerEdges
                        .filter(e => e.rightAttribute == attribute  && !this.isSameRankEdge(e))
                        .map(e => parseFloat(e.leftAttribute.weight))

                    let val = parseFloat(this.median(tableWeights)) + parseFloat(this.median(attributeWeights)/table.attributes.length);

                    if (!isNaN(val)) tmpAttributeWeights[table.name][attribute.name] = val;
                }
            }
        }

        this.reorder(g, tmpWeightsTables, tmpAttributeWeights);
    }

    arrangeRight(g){
        console.log('Right')
        let tmpWeightsTables = {};
        let tmpAttributeWeights = {};

        for (let i = g.maxDepth - 1; i>0; i--){
            let layerTables = g.tableIndex[i];
            let layerEdges = g.edgeIndex[i];

            for (let table of layerTables){
                let weights = layerEdges
                    .filter(e => e.leftTable == table)
                    .map(e => parseFloat(e.rightTable.weight))

                let val = parseFloat(this.median(weights));

                if (!isNaN(val)) tmpWeightsTables[table.name] = val;
                tmpAttributeWeights[table.name] = {};

                for (let attribute of table.attributes){
                    let tableWeights = layerEdges
                        .filter(e => e.leftAttribute == attribute)
                        .map(e => parseFloat(e.rightTable.weight))

                    let attributeWeights = layerEdges
                        .filter(e => e.leftAttribute == attribute)
                        .map(e => parseFloat(e.rightAttribute.weight))

                    let val = parseFloat(this.median(tableWeights)) + parseFloat(this.median(attributeWeights)/table.attributes.length);

                    if (!isNaN(val)) tmpAttributeWeights[table.name][attribute.name] = val;
                }
            }
        }

        this.reorder(g, tmpWeightsTables, tmpAttributeWeights)
    }

    isSameRankEdge(e){
        return e.leftTable.depth == e.rightTable.depth;
    }

    reorder(g, tmpWeightsTables, tmpAttributeWeights){
        for (let i in g.tableIndex){

            // is this correct?
            if (i == 0) continue;

            for (let j in g.tableIndex[i]){
                let tabl = g.tableIndex[i][j];

                // is this correct?
                if (tmpWeightsTables[tabl.name] == undefined) continue;

                tabl.weight = tmpWeightsTables[tabl.name];
                tabl.assignedWeight = tmpWeightsTables[tabl.name];

                for (let k in tabl.attributes){
                    let attr = tabl.attributes[k]
                    attr.weight = tmpAttributeWeights[tabl.name][attr.name]
                    attr.assignedWeight = tmpAttributeWeights[tabl.name][attr.name]
                }

                tabl.attributes.sort((a, b) => {
                    if (isNaN(a.weight) || isNaN(b.weight)) return 0;
                    else return a.weight > b.weight ? 1 : -1;
                })

                for (let k in tabl.attributes){
                    let attr = tabl.attributes[k]
                    attr.weight = k;
                }
            }

            g.tableIndex[i].sort((a, b) => {
                if (isNaN(a.weight) || isNaN(b.weight)) return 0;
                else return a.weight > b.weight ? 1 : -1;
            })

            for (let j in g.tableIndex[i]){
                let tabl = g.tableIndex[i][j];
                tabl.weight = j;
            }
        }
    }

    transpose(g){
        let improved = true;
        while (improved){
            improved = false;
            for (let i=0; i<=g.maxDepth; i++){

                let initCrossings = g.getEdgeCrossingsAtDepth(i);

                let layerTables = g.tableIndex[i];
                
                for (let j = 0; j < layerTables.length - 1; j++){
                    let table1 = layerTables[j];
                    let table2 = layerTables[j+1];

                    this.swap(table1, table2);

                    let curCrossings = g.getEdgeCrossingsAtDepth(i) + g.getEdgeCrossingsAtDepth(i+1)

                    if (curCrossings < initCrossings){
                        improved = true;
                    } else this.swap(table1, table2)
                }

                for (let table of layerTables){
                    
                    for (let k=0; k < table.attributes.length - 1; k++){
                        let attr1 = table.attributes[k]
                        let attr2 = table.attributes[k+1]

                        this.swap(attr1, attr2)

                        let curCrossings2 = g.getEdgeCrossingsAtDepth(i) + g.getEdgeCrossingsAtDepth(i+1)

                        if (curCrossings2 < initCrossings){
                            improved = true;
                        } else this.swap(attr1, attr2)
                    }
                }
            }
        }
    }

    swap(w1, w2){
        let tmpw = w1.weight;
        w1.weight = w2.weight;
        w2.weight = tmpw;
    }
}
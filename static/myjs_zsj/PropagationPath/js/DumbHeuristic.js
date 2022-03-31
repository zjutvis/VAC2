class DumbHeuristic {
    constructor(g){
        this.g = g;
    }

    arrange(){
        for (let i=0; i<this.g.maxDepth; i++){
            let edges = g.edgeIndex[i];
            edges = edges.sort((a, b) => a.compareTo(b))

            for (let j=0; j<edges.length-1; j++){
                let edge1 = edges[j];
                let edge2 = edges[j+1];

                if (edge1.leftTable == edge2.leftTable 
                    && (edge1.leftAttribute.mutable || edge2.leftAttribute.mutable)){
                        this.swap(edge1.leftAttribute, edge2.leftAttribute)
                        if (edge1.rightAttribute.mutable || edge2.rightAttribute.mutable){
                            if (edge1.rightTable == edge2.rightTable) 
                                this.swap(edge1.rightAttribute, edge2.rightAttribute)
                            else this.swap(edge1.rightTable, edge2.rightTable)
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
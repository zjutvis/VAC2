class Sweep {
    constructor(g){
        this.g = g;
        this.elapsedTime = 0;
    }

    arrange(){
        let startTime = new Date().getTime();

        this.g.setExactWeights();
        this.sweepRight();
        this.sweepLeft();

        this.elapsedTime = new Date().getTime() - startTime;
    }

    sweepRight(){
        for (let i = 1; i <= this.g.maxDepth; i++){
            let layerTables = this.g.tableIndex[i];
            let crosses, curCrosses;

            do {
                crosses = this.g.getEdgeCrossingsAtDepth(i-1) + this.g.getEdgeCrossingsAtDepth(i);
                curCrosses = crosses;

                do {
                    crosses = this.g.getEdgeCrossingsAtDepth(i-1) + this.g.getEdgeCrossingsAtDepth(i);
                    curCrosses = crosses;

                    for (let j=0; j<layerTables.length - 1; j++){
                        let t1 = layerTables[j];
                        let t2 = layerTables[j+1];
                        this.swap(t1, t2);
                        let newCrosses = this.g.getEdgeCrossingsAtDepth(i-1) + this.g.getEdgeCrossingsAtDepth(i);
                        if (curCrosses > newCrosses){
                            curCrosses = newCrosses
                            layerTables[j] = t2;
                            layerTables[j+1] = t1;
                        } else this.swap(t1, t2);
                    }

                } while (crosses > curCrosses);

                do {
                    crosses = this.g.getEdgeCrossingsAtDepth(i-1) + this.g.getEdgeCrossingsAtDepth(i);
                    curCrosses = crosses;

                    for (let j=0; j<layerTables.length; j++){
                        let attrs = layerTables[j].attributes;

                        for (let k=0; k<attrs.length -1; k++){
                            let a1 = attrs[k]
                            let a2 = attrs[k+1]
                            this.swap(a1, a2);

                            let newCrosses = this.g.getEdgeCrossingsAtDepth(i-1) + this.g.getEdgeCrossingsAtDepth(i);
                        
                            if (curCrosses > newCrosses){
                                curCrosses = newCrosses;
                                attrs[k] = a2;
                                attrs[k+1] = a1;
                            } else this.swap(a1, a2);
                        }
                    }

                } while (crosses > curCrosses);

            } while (crosses > curCrosses);
        }
    }

    sweepLeft(){
        for (let i=this.g.maxDepth; i>=2; i--){
            let layerTables = this.g.tableIndex[i-1];
            let crosses, curCrosses;

            do {
                crosses = this.g.getEdgeCrossingsAtDepth(i-1) + this.g.getEdgeCrossingsAtDepth(i-2);
                curCrosses = crosses;

                do {
                    crosses = this.g.getEdgeCrossingsAtDepth(i-1) + this.g.getEdgeCrossingsAtDepth(i-2);
                    curCrosses = crosses;

                    for (let j=0; j<layerTables.length - 1; j++){
                        let t1 = layerTables[j];
                        let t2 = layerTables[j+1];

                        this.swap(t1, t2);
                        let newCrosses = this.g.getEdgeCrossingsAtDepth(i-1) + this.g.getEdgeCrossingsAtDepth(i-2);
                        if (curCrosses > newCrosses){
                            curCrosses = newCrosses;
                            layerTables[j] = t2;
                            layerTables[j+1] = t1;
                        } else this.swap(t1, t2);
                    }
                } while (crosses > curCrosses);

                do {
                    crosses = this.g.getEdgeCrossingsAtDepth(i-1) + this.g.getEdgeCrossingsAtDepth(i-2);
                    curCrosses = crosses;

                    for (let j=0; j<layerTables.length; j++){
                        let attrs = layerTables[j].attributes;

                        for (let k=0; k<attrs.length -1; k++){
                            let a1 = attrs[k]
                            let a2 = attrs[k+1]
                            this.swap(a1, a2);

                            let newCrosses = this.g.getEdgeCrossingsAtDepth(i-1) + this.g.getEdgeCrossingsAtDepth(i-2);
                        
                            if (curCrosses > newCrosses){
                                curCrosses = newCrosses;
                                attrs[k] = a2;
                                attrs[k+1] = a1;
                            } else this.swap(a1, a2);
                        }
                    }
                } while (crosses > curCrosses);

            } while (crosses > curCrosses);
        }
    }

    swap(w1, w2){
        let tmpw = w1.weight;
        w1.weight = w2.weight;
        w2.weight = tmpw;
    }
}
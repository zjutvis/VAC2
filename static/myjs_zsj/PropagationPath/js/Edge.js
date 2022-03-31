class Edge {
    constructor(leftTable, att1, rightTable, att2){
        this.leftTable = leftTable;
        this.att1 = att1;
        this.leftAttribute = att1;
        this.rightTable = rightTable;
        this.att2 = att2;
        this.rightAttribute = att2;
    }

    compareTo(otherEdge){
        if (this.leftTable == otherEdge.leftTable){
            // edges have the same left table
            if (this.rightTable == otherEdge.rightTable){
                // and the same right table
                if (this.leftAttribute.weight > otherEdge.leftAttribute.weight && this.rightAttribute.weight < otherEdge.rightAttribute.weight)
                    return true;
                else if (this.leftAttribute.weight < otherEdge.leftAttribute.weight && this.rightAttribute.weight > otherEdge.rightAttribute.weight)
                    return true;
            } else if (this.rightTable.weight < otherEdge.rightTable.weight && this.leftAttribute.weight > otherEdge.leftAttribute.weight)
                // right table is under but left attribute is over
                return true;
            else if (this.rightTable.weight > otherEdge.rightTable.weight && this.leftAttribute.weight < otherEdge.leftAttribute.weight)
                // right table is over but left attribute is under
                return true;
        } else if (this.rightTable == otherEdge.rightTable){
            // edges have the same right table
            if (this.leftTable == otherEdge.leftTable){
                // and the same left table
                if (this.leftAttribute.weight > otherEdge.leftAttribute.weight && this.rightAttribute.weight < otherEdge.rightAttribute.weight)
                    return true;
                else if (this.leftAttribute.weight < otherEdge.leftAttribute.weight && this.rightAttribute.weight > otherEdge.rightAttribute.weight)
                    return true;
            } else if (this.leftTable.weight < otherEdge.leftTable.weight && this.rightAttribute.weight > otherEdge.rightAttribute.weight)
                // left table is under but right attribute is over
                return true;
            else if (this.leftTable.weight > otherEdge.leftTable.weight && this.rightAttribute.weight < otherEdge.rightAttribute.weight)
                // left table is over but right attribute is under
                return true;
        } else {
            // edges have different tables both on the left and on the right
            if (this.leftTable.weight < otherEdge.leftTable.weight && this.rightTable.weight > otherEdge.rightTable.weight)
                return true
            else if (this.leftTable.weight > otherEdge.leftTable.weight && this.rightTable.weight < otherEdge.rightTable.weight){
                return true
            }
        }

        return false;
    }

    compareSelfEdgeTo(otherEdge){
        if (this.leftTable.depth == this.rightTable.depth && otherEdge.leftTable.depth == otherEdge.rightTable.depth){
            // they are both self edges
            if (this.leftTable == otherEdge.leftTable){
                // they have the same left table
                if (this.rightTable == otherEdge.rightTable){
                    // and the same right table
                    if (this.leftAttribute.weight < otherEdge.leftAttribute.weight && this.rightAttribute.weight < otherEdge.rightAttribute.weight)
                        return true
                    else if (this.leftAttribute.weight > otherEdge.leftAttribute.weight && this.rightAttribute.weight > otherEdge.rightAttribute.weight)
                        return true
                } else {
                    if (this.leftAttribute.weight < otherEdge.leftAttribute.weight && this.rightTable.weight < otherEdge.rightTable.weight)
                        return true
                    else if (this.leftAttribute.weight > otherEdge.leftAttribute.weight && this.rightTable.weight > otherEdge.rightTable.weight)
                        return true
                }
            } else if (this.leftTable == otherEdge.rightTable){
                // the left table of the first is the right table of the other
                if (this.rightTable == otherEdge.leftTable){
                    // the left table is the same as the right table
                    if (this.rightAttribute.weight < otherEdge.leftAttribute.weight && this.leftAttribute.weight < otherEdge.rightAttribute.weight)
                        return true;
                    else if (this.rightAttribute.weight > otherEdge.leftAttribute.weight && this.leftAttribute.weight > otherEdge.rightAttribute.weight)
                        return true;
                } else {
                    if (this.leftAttribute.weight < otherEdge.rightAttribute.weight && this.rightTable.weight < otherEdge.leftTable.weight)
                        return true;
                    else if (this.leftAttribute.weight > otherEdge.rightAttribute.weight && this.rightTable.weight > otherEdge.leftTable.weight)
                        return true;
                }
            } else if (this.rightTable == otherEdge.leftTable){
                // the right table of the first is the left table of the second
                if (this.leftTable == otherEdge.rightTable){
                    if (this.rightAttribute.weight < otherEdge.leftAttribute.weight && this.leftAttribute.weight < otherEdge.rightAttribute.weight)
                        return true;
                    else if (this.rightAttribute.weight > otherEdge.leftAttribute.weight && this.leftAttribute.weight > otherEdge.rightAttribute.weight)
                        return true;
                } else {
                    if (this.rightAttribute.weight < otherEdge.leftAttribute.weight && this.leftTable.weight < otherEdge.rightTable.weight)
                        return true;
                    else if (this.rightAttribute.weight > otherEdge.leftAttribute.weight && this.leftTable.weight > otherEdge.rightTable.weight)
                        return true;
                }
            } else if (this.rightTable == otherEdge.rightTable){
                // they have the same right table
                if (this.leftTable == otherEdge.leftTable){
                    // and the same right table
                    if (this.leftAttribute.weight < otherEdge.leftAttribute.weight && this.rightAttribute.weight < otherEdge.rightAttribute.weight)
                        return true
                    else if (this.leftAttribute.weight > otherEdge.leftAttribute.weight && this.rightAttribute.weight > otherEdge.rightAttribute.weight)
                        return true
                } else {
                    if (this.rightAttribute.weight < otherEdge.rightAttribute.weight && this.leftTable.weight < otherEdge.leftTable.weight)
                        return true
                    else if (this.rightAttribute.weight > otherEdge.rightAttribute.weight && this.leftTable.weight > otherEdge.leftTable.weight)
                        return true
                }
            }
        } else {
            // one is a self edge but the other is not
            if (this.leftTable.depth == this.rightTable.depth){
                // the first is a self edge
                if (this.leftTable == otherEdge.leftTable){
                    // the first's left table is the same as the other
                    if (this.leftAttribute.weight < otherEdge.leftAttribute.weight && this.rightTable.weight > otherEdge.leftTable.weight)
                        return true
                    else if (this.leftAttribute.weight > otherEdge.leftAttribute.weight && this.rightTable.weight < otherEdge.leftTable.weight)
                        return true
                } else if (this.rightTable == otherEdge.rightTable){
                    // the first's right table is the same as the other
                    if (this.rightAttribute.weight < otherEdge.leftAttribute.weight && this.leftTable.weight > otherEdge.leftTable.weight)
                        return true
                    else if (this.rightAttribute.weight > otherEdge.leftAttribute.weight && this.leftTable.weight < otherEdge.leftTable.weight)
                        return true
                } else {
                    // they don't share any table
                    if (this.leftTable.weight > otherEdge.leftTable.weight && this.rightTable.weight < otherEdge.leftTable.weight)
                        return true;
                    else if (this.leftTable.weight < otherEdge.leftTable.weight && this.rightTable.weight > otherEdge.leftTable.weight)
                        return true;
                }
            } else {
                // the second is a self edge
                if (otherEdge.leftTable == this.leftTable){
                    // the other's left table is the same as the first's
                    if (otherEdge.leftAttribute.weight < this.leftAttribute.weight && otherEdge.rightTable.weight > this.leftTable.weight)
                        return true
                    else if (otherEdge.leftAttribute.weight > this.leftAttribute.weight && otherEdge.rightTable.weight < this.leftTable.weight)
                        return true
                } else if (otherEdge.rightTable == this.leftTable){
                    // the other's right table is the same as the first's right
                    if (otherEdge.rightAttribute.weight < this.leftAttribute.weight && otherEdge.leftTable.weight > this.leftTable.weight)
                        return true
                    else if (otherEdge.rightAttribute.weight > this.leftAttribute.weight && otherEdge.leftTable.weight < this.leftTable.weight)
                        return true
                } else {
                    // they don't share any table
                    if (otherEdge.leftTable.weight < this.leftAttribute.weight && otherEdge.rightTable.weight > this.leftAttribute.weight)
                        return true;
                    else if (otherEdge.leftTable.weight > this.leftAttribute.weight && otherEdge.rightTable.weight < this.leftAttribute.weight)
                        return true;
                }
            }
        }
    }

    crosses(otherEdge){
        if (this.leftTable.depth == this.rightTable.depth || otherEdge.leftTable.depth == otherEdge.rightTable.depth) 
            return this.compareSelfEdgeTo(otherEdge)

        if (this.compareTo(otherEdge)){
            return true;
        }

        return false;
    }

    compare(arg0){
        if (arg0 == undefined) return 1;
        let ret = this.compareAttributes(this.leftTable, this.leftAttribute, arg0.leftTable, arg0.leftAttribute)
    }

    compareAttributes(t1, a1, t2, a2){
        let ret = t1.compareTo(t2)
        if (ret == 0) ret = a1.compareTo(a2);
        return ret;
    }

    isSameRankEdge(){
        return this.leftTable.depth == this.rightTable.depth
    }

    getBendiness(){
        let res = 0;
        let factor = 10/(this.leftTable.graph.baseRowDistance*10);
        //if (this.leftTable.name == "select") console.log(this.rightTable.name, 'selectpos', this.leftTable.weight + this.leftAttribute.weight * factor + this.leftTable.verticalAttrOffset * factor, 'thispos', this.rightTable.weight + this.rightAttribute.weight * factor + this.rightTable.verticalAttrOffset * factor)
        res = (this.rightTable.weight + this.rightAttribute.weight * factor + this.rightTable.verticalAttrOffset * factor) - (this.leftTable.weight + this.leftAttribute.weight * factor + this.leftTable.verticalAttrOffset * factor);
        //if (this.leftTable.name == "select") console.log(res)
        res = Math.round(res*1000)/1000
        //if (this.leftTable.name == "select") console.log(res)
        return Math.abs(res);
    }
}

try {
    module.exports = exports = Edge;
 } catch (e) {}
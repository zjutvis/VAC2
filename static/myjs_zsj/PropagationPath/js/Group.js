class Group {
    constructor(groupHeader = undefined){
        this.tables = [];
        this.coords = [];
        this.x_coord = 0;
        this.y_coord = 0;
        this.width_coord = 0;
        this.height_coord = 0;
        this.id = undefined;
        this.margin = 5;
        this.graph = undefined;

        if (groupHeader != undefined){
            this.groupHeader = "count";
            this.groupHeaderTable = new Table(this.groupHeader, this.groupHeader, true, 20, "groupheader");
            this.addTable(this.groupHeaderTable);
        }

        this.coords = [];
    }

    addTable(table){
        table.group = this;
        table.groups.push(this);
        this.tables.push(table);
        this.updateCoords();
    }

    updateCoordsPrecise(){
        this.coords = [];
        // this will need to be changed in case we decide to use a vertical positioning that is not fixed

        let leftMaxDepth = Math.min.apply(0, this.tables.map(t => t.depth));
        let leftTable = this.tables.find(t => t.depth == leftMaxDepth);
        this.x_coord = leftTable.depth;

        let topMax = Math.min.apply(0, this.tables.map(t => t.weight));
        let topTable = this.tables.find(t => t.weight == topMax);
        this.y_coord = topTable.weight;

        let rightMax = Math.max.apply(0, this.tables.map(t => t.depth));
        let rightTable = this.tables.find(t => t.depth == rightMax);
        this.width_coord = rightTable.depth - leftTable.depth;
        
        let bottomMax = Math.max.apply(0, this.tables.map(t => t.weight));
        let bottomTable = this.tables.find(t => t.weight == bottomMax);
        this.height_coord = bottomTable.weight - topTable.weight;

        let depthrange = [leftTable.depth, rightTable.depth];
        
        for (let i=0; i<depthrange.length; i++){
            let cur_d = depthrange[i];
            let numthisDepth = Math.min.apply(0, this.tables.filter(t => t.depth == cur_d).map(d => d.weight));
            let topTable = this.tables.find(t => t.depth == cur_d && t.weight == numthisDepth);

            this.coords.push([topTable.depth*depth_distance - this.margin, topTable.weight*table_vert_space + topTable.verticalAttrOffset*attr_height - this.margin])
            this.coords.push([topTable.depth*depth_distance + table_width + this.margin, topTable.weight*table_vert_space + topTable.verticalAttrOffset*attr_height - this.margin])
        }

        for (let i=depthrange.length - 1; i>=0; i--){
            let cur_d = depthrange[i];
            let numthisDepth = Math.max.apply(0, this.tables.filter(t => t.depth == cur_d).map(d => d.weight));
            let bottomTable = this.tables.find(t => t.depth == cur_d && t.weight == numthisDepth);

            this.coords.push([bottomTable.depth*depth_distance + table_width + this.margin, bottomTable.weight*table_vert_space + (1 + bottomTable.attributes.length)*attr_height + bottomTable.verticalAttrOffset*attr_height + this.margin])
            this.coords.push([bottomTable.depth*depth_distance - this.margin, bottomTable.weight*table_vert_space + (1 + bottomTable.attributes.length)*attr_height + bottomTable.verticalAttrOffset*attr_height + this.margin])
        }

        this.coords.push(this.coords[0]);
    }

    get_subgroups(){
        let subgroup_list = [];
        if (this.tables.length == 1) return [];
        // console.log('numTables', this.tables.length)

        for (let t of this.tables){
            for (let gr2 of t.groups){
                if (subgroup_list.indexOf(gr2) != -1 || gr2 == this) continue;
                let isSubgroup = true;
                for (let t2 of gr2.tables){
                    if (this.tables.indexOf(t2) == -1) isSubgroup = false;
                }
                if (isSubgroup) subgroup_list.push(gr2);
            }
        }
        return subgroup_list;
    }

    updateCoords(){
        this.margin += this.get_subgroups().length * 5;
        
        this.coords = [];

        let leftMaxDepth = Math.min.apply(0, this.tables.map(t => t.depth));
        let leftTable = this.tables.find(t => t.depth == leftMaxDepth);
        this.x_coord = leftTable.depth;

        let computeYCoord = (table) => {
            return parseFloat(table.weight) * table_vert_space + table.verticalAttrOffset * attr_height;
        }

        let topMax = Math.min.apply(0, this.tables.map(t => computeYCoord(t)));
        let topTable = this.tables.find(t => (computeYCoord(t) == topMax));
        this.y_coord = computeYCoord(topTable);

        let rightMax = Math.max.apply(0, this.tables.map(t => t.depth));
        let rightTable = this.tables.find(t => t.depth == rightMax);
        this.width_coord = rightTable.depth - leftTable.depth;

        let computeYCoordBottom = (table) => {
            return computeYCoord(table) + (1 + table.attributes.length)*attr_height
        }
        
        let bottomMax = Math.max.apply(0, this.tables.map(t => computeYCoordBottom(t)));
        let bottomTable = this.tables.find(t => computeYCoordBottom(t) == bottomMax);
        this.height_coord = computeYCoordBottom(bottomTable);
        
        this.coords.push([leftTable.depth*depth_distance - this.margin, this.y_coord - this.margin])
        this.coords.push([leftTable.depth*depth_distance + this.margin + this.width_coord*depth_distance + table_width, this.y_coord - this.margin])
        this.coords.push([leftTable.depth*depth_distance + this.margin + this.width_coord*depth_distance + table_width, this.height_coord + this.margin])
        this.coords.push([leftTable.depth*depth_distance - this.margin, this.height_coord + this.margin])
        
        this.coords.push(this.coords[0]);

        if (this.groupHeader != undefined) this.groupHeaderTable.depth = leftMaxDepth;
        // "translate(" + (d.depth*depth_distance) + "," 
        // + (g.tableIndex[d.depth].indexOf(d) * table_vert_space + d.verticalAttrOffset * attr_height) + ")" )
    }
}
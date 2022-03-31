class LPBendinessCombinedPlusGroups {
    constructor (g, options) {
        this.g = g;
        this.mip = true;
        this.verbose = false;
        this.elapsedTime = 0;
        this.numConstraints = 0;
        this.modelString = "";

        if (options == undefined){
            this.options = {
                bendiness_reduction_active: true,
                bendiness_reduction_type: "simple", // either "simple" or "optimize_angles"
                crossings_reduction_active: true,
                crossings_reduction_weight: 1,
                bendiness_reduction_weight: 0.1,
                bendiness_angle_optimization_weight: 0.01
            }
        } else this.options = options;
        
    }

    async arrange(){

        // TODO: temporary fix
        if (this.options.crossings_reduction_active == false && this.options.bendiness_reduction_active == false) return;

        let startTime = new Date().getTime()

        // build model from graph
        let model = {}

        this.fillModel(model)
        let prob = this.modelToString(model)
        this.modelString = prob;
        if (model.minimize.length <= 10) return;

        // solve
        let result = {}, objective, i;

        if (this.verbose) glp_set_print_func(console.log);

        let lp = glp_create_prob();
        glp_read_lp_from_string(lp, null, prob);

        glp_scale_prob(lp, GLP_SF_AUTO);
            
        let smcp = new SMCP({presolve: GLP_ON});
        glp_simplex(lp, smcp);

        if (this.mip){
            glp_intopt(lp);
            objective = glp_mip_obj_val(lp);

            for(i = 1; i <= glp_get_num_cols(lp); i++){
                result[glp_get_col_name(lp, i)] = glp_mip_col_val(lp, i);
            }
        } else {
            objective = glp_get_obj_val(lp);
            for(i = 1; i <= glp_get_num_cols(lp); i++){
                result[glp_get_col_name(lp, i)] = glp_get_col_prim (lp, i);
            }
        }

        this.apply_solution(result)

        this.elapsedTime = new Date().getTime() - startTime 
    }

    fillModel(model){

        this.m = 30; // TODO: change this
        this.zcount = 0;
        this.buffer = 2;

        model.minimize = "Minimize \n"
        model.subjectTo = "Subject To \n"
        model.bounds = "\nBounds \n"

        this.definitions = {}
        this.crossing_vars = {}

        // store all variable names in order
        for (let k=0; k < this.g.maxDepth + 1; k++){
            let layerTables = this.g.tableIndex[k];
            let layerAttributes = layerTables.map(t => t.attributes).flat();

            // store tables
            for (let i=0; i<layerTables.length; i++){
                let t1 = layerTables[i].id;
                for (let j=i+1; j<layerTables.length; j++){
                    let t2 = layerTables[j].id;
                    this.definitions[this.mkxBase(t1, t2, 'T')] = ''
                }
            }

            // store attributes
            for (let i=0; i<layerAttributes.length; i++){
                let a1 = layerAttributes[i].id;
                for (let j=i+1; j<layerAttributes.length; j++){
                    let a2 = layerAttributes[j].id;
                    this.definitions[this.mkxBase(a1, a2)] = ''
                }
            }
        }

        if (this.options.bendiness_reduction_active) this.setGroupConstraints(model);
        else {
            this.g.addBlankTables();
            this.xGroupConstraints(model);
        }
        this.setTransitivityConstraints(model);
        
        if (this.options.crossings_reduction_active) this.addCrossingsReduction(model)

       // constraint of attributes within tables
       for (let k=0; k<this.g.maxDepth + 1; k++){
            let layerTables = this.g.tableIndex[k];
            let layerAttributes = layerTables.map(t => t.attributes).flat()
            
            for (let i=0; i<layerAttributes.length; i++){
                let attr1 = layerAttributes[i].id;
                let t1 = layerAttributes[i].table.id;

                for (let j=i+1; j<layerAttributes.length; j++){
                    let attr2 = layerAttributes[j].id;
                    let t2 = layerAttributes[j].table.id

                    if (t1 != t2){
                        model.subjectTo += this.mkxBase(attr1, attr2) + ""
                            + " - " + this.mkxBase(t1, t2, 'T') 
                            + " = 0\n"
                    }
                }
            }
        }

        if (this.options.bendiness_reduction_active){
            if (this.options.bendiness_reduction_type == "simple") 
                this.addSimpleBendiness(this.g, model)
            else if (this.options.bendiness_reduction_type == "optimize_angles") 
                this.addBendinessPlusMaximizeCrossingAngle(this.g, model)
        } else {
            model.minimize = model.minimize.substring(0, model.minimize.length - 2) + "\n\n"
        }

        for (let elem in this.definitions){
            model.bounds += "binary " + elem + "\n"
        }
        for (let elem in this.crossing_vars){
            model.bounds += "binary " + elem + "\n"
        }

        // console.log(this.modelToString(model))
        this.numConstraints = model.subjectTo.split("\n").length;
        console.log("number of constraints: ", this.numConstraints)
    }

    mkc(u1, v1, u2, v2){
        let res = "c_" + u1 + v1 + "_" + u2 + v2;
        this.crossing_vars[res] = ""
        return res
    }

    mkxDict (sign, u1, u2, pre) {
        let res = ""
        let accumulator = 0
        let oppsign = " - "

        if (sign == " - ") oppsign = " + "

        let p = this.mkxBase(u1, u2, pre)
        if (this.definitions[p] != undefined){
            res += sign + p
        } else {
            p = this.mkxBase(u2, u1, pre)
            if (this.definitions[p] == undefined) console.warn(p + " not yet in dict");
            accumulator -= 1
            res += oppsign + p
        }

        return [res, accumulator];
    }

    groupConditionApplies(tt1, tt2, tt3){
        for (let group of tt1.groups){
            if (!tt2.groups.includes(group)) continue;
            else if (tt3.groups.includes(group)) continue;
            else return true;
        }
        return false;
    }

    xGroupConstraints(model){
        for (let group of this.g.groups){
            let minDepth = Math.min.apply(0, group.tables.map(t => t.depth))
            let maxDepth = Math.max.apply(0, group.tables.map(t => t.depth))

            for (let i=minDepth; i<maxDepth; i++){
                let tablesAtDepth1 = group.tables.filter(t => t.depth == i)
                let tablesOutGroupAtDepth1 = this.g.tables.filter(t => t.depth == i && !t.groups.includes(group))

                let tablesAtDepth2 = group.tables.filter(t => t.depth == i+1)
                let tablesOutGroupAtDepth2 = this.g.tables.filter(t => t.depth == i+1 && !t.groups.includes(group))

                let tstring1 = ""
                for (let t1 of tablesAtDepth1){
                    for (let t2 of tablesOutGroupAtDepth1){
                        tstring1 += " + " + this.mkxBase(t1.id, t2.id, 'T')
                    }
                }

                let tstring2 = ""
                for (let t1 of tablesAtDepth2){
                    for (let t2 of tablesOutGroupAtDepth2){
                        tstring2 += " - " + this.mkxBase(t1.id, t2.id, 'T') 
                    }
                }
                
                if (tstring1 == "" || tstring2 == "") continue;
                
                model.subjectTo += tstring1 + tstring2 + " = 0\n"

            }
        }
    }

    setTransitivityConstraints(model){
        for (let k=0; k < this.g.maxDepth + 1; k++){
            let layerTables = this.g.tableIndex[k];
            let layerAttributes = layerTables.map(t => t.attributes).flat()
            
            // global ordering of tables 
            for (let i=0; i<layerTables.length; i++){
                let t1 = layerTables[i].id;
                let tt1 = layerTables[i];

                for (let j = i+1; j < layerTables.length; j++){
                    let t2 = layerTables[j].id;
                    let tt2 = layerTables[j];

                    for (let m = j + 1; m < layerTables.length; m++){
                        let t3 = layerTables[m].id;
                        let tt3 = layerTables[m];

                        if (t1 == t2 || t2 == t3 || t1 == t3) continue;

                        if (this.groupConditionApplies(tt1, tt2, tt3)) {
                            model.subjectTo += ""
                                + this.mkxDict(" + ", t1, t3, 'T')[0]
                                + this.mkxDict(" - ", t2, t3, 'T')[0]
                                + " = " + ( - this.mkxDict(" - ", t2, t3, 'T')[1] + this.mkxDict(" + ", t1, t3, 'T')[1]) + "\n"
                            continue;
                        } else if (this.groupConditionApplies(tt1, tt3, tt2)){
                            model.subjectTo += ""
                                + this.mkxDict(" + ", t1, t2, 'T')[0]
                                + this.mkxDict(" - ", t3, t2, 'T')[0]
                                + " = " + ( - this.mkxDict(" - ", t3, t2, 'T')[1] + this.mkxDict(" + ", t1, t2, 'T')[1]) + "\n"
                            continue;
                        }

                        model.subjectTo += ""
                            + this.mkxBase(t1, t2, 'T')
                            + " + " + this.mkxBase(t2, t3, 'T')
                            + " - " + this.mkxBase(t1, t3, 'T')
                            + " >= 0\n"

                        model.subjectTo += ""
                            + "- " + this.mkxBase(t1, t2, 'T')
                            + " - " + this.mkxBase(t2, t3, 'T')
                            + " + " + this.mkxBase(t1, t3, 'T')
                            + " >= -1\n"
                    }
                }
            }

            // global ordering of attributes
            // constraints generated: O ( num_tables * num_attributes_per_table[variable] )
            for (let i = 0; i < layerAttributes.length; i++){
                let t1 = layerAttributes[i].id;
                
                for (let j = i+1; j < layerAttributes.length; j++){
                    let t2 = layerAttributes[j].id;
                    if (i == j) continue;

                    // attrs don't need transitivity if they are not in the same table - it's already given by the table
                    if (layerAttributes[i].table.id != layerAttributes[j].table.id) continue

                    for (let m = j+1; m < layerAttributes.length; m++){
                        if (m == j || m == i) continue

                        // again, all attributes should be in the same table
                        if (layerAttributes[m].table.id != layerAttributes[i].table.id) continue
                        if (layerAttributes[m].table.id != layerAttributes[j].table.id) continue

                        let t3 = layerAttributes[m].id;

                        if (t1 == t2 || t2 == t3 || t1 == t3) continue;

                        model.subjectTo += ""
                            + this.mkxBase(t1, t2)
                            + " + " + this.mkxBase(t2, t3)
                            + " - " + this.mkxBase(t1, t3)
                            + " >= 0\n"

                        model.subjectTo += ""
                            + "- " + this.mkxBase(t1, t2)
                            + " - " + this.mkxBase(t2, t3)
                            + " + " + this.mkxBase(t1, t3)
                            + " >= -1\n"
                    }

                    // attributes with value constraints should always be on the bottom
                    // this is removable for general formulations
                    if (layerAttributes[j].type == "constraint"){
                        model.subjectTo += "" 
                            + this.mkxDict(" + ", t1, t2)[0]
                            + " = " + (1 + this.mkxDict(" + ", t1, t2)[1]) + "\n";
                    } else if (layerAttributes[i].type == "constraint"){
                        model.subjectTo += "" 
                            + this.mkxDict(" + ", t2, t1)[0]
                            + " = " + (1 + this.mkxDict(" + ", t2, t1)[1]) + "\n";
                    }
                }
            }
        }
    }

    setGroupConstraints(model){
        // all groups should have the same y_start and y_end on every depth
        for (let group of this.g.groups){
            for (let table of group.tables){
                model.subjectTo += "y_groupstart_" + group.id + " - y_" + table.id + " <= 0\n";
                model.subjectTo += "y_groupend_" + group.id + " - y_" + table.id + " >= " + (table.attributes.length + this.buffer) + "\n";
            }

            for (let table of this.g.tables){
                if (group.tables.indexOf(table) == -1 && group.tables.map(t => t.depth).indexOf(table.depth) != -1){
                    model.subjectTo += "y_" + table.id + " - " + this.m + " z_" + this.zcount + " - y_groupstart_" + group.id + " <= - " + (table.attributes.length + this.buffer) + "\n";
                    model.subjectTo += "- y_" + table.id + " + " + this.m + " z_" + this.zcount + " + y_groupend_" + group.id + " <= " + this.m + "\n"
                    this.zcount += 1;
                }
            }            
        }

        for (let i=0; i<=this.zcount; i++){
            model.bounds += "binary z_" + i + "\n" 
        }
    }

    addCrossingsReduction(model){
        // determining crossings
        for (let k=0; k < this.g.maxDepth + 1; k++){
            let layerEdges = this.g.edgeIndex[k]

            for (let i=0; i<layerEdges.length; i++){
                let u1v1 = layerEdges[i];

                for (let j=i+1; j<layerEdges.length; j++){
                    let u2v2 = layerEdges[j];

                    let u1 = u1v1.leftAttribute.id
                    let v1 = u1v1.rightAttribute.id
                    let u2 = u2v2.leftAttribute.id
                    let v2 = u2v2.rightAttribute.id

                    // not not
                    if (!this.isSameRankEdge(u1v1) && !this.isSameRankEdge(u2v2)){
                        if (u1 == u2 || v1 == v2) continue

                        let p1 = this.mkc(u1, v1, u2, v2)
                        let finalsum = 1 + this.mkxDict(" + ", u2, u1)[1] + this.mkxDict(" + ", v1, v2)[1]
                        model.subjectTo += p1 + "" + this.mkxDict(" + ", u2, u1)[0] + this.mkxDict(" + ", v1, v2)[0]
                        model.subjectTo += " >= " + finalsum + "\n"

                        p1 = this.mkc(u1, v1, u2, v2)
                        finalsum = 1 + this.mkxDict(" + ", u1, u2)[1] + this.mkxDict(" + ", v2, v1)[1]
                        model.subjectTo += p1 + "" + this.mkxDict(" + ", u1, u2)[0] + this.mkxDict(" + ", v2, v1)[0]
                        model.subjectTo += " >= " + finalsum + "\n"
                        
                    // if they are both same rank edges
                    } else if (this.isSameRankEdge(u1v1) && this.isSameRankEdge(u2v2)) {

                        let p1 = this.mkc(u1, v1, u2, v2)
                        let finalsum = 1 + this.mkxDict(" + ", u1, u2)[1] + this.mkxDict(" + ", v1, v2)[1] + this.mkxDict(" + ", u2, v1)[1]
                        model.subjectTo += p1 + "" + this.mkxDict(" + ", u1, u2)[0] + this.mkxDict(" + ", v1, v2)[0] + this.mkxDict(" + ", u2, v1)[0]
                        model.subjectTo += " >= " + finalsum + "\n"

                        p1 = this.mkc(u1, v1, u2, v2)
                        finalsum = 1 + this.mkxDict(" + ", u1, u2)[1] + this.mkxDict(" + ", v1, v2)[1] + this.mkxDict(" + ", v2, u1)[1]
                        model.subjectTo += p1 + "" + this.mkxDict(" + ", u1, u2)[0] + this.mkxDict(" + ", v1, v2)[0] + this.mkxDict(" + ", v2, u1)[0]
                        model.subjectTo += " >= " + finalsum + "\n"

                    } else if (this.isSameRankEdge(u1v1) && !this.isSameRankEdge(u2v2)) {
                        
                        let p1 = this.mkc(u1, v1, u2, v2)
                        let finalsum = 1 + this.mkxDict(" + ", u2, u1)[1] + this.mkxDict(" + ", v1, u2)[1]
                        model.subjectTo += p1 + "" + this.mkxDict(" + ", u2, u1)[0] + this.mkxDict(" + ", v1, u2)[0]
                        model.subjectTo += " >= " + finalsum + "\n"

                        p1 = this.mkc(u1, v1, u2, v2)
                        finalsum = 1 + this.mkxDict(" + ", u2, v1)[1] + this.mkxDict(" + ", u1, u2)[1]
                        model.subjectTo += p1 + "" + this.mkxDict(" + ", u2, v1)[0] + this.mkxDict(" + ", u1, u2)[0]
                        model.subjectTo += " >= " + finalsum + "\n"

                    } else if (!this.isSameRankEdge(u1v1) && this.isSameRankEdge(u2v2)) {
                        // console.log(u1, v1, u2, v2)
                        let p1 = this.mkc(u1, v1, u2, v2)
                        let finalsum = 1 + this.mkxDict(" + ", u1, u2)[1] + this.mkxDict(" + ", v2, u1)[1]
                        model.subjectTo += p1 + "" + this.mkxDict(" + ", u1, u2)[0] + this.mkxDict(" + ", v2, u1)[0]
                        model.subjectTo += " >= " + finalsum + "\n"


                        p1 = this.mkc(u1, v1, u2, v2)
                        finalsum = 1 + this.mkxDict(" + ", u1, v2)[1] + this.mkxDict(" + ", u2, u1)[1] 
                        model.subjectTo += p1 + "" + this.mkxDict(" + ", u1, v2)[0] + this.mkxDict(" + ", u2, u1)[0]
                        model.subjectTo += " >= " + finalsum + "\n"
                    }
                }
            }
        }

        // fill function to minimize
        for (let elem in this.crossing_vars){
            model.minimize += this.options.crossings_reduction_weight + " " + elem + " + "
        }
    }

    isSameRankEdge(edge){
        return edge.leftTable.depth == edge.rightTable.depth
    }

    modelToString(model){
        return model.minimize + model.subjectTo + model.bounds + '\nEnd\n'
    }

    mkxBase(u1, u2, pre=""){
        return "x_" + pre + u1 + "_" + pre + u2
    }

    addBendinessPlusMaximizeCrossingAngle(g, model){
        for (let e of g.edges){
            if (this.isSameRankEdge(e)) continue;

            model.subjectTo += 
                "y_" + e.leftAttribute.id + " - " + 
                "y_" + e.rightAttribute.id + " - " + 
                "bend_" + e.leftAttribute.id + "_" + e.rightAttribute.id +
                " <= 0\n"

            model.subjectTo += 
                "y_" + e.rightAttribute.id + " - " + 
                "y_" + e.leftAttribute.id + " - " + 
                "bend_" + e.leftAttribute.id + "_" + e.rightAttribute.id +
                " <= 0\n"
        }

        // definition of the vertical position of the tables based on x vars
        for (let tableCol of g.tableIndex){
            for (let i in tableCol){
                let t1 = tableCol[i];
                for (let j in tableCol){
                    if (i == j) continue;

                    let t2 = tableCol[j];

                    let p = this.mkxBase(t2.id, t1.id, 'T')
                    if (this.definitions[p] != undefined){
                        model.subjectTo += "z_" + this.zcount + " - " + this.m + " " + p + " <= 0\n" 
                        model.subjectTo += "z_" + this.zcount + " - " + "y_" + t2.id + " <= 0\n"
                        model.subjectTo += "z_" + this.zcount + " - " + "y_" + t2.id + " - " + this.m + " " + p + " >= - " + this.m + "\n"  
                        model.subjectTo += "z_" + this.zcount + " >= 0\n"
                        model.subjectTo += "y_" + t1.id + " - " + "z_" + this.zcount + " - " + (this.buffer + t2.attributes.length) + " " + p + " >= 0\n"
                    } else {
                        p = this.mkxBase(t1.id, t2.id, 'T')
                        model.subjectTo += "z_" + this.zcount + " + " + this.m + " " + p + " <= " + this.m + "\n"
                        model.subjectTo += "z_" + this.zcount + " - " + "y_" + t2.id + " <= 0\n"
                        model.subjectTo += "z_" + this.zcount + " - " + "y_" + t2.id + " + " + this.m + " " + p + " >= 0\n"
                        model.subjectTo += "z_" + this.zcount + " >= 0\n"
                        model.subjectTo += "y_" + t1.id + " - " + "z_" + this.zcount + " + " + (this.buffer + t2.attributes.length) + " " + p + " >= " + (this.buffer + t2.attributes.length) + "\n"
                    }
                    
                    this.zcount += 1
                }
            }
        }

        // defintion of the vertical position of the attributes based on the tables and the x vars of the other attributes in the table
        for (let t of g.tables){
            for (let i in t.attributes){
                let a1 = t.attributes[i]
                let accumulator = 1
                let tmpstr = "y_" + a1.id + " - " + "y_" + t.id
                for (let j in t.attributes){
                    if (i == j) continue
                    let a2 = t.attributes[j]
                    let p =  this.mkxBase(a2.id, a1.id)
                    if (this.definitions[p] != undefined){
                        tmpstr += " - " + p
                    } else {
                        let p = this.mkxBase(a1.id, a2.id)
                        tmpstr += " + " + p
                        accumulator += 1
                    }
                }

                tmpstr += " = " + accumulator + "\n"
                model.subjectTo += tmpstr
            }
        }

        // new part
        for (let e of g.edges){
            if (this.isSameRankEdge(e)) continue;

            let la = e.leftAttribute.id;
            let ra = e.rightAttribute.id;

            for (let c in this.crossing_vars){
                let c_split = c.split("_")
                if (c_split[1] == la + ra || c_split[2] == la + ra) {
                    model.subjectTo += "onecross_" + la + "_" + ra + " - " + c + " >= 0\n"
                }
            }
            
            model.bounds += "binary " + "onecross_" + la + "_" + ra + "\n"

            model.subjectTo += "auxbend_" + la + "_" + ra + " + " + this.m + " onecross_" + la + "_" + ra + " <= " + this.m + "\n"  
            model.subjectTo += "auxbend_" + la + "_" + ra + " - bend_" + la + "_" + ra + " <= 0\n" 
            model.subjectTo += "auxbend_" + la + "_" + ra + " - bend_" + la + "_" + ra + " + " + this.m + " onecross_" + la + "_" + ra + " >= 0\n"
            model.subjectTo += "auxbend_" + la + "_" + ra + " >= 0\n"

            model.subjectTo += "aux2bend_" + la + "_" + ra + " - " + this.m + " onecross_" + la + "_" + ra + " <= 0\n"
            model.subjectTo += "aux2bend_" + la + "_" + ra + " + bend_" + la + "_" + ra + " <= " + this.m + "\n"
            model.subjectTo += "aux2bend_" + la + "_" + ra + " + bend_" + la + "_" + ra + " - " + this.m + " onecross_" + la + "_" + ra + " >= 0\n"
            model.subjectTo += "aux2bend_" + la + "_" + ra + " >= 0\n"
        }

        // add to objective function
        for (let e of g.edges){
            if (this.isSameRankEdge(e)) continue;
            // model.minimize += "0.1 bend_" + e.leftAttribute.id + "_" + e.rightAttribute.id + " + "
            model.minimize += this.options.bendiness_reduction_weight + " auxbend_" + e.leftAttribute.id + "_" + e.rightAttribute.id + " + "
            model.minimize += this.options.bendiness_angle_optimization_weight + " aux2bend_" + e.leftAttribute.id + "_" + e.rightAttribute.id + " + "
        }
        model.minimize = model.minimize.substring(0, model.minimize.length - 2) + "\n\n"
    }

    addSimpleBendiness(g, model){
        // ************
        // bendiness
        // ************
        for (let e of g.edges){
            if (this.isSameRankEdge(e)) continue;

            model.subjectTo += 
                "y_" + e.leftAttribute.id + " - " + 
                "y_" + e.rightAttribute.id + " - " + 
                "bend_" + e.leftAttribute.id + "_" + e.rightAttribute.id +
                " <= 0\n"

            model.subjectTo += 
                "y_" + e.rightAttribute.id + " - " + 
                "y_" + e.leftAttribute.id + " - " + 
                "bend_" + e.leftAttribute.id + "_" + e.rightAttribute.id +
                " <= 0\n"
        }

        // definition of the vertical position of the tables based on x vars
        for (let tableCol of g.tableIndex){
            for (let i in tableCol){
                let t1 = tableCol[i];
                for (let j in tableCol){
                    if (i == j) continue;

                    let t2 = tableCol[j];

                    let p = this.mkxBase(t2.id, t1.id, 'T')
                    if (this.definitions[p] != undefined){
                        model.subjectTo += "z_" + this.zcount + " - " + this.m + " " + p + " <= 0\n" 
                        model.subjectTo += "z_" + this.zcount + " - " + "y_" + t2.id + " <= 0\n"
                        model.subjectTo += "z_" + this.zcount + " - " + "y_" + t2.id + " - " + this.m + " " + p + " >= - " + this.m + "\n"  
                        model.subjectTo += "z_" + this.zcount + " >= 0\n"
                        model.subjectTo += "y_" + t1.id + " - " + "z_" + this.zcount + " - " + (this.buffer + t2.attributes.length) + " " + p + " >= 0\n"
                    } else {
                        p = this.mkxBase(t1.id, t2.id, 'T')
                        model.subjectTo += "z_" + this.zcount + " + " + this.m + " " + p + " <= " + this.m + "\n"
                        model.subjectTo += "z_" + this.zcount + " - " + "y_" + t2.id + " <= 0\n"
                        model.subjectTo += "z_" + this.zcount + " - " + "y_" + t2.id + " + " + this.m + " " + p + " >= 0\n"
                        model.subjectTo += "z_" + this.zcount + " >= 0\n"
                        model.subjectTo += "y_" + t1.id + " - " + "z_" + this.zcount + " + " + (this.buffer + t2.attributes.length) + " " + p + " >= " + (this.buffer + t2.attributes.length) + "\n"
                    }
                    
                    this.zcount += 1
                }
            }
        }

        // defintion of the vertical position of the attributes based on the tables and the x vars of the other attributes in the table
        for (let t of g.tables){
            for (let i in t.attributes){
                let a1 = t.attributes[i]
                let accumulator = 1
                let tmpstr = "y_" + a1.id + " - " + "y_" + t.id
                for (let j in t.attributes){
                    if (i == j) continue
                    let a2 = t.attributes[j]
                    let p =  this.mkxBase(a2.id, a1.id)
                    if (this.definitions[p] != undefined){
                        tmpstr += " - " + p
                    } else {
                        let p = this.mkxBase(a1.id, a2.id)
                        tmpstr += " + " + p
                        accumulator += 1
                    }
                }

                tmpstr += " = " + accumulator + "\n"
                model.subjectTo += tmpstr
            }
        }

        // add to objective function
        for (let e of g.edges){
            if (this.isSameRankEdge(e)) continue;
            model.minimize +=  this.options.bendiness_reduction_weight + " bend_" + e.leftAttribute.id + "_" + e.rightAttribute.id + " + "
        }
        model.minimize = model.minimize.substring(0, model.minimize.length - 2) + "\n\n"
    }


    apply_solution(solution){
        console.log(solution)
        for (let i=0; i<this.g.maxDepth + 1; i++){
            let layerTables = this.g.tableIndex[i];

            layerTables.sort((a, b) => {
                //console.log(a.id, b.id, solution["x_T" + a.id + "_T" + b.id], solution["x_T" + b.id + "_T" + a.id])
                if (solution["x_T" + a.id + "_T" + b.id] == 0) return 1
                else if (solution["x_T" + a.id + "_T" + b.id] == 1) return -1
                else if (solution["x_T" + b.id + "_T" + a.id] == 1) return 1
                else if (solution["x_T" + b.id + "_T" + a.id] == 0) return -1
            })

            for (let k in layerTables){
                layerTables[k].weight = k;
            }

            for (let table of layerTables){
                table.attributes.sort((a, b) => {
                    //if (b.table.id == "T8y4") console.log(a.id, b.id, solution["x_" + b.id + "_" + a.id])
                    if (solution["x_" + a.id + "_" + b.id] == 0) return 1
                    else if (solution["x_" + a.id + "_" + b.id] == 1) return -1
                    else if (solution["x_" + b.id + "_" + a.id] == 1) return 1
                    else if (solution["x_" + b.id + "_" + a.id] == 0) return -1
                })

                for (let j=0; j<table.attributes.length; j++){
                    table.attributes[j].weight = j;
                }
            }
        }

        // **********
        // bendiness
        // **********
        if (this.options.bendiness_reduction_active){
            for (let i=0; i<this.g.tableIndex.length; i++){
                let tableCol = this.g.tableIndex[i];
                for (let j=0; j<tableCol.length; j++){
                    let t = tableCol[j];
    
                    let val = solution["y_" + t.id]
                    if (val == undefined) continue;
                    t.verticalAttrOffset = val - t.weight * this.g.baseRowDistance;
                }
            }
        }
    }
}
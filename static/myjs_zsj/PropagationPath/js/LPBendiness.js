class LPBendiness {
    constructor (g) {
        this.g = g;
        this.mip = true;
        this.verbose = false;
        this.elapsedTime = 0
    }

    // isMip (lp) {
    //     return glp_get_num_int(lp) + glp_get_num_bin(lp) > 0;
    //   };

    // async arrange(){

    //     glp_set_print_func(console.log)

    //     let code = "var x1 >= 0; \n \
    //         var x2 >= 0; \n \
    //         \n \
    //         maximize z:     3*x1 + 2*x2; \n \
    //         \n \
    //         subject to c11:   x1 +   x2 <=  9; \n \
    //         subject to c12: 3*x1 +   x2 <= 18; \n \
    //         subject to c13:   x1        <=  7; \n \
    //         subject to c14:          x2 <=  6; \n \
    //         \n \
    //         end;"

    //     var workspace = glp_mpl_alloc_wksp();
    //     var lp = glp_create_prob();
    //     var modelname = "testmodel"
    //     var isMip = this.isMip(lp);

    //     glp_mpl_read_model_from_string(workspace, modelname, code);
    //     glp_mpl_generate(workspace, modelname, console.log, undefined);
    //     glp_mpl_build_prob(workspace, lp);
    //     glp_scale_prob(lp, GLP_SF_AUTO);

    //     if (!isMip) {
    //         console.log("Solving the model using the simplex optimizer");
    //         var smcp = new SMCP({presolve: GLP_ON});
    //         var glpkStatus = glp_simplex(lp, smcp);
    //         //var status = getLpStatus(glpkStatus, lp);
    //       } else {
    //         console.log("The model has integer variables: solving the model using the mixed-integer optimizer");
    //         var iocp = new IOCP({presolve: GLP_ON});
    //         var glpkStatus = glp_intopt(lp, iocp);
    //         //var status = getMipStatus(glpkStatus, lp);
    //       }

    //     glp_mpl_postsolve(workspace, lp, this.isMip(lp) ? GLP_MIP : GLP_SOL);

    //     console.log('ismip', isMip)
    //     for (var c = 1; c <= glp_get_num_cols(lp); c++) {
    //         console.log(glp_get_col_name(lp, c))
    //         console.log(isMip ? glp_mip_col_val(lp, c) : glp_get_col_prim(lp, c))
    //     }
    // }

    async arrange(){

        let startTime = new Date().getTime()

        // build model from graph
        let model = {}

        this.fillModel(model)
        let prob = this.modelToString(model)

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
        model.minimize = "Minimize \n"
        model.subjectTo = "Subject To \n"
        model.bounds = "\nBounds \n"
        //model.bounds = ""

        for (let e of this.g.edges){
            if (this.isSameRankEdge(e)) continue

            model.minimize += "bend_" + e.leftAttribute.name + "_" + e.rightAttribute.name + " + "

            model.subjectTo += 
                "y_" + e.leftAttribute.name + " - " + 
                "y_" + e.rightAttribute.name + " - " + 
                "bend_" + e.leftAttribute.name + "_" + e.rightAttribute.name +
                " <= 0\n"

            model.subjectTo += 
                "y_" + e.rightAttribute.name + " - " + 
                "y_" + e.leftAttribute.name + " - " + 
                "bend_" + e.leftAttribute.name + "_" + e.rightAttribute.name +
                " <= 0\n"
        }

        for (let i=0; i<this.g.tableIndex.length; i++){
            let tableCol = this.g.tableIndex[i];
            for (let j=0; j<tableCol.length - 1; j++){
                let t = tableCol[j];
                let t2 = tableCol[j+1];
                model.subjectTo += "y_" + t2.name + " - y_" + t.name + " > " + (2 + t.attributes.length) + "\n"
            }
        }

        for (let t of this.g.tables){
            for (let i=0; i<t.attributes.length; i++){
                let attr = t.attributes[i];
                model.subjectTo += "y_" + attr.name + " - y_" + t.name + " = " + (i + 1) + "\n"
            }
        }

        //model.subjectTo += "y_select = 4\n"

        model.minimize = model.minimize.substring(0, model.minimize.length - 2) + "\n\n"

    }

    isSameRankEdge(edge){
        return edge.leftTable.depth == edge.rightTable.depth
    }

    modelToString(model){
        return model.minimize + model.subjectTo + model.bounds + '\nEnd\n'
    }

    apply_solution(solution){
        for (let i=0; i<this.g.tableIndex.length; i++){
            let tableCol = this.g.tableIndex[i];
            for (let j=0; j<tableCol.length; j++){
                let t = tableCol[j];

                let val = solution["y_" + t.name]
                t.verticalAttrOffset = val - t.weight * this.g.baseRowDistance;
            }
        }
    }
}
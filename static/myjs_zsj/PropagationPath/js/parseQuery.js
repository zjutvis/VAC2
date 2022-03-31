let parseQuery = (qstring, schemastring) => {

    const parser = new NodeSQLParser.Parser()
    const ast = parser.astify(qstring)
    const schema = schemastring;
    console.log(ast)

    let readSchema = (schema) => {
        let schemaDict = {}
        let s = schema.split("\n")
        for (let line of s){
            let tname = line.split('(')[0]
            let tlist = line.split('(')[1].split(')')[0].split(',');
            schemaDict[tname] = []
            for (let elem of tlist){
                schemaDict[tname].push(elem.replace(/ /g, ""))
            }
        }
        return schemaDict;
    }

    let schemaDict = readSchema(schema);

    g = new Graph();

    let selectTable = new Table("select", "select", true, 0)
    g.addTable(selectTable);

    let tabledefs = {}

    let tablecount = 0
    for (let elem of ast.from){
        if (elem.as != null){
            tabledefs[elem.as] = elem.table + tablecount
            tablecount += 1
        } else {
            tabledefs[elem.table] = elem.table + tablecount
            tablecount += 1
        }
    }

    let navigateExpr = (ast, depth, groups, prevOperator) => {
        console.log('navigateExpr', depth, ast, groups)

        for (let elem of ast.from){
            if (elem.as != undefined){
                tabledefs[elem.as] = elem.table + tablecount
                tablecount += 1
            } else {
                tabledefs[elem.table] = elem.table + tablecount
                tablecount += 1
            }
        }
        
        navigateWhere(ast.where, depth + 1, groups, prevOperator)
    }

    let getTableAttribute = (table, name) => {
        let attr = table.attributes.find(a => a.name == name)
        if (attr == undefined){
            attr = new Attribute(table, name)
            g.addAttribute(table, attr)
        }
        return attr
    }

    let getTableById = (tableId, groups) => {
        let t1 = g.tables.find(t => t.id == tableId)
        
        if (t1 == undefined){
            
            t1 = new Table(tableId, tableId, true, parseFloat(depth))

            if (groups!= undefined && groups.length > 0){
                for (group of groups){
                    group.addTable(t1)
                }
            }
            g.addTable(t1)

            let tname = tableId.slice(0, tableId.length - 1)

            if (tname == undefined) console.error("not found: " + tableId)
            
            // find table in schemadict
            if (schemaDict[tname] != undefined){
                for (let a of schemaDict[tname]){
                    let attr = new Attribute(t1, a)
                    g.addAttribute(t1, attr)
                }
            }
        }
        return t1
    }

    let navigateWhere = (w, depth, groups, prevAst) => {
        if (w == null) return;

        console.log('navigateWhere', depth, w, groups)

        if (w.operator == "AND"){
            navigateWhere(w.left, depth+1, groups, prevAst)
            navigateWhere(w.right, depth+1, groups, prevAst)
        }


        if (w.left != undefined && w.left.table == null)
            w.left.table = prevAst.columns.find(c => c.column == w.left.attribute).expr.table


        if (w.operator == "=" || w.operator == ">" || w.operator == "<" || w.operator == "<>"){
            if (w.right.type == "string"){
                let t = getTableById(tabledefs[w.left.table], groups)
                let attr = new Attribute(t, w.left.column + " " + w.operator + " " + '"' + w.right.value + '"')
                attr.id = attr.name.replace(/"/g, '').replace(/=/g, '').replace(/>/g, '').replace(/</g, '').replace(/ /g, '') + "c"
                attr.type = "constraint";
                t.attributes.push(attr);
            } else if (w.right.type == "number"){
                let t = getTableById(tabledefs[w.left.table], groups)
                let attr = new Attribute(t, w.left.column + " " + w.operator + " " + w.right.value)
                attr.id = attr.name.replace(/"/g, '').replace(/=/g, '').replace(/>/g, '').replace(/</g, '').replace(/ /g, '') + "c"
                attr.type = "constraint";
                t.attributes.push(attr);
            } else if (w.right.type == "column_ref"){
                let tablename1 = tabledefs[w.left.table]
                let tablename2 = tabledefs[w.right.table]
                
                let t1 = getTableById(tablename1, groups);
                let attr1 = getTableAttribute(t1, w.left.column)

                let t2 = getTableById(tablename2, groups) 
                let attr2 = getTableAttribute(t2, w.right.column)             

                let e = new Edge(t1, attr1, t2, attr2)

                if (w.operator == "<>"){
                    e.label = "<>"
                } else if (w.operator == "<"){
                    e.type = "directed";
                    e.label = "<"
                } else if (w.operator == ">"){
                    e.type = "directed";
                    e.label = ">"
                } 
                g.addEdge(e);

            } else console.warn('something weird here')
            
            w.add = true

        } else if (w.operator == "NOT EXISTS"){
            let group = new Group()
            group.type = "NOT EXISTS"
            g.addGroup(group);
            groups.push(group)
            navigateExpr(w.expr.ast, depth + 1, groups, prevAst)
        } else if (w.operator == "EXISTS"){
            navigateExpr(w.expr.ast, depth + 1, groups, prevAst)
        }
    }

    // fill in the first select table
    for (let c of ast.columns){
        if (c == "*"){
            for (let elem of ast.from){
                let t = getTableById(tabledefs[elem.table])
                for (let a of t.attributes){
                    let new_a = new Attribute(selectTable, a.name)
                    g.addAttribute(selectTable, new_a)
                    g.addEdge(new Edge(selectTable, new_a, t, a))
                }
            }
        } else {
            let attrname = c.expr.column;
            let a = new Attribute(selectTable, attrname);
            selectTable.attributes.push(a);

            let t2;
            if (c.expr.table == null){
                t2 = getTableById(tabledefs[ast.from[0].table])
            } else {
                t2 = getTableById(tabledefs[c.expr.table])
            }
            
            let attr2 = getTableAttribute(t2, c.expr.column)

            let e = new Edge(selectTable, a, t2, attr2)
            g.addEdge(e);
        }
    }

    navigateWhere(ast.where, 0, [], ast)

    assignTablesToDepths(g);

    return g;
}

let assignTablesToDepths = (g) => {
    for (let i=0; i<4; i++){
        g.tables.forEach(t => t.visited = false)
        arrangeTables(g, g.tableIndex[0][0]);
        for (let col in g.tableIndex){
            g.tableIndex[col] = [];
        }
        for (let table of g.tables){
            g.tableIndex[table.depth].push(table);
            for (let attribute of table.attributes){
                let linkedEdges = g.edges.filter(e => (e.leftAttribute == attribute || e.rightAttribute == attribute))
                if (linkedEdges.length == 0 && attribute.type != "constraint") table.attributes.splice(table.attributes.indexOf(attribute), 1)
            }
        }
        for (let col in g.edgeIndex){
            g.edgeIndex[col] = [];
        }
        for (let edge of g.edges){
            if (edge.leftTable.depth > edge.rightTable.depth){
                let tmpTable = edge.leftTable;
                let tmpAttr = edge.leftAttribute;
                edge.leftTable = edge.rightTable;
                edge.rightTable = tmpTable;
                edge.leftAttribute = edge.rightAttribute;
                edge.rightAttribute = tmpAttr;
            }
            g.edgeIndex[edge.leftTable.depth].push(edge);
        }
    }
}

// dfs to arrange the tables on the correct depths
let arrangeTables = (g, startTable) => {    
    let outedges = g.edges.filter(e => e.leftTable == startTable);
    if (outedges.length == 0) return;

    for (let i in outedges){
        let edge = outedges[i]
        
        let t = edge.rightTable

        if (t.visited == true) continue;
        t.visited = true;

        t.depth = startTable.depth + 1;
        while (g.tableIndex.length < t.depth){
            g.newLayer()
        }
        arrangeTables(g, t);
    }
}
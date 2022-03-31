class Table {
    constructor(name, header, main, depth, type=undefined){
        this.name = name;
        this.header = header;
        this.main = main;
        this.depth = depth;
        this.attributes = [];
        this.attrMaps = [];
        this.weight = 0;
        this.group = undefined;
        this.groups = [];
        this.graph = undefined;
        this.visibility = 'visible';
        this.verticalAttrOffset = 0;
        this.id = name;
        this.type = type;
    }

    addAttribute(attribute){
        this.attributes.push(new Attribute(this, attribute))
    }

    compareTo(otherTable){
        if (this.depth > otherTable.depth) return -1;
        else if (this.depth < otherTable.depth) return 1;
        else {
            if (this.weight < otherTable.weight) return 1;
            else if (this.weight > otherTable.weight) return -1;
            else return 0;
        }
    }
}

try {
    module.exports = exports = Table;
 } catch (e) {}
function DrawCausalityDAG(div, dataset, event2namefortooltip) {
    let margin, width, height, svg;
    if (div == "#OverviewVis") {
        margin = { top: 10, right: 5, bottom: 10, left: 5 },
            width = 871.2 - margin.left - margin.right,
            height = 475.2 - margin.top - margin.bottom;
        svg = d3.select(div)
            .append("svg")
            .attr("id", "OverviewSvg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
    }


    var graph = { "nodes": dataset.nodes, "links": dataset.links }
    console.log(dataset.nodes.length)
    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svg.append("svg:defs").selectAll("marker")
        .data(["end"])      // Different link/path types can be defined here
        .enter().append("svg:marker")    // This section adds in the arrows
        .attr("class", "arrow1")
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -1.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("class", "arrow")

    const R = 6;
    const simulation = d3.forceSimulation()
        .nodes(graph.nodes)
        .alphaDecay(0.8)
        .force('link', d3.forceLink(graph.links).id(d => d.id).distance(0).strength(1))
        .force('charge', d3.forceManyBody().strength(-120))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide().radius(R + 1).iterations(2))

        .on('tick', ticked)


    simulation.force('link')
        .links(graph.links);


    let path = svg.selectAll('line')
        .data(graph.links)
        .enter().append('path')
        .style('stroke', function (d) {
            if (d.value > 0)
                return "#469d89"
            else
                return "#b6838d"
        })

    path
        .attr('class', 'link')
        .attr("stroke-width", function (d) {
            return Math.abs(d.value * 2)
        })
        .attr("id", function (d) {
            return "linkid" + d.source.id + "_" + d.target.id
        })
        .attr("marker-end", "url(#end)")
        .attr('fill', 'none')
        .on('mouseover.tooltip', function (d) {
            tooltip.transition()
                .duration(300)
                .style("opacity", .8);
        })
        .on("mouseout.tooltip", function () {
            tooltip.transition()
                .duration(100)
                .style("opacity", 0);
        })
        .on('mouseout.fade', fade(1))
        .on("mousemove", function () {
            tooltip.style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY + 10) + "px");
        })
        .on('mouseout', function () {
            path.attr("marker-end", "url(#end)")
        })
        .on('mouseover', function (d) {
            fade(0.1)
        })


    let node = svg.selectAll('.node')
        .data(graph.nodes)
        .enter().append('g')
        .attr('class', 'node')
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append('circle')
        .attr('r', R).attr("fill", function (d) {
            return myColor[d.group];
        })
        .attr("id", function (d) {
            return "event_" + d.id
        })

        .on('mouseover.fade', fade(0.1))
        .on("mouseout.tooltip", function () {
            tooltip.transition()
                .duration(100)
                .style("opacity", 0);
        })
        .on('mouseout.fade', fade(1))
        .on('mouseout', function () {
            path.attr("marker-end", "url(#end)")
        })
        .on("mousemove", function () {
            tooltip.style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY + 10) + "px");
        })
        .on('dblclick', releasenode)

    node.append('text')
        .attr('dx', 12)
        .attr('dy', '.35em')
        .text(d => event2namefortooltip[d.id]);


    function ticked() {


        path.attr("d", function (d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" +
                d.source.x + "," +
                d.source.y + "A" +
                dr + "," + dr + " 0 0,1 " +
                d.target.x + "," +
                d.target.y;
        });

        node.attr("transform", function (d) {
            if (d.x < 0) {
                d.x = R
            }
            if (d.y < 0) {
                d.y = R
            }
            if (d.x > width) {
                d.x = width - R
            }
            if (d.y > height) {
                d.y = height - R
            }
            return "translate(" + d.x + "," + d.y + ")"
        })
        // .attr('transform', d => `translate(${d.x},${d.y})`);
    }

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        //d.fx = null;
        //d.fy = null;
    }

    function releasenode(d) {
        d.fx = null;
        d.fy = null;
    }

    const linkedByIndex = {};
    graph.links.forEach(d => {
        linkedByIndex[`${d.source.index},${d.target.index}`] = 1;
    });

    function isConnected(a, b) {
        return linkedByIndex[`${a.index},${b.index}`] || linkedByIndex[`${b.index},${a.index}`] || a.index === b.index;
    }

    function fade(opacity) {
        return d => {
            node.style('stroke-opacity', function (o) {
                const thisOpacity = isConnected(d, o) ? 1 : opacity;
                this.setAttribute('fill-opacity', thisOpacity);
                return thisOpacity;
            });

            path.style('stroke-opacity', o => (o.source === d || o.target === d ? 1 : opacity))
                .attr("marker-end", o => (o.source === d || o.target === d ? "url(#end)" : null))
            svg.select('.marker').style('fill-opacity', o => (o.source === d || o.target === d ? 1 : opacity))

        };
    }

}
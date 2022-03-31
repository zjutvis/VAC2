function point(data) {



        var points = data;

        console.log(points);
        var w = 1000;
        var h = 1000;

        var poo = [];
        for (var i = 0; i < 1000; ++i) {
            var p = [points[i].x, points[i].y];
            poo.push(p);
        }

        poo = dbscan(poo, 264000, 2);//dbscan(data,eps,minpts)
        console.log(poo);

        //颜色比例尺
        var clinear=d3.scaleOrdinal()
            .domain([1,3])
            .range(['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854','#ffd92f']);
        //创建SVG
        var svg = d3.select("body")
            // .select("#points")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

        //创建比例尺
        var xlinear = d3.scaleLinear()
            .domain([1.2 * d3.min(points, function (d) {
                return d.x;
            }), 1.2 * d3.max(points, function (d) {
                return d.x;
            })])
            .range([0, w]);

        var ylinear = d3.scaleLinear()
            .domain([1.2 * d3.min(points, function (d) {
                return d.y;
            }), 1.2 * d3.max(points, function (d) {
                return d.y;
            })])
            .range([0, h]);
        //外边框
        var padding = {top: 30, right: 30, bottom: 30, left: 30}

        // //绘制点
        // svg.selectAll("circle")
        //     .data(points)
        //     .enter()
        //     .append("circle")
        //     .attr("fill", function (d) {
        //             return 'black';
        //     })
        //     .attr("cx", function (d) {
        //         //console.log(xlinear(d.x));
        //         return padding.left + xlinear(d.x);
        //     })
        //     .attr("cy", function (d) {
        //         //console.log(ylinear(d.y));
        //         return h - padding.bottom - ylinear(d.y);
        //     })
        //     .attr("r", function (d) {
        //         return 1;
        //     });

        //dbscan聚类结果绘制
        svg.selectAll("circle")
            .data(poo)
            .enter()
            .append("circle")
            .attr("fill", function (d) {
                if(d.presentCluster=='noise')
                    return "black";
                else
                    return clinear(d.presentCluster);
            })
            .attr("cx", function (d) {
                //console.log(xlinear(d.x));
                return padding.left + xlinear(d[0]);
            })
            .attr("cy", function (d) {
                //console.log(ylinear(d.y));
                return h - padding.bottom - ylinear(d[1]);
            })
            .attr("r", function (d) {
                return 3;
            });





}
//可视化：左侧的颜色轴
function Slider_filter_strength(div1, div2) {
    let background_margin = { top: 5, right: 5, bottom: 5, left: 15 },
        slider_margin = { top: 8, right: 2, bottom: 1, left: 12 },
        // padding = { top: 5, right: 5, bottom: 5, left: 5 }
        rect_width = 160,
        rect_height = 12

    d3.select(div1).selectAll("*").remove();
    d3.select(div2).selectAll("*").remove();
    let container_svg = d3.select(div1)
        .attr("width", rect_width + background_margin.left + background_margin.right)
        .attr("height", rect_height + background_margin.top + background_margin.bottom)
        .append("svg")
        .attr("width", rect_width + background_margin.left + background_margin.right)
        .attr("height", rect_height + background_margin.top + background_margin.bottom + 25)
        .attr("id", "container_svg")
        .attr("transform", "translate(" + 0 + "," + 0 + ")")

    // 颜色过渡背景
    let color_axis = d3.scaleSequential(d3.interpolateGreens).domain([0, rect_width])

    let background_svg = d3.select("#container_svg")
        .append("g")
        .attr("width", rect_width)
        .attr("height", rect_height)
        .attr("transform", "translate(" + background_margin.left + "," + background_margin.top + ")")

    let slider_svg = d3.select("#container_svg")
        .append("g")
        .attr('id', 'slider_g2')
        .attr("width", rect_width + 6)
        .attr("height", rect_height + 8)
        .attr("transform", "translate(" + slider_margin.left + "," + slider_margin.top + ")")

    let rects = background_svg.selectAll(".colorRect")
        .data(d3.range(rect_width), function (d) {
            return d;
        })
        .enter()
        .append("rect")
        .attr("class", "colorRect")
        .attr("x", function (d, i) {
            return i - 2;
        })
        .attr("y", 0)
        .attr("width", 1)
        .attr("height", rect_height)
        .style("fill", function (d, i) {
            // console.log(color_axis(d))
            return color_axis(d)
        })
        .style("stroke", "none")


    // //比例尺上的拖动
    let axis_strength = d3.scaleLinear()
        .domain([-1, 1])
        .range([0, rect_width])

    var sliderSimple = d3
        .sliderBottom()
        .min(0)
        .max(1)
        .width(160)
        .tickFormat(d3.format('.2%'))
        .ticks(0)
        .default([0.3])
        .displayValue(true)
        .on('drag', val => {
            select_strengths = [-sliderSimple1.value(),val]
            focusandcontextbrush("filter", "#Brushview", global_obj, select_strengths, causes_max, order_method)
        });


    slider_svg.call(sliderSimple);
//    var r1, r2;
//    d3.selectAll('.parameter-value').each(function(d, i){
//        if (i == 0){
//            r1 = d3.select(this).select('path').node().getBoundingClientRect();
//        }else{
//            r2 = d3.select(this).select('path').node().getBoundingClientRect();
//        }
//    });
//    origin_position=d3.select(div).node().getBoundingClientRect();
//    d3.select("#slider_g2").append("rect")
//        .attr("id", "slider_rect")
//        .attr("x", r1.x-origin_position.x-r1.width/2)
//        .attr("y", r1.y-origin_position.y-r1.height/2)
//        .attr("width", r2.x-r1.x)
//        .attr("height", r1.height)
//        .attr('fill', '#c0c0c0')
//        .attr('opacity', '0.8');
//
//    sliderSimple.on('onchange', function(){
//        d3.select("#slider_rect").remove();
//        var r1, r2;
//        d3.selectAll('.parameter-value').each(function(d, i){
//            if (i == 0){
//                r1 = d3.select(this).select('path').node().getBoundingClientRect();
//            }else{
//                r2 = d3.select(this).select('path').node().getBoundingClientRect();
//            }
//        });
//        origin_position=d3.select(div).node().getBoundingClientRect();
//        d3.select("#slider_g2").append("rect")
//            .attr("id", "slider_rect")
//            .attr("x", r1.x-origin_position.x-r1.width/2)
//            .attr("y", r1.y-origin_position.y-r1.height/2)
//            .attr("width", r2.x-r1.x)
//            .attr("height", r1.height)
//            .attr('fill', '#c0c0c0')
//            .attr('opacity', '0.8');
//    });

    d3.select('p#value-simple').text(d3.format('.2f')(sliderSimple.value())).style("font-weight","none");;

    let container_svg1 = d3.select(div2)
        .attr("width", rect_width + background_margin.left + background_margin.right)
        .attr("height", rect_height + background_margin.top + background_margin.bottom)
        .append("svg")
        .attr("width", rect_width + background_margin.left + background_margin.right)
        .attr("height", rect_height + background_margin.top + background_margin.bottom + 25)
        .attr("id", "container_svg1")
        .attr("transform", "translate(" + 0 + "," + 0 + ")")

    // 颜色过渡背景
    let color_axis1 = d3.scaleSequential(d3.interpolatePurples).domain([0, rect_width])

    let background_svg1 = d3.select("#container_svg1")
        .append("g")
        .attr("width", rect_width)
        .attr("height", rect_height)
        .attr("transform", "translate(" + background_margin.left + "," + background_margin.top + ")")

    let slider_svg1 = d3.select("#container_svg1")
        .append("g")
        .attr('id', 'slider_g2_1')
        .attr("width", rect_width + 6)
        .attr("height", rect_height + 8)
        .attr("transform", "translate(" + slider_margin.left + "," + slider_margin.top + ")")

    let rects1 = background_svg1.selectAll(".colorRect")
        .data(d3.range(rect_width), function (d) {
            return d;
        })
        .enter()
        .append("rect")
        .attr("class", "colorRect")
        .attr("x", function (d, i) {
            return i - 2;
        })
        .attr("y", 0)
        .attr("width", 1)
        .attr("height", rect_height)
        .style("fill", function (d, i) {
            // console.log(color_axis(d))
            return color_axis1(d)
        })
        .style("stroke", "none")


    // //比例尺上的拖动
    let axis_strength1 = d3.scaleLinear()
        .domain([-1, 1])
        .range([0, rect_width])

    var sliderSimple1 = d3
        .sliderBottom()
        .min(0)
        .max(1)
        .width(160)
        .tickFormat(d3.format('.2%'))
        .ticks(0)
        .default([0.3])
        .displayValue(true)
        // .on('end', val => {
        .on('drag', val => {
            select_strengths = [-val, sliderSimple.value()]
            focusandcontextbrush("filter", "#Brushview", global_obj, select_strengths, causes_max, order_method)
        });


    slider_svg1.call(sliderSimple1);
//    var r1, r2;
//    d3.selectAll('.parameter-value').each(function(d, i){
//        if (i == 0){
//            r1 = d3.select(this).select('path').node().getBoundingClientRect();
//        }else{
//            r2 = d3.select(this).select('path').node().getBoundingClientRect();
//        }
//    });
//    origin_position = d3.select(div).node().getBoundingClientRect();
//    d3.select("#slider_g2_1").append("rect")
//        .attr("id", "slider_rect1")
//        .attr("x", r1.x-origin_position.x-r1.width/2)
//        .attr("y", r1.y-origin_position.y-r1.height/2)
//        .attr("width", r2.x-r1.x)
//        .attr("height", r1.height)
//        .attr('fill', '#c0c0c0')
//        .attr('opacity', '0.8');

//    sliderSimple1.on('onchange', function(){
//        d3.select("#slider_rect1").remove();
//        var r1, r2;
//        d3.selectAll('.parameter-value').each(function(d, i){
//            if (i == 0){
//                r1 = d3.select(this).select('path').node().getBoundingClientRect();
//            }else{
//                r2 = d3.select(this).select('path').node().getBoundingClientRect();
//            }
//        });
//        origin_position=d3.select(div).node().getBoundingClientRect();
//        d3.select("#slider_g2_1").append("rect")
//            .attr("id", "slider_rect1")
//            .attr("x", r1.x-origin_position.x-r1.width/2)
//            .attr("y", r1.y-origin_position.y-r1.height/2)
//            .attr("width", r2.x-r1.x)
//            .attr("height", r1.height)
//            .attr('fill', '#c0c0c0')
//            .attr('opacity', '0.8');
//    });

    d3.select('p#value-simple')
    .text(d3.format('.2f')(sliderSimple1.value()))
    .style("font-weight","none");
    // d3.selectAll("#container_svg").selectAll(".parameter-value").call(d3.drag()
    // .on("end", function(){console.log("aaa")}))
}

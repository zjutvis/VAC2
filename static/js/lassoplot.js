function lasso(data) {
    var graphDiv = document.getElementById('points');
    var N = 1000;
    var color1 = 'rgba(50,148,89,0.87)';
    var color1Light = '#c2a5cf';
    var colorX = '#ffa7b5';
    var colorY = '#fdae61';
    var colors = ['rgba(50,148,89,0.87)', 'rgba(148,50,127,0.87)', 'rgba(239,171,71,0.88)', 'rgba(77,178,187,0.87)'];

    var points = data;

    var poox = [];
    var pooy = [];
    var pooc = [];
    var pooi = [];
    for (var i = 0; i < 1000; ++i) {
        var px = points[i].x;
        poox.push(px);
        var py = points[i].y;
        pooy.push(py);
        var pc = colors[points[i].color];
        pooc.push(pc);
        pooi.push(i);
    }

    function randomArray() {
        var out = new Array(N);
        for (var i = 0; i < N; i++) {
            out[i] = Math.random();
        }
        return out;
    }

    var x = poox;
    var y = pooy;
    var c = pooc;

    Plotly.newPlot(graphDiv, [{
        type: 'scatter',
        mode: 'markers',
        x: x,
        y: y,
        xaxis: 'x',
        yaxis: 'y',
        name: 'random data',
        id: pooi,
        marker: {color: c, size: 10},

    }], {
        dragmode: 'lasso',
        width: 700,

    });

    graphDiv.on('plotly_selected', function (eventData) {
        //console.log(eventData);
        var x = [];
        var y = [];
        var points = [];
        var colors = [];
        for (var i = 0; i < N; i++) colors.push(color1Light);

        eventData.points.forEach(function (pt) {
            x.push(pt.x);
            y.push(pt.y);
            colors[pt.pointNumber] = color1;
            points.push(pt.pointNumber);
        });

        Plotly.restyle(graphDiv, {
            x: [x, y],
            xbins: {}
        }, [1, 2]);

        Plotly.restyle(graphDiv, 'marker.color', [colors], [0]);

        deliverdata(points);
    });

    //绘制热力图
    var w = $('#info').width();
    var h = $('#info').height();


    //热力图颜色比例尺
    var scaleColor = d3.scaleLinear()
        .domain([0, 1])
        .range(["white", "green"]);

    //绘制热力图
    function drawhot(p, points) {

        //console.log(d);
        //获得user信息
        arr = p;
        // console.log(arr);
        //热力图svg
        var svg = d3.select("#points_info_View")
            .select("#info")
            .select("#hotrect")
            .append("svg")
            .attr("width", w)
            .attr("height", arr.length * 50)

        //////绘制矩阵热力图
        for (var i = 0; i < arr.length; i++) {
            for (var j = 0; j < 10; j++) {
                svg
                    .append("rect")
                    .attr("class", i + j)
                    .attr("x", 10 + j * 40)
                    .attr("y", 10 + i * 40)
                    .attr("width", "32px")
                    .attr("height", "32px")
                    .attr("fill", scaleColor(arr[i][j]));
                // d3.select("#points_info_View")
                //     .select("#info")
                //     .append("g")
                //     .append("radiobutton")

            }
        }
        //绘制按钮
        var ra = d3.select("#points_info_View")
            .select("#info")
            .select("#radiobutton")
            .append("ul")
            .attr("class", "clearfix")

        for (var k = 0; k < points.length; k++) {
            if (k == 0) {
                ra.append("li")
                    .attr("id", "class" + k)
                    .attr("class", "select-cur");

            } else {
                ra.append("li")
                    .attr("id", "class" + k);
            }
        }
        for (var m = 0; m < points.length; m++) {
            var a = ""
            if (m == 0) {
                var html = "<input  type=\"radio\"  value=" + points[m] + "  >";
                // checked="checked"
            } else {
                var html = "<input  type=\"radio\" value=" + points[m] + " >";
            }
            document.getElementById("class" + m).innerHTML = html;
        }

        //返回
        $("#submit").click(function () {
            display();
        });

        $('input:radio').click(function () {
            var $radio = $(this);
            if ($radio.data('checked')) {
                $radio.prop('checked', false);
                $radio.data('checked', false);
            } else {
                $radio.prop('checked', true);
                $radio.data('checked', true);
            }
        });

        function display() {
            var list = [];
            $("input[type=radio]:checked").each(function () {
                item = $(this).val();
                list.push(item);
            })
            console.log(list);
            $.ajax({
                type: 'POST',
                url: '../getUsersSimilar/',
                dataType: "json",
                data: {"users": JSON.stringify(list)},
                success: function (data) {
                    list=[]
                    var obj = JSON.parse(data);
                    $(".xw").empty();
                    force(obj)
                }
            });
            //添加一个ajax传输数据
        }

        //传输数据到后端

    }

//传输数据到后端
    function deliverdata(points) {
        $.ajax({
            type: 'POST',
            url: '../getPointInfo/',
            dataType: "json",
            data: {"points": JSON.stringify(points)},
            success: function (data) {
                var obj = JSON.parse(data);
                jsonArr = []
                for (var i = 0; i < points.length; i++) {
                    Arr_row = []
                    for (var j = 0; j < 10; j++) {
                        Topic = "Topic" + (j)
                        Arr = []
                        Arr = obj[points[i]][Topic];
                        Arr_row.push(Arr)
                    }
                    jsonArr.push(Arr_row)
                }
                $("#radiobutton").empty();
                $("#hotrect").empty();
                drawhot(jsonArr, points)
            }
        });
    }

//高亮相关用户
//选择

}
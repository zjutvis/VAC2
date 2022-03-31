var writetosource = 1;

//聚类的色系 7种色系，分别红橙黄绿青蓝紫
var cluster_color = [
    "#f94144",
    // "#f3722c",
    "#f9c74f",
    "#90be6d",
    "#4d908e",
    "#277da1",
    "#6930c3",
    "#734f38"
]

//各个聚类对应事件的颜色
var event_color_with_cluster = [
    ["#cc444b", "#da5552", "#df7373", "#e39695", "#e4b1ab"],
    ["#fcac5d", "#fcb75d", "#fcbc5d","#fcc75d", "#fcc75d", "#fcc75d", "#fcc75d","#fcc75d","#fcc75d","#fcc75d","#fcc75d"],
    ["#14746f", "#248277", "#358f80", "#469d89", "#56ab91", "#67b99a", "#67b99a", "#67b99a", "#67b99a", "#67b99a", "#67b99a"],
    ["#2476b1", "#2d82bd", "#4893c6", "#64a4ce", "#61a5c2", "#89c2d9", "#89c2d9", "#89c2d9"],
    ["#7251b5", "#815ac0", "#9163cb", "#a06cd5", "#b185db", "#c19ee0"],
]


//event_color key->事件在原始数据中分配的id value->根据在前端显示的上下次序分配的属于该事件的颜色
var event_color = new Map();

var event_color1 = new Map();

// var cluster_order1 = [
//        36,//funny
//         610,//pokemon
//         2750,//miamidolphins
//     60,//news
//     140,//worldnews
//     287,//politics
//     621,//DCcomics
//         678,//uncensorednews
//      278,//OutOfTheLoop
//         71,//AskReddit
//         735,//MensRights
//
//     1112,//ukpolitics
//     65, //Art
//     124,//BlackPeopleTwitter
//     682, //KotakuInAction
//
// ]
// event_color1.set("36",event_color_with_cluster[0][0])
// event_color1.set("621",event_color_with_cluster[0][1])
// event_color1.set("610",event_color_with_cluster[0][2])
//
// event_color1.set("140",event_color_with_cluster[1][0])
// event_color1.set("60",event_color_with_cluster[1][1])
// event_color1.set("287",event_color_with_cluster[1][2])
// event_color1.set("1112",event_color_with_cluster[1][3])
// event_color1.set("735",event_color_with_cluster[1][4])
// event_color1.set("71",event_color_with_cluster[1][5])
// event_color1.set("278",event_color_with_cluster[1][6])
// event_color1.set("678",event_color_with_cluster[1][7])
// event_color1.set("124",event_color_with_cluster[1][8])
//
// event_color1.set("682",event_color_with_cluster[2][0])
// event_color1.set("65",event_color_with_cluster[2][1])
// event_color1.set("2750",event_color_with_cluster[2][2])


// //排序1
//
// var cluster_order1 = [
//     60,//news
//     140,//worldnews
//
//     287,//politics
//     1112,//ukpolitics
//     735,//MensRights
//
//     678,//uncensorednews
//     71,//AskReddit
//     278,//OutOfTheLoop
//     124,//BlackPeopleTwitter
//     36,//funny
//     621,//DCcomics
//     610,//pokemon
//     682, //KotakuInAction
//
//     65, //Art
//     2750,//miamidolphins
//
// ]
// event_color1.set("60","#e35053")
// event_color1.set("140","#e35053")
// event_color1.set("287","#e66063")
// event_color1.set("1112","#e66063")
// event_color1.set("735","#e66063")
//
// event_color1.set("678","#ff9500")
// event_color1.set("71","#ff9500")
// event_color1.set("278","#ff9500")
// event_color1.set("124","#ff9500")
// event_color1.set("36","#ff9500")
// event_color1.set("621","#ff9500")
// event_color1.set("610","#ff9500")
//
// event_color1.set("682","#1d4e89")
// event_color1.set("65","#1a5b92")
// event_color1.set("2750","#0f80aa")


//排序2

var cluster_order1 = [

    278,//OutOfTheLoop
    71,//AskReddit

    124,//BlackPeopleTwitter
    36,//funny
    610,//pokemon
    682, //KotakuInAction
    621,//DCcomics

    60,//news
    140,//worldnews
    1112,//ukpolitics
    287,//politics
    735,//MensRights

    2750,//miamidolphins
    65, //Art
     678,//uncensorednews

]
event_color1.set("278","#e35053")
event_color1.set("71","#e35053")

event_color1.set("124","#ff9500")
event_color1.set("36","#ff9500")
event_color1.set("610","#ff9500")
event_color1.set("682","#ff9500")
event_color1.set("621","#ff9500")


event_color1.set("60","#1d4e89")
event_color1.set("140","#1d4e89")
event_color1.set("1112","#1d4e89")
event_color1.set("287","#1d4e89")
event_color1.set("735","#1d4e89")

event_color1.set("2750","#815ac0")
event_color1.set("65","#815ac0")
event_color1.set("678","#815ac0")


var cluster_order2 = [
    0,//frontpage
    1,//news
    3,//local

    8,//health
    9,//living
    7,//weather
    14,//travel
    5,//on-air
    2,//tech
    6,//misc
    10,//business
    4,//opinion
    11,//sports

    12,//summary
    13,//bbs (bulletin board service)
    15,//msn-news
    16,//msn-sports


]

var event_color2 = new Map();
event_color2.set("0","#e35053")
event_color2.set("1","#e35053")
event_color2.set("3","#e35053")

event_color2.set("8","#ff9500")
event_color2.set("9","#ff9500")
event_color2.set("7","#ff9500")
event_color2.set("14","#ff9500")
event_color2.set("5","#ff9500")

event_color2.set("2","#14746f")
event_color2.set("6","#14746f")
event_color2.set("10","#14746f")
event_color2.set("4","#14746f")
event_color2.set("11","#14746f")



event_color2.set("12","#815ac0")
event_color2.set("13","#815ac0")
event_color2.set("15","#815ac0")
event_color2.set("16","#815ac0")


//预留给各个事件对应的颜色
var event_color_set = [
    "#f94144",
    "#f3722c",
    "#f8961e",
    "#f9844a",
    "#f9c74f",
    "#90be6d",
    "#43aa8b",
    "#4d908e",
    "#577590",
    "#277da1",
    "#94d2bd",
    "#e9d8a6",
    "#ee9b00",
    "#bb3e03",
    "#ae2012",
    "#9b2226",
    "#a4133c",
    "#c9184a",
    "#ff4d6d",
    "#9d4edd",
    "#7b2cbf",
    "#5a189a"
];
var brusheddata_center,
    brusheddata_side1,
    brusheddata_side2
var global_linelist;
//event_order key->事件在原始数据中分配的id value->在前端显示的上下次序
var event_order = new Map();

// //event_color key->事件在原始数据中分配的id value->根据在前端显示的上下次序分配的属于该事件的颜色
// var event_color = new Map();

var cluster_order
// var cluster = [["Funny", "Dccomics", "miamidolphins"],
// ["News", "Worldnews", "Politics", "Ukpolitics", "AskReddit", "OutOfTheLoop"],
// ["Pokemon", "Art", "KotakuInAction", "BlackPeopleTwitter"]]
//自动
//var cluster_order1 = [36,610,2750,60,71,140,278,287,1112,621,678,735,65,124,682]
//var cluster_order2 = [0,1,3,8,9,5,12,13,6,7,11,14,15,2,16,10,4]

//自动加手动
//var cluster_order1 = [140,60,287,1112,735,71,278,678,124,36,621,610,682,65,2750]
//var cluster_order2 = [0,1,3,8,9,7,14,5,12,13,6,11,15,2,16,10,4]

var old_new_order = new Map();
// order_array range(0,nodes.length)
var order_array = [];

//全局变量，记录前端查询记录
var all_query_history = []

//全局激励和抑制的颜色映射
var colorScale = d3.scaleSequential(d3.interpolatePRGn).domain([-1, 1])

var nodes = [];

//全局变量global_links：包括所有的单因果和多因果，数据组成："source": (Array), "target": (int), "strength": (-1,1),"source_order": (Array), "target_order": (int), "isfirst": 0
var links = []

//全局变量global_links_Set：为了去重，保留第一个strength
var links_Set = new Set()

//全局变量global_dhgs：关于绘制点线图的：包含隐藏节点
var dhgs = []

//全局变量global_lineList：前端绘制用到的合并之后的数据
var lineList = []


//全局变量sequences：记录所有序列
var sequences

var initialgraphdataset = {}
var drawgraphdataset = {}

var overviewBartChartData = [];

var center_left;
var horizontalDragStart;
var horizontalDragEnd;

var brushleft=400;
var brushright=500;



function sp_dist(a, b) {
    var lat1 = a[0], lng1 = a[1], lat2 = b[0], lng2 = b[1];
    //var lat1 = a.lng, lng1 = a.lati, lat2 = b.lng, lng2 = b.lati;
    var toRadius = 0.017453292519943295;
    var R = 6371000; // radius in meter
    var dLat = (lat2 - lat1) * toRadius;
    var dLng = (lng2 - lng1) * toRadius;
    lat1 = lat1 * toRadius;
    lat2 = lat2 * toRadius;

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;

    return d;
}

// retrieve list of neighbors
function retrieve_neighbors(eps, point, cluster) {
    var neighbors = [];     // list of neighbor
    for (var iter = 0; iter < cluster.length; iter++) {
        var dist = sp_dist(point, cluster[iter]);
//        var dist2 = tp_dist(point, cluster[iter]);
        if (dist <= eps) {
            neighbors.push(iter);
        }
    }
    return neighbors;
}

// main function
var dbscan = function(X, eps, MinPts) {
    var cluster_label = 0; // label meaning: 0:unmarked; 1,2,3,...:cluster label; "noise":noise
    var labels = new Array(X.length).fill(0); // new an 0 array to store labels
    var clusters = []; // final output

    // clustering data points
    for (var i = 0; i < X.length; i++) {
        var neighbors = retrieve_neighbors(eps, X[i], X);
        var noiseCluster=[];
        if (neighbors.length < MinPts) {
            // if it is unmarked, mark it "noise"
            if (labels[i] === 0) {
                labels[i] = "noise";

            }
        } else {
            cluster_label += 1;  // construct a new cluster
            var cluster = [];   // construct cluster

            // mark label for all unmarked neighbors
            for (var j1 = 0; j1 < neighbors.length; j1++) {
                // if no other labels
                if (labels[neighbors[j1]] === 0 || labels[neighbors[j1]] === "noise") {
                    labels[neighbors[j1]] = cluster_label;
                    cluster.push(neighbors[j1]);
                }
            }

            // check the sub-circle of all objects
            while (neighbors.length !== 0) {
                var j2;
                j2 = neighbors.pop();
                var sub_neighbors = retrieve_neighbors(eps, X[j2], X);

                // mark all unmarked neighbors
                if (sub_neighbors.length >= MinPts) {
                    for (var k = 0; k < sub_neighbors.length; k++) {
                        // if no other labels
                        if (labels[sub_neighbors[k]] === 0 || labels[sub_neighbors[k]] === "noise") {
                            neighbors.push(sub_neighbors[k]);
                            labels[sub_neighbors[k]] = cluster_label;
                            cluster.push(sub_neighbors[k]);
                        }
                    }
                }
            }

            // remove cluster of small size
            if (cluster.length < MinPts) {
                for (var j3 = 0; j3 < X.length; j3++) {
                    if (labels[j3] === cluster_label) {
                        labels[j3] = "noise";

                    }
                }
            } else {
                clusters.push(cluster);
            }

        }
    }
    for(var i = 0; i < labels.length; i++){
        X[i].presentCluster=labels[i];
    }

    return X;
}

var BinaryHeap = require('./binaryHeap').BinaryHeap;
exports.kdTree = kdTree;

function kdTree(points, metric, dimensions) {

  function Node(obj, d) {
    this.obj = obj;
    this.left = null;
    this.right = null;
    this.dimension = d;
  }

  var root = buildTree(points, 0);

  function buildTree(points, depth) {
    // console.log(new Array(depth).join(" ") + "(" + points.length);
    var dim = depth % dimensions.length;
    if(points.length == 0) return null;
    if(points.length == 1) return new Node(points[0], dim);

    points.sort(function(a,b){ return a[dimensions[dim]] - b[dimensions[dim]]; });

    var median = Math.floor(points.length/2);
    var node = new Node(points[median], dim);
    node.left = buildTree(points.slice(0,median), depth+1);
    node.right = buildTree(points.slice(median+1), depth+1);
    return node;
  }

  this.nearest = function(point, maxNodes, maxDistance) {
    bestNodes = new BinaryHeap(function(e){ return -e[1]; });
    if(maxDistance) {
      for(var i=0; i<maxNodes; i++) {
        bestNodes.push([null, maxDistance]);
      }
    }
    nearestSearch(root);

    function nearestSearch(node) {
      var bestChild;
      var dimension = dimensions[node.dimension];
      var ownDistance = metric(point, node.obj);

      var linearPoint = {};
      for(var i=0; i<dimensions.length; i++) {
        if(i == node.dimension) {
          linearPoint[dimensions[i]] = point[dimensions[i]];
        } else {
          linearPoint[dimensions[i]] = node.obj[dimensions[i]];
        }
      }
      var linearDistance = metric(linearPoint, node.obj);

      if(node.right == null && node.left == null) {
        if(bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
          saveNode(node, ownDistance);
        }
        return;
      }

      if(node.right == null) {
        bestChild = node.left;
      } else if(node.left == null) {
        bestChild = node.right;
      } else {
        if(point[dimension] < node.obj[dimension]) {
          bestChild = node.left;
        } else {
          bestChild = node.right;
        }
      }

      nearestSearch(bestChild);

      if(bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
        saveNode(node, ownDistance);
      }

      if(bestNodes.size() < maxNodes || Math.abs(linearDistance) < bestNodes.peek()[1]) {
        var otherChild;
        if(bestChild == node.left) {
          otherChild = node.right;
        } else {
          otherChild = node.left;
        }
        if(otherChild != null) nearestSearch(otherChild);
      }

      function saveNode(node, distance) {
        bestNodes.push([node, distance]);
        if(bestNodes.size() > maxNodes) {
          bestNodes.pop();
        }
      }
    }

    var result = [];
    for(var i=0; i<maxNodes; i++) {
      if(bestNodes.content[i][0]) {
        result.push([bestNodes.content[i][0].obj, bestNodes.content[i][1]]);
      }
    }
    return result;
  }
}

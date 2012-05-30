function kdTree(points, metric, dimensions) {

  function Node(obj, d) {
    this.obj = obj;
    this.left = null;
    this.right = null;
    this.dimension = d;
  }

  var root = buildTree(points, 0);

  function buildTree(points, depth) {
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

  // Binary heap implementation from:
  // http://eloquentjavascript.net/appendix2.html
  function BinaryHeap(scoreFunction){
    this.content = [];
    this.scoreFunction = scoreFunction;
  }

  BinaryHeap.prototype = {
    push: function(element) {
      this.content.push(element);
      this.bubbleUp(this.content.length - 1);
    },

    pop: function() {
      var result = this.content[0];
      var end = this.content.pop();
      if (this.content.length > 0) {
        this.content[0] = end;
        this.sinkDown(0);
      }
      return result;
    },

    peek: function() {
      return this.content[0];
    },

    remove: function(node) {
      var len = this.content.length;
      for (var i = 0; i < len; i++) {
        if (this.content[i] == node) {
          var end = this.content.pop();
          if (i != len - 1) {
            this.content[i] = end;
            if (this.scoreFunction(end) < this.scoreFunction(node))
              this.bubbleUp(i);
            else
              this.sinkDown(i);
          }
          return;
        }
      }
      throw new Error("Node not found.");
    },

    size: function() {
      return this.content.length;
    },

    bubbleUp: function(n) {
      var element = this.content[n];
      while (n > 0) {
        var parentN = Math.floor((n + 1) / 2) - 1,
        parent = this.content[parentN];
        if (this.scoreFunction(element) < this.scoreFunction(parent)) {
          this.content[parentN] = element;
          this.content[n] = parent;
          n = parentN;
        }
        else {
          break;
        }
      }
    },

    sinkDown: function(n) {
      var length = this.content.length,
      element = this.content[n],
      elemScore = this.scoreFunction(element);

      while(true) {
        var child2N = (n + 1) * 2, child1N = child2N - 1;
        var swap = null;
        if (child1N < length) {
          var child1 = this.content[child1N],
          child1Score = this.scoreFunction(child1);
          if (child1Score < elemScore)
            swap = child1N;
        }
        if (child2N < length) {
          var child2 = this.content[child2N],
          child2Score = this.scoreFunction(child2);
          if (child2Score < (swap == null ? elemScore : child1Score))
            swap = child2N;
        }

        if (swap != null) {
          this.content[n] = this.content[swap];
          this.content[swap] = element;
          n = swap;
        }
        else {
          break;
        }
      }
    }
  };

}

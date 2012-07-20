function kdTree(points, metric, dimensions) {

  function Node(obj, d, parent) {
    this.obj = obj;
    this.left = null;
    this.right = null;
    this.parent = parent;
    this.dimension = d;
  }

  var self = this;
  this.root = buildTree(points, 0, null);

  function buildTree(points, depth, parent) {
    var dim = depth % dimensions.length;
    if(points.length == 0) return null;
    if(points.length == 1) return new Node(points[0], dim, parent);

    points.sort(function(a,b){ return a[dimensions[dim]] - b[dimensions[dim]]; });

    var median = Math.floor(points.length/2);
    var node = new Node(points[median], dim, parent);
    node.left = buildTree(points.slice(0,median), depth+1, node);
    node.right = buildTree(points.slice(median+1), depth+1, node);
    return node;
  }

  this.insert = function(point) {
    var insertPosition = innerSearch(self.root, null);

    if(insertPosition == null) {
      self.root = new Node(point, 0, null);
      return;
    }

    var newNode = new Node(point, (insertPosition.dimension+1)%dimensions.length, insertPosition);
    var dimension = dimensions[insertPosition.dimension];
    if(point[dimension] < insertPosition.obj[dimension]) {
      insertPosition.left = newNode;
    } else {
      insertPosition.right = newNode;
    }

    function innerSearch(node, parent) {
      if(node == null) return parent;

      var dimension = dimensions[node.dimension];
      if(point[dimension] < node.obj[dimension]) {
        return innerSearch(node.left, node);
      } else {
        return innerSearch(node.right, node);
      }
    }
  }

  this.remove = function(point) {
    var node = nodeSearch(self.root);
    if(node == null) return;

    removeNode(node);
    function nodeSearch(node) {
      if(node == null) return null;
      if(node.obj === point) return node;

      var dimension = dimensions[node.dimension];
      if(point[dimension] < node.obj[dimension]) {
        return nodeSearch(node.left, node);
      } else {
        return nodeSearch(node.right, node);
      }
    }

    function removeNode(node) {
      if(node.left == null && node.right == null) {
        if(node.parent == null) {
          self.root = null;
          return;
        }
        var pDimension = dimensions[node.parent.dimension];
        if(node.obj[pDimension] < node.parent.obj[pDimension]) {
          node.parent.left = null;
        } else {
          node.parent.right = null;
        }
        return;
      }

      if(node.left != null) {
        var nextNode = findMax(node.left, node.dimension);
      } else {
        var nextNode = findMin(node.right, node.dimension);
      }
      var nextObj = nextNode.obj;
      removeNode(nextNode);
      node.obj = nextObj;

      function findMax(node, dim) {
        if(node == null) return null;

        var dimension = dimensions[dim];
        if(node.dimension == dim) {
          if(node.right != null) return findMax(node.right, dim);
          return node;
        }

        var own = node.obj[dimension]
        var left = findMax(node.left, dim);
        var right = findMax(node.right, dim);
        var max = node;
        if(left != null && left.obj[dimension] > own) max = left;
        if(right != null && right.obj[dimension] > max.obj[dimension]) max = right;
        return max;
      }

      function findMin(node, dim) {
        if(node == null) return null;

        var dimension = dimensions[dim];
        if(node.dimension == dim) {
          if(node.left != null) return findMin(node.left, dim);
          return node;
        }

        var own = node.obj[dimension]
        var left = findMin(node.left, dim);
        var right = findMin(node.right, dim);
        var min = node;
        if(left != null && left.obj[dimension] < own) min = left;
        if(right != null && right.obj[dimension] < min.obj[dimension]) min = right;
        return min;
      }
    }
  }

  this.nearest = function(point, maxNodes, maxDistance) {
    bestNodes = new BinaryHeap(function(e){ return -e[1]; });
    if(maxDistance) {
      for(var i=0; i<maxNodes; i++) {
        bestNodes.push([null, maxDistance]);
      }
    }
    nearestSearch(self.root);

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

  this.balanceFactor = function() {
    return height(self.root)/(Math.log(count(self.root))/Math.log(2));

    function height(node) {
      if(node == null) return 0;
      return Math.max(height(node.left), height(node.right)) + 1;
    }

    function count(node) {
      if(node == null) return 0;
      return count(node.left) + count(node.right) + 1;
    }
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

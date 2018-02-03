/**
 * k-d Tree JavaScript - V 1.01
 *
 * https://github.com/ubilabs/kd-tree-javascript
 *
 * @author Mircea Pricop <pricop@ubilabs.net>, 2012
 * @author Martin Kleppe <kleppe@ubilabs.net>, 2012
 * @author Ubilabs http://ubilabs.net, 2012
 * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

/*
function assert(condition, message) {
	if (condition) {
		return;
	}
	message = message || "Assertion failed";
	if (typeof Error !== "undefined") {
		throw new Error(message);
	}
	throw message; // Fallback
}*/

function swap(points, i,j) {
	const t = points[i];
	points[i] = points[j];
	points[j] = t;
}

// left is always included, right is always excluded,
// so the range [left,right) contains (right-left) elements.
function partition(points, left, right, pivIdx, dim) {
	// Partition around the value found at position pivIdx.
	const pivot = points[pivIdx][dim]; // get pivot value
	var storeIdx = left; // variable to store the final position of the pivot value.
	swap(points, pivIdx, right-1); // Move pivot to end
	for (i=left; i < right-1; ++i) { // check all values but the last
		if( points[i][dim] < pivot ) {
			if( storeIdx < i )
				swap(points, storeIdx, i); // this moves all values smaller that pivot to the left.
			++storeIdx;
		}
	}
	if( storeIdx < right-1 ) {
		swap(points, storeIdx, right-1); // Move pivot to proper place
	}
	return storeIdx;
}

// assumes [left, right) is sorted and
// finds position of first element >= val
function lower_bound(points, left, right, val, dim) {
	var count = right - left;
	while( count > 0 ) {
		let step = Math.floor(count / 2);
		if( points[left+step][dim] < val ) {
			left  += step+1;
			count -= step+1;
		}
		else {
			count = step;
		}
	}
	return left;
}

// returns the *position* of a median
function smallMedian(points, left, right, dim) {
	if( right - left < 3 ) { // less than 3 elements
		return left;
	}
	// at least 3 elements.
	const p0 = points[left+0], p1 = points[left+1], p2 = points[left+2];
	const v0 = p0[dim],        v1 = p1[dim],        v2 = p2[dim];
	if( v0 <= v1 ) {
		if( v2 < v1 ) {
			if( v2 < v0 ) { // we want v2-v0-v1
				points[left+0] = p2;
				points[left+1] = p0;
				points[left+2] = p1;
			} else { // we want v0-v2-v1
				points[left+1] = p2;
				points[left+2] = p1;
			}
		}
	} else { // v1 < v0
		if( v2 < v1 ) {
			points[left+0] = p2;
			points[left+1] = p1;
			points[left+2] = p0;
		} else if( v2 < v0 ) {
			points[left+0] = p1;
			points[left+1] = p2;
			points[left+2] = p0;
		} else {
			points[left+0] = p1;
			points[left+1] = p0;
		}
	}
	if( left + 3 == right ) { // exactly 3 elements
		return left+1;
	}
	// insert remaining elements with insertion sort
	for( r = left+3; r < right; ++r ) {
		const pos = lower_bound(points, left, r, points[r][dim], dim); // binary search
		if( pos < r ) {
			const p = points[r];
			for(j=r; j > pos; --j) {
				points[j] = points[j-1];
			}
			points[pos] = p;
		}
	}
	return Math.floor((left+right)/2);
}

function find_good_pivot_pos(points, left, right, dim) {
	if( right <= left + 5 ) {
		return smallMedian(points, left, right, dim);
	}
	var ipos = left;
	for( i = left; i < right; i += 5 ) {
		const subRight = Math.min(i+5, right);
		const m = smallMedian(points, i, subRight, dim);
		swap(points, m, ipos);
		++ipos;
	}
	return select(points, left, ipos, Math.floor((left+ipos)/2), dim);
}

function select(points, left, right, nth, dim) {
	while (true) {
		if (left+1 == right) {
			return left;
		}
		// `find_good_pivot_pos` uses median-of-medians-of-5 to find a good pivot position.
		// But it turns out to be slower than the stupid choice in our tests.
		// 1M 2D points in the basic example : 2.5 sec vs 4.5 sec.
		let pivotIdx = Math.floor((left+right)/2);//find_good_pivot_pos(points, left, right, dim);
		pivotIdx = partition(points, left, right, pivotIdx, dim);
		if (nth == pivotIdx) {
			return nth;
		} else if (nth < pivotIdx) {
			right = pivotIdx;
		} else {
			left = pivotIdx+1;
		}
	}
}

(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports'], factory);
	} else if (typeof exports === 'object') {
		factory(exports);
	} else {
		factory(root);
	}
}(this, function (exports) {
	function Node(obj, dimIdx, parent) {
		this.obj = obj;
		this.left = null;
		this.right = null;
		this.parent = parent;
		this.dimIdx = dimIdx;
	}

function kdTree(points, metric, dimensions) {

	var self = this;

	function buildTree(left, right, depth, parent) {
		const dimi = depth % dimensions.length;
		const dim = dimensions[dimi];
		if (left == right) {
			return null;
		}
		if (left+1 == right) {
			return new Node(points[left], dimi, parent);
		}
		const mid = Math.floor((left+right)/2);
		select(points, left, right, mid, dim);
		const node = new Node(points[mid], dimi, parent);
		node.left = buildTree(left, mid, depth + 1, node);
		node.right = buildTree(mid+1, right, depth + 1, node);
		return node;
	}

    // Reloads a serialized tree
    function loadTree (data) {
      // Just need to restore the `parent` parameter
      self.root = data;

      function restoreParent (root) {
        if (root.left) {
          root.left.parent = root;
          restoreParent(root.left);
        }

        if (root.right) {
          root.right.parent = root;
          restoreParent(root.right);
        }
      }

      restoreParent(self.root);
    }

    // If points is not an array, assume we're loading a pre-built tree
    if (!Array.isArray(points)) loadTree(points, metric, dimensions);
    else this.root = buildTree(0, points.length, 0, null);

    // Convert to a JSON serializable structure; this just requires removing
    // the `parent` property
    this.toJSON = function (src) {
      if (!src) src = this.root;
      const dest = new Node(src.obj, src.dimIdx, null);
      if (src.left) dest.left = self.toJSON(src.left);
      if (src.right) dest.right = self.toJSON(src.right);
      return dest;
    };

    this.insert = function (point) {
      function innerSearch(node, parent) {

        if (node === null) {
          return parent;
        }

        const dimension = dimensions[node.dimIdx];
        if (point[dimension] < node.obj[dimension]) {
          return innerSearch(node.left, node);
        } else {
          return innerSearch(node.right, node);
        }
      }

      const insertPosition = innerSearch(this.root, null);

      if (insertPosition === null) {
        this.root = new Node(point, 0, null);
        return;
      }

      const newNode = new Node(point, (insertPosition.dimIdx + 1) % dimensions.length, insertPosition);
      const dimension = dimensions[insertPosition.dimIdx];

      if (point[dimension] < insertPosition.obj[dimension]) {
        insertPosition.left = newNode;
      } else {
        insertPosition.right = newNode;
      }
    };

    this.remove = function (point) {
      var node;

      function nodeSearch(node) {
        if (node === null) {
          return null;
        }

        if (node.obj === point) {
          return node;
        }

        const dimension = dimensions[node.dimIdx];

        if (point[dimension] < node.obj[dimension]) {
          return nodeSearch(node.left, node);
        } else {
          return nodeSearch(node.right, node);
        }
      }

      function removeNode(node) {
        var nextNode,
          nextObj,
          pDimension;

        function findMin(node, dim) {
          var dimension,
            own,
            left,
            right,
            min;

          if (node === null) {
            return null;
          }

          dimension = dimensions[dim];

          if (node.dimIdx === dim) {
            if (node.left !== null) {
              return findMin(node.left, dim);
            }
            return node;
          }

          own = node.obj[dimension];
          left = findMin(node.left, dim);
          right = findMin(node.right, dim);
          min = node;

          if (left !== null && left.obj[dimension] < own) {
            min = left;
          }
          if (right !== null && right.obj[dimension] < min.obj[dimension]) {
            min = right;
          }
          return min;
        }

        if (node.left === null && node.right === null) {
          if (node.parent === null) {
            self.root = null;
            return;
          }

          pDimension = dimensions[node.parent.dimIdx];

          if (node.obj[pDimension] < node.parent.obj[pDimension]) {
            node.parent.left = null;
          } else {
            node.parent.right = null;
          }
          return;
        }

        // If the right subtree is not empty, swap with the minimum element on the
        // node's dimension. If it is empty, we swap the left and right subtrees and
        // do the same.
        if (node.right !== null) {
          nextNode = findMin(node.right, node.dimIdx);
          nextObj = nextNode.obj;
          removeNode(nextNode);
          node.obj = nextObj;
        } else {
          nextNode = findMin(node.left, node.dimIdx);
          nextObj = nextNode.obj;
          removeNode(nextNode);
          node.right = node.left;
          node.left = null;
          node.obj = nextObj;
        }

      }

      node = nodeSearch(self.root);

      if (node === null) { return; }

      removeNode(node);
    };

    this.nearest = function (query, maxNodes, maxDistance) {
      var i,
        result,
        bestNodes;

      bestNodes = new BinaryHeap(
        function (e) { return -e[1]; }
      );

        function saveNode(node, distance) {
          bestNodes.push([node, distance]);
          if (bestNodes.size() > maxNodes) {
            bestNodes.pop();
          }
        }

      function nearestSearch(node) {
        var bestChild, otherChild, i;
        const curdim = dimensions[node.dimIdx];
        const ownDistance = metric(query, node.obj);

		 var orthogonalPoint = {}
		 for(d =0; d < dimensions.length; ++d) {
			 orthogonalPoint[dimensions[d]] = node.obj[dimensions[d]];
		 }
		 orthogonalPoint[curdim] = query[curdim];
		 const orthogonalDistance = metric(orthogonalPoint, node.obj);

        if (node.right === null && node.left === null) {
          if (bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
            saveNode(node, ownDistance);
          }
          return;
        }

        if (node.right === null) {
          bestChild = node.left;
        } else if (node.left === null) {
          bestChild = node.right;
        } else {
          if (query[curdim] < node.obj[curdim]) {
            bestChild = node.left;
          } else {
            bestChild = node.right;
          }
        }

        nearestSearch(bestChild);

        if (bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
          saveNode(node, ownDistance);
        }

        if (bestNodes.size() < maxNodes || Math.abs(orthogonalDistance) < bestNodes.peek()[1]) {
          if (bestChild === node.left) {
            otherChild = node.right;
          } else {
            otherChild = node.left;
          }
          if (otherChild !== null) {
            nearestSearch(otherChild);
          }
        }
      }

      if (maxDistance) {
        for (i = 0; i < maxNodes; i += 1) {
          bestNodes.push([null, maxDistance]);
        }
      }

      if(self.root)
        nearestSearch(self.root);

      result = [];

      for (i = 0; i < Math.min(maxNodes, bestNodes.content.length); i += 1) {
        if (bestNodes.content[i][0]) {
          result.push([bestNodes.content[i][0].obj, bestNodes.content[i][1]]);
        }
      }
      return result;
    };

    this.balanceFactor = function () {
      function height(node) {
        if (node === null) {
          return 0;
        }
        return Math.max(height(node.left), height(node.right)) + 1;
      }

      function count(node) {
        if (node === null) {
          return 0;
        }
        return count(node.left) + count(node.right) + 1;
      }

      return height(self.root) / (Math.log(count(self.root)) / Math.log(2));
    };
  }

	/* Now a static version of the Kd-tree, that only shuffles the input array.
	 * No extra node hierarchy is built.
	 * It does not seem to be faster, but it uses less memory.
	 */

function staticKdTree(points, metric, dimensions) {

	var self = this;

	function getNodeIndex(node) {
		return Math.floor((node[0]+node[1])/2);
	}

	function buildTree(left, right, depth) {
		if (left+1 >= right) {
			return;
		}
		const dim = dimensions[depth % dimensions.length];
		const mid = getNodeIndex([left, right]);
		select(self.points, left, right, mid, dim);
		buildTree(left, mid, depth + 1);
		buildTree(mid+1, right, depth + 1);
	}

	this.points = points;//.slice();
	this.root = buildTree(0, self.points.length, 0);

	this.nearest = function (query, maxNodes, maxDistance) {
		var i, result, bestNodes;

		bestNodes = new BinaryHeap(
			function (e) { return -e[1]; }
		);

		function saveNode(node, distance) {
			bestNodes.push([node, distance]);
			if (bestNodes.size() > maxNodes) {
				bestNodes.pop();
			}
		}

		function nearestSearch(bounds, depth) {
			const nodeIdx = getNodeIndex(bounds);
			const nodePt = self.points[nodeIdx];
			const dimi = depth % dimensions.length;
			const curdim = dimensions[dimi];
			var bestChild, otherChild, i;
			const ownDistance = metric(query, nodePt);

			var orthogonalPoint = {}
			for(d =0; d < dimensions.length; ++d) {
				orthogonalPoint[dimensions[d]] = nodePt[dimensions[d]];
			}
			orthogonalPoint[curdim] = query[curdim];
			const orthogonalDistance = metric(orthogonalPoint, nodePt);

			const [left, right] = bounds;
			const nbElem = right - left;

			if( nbElem == 1 ) {
				if (bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
					saveNode(bounds, ownDistance);
				}
				return;
			}

			const leftChild = [left, nodeIdx];
			const rightChild = [nodeIdx+1, right];

			if( rightChild[0] == rightChild[1] ) { // right child is empty
				bestChild = leftChild;
				otherChild = rightChild;
			} else if( leftChild[0] == leftChild[1] ) { // left child is empty
				bestChild = rightChild;
				otherChild = leftChild;
			} else { // both children are NOT empty
				if (query[curdim] < nodePt[curdim]) {
					bestChild = leftChild;
					otherChild = rightChild;
				} else {
					bestChild = rightChild;
					otherChild = leftChild;
				}
			}

			nearestSearch(bestChild, depth+1);

			if (bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
				saveNode(bounds, ownDistance);
			}

			if (bestNodes.size() < maxNodes || Math.abs(orthogonalDistance) < bestNodes.peek()[1]) {
				if (otherChild[0] < otherChild[1]) { // if otherChild is NOT empty
					nearestSearch(otherChild, depth+1);
				}
			}
		}

		if (maxDistance) {
			for (i = 0; i < maxNodes; i += 1) {
				bestNodes.push([null, maxDistance]);
			}
		}

		if(self.points.length > 0)
			nearestSearch([0, points.length], 0);

		result = [];

		for (i = 0; i < Math.min(maxNodes, bestNodes.content.length); i += 1) {
			bounds = bestNodes.content[i][0];
			if( bounds != null ) {
				result.push([self.points[getNodeIndex(bounds)], bestNodes.content[i][1]]);
			}
		}
		return result;
	};

}

  // Binary heap implementation from:
  // http://eloquentjavascript.net/appendix2.html

  function BinaryHeap(scoreFunction){
    this.content = [];
    this.scoreFunction = scoreFunction;
  }

  BinaryHeap.prototype = {
    push: function(element) {
      // Add the new element to the end of the array.
      this.content.push(element);
      // Allow it to bubble up.
      this.bubbleUp(this.content.length - 1);
    },

    pop: function() {
      // Store the first element so we can return it later.
      var result = this.content[0];
      // Get the element at the end of the array.
      var end = this.content.pop();
      // If there are any elements left, put the end element at the
      // start, and let it sink down.
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
      // To remove a value, we must search through the array to find
      // it.
      for (var i = 0; i < len; i++) {
        if (this.content[i] == node) {
          // When it is found, the process seen in 'pop' is repeated
          // to fill up the hole.
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
      // Fetch the element that has to be moved.
      var element = this.content[n];
      // When at 0, an element can not go up any further.
      while (n > 0) {
        // Compute the parent element's index, and fetch it.
        var parentN = Math.floor((n + 1) / 2) - 1,
            parent = this.content[parentN];
        // Swap the elements if the parent is greater.
        if (this.scoreFunction(element) < this.scoreFunction(parent)) {
          this.content[parentN] = element;
          this.content[n] = parent;
          // Update 'n' to continue at the new position.
          n = parentN;
        }
        // Found a parent that is less, no need to move it further.
        else {
          break;
        }
      }
    },

    sinkDown: function(n) {
      // Look up the target element and its score.
      var length = this.content.length,
          element = this.content[n],
          elemScore = this.scoreFunction(element);

      while(true) {
        // Compute the indices of the child elements.
        var child2N = (n + 1) * 2, child1N = child2N - 1;
        // This is used to store the new position of the element,
        // if any.
        var swap = null;
        // If the first child exists (is inside the array)...
        if (child1N < length) {
          // Look it up and compute its score.
          var child1 = this.content[child1N],
              child1Score = this.scoreFunction(child1);
          // If the score is less than our element's, we need to swap.
          if (child1Score < elemScore)
            swap = child1N;
        }
        // Do the same checks for the other child.
        if (child2N < length) {
          var child2 = this.content[child2N],
              child2Score = this.scoreFunction(child2);
          if (child2Score < (swap == null ? elemScore : child1Score)){
            swap = child2N;
          }
        }

        // If the element needs to be moved, swap it, and continue.
        if (swap != null) {
          this.content[n] = this.content[swap];
          this.content[swap] = element;
          n = swap;
        }
        // Otherwise, we are done.
        else {
          break;
        }
      }
    }
  };

  exports.kdTree = kdTree;
  exports.staticKdTree = staticKdTree;
  exports.BinaryHeap = BinaryHeap;
}));

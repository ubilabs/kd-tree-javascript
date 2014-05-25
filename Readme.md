# k-d Tree JavaScript Library

A basic but super fast JavaScript implementation of the k-dimensional tree data structure.

As of version 1.01, the library is defined as an UMD module (based on https://github.com/umdjs/umd/blob/master/commonjsStrict.js).

In computer science, a [k-d tree](http://en.wikipedia.org/wiki/K-d_tree) (short for k-dimensional tree) is a space-partitioning data structure for organizing points in a k-dimensional space. k-d trees are a useful data structure for several applications, such as searches involving a multidimensional search key (e.g. range searches and nearest neighbor searches). k-d trees are a special case of binary space partitioning trees.

### Demos

* [Spiders](http://ubilabs.github.com/kd-tree-javascript/examples/basic/) - animated multiple nearest neighbour search
* [Google Map](http://ubilabs.github.com/kd-tree-javascript/examples/map/) - show nearest 20 out of 3000 markers on mouse move
* [Colors](http://ubilabs.github.com/kd-tree-javascript/examples/colors/) - search color names based on color space distance
* [Mutable](http://ubilabs.github.com/kd-tree-javascript/examples/mutable/) - dynamically add and remove nodes

### Usage

#### Using global exports
When you include the kd-tree script via HTML, the global variables *kdTree* and *BinaryHeap* will be exported.

```js
// Create a new tree from a list of points, a distance function, and a
// list of dimensions.
var tree = new kdTree(points, distance, dimensions);

// Query the nearest *count* neighbours to a point, with an optional
// maximal search distance.
// Result is an array with *count* elements.
// Each element is an array with two components: the searched point and
// the distance to it.
tree.nearest(point, count, [maxDistance]);

// Insert a new point into the tree. Must be consistent with previous
// contents.
tree.insert(point);

// Remove a point from the tree by reference.
tree.remove(point);

// Get an approximation of how unbalanced the tree is.
// The higher this number, the worse query performance will be.
// It indicates how many times worse it is than the optimal tree.
// Minimum is 1. Unreliable for small trees.
tree.balanceFactor();
```

#### Using RequireJS
```js
requirejs(['path/to/kdTree.js'], function (ubilabs) {
	// Create a new tree from a list of points, a distance function, and a
	// list of dimensions.
	var tree = new ubilabs.kdTree(points, distance, dimensions);

	// Query the nearest *count* neighbours to a point, with an optional
	// maximal search distance.
	// Result is an array with *count* elements.
	// Each element is an array with two components: the searched point and
	// the distance to it.
	tree.nearest(point, count, [maxDistance]);

	// Insert a new point into the tree. Must be consistent with previous
	// contents.
	tree.insert(point);

	// Remove a point from the tree by reference.
	tree.remove(point);

	// Get an approximation of how unbalanced the tree is.
	// The higher this number, the worse query performance will be.
	// It indicates how many times worse it is than the optimal tree.
	// Minimum is 1. Unreliable for small trees.
	tree.balanceFactor();
});
```

### Example

```js
var points = [
  {x: 1, y: 2},
  {x: 3, y: 4},
  {x: 5, y: 6},
  {x: 7, y: 8}
];

var distance = function(a, b){
  return Math.pow(a.x - b.x, 2) +  Math.pow(a.y - b.y, 2);
}

var tree = new kdTree(points, distance, ["x", "y"]);

var nearest = tree.nearest({ x: 5, y: 5 }, 2);

console.log(nearest);
```

## About

Developed at [Ubilabs](http://ubilabs.net).
Released under the MIT Licence.

[![Analytics](https://ga-beacon.appspot.com/UA-57649-14/kd-tree)](https://github.com/igrigorik/ga-beacon)

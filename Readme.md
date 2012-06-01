# k-d Tree JavaScript Library

## A basic JavaScript implementation of the k-dimensional tree data structure.

In computer science, a k-d tree (short for k-dimensional tree) is a space-partitioning data structure for organizing points in a k-dimensional space. k-d trees are a useful data structure for several applications, such as searches involving a multidimensional search key (e.g. range searches and nearest neighbor searches). k-d trees are a special case of binary space partitioning trees.

### Demos

* [Spider](http://ubilabs.github.com/kd-tree-javascript/examples/basic/) - animated multiple nearest neighbour search
* [Google Map](http://ubilabs.github.com/kd-tree-javascript/examples/map/) - find nearest 20 out of 3000 markers
* [Colors](http://ubilabs.github.com/kd-tree-javascript/examples/colors/) - search color names based on color space distance


### Usage

```js
var tree = new kdTree(points, distance, dimensions);
tree.nearest(point, count, [maxDistance]);
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
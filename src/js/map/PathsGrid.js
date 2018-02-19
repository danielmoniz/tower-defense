
import Grid from './Grid'

export default class PathsGrid extends Grid {
  constructor(tilesWide, tilesHigh) {
    // this.grid = new Grid(tilesWide, tilesHigh)
    super(tilesWide, tilesHigh)
    this.reset()
  }

  reset() {
    this.values = this.newMapArray(null)
  }

  /*
   * Like at(), but for checking a direction.
   * Avoids returning null or false and instead returns -1 if invalid.
   * @TODO Give better name!
   */
  directionAt(x, y) {
    let value = this.at(x, y)
    if (Number.isInteger(value)) { return value }
    return -1
  }

  calculate(weights, endX = this.tilesWide - 1, endY = this.tilesHigh - 1) {
    // this.setUpPathLengths()
    this.reset()

    // @TODO Add -1 on each obstacle (0s on weights map)
    for (let x in weights.values) {
      for (let y in weights.values[x]) {
        if (weights.at(x, y) === 0) {
          this.set(x, y, -1)
        }
      }
    }

    if (!this.coordinateIsValid(endX, endY) || !weights.at(endX, endY)) {
      return false
    }
    this.set(endX, endY, 0)

    let queue = new BinaryHeap((pos) => this.at(pos.x, pos.y))
    let currentPos = { x: endX, y: endY }
    let coordinates = this.searchDirections(queue, currentPos)
    this.addMultipleToQueue(queue, coordinates, currentPos, weights)

    while (queue.content.length !== 0) {
      currentPos = queue.pop()
      coordinates = this.searchDirections(queue, currentPos)
      this.addMultipleToQueue(queue, coordinates, currentPos, weights)
    }

    return this.isMapValid() // need to know if map is blocked
  }

  // return false if the map is blocked off, ie. some tiles were never explored
  isMapValid() {
    for (let x = 0; x < this.values.length; x++) {
      for (let y = 0; y < this.values[x].length; y++) {
        if (this.at(x, y) === null) {
          return false
        }
      }
    }
    return true
  }

  searchDirections(queue, currentPos) {
    let north = { x: currentPos.x, y: currentPos.y - 1 }
    let south = { x: currentPos.x, y: currentPos.y + 1 }
    let west = { x: currentPos.x - 1, y: currentPos.y }
    let east = { x: currentPos.x + 1, y: currentPos.y }

    // let northEast = { x: currentPos.x + 1, y: currentPos.y - 1, angle: true }
    // let northWest = { x: currentPos.x - 1, y: currentPos.y - 1, angle: true }
    // let southEast = { x: currentPos.x + 1, y: currentPos.y + 1, angle: true }
    // let southWest = { x: currentPos.x - 1, y: currentPos.y + 1, angle: true }

    const directions = []

    const angles = {
      north: false,
      south: false,
      east: false,
      west: false,
    }

    if (this.at(north.x, north.y) == null) {
      directions.push(north)
      angles.north = true
    }
    if (this.at(south.x, south.y) == null) {
      directions.push(south)
      angles.south = true
    }
    if (this.at(west.x, west.y) == null) {
      directions.push(west)
      angles.west = true
    }
    if (this.at(east.x, east.y) == null) {
      directions.push(east)
      angles.east = true
    }

    // if (angles.north && angles.east && this.at(northEast.x, northEast.y) == null) {
    //   directions.push(northEast)
    // }
    // if (angles.north && angles.west && this.at(northWest.x, northWest.y) == null) {
    //   directions.push(northWest)
    // }
    // if (angles.south && angles.west && this.at(southWest.x, southWest.y) == null) {
    //   directions.push(southWest)
    // }

    // console.log(directions.length);

    return directions
  }

  addToQueue(queue, coordinate, currentPos, weights) {
    let newWeight = weights.at(coordinate.x, coordinate.y)
    // if (coordinate.angle) { console.log('bigger weight due to angle!'); newWeight *= Math.sqrt(2) }

    if (newWeight == 0) {
      this.set(coordinate.x, coordinate.y, -1)
    } else {
      let newLength = this.at(currentPos.x, currentPos.y) + newWeight
      this.set(coordinate.x, coordinate.y, newLength)
      queue.push(coordinate)
    }
  }

  addMultipleToQueue(queue, coordinates, currentPos, weights) {
    coordinates.forEach((coordinate) => {
      this.addToQueue(queue, coordinate, currentPos, weights)
    })
  }

}

function BinaryHeap(scoreFunction){
    this.content = [];
    this.scoreFunction = scoreFunction;
}

BinaryHeap.prototype = {
    push: function(element) {
        // Add the new element to the end of the array.
        this.content.push(element);

        // Allow it to sink down.
        this.sinkDown(this.content.length - 1);
    },
    pop: function() {
        // Store the first element so we can return it later.
        var result = this.content[0];
        // Get the element at the end of the array.
        var end = this.content.pop();
        // If there are any elements left, put the end element at the
        // start, and let it bubble up.
        if (this.content.length > 0) {
            this.content[0] = end;
            this.bubbleUp(0);
        }
        return result;
    },
    remove: function(node) {
        var i = this.content.indexOf(node);

        // When it is found, the process seen in 'pop' is repeated
        // to fill up the hole.
        var end = this.content.pop();

        if (i !== this.content.length - 1) {
            this.content[i] = end;

            if (this.scoreFunction(end) < this.scoreFunction(node)) {
                this.sinkDown(i);
            }
            else {
                this.bubbleUp(i);
            }
        }
    },
    size: function() {
        return this.content.length;
    },
    rescoreElement: function(node) {
        this.sinkDown(this.content.indexOf(node));
    },
    sinkDown: function(n) {
        // Fetch the element that has to be sunk.
        var element = this.content[n];

        // When at 0, an element can not sink any further.
        while (n > 0) {

            // Compute the parent element's index, and fetch it.
            var parentN = ((n + 1) >> 1) - 1,
                parent = this.content[parentN];
            // Swap the elements if the parent is greater.
            if (this.scoreFunction(element) < this.scoreFunction(parent)) {
                this.content[parentN] = element;
                this.content[n] = parent;
                // Update 'n' to continue at the new position.
                n = parentN;
            }
            // Found a parent that is less, no need to sink any further.
            else {
                break;
            }
        }
    },
    bubbleUp: function(n) {
        // Look up the target element and its score.
        var length = this.content.length,
            element = this.content[n],
            elemScore = this.scoreFunction(element);

        while(true) {
            // Compute the indices of the child elements.
            var child2N = (n + 1) << 1,
                child1N = child2N - 1;
            // This is used to store the new position of the element, if any.
            var swap = null,
                child1Score;
            // If the first child exists (is inside the array)...
            if (child1N < length) {
                // Look it up and compute its score.
                var child1 = this.content[child1N];
                child1Score = this.scoreFunction(child1);

                // If the score is less than our element's, we need to swap.
                if (child1Score < elemScore){
                    swap = child1N;
                }
            }

            // Do the same checks for the other child.
            if (child2N < length) {
                var child2 = this.content[child2N],
                    child2Score = this.scoreFunction(child2);
                if (child2Score < (swap === null ? elemScore : child1Score)) {
                    swap = child2N;
                }
            }

            // If the element needs to be moved, swap it, and continue.
            if (swap !== null) {
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

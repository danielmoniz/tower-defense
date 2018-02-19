
import Grid from './Grid'
import BinaryHeap from './BinaryHeap'

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

    while (queue.size() !== 0) {
      currentPos = queue.pop()
      coordinates = this.searchDirections(queue, currentPos)
      this.addMultipleToQueue(queue, coordinates, currentPos, weights)
    }

    console.log(this.values)
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

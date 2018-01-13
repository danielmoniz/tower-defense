
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
    let start = new Date()

    // this.setUpPathLengths()
    this.reset()

    if (!this.coordinateIsValid(endX, endY) || !weights.at(endX, endY)) {
      return
    }
    this.set(endX, endY, 0)
    let queue = []
    let currentPos = { x: endX, y: endY }
    let lastPos = {}
    let coordinates = this.searchDirections(queue, currentPos)
    this.addMultipleToQueue(queue, coordinates, currentPos, weights)

    while (queue.length != 0) {
      currentPos = queue.shift()
      coordinates = this.searchDirections(queue, currentPos)
      this.addMultipleToQueue(queue, coordinates, currentPos, weights)
    }

    console.log('Time to calculate path lengths:', new Date() - start)
  }

  searchDirections(queue, currentPos) {
    let north = { x: currentPos.x, y: currentPos.y - 1 }
    let south = { x: currentPos.x, y: currentPos.y + 1 }
    let west = { x: currentPos.x - 1, y: currentPos.y }
    let east = { x: currentPos.x + 1, y: currentPos.y }

    const directions = []

    if (this.at(north.x, north.y) == null) {
      directions.push(north)
    }
    if (this.at(south.x, south.y) == null) {
      directions.push(south)
    }
    if (this.at(west.x, west.y) == null) {
      directions.push(west)
    }
    if (this.at(east.x, east.y) == null) {
      directions.push(east)
    }

    return directions
  }

  addToQueue(queue, coordinate, currentPos, weights) {
    let newWeight = weights.at(coordinate.x, coordinate.y)
    if (newWeight == 0) {
      this.set(coordinate.x, coordinate.y, -1)
    } else {
      let newLength = this.at(currentPos.x, currentPos.y) + newWeight
      queue.push(coordinate)
      this.set(coordinate.x, coordinate.y, newLength)
    }
  }

  addMultipleToQueue(queue, coordinates, currentPos, weights) {
    coordinates.forEach((coordinate) => {
      this.addToQueue(queue, coordinate, currentPos, weights)
    })
  }

}

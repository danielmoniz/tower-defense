import { GRID_SIZE } from '../appConstants'

export default class Map {
  constructor(game) {
    this.game = game

    this.calculateGridDimensions()
    this.setupWeights()
    this.setupPathLengths()

    this.randomizeWeights(0.35)
    this.calculatePathLengths()

    console.log(this.weights);
    console.log(this.pathLengths);
    console.log(this.getPath());
  }

  randomizeWeights(wallProbability = 0.1) {
    for (let i = 0; i < this.weights.length; i++) {
      for (let j = 0; j < this.weights[i].length; j++) {
        let random = Math.random()
        if (random < wallProbability) {
          this.weights[i][j] = 0
        } else {
          this.weights[i][j] = 1
        }
      }
    }
  }

  calculatePathLengths(endX = this.tilesWide - 1, endY = this.tilesHigh - 1) {
    let start = new Date()

    this.setupPathLengths()

    if (!this.positionIsValid(endX, endY) || !this.weights[endX][endY]) {
      return
    }
    this.pathLengths[endX][endY] = 0
    let queue = []
    let currentPos = { x: endX, y: endY }
    let lastPos = {}
    this.searchAccessibleDirections(queue, currentPos)

    while (queue.length != 0) {
      currentPos = queue.shift()
      this.searchAccessibleDirections(queue, currentPos)
    }

    console.log(new Date() - start)
  }

  searchAccessibleDirections(queue, currentPos) {
    let north = { x: currentPos.x, y: currentPos.y - 1 }
    let south = { x: currentPos.x, y: currentPos.y + 1 }
    let west = { x: currentPos.x - 1, y: currentPos.y }
    let east = { x: currentPos.x + 1, y: currentPos.y }

    if (this.positionIsValid(north.x, north.y) &&
        this.pathLengths[north.x][north.y] == null) { // north
      this.addToQueue(queue, north, currentPos)
    }
    if (this.positionIsValid(south.x, south.y) &&
        this.pathLengths[south.x][south.y] == null) { // south
      this.addToQueue(queue, south, currentPos)
    }
    if (this.positionIsValid(west.x, west.y) &&
        this.pathLengths[west.x][west.y] == null) { // west
      this.addToQueue(queue, west, currentPos)
    }
    if (this.positionIsValid(east.x, east.y) &&
        this.pathLengths[east.x][east.y] == null) { // east
      this.addToQueue(queue, east, currentPos)
    }
  }

  addToQueue(queue, newPos, currentPos) {
    let newWeight = this.weights[newPos.x][newPos.y]
    if (newWeight == 0) {
      this.pathLengths[newPos.x][newPos.y] = -1
    } else {
      let newLength = this.pathLengths[currentPos.x][currentPos.y] + newWeight
      queue.push(newPos)
      this.pathLengths[newPos.x][newPos.y] = newLength
    }
  }

  positionIsValid(x, y) {
    if (x < 0 || x >= this.tilesWide || y < 0 || y >= this.tilesHigh) {
      return false
    } else {
      return true
    }
  }

  getPath(position = { x: 0, y: 0 }) {
    let start = new Date()

    let currentPos = position
    let currentLength = this.pathLengths[currentPos.x][currentPos.y]
    let path = []
    path.push([currentPos.x, currentPos.y])

    if (!this.positionIsAccessible(currentPos.x, currentPos.y)) {
      return false
    } else {
      while (currentLength > 0) {
        currentPos = this.searchPathDirections(path, currentPos, currentLength)
        currentLength = this.pathLengths[currentPos.x][currentPos.y]
      }
    }

    console.log(new Date() - start)
    return path
  }

  searchPathDirections(path, currentPos, currentLength) {
    let north = { x: currentPos.x, y: currentPos.y - 1 }
    let south = { x: currentPos.x, y: currentPos.y + 1 }
    let west = { x: currentPos.x - 1, y: currentPos.y }
    let east = { x: currentPos.x + 1, y: currentPos.y }

    let northLength = this.positionIsAccessible(north.x, north.y)
    let southLength = this.positionIsAccessible(south.x, south.y)
    let westLength = this.positionIsAccessible(west.x, west.y)
    let eastLength = this.positionIsAccessible(east.x, east.y)

    if (northLength !== false && northLength < currentLength) { // north
      path.push([north.x, north.y])
      return north
    }
    if (southLength !== false && southLength < currentLength) { // south
      path.push([south.x, south.y])
      return south
    }
    if (westLength !== false && westLength < currentLength) { // west
      path.push([west.x, west.y])
      return west
    }
    if (eastLength !== false && eastLength < currentLength) { // east
      path.push([east.x, east.y])
      return east
    }
  }

  positionIsAccessible(x, y) {
    if (!this.positionIsValid(x, y)) {
      return false
    }

    let pathLength = this.pathLengths[x][y]
    if (pathLength == null || pathLength < 0) {
      return false
    } else {
      return pathLength
    }
  }

  calculateGridDimensions() {
    this.tilesWide = Math.floor( this.game.width / GRID_SIZE )
    this.tilesHigh = Math.floor( this.game.height / GRID_SIZE )
  }

  setupWeights() {
    if (this.hasOwnProperty('weights')) {
      return
    }

    this.weights = this.newMapArray(1)
  }

  setupPathLengths() {
    // Commented out to use this temporarily for resetting this.pathLengths

    // if (this.hasOwnProperty('pathLengths')) {
    //   return
    // }

    this.pathLengths = this.newMapArray(null)
  }

  newMapArray(initialValue = 0) {
    let mapArray = new Array(this.tilesWide)
    for (let i = 0; i < mapArray.length; i++) {
      mapArray[i] = new Array(this.tilesHigh).fill(initialValue)
    }
    return mapArray
  }
}

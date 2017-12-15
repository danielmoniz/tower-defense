import { GRID_SIZE } from '../appConstants'

export default class Map {
  constructor(game) {
    this.game = game

    this.calculateGridDimensions()
    this.setupWeights()
    this.setupPathLengths()

    this.randomizeWeights(0.3)
    this.calculatePathLengths()

    console.log(this.weights);
    console.log(this.pathLengths);
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

    if (!this.coordinateIsValid(endX, endY) || !this.weights[endX][endY]) {
      return
    }
    this.pathLengths[endX][endY] = 0
    let queue = []
    let currentPos = { x: endX, y: endY }
    let lastPos = {}
    this.searchDirections(queue, currentPos)

    while (queue.length != 0) {
      currentPos = queue.shift()
      this.searchDirections(queue, currentPos)
    }

    console.log(new Date() - start)
  }

  searchDirections(queue, currentPos) {
    let north = { x: currentPos.x, y: currentPos.y - 1 }
    let south = { x: currentPos.x, y: currentPos.y + 1 }
    let west = { x: currentPos.x - 1, y: currentPos.y }
    let east = { x: currentPos.x + 1, y: currentPos.y }

    if (this.coordinateIsValid(north.x, north.y) &&
        this.pathLengths[north.x][north.y] == null) { // north
      this.addToQueue(queue, north, currentPos)
    }
    if (this.coordinateIsValid(south.x, south.y) &&
        this.pathLengths[south.x][south.y] == null) { // south
      this.addToQueue(queue, south, currentPos)
    }
    if (this.coordinateIsValid(west.x, west.y) &&
        this.pathLengths[west.x][west.y] == null) { // west
      this.addToQueue(queue, west, currentPos)
    }
    if (this.coordinateIsValid(east.x, east.y) &&
        this.pathLengths[east.x][east.y] == null) { // east
      this.addToQueue(queue, east, currentPos)
    }
  }

  addToQueue(queue, coordinate, currentPos) {
    let newWeight = this.weights[coordinate.x][coordinate.y]
    if (newWeight == 0) {
      this.pathLengths[coordinate.x][coordinate.y] = -1
    } else {
      let newLength = this.pathLengths[currentPos.x][currentPos.y] + newWeight
      queue.push(coordinate)
      this.pathLengths[coordinate.x][coordinate.y] = newLength
    }
  }

  coordinateIsValid(x, y) {
    if (x < 0 || x >= this.tilesWide || y < 0 || y >= this.tilesHigh) {
      return false
    } else {
      return true
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

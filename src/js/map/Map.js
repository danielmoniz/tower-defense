import { GRID_SIZE } from '../appConstants'

export default class Map {
  constructor(game) {
    this.game = game

    this.calculateGridDimensions()
    this.setupWeights()
    this.setupPathLengths()

    this.randomizeWeights(0.3)
    this.calculatePathLengths()

    // console.log(this.weights);
    console.log(this.pathLengths);
  }

  getDirectionFromNode(x, y) {
    const north = this.pathLengths[x][y + 1] || -1
    const south = this.pathLengths[x][y - 1] || -1
    const east = this.pathLengths[x + 1] && this.pathLengths[x + 1][y] || -1
    const west = this.pathLengths[x - 1] && this.pathLengths[x - 1][y] || -1
    let directions = [
      {direction: 'north', value: north, angle: this.degreesToRadians(90)},
      {direction: 'south', value: south, angle: this.degreesToRadians(270)},
      {direction: 'east', value: east, angle: this.degreesToRadians(0)},
      {direction: 'west', value: west, angle: this.degreesToRadians(180)},
    ]
    const directionValues = directions.map((directionInfo) => {
      return directionInfo.value
    }).filter((value) => {
      return value >= 0
    })
    // Return false if there is nowhere to go
      // ^^^ Shouldn't happen if we prevent towers from being placed anywhere!
      // however, terrain might still cause issues
    if (directionValues.length === 0) { return false }

    // @TODO What to do if on final space? ie. value of current value is 0?
    const smallestValue = Math.min(...directionValues)
    directions = directions.filter((direction) => {
      return direction.value === smallestValue
    })
    console.log(directions);

    // pick random direction out of smallest options (might be multiple)
    const finalDirection = directions[Math.floor(Math.random() * directions.length)]
    console.log(finalDirection);
    return finalDirection.angle
  }

  degreesToRadians(degrees) {
    return degrees * Math.PI / 180
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

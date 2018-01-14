
import WeightsGrid from './WeightsGrid'
import PathsGrid from './PathsGrid'

export default class Pathing {
  constructor(game, grid_size) {
    this.game = game
    this.GRID_SIZE = grid_size

    this.calculateGridDimensions()
    this.weights = new WeightsGrid(this.tilesWide, this.tilesHigh)
    this.pathLengths = new PathsGrid(this.tilesWide, this.tilesHigh)

    this.compute()
  }

  setUpRandomMap() {
    // this.weights.randomize(0.3)
    this.weights.testTerrainWall()
    this.compute()
  }

  compute(endX, endY) {
    // @TODO calculate weights based on terrain/towers
    this.pathLengths.reset()
    // console.log(this.pathLengths);
    this.pathLengths.calculate(this.weights, endX, endY)
    // console.log(this.weights);
    console.log(this.pathLengths);
  }

  // @TODO Split into smaller functions!
  getDirection(x, y) {
    const gridLocation = this.calculateGridLocation({ x, y })
    x = gridLocation.x
    y = gridLocation.y
    // y = Math.floor(y)
    // console.log(x, y);
    const north = this.pathLengths.directionAt(x, y - 1)
    const south = this.pathLengths.directionAt(x, y + 1)
    const east = this.pathLengths.directionAt(x + 1, y)
    const west = this.pathLengths.directionAt(x - 1, y)
    // console.log(north, south, east, west);
    let directions = [
      {direction: 'north', value: north, angle: this.degreesToRadians(90), location: { x: x, y: y - 1 }},
      {direction: 'south', value: south, angle: this.degreesToRadians(270), location: { x: x, y: y + 1 }},
      {direction: 'east', value: east, angle: this.degreesToRadians(0), location: { x: x + 1, y: y }},
      {direction: 'west', value: west, angle: this.degreesToRadians(180), location: { x: x - 1, y: y }},
    ]
    const directionValues = directions.map((directionInfo) => {
      return directionInfo.value
    }).filter((value) => {
      return value >= 0
    })

    // Return false if there is nowhere to go
      // ^^^ Shouldn't happen if we prevent towers from being placed anywhere!
      // however, terrain might still cause issues
    if (directionValues.length === 0) {
      const oneTileLeft = this.calculateGridLocation({ x: gridLocation.x - 1, y: gridLocation.y })
      console.log("No directions - sending left");
      return oneTileLeft
      // return this.calculateGridLocation({ x: x - 1, y: y })
      // return {x: Math.floor(x - 1), y: Math.floor(y) }
    }
    // console.log(directionValues);

    // @TODO What to do if on final space? ie. value of current value is 0?
    const smallestValue = Math.min(...directionValues)
    directions = directions.filter((direction) => {
      return direction.value === smallestValue
    })
    // const randomIndex = Math.floor(Math.random() * directions.length)
    // const randomIndex = 0
    const randomIndex = directions.length - 1

    // pick random direction out of smallest options (might be multiple)
    const finalDirection = directions[randomIndex]

    // console.log(finalDirection);
    return this.convertToRealLocation(finalDirection.location)
  }

  degreesToRadians(degrees) {
    return degrees * Math.PI / 180
  }

  calculateGridDimensions() {
    this.tilesWide = Math.floor( this.game.width / this.GRID_SIZE )
    this.tilesHigh = Math.floor( this.game.height / this.GRID_SIZE )
  }

  calculateGridLocation(location) {
    return {
      x: Math.floor(location.x / this.GRID_SIZE),
      y: Math.floor(location.y / this.GRID_SIZE),
    }
  }

  convertToRealLocation(gridLocation) {
    return {
      x: Math.floor(gridLocation.x * this.GRID_SIZE),
      y: Math.floor(gridLocation.y * this.GRID_SIZE),
    }
  }
}

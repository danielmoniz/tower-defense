
import WeightsGrid from './WeightsGrid'
import PathsGrid from './PathsGrid'

export default class Pathing {
  constructor(game, grid_size, endGoal) {
    this.game = game
    this.GRID_SIZE = grid_size
    this.calculateGridDimensions()

    this.endGoal = this.setEndGoal(endGoal)
    this.objectives = [endGoal]


    this.weights = new WeightsGrid(this.tilesWide, this.tilesHigh)
    this.pathLengths = new PathsGrid(this.tilesWide, this.tilesHigh)


    this.compute()
  }

  addObstacle(location, width, height) {
    const gridLocation = this.calculateGridLocation(location)
    const gridWidth = this.convertToGridValue(width)
    const gridHeight = this.convertToGridValue(height)

    // const testWeights = new WeightsGrid(this.tilesWide, this.tilesHigh)
    // testWeights.values = this.weights.values.slice() // copy existing weights
    // testWeights.addObstacle(gridLocation, gridWidth, gridHeight)
    // const testPathLengths = new PathsGrid(this.tilesWide, this.tilesHigh)
    // testPathLengths.calculate(testWeights, this.endX, this.endY)
    // testPathLengths.addObstacle(gridLocation, gridWidth, gridHeight)
    // const allowed = testPathLengths.isMapValid()
    // if (!allowed) { console.log("Not allowed!"); return false }
    //
    // console.log('----------------');

    this.weights.addObstacle(gridLocation, gridWidth, gridHeight)
    this.compute()
    return true
  }

  setEndGoal(endGoal) {
    if (endGoal !== undefined) {
      return this.calculateGridLocation(endGoal)
    }
    return {
      x: this.tilesWide - 1,
      y: this.tilesHigh - 1,
    }
  }

  setUpRandomMap() {
    // this.weights.randomize(0.3)
    this.weights.testTerrainWall()
    this.compute()
  }

  compute(options = {
    endX: this.endGoal.x,
    endY: this.endGoal.y,
    weights: this.weights,
    pathLengths: this.pathLengths,
  }) {
    // @TODO calculate weights based on terrain
    options.pathLengths.reset()
    // console.log(options.pathLengths);
    options.pathLengths.calculate(options.weights, options.endX, options.endY)
    // console.log(this.weights);
    console.log(options.pathLengths);
  }

  // @TODO Split into smaller functions!
  getDirection(realX, realY) {
    const gridLocation = this.calculateGridLocation({ x: realX, y: realY })
    const { x, y } = gridLocation

    // @TODO What to do if on final space? ie. value of current value is 0?
    const currentValue = this.pathLengths.directionAt(x, y)
    if (currentValue === 0) {
      return this.endGoal
    }

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

    const smallestValue = Math.min(...directionValues)
    directions = directions.filter((direction) => {
      return direction.value === smallestValue
    })
    // const randomIndex = Math.floor(Math.random() * directions.length)
    // const randomIndex = 0
    const randomIndex = directions.length - 1

    // pick random direction out of smallest options (might be multiple)
    const finalDirection = directions[randomIndex]

    // console.log(this.convertToRealLocation(finalDirection.location));
    // console.log('---');
    return this.convertToRealLocation(finalDirection.location)
  }

  degreesToRadians(degrees) {
    return degrees * Math.PI / 180
  }

  calculateGridDimensions() {
    this.tilesWide = this.convertToGridValue(this.game.width)
    this.tilesHigh = this.convertToGridValue(this.game.height)
  }

  calculateGridLocation(location) {
    return {
      x: this.convertToGridValue(location.x),
      y: this.convertToGridValue(location.y),
    }
  }

  convertToRealLocation(gridLocation) {
    return {
      x: this.convertToRealValue(gridLocation.x),
      y: this.convertToRealValue(gridLocation.y),
    }
  }

  convertToGridValue(value) {
    return Math.floor(value / this.GRID_SIZE)
  }

  convertToRealValue(value) {
    return Math.floor(value * this.GRID_SIZE)
  }
}

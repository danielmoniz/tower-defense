
import WeightsGrid from './WeightsGrid'
import PathsGrid from './PathsGrid'

export default class Pathing {
  constructor(dimensions, grid_size, endGoal, helpers) {
    this.dimensions = dimensions
    this.helpers = helpers
    this.GRID_SIZE = grid_size
    this.calculateGridDimensions()

    this.actualEndGoal = endGoal
    this.endGoal = this.setEndGoal(endGoal)
    this.objectives = [endGoal]


    this.weights = new WeightsGrid(this.tilesWide, this.tilesHigh)
    this.pathLengths = new PathsGrid(this.tilesWide, this.tilesHigh)


    this.compute()
  }

  /*
   * Attempts to add an obstacle to the map. This involves updating both
   * the weights and pathLengths grids.
   * If the obstacle is not valid, will not update anything.
   * Returns true or false based on success.
   */
  addObstacle(location, width, height) {
    if (!this.isAreaFree(location, width, height)) {
      return false
    }

    // @TODO Bring this back! Otherwise, tower placement can be hacked.
    // if (this.obstacleOverlapsEntrance(location, width, height)) {
    //   return false
    // }

    const gridLocation = this.calculateGridLocation(location)
    const gridWidth = this.convertToGridValue(width)
    const gridHeight = this.convertToGridValue(height)

    const { allowed, newWeights, newPathLengths } = this.checkObstacleValidity(gridLocation, gridWidth, gridHeight)
    if (!allowed) { return false }

    this.weights.setValues(newWeights.copyValues())
    // console.log(this.weights);
    this.pathLengths.setValues(newPathLengths.copyValues())
    // console.log(this.pathLengths);

    return true
  }

  /*
   * Determines whether or not an obstacle would be blocking the pathfinding.
   * Returns an object of information about the obstacle placement.
   */
  checkObstacleValidity(gridLocation, gridWidth, gridHeight) {
    const testWeights = new WeightsGrid(this.tilesWide, this.tilesHigh)
    testWeights.values = this.weights.copyValues() // copy existing weights
    testWeights.addObstacle(gridLocation, gridWidth, gridHeight)
    const testPathLengths = new PathsGrid(this.tilesWide, this.tilesHigh)
    testPathLengths.calculate(testWeights, this.endGoal.x, this.endGoal.y)

    return {
      allowed: testPathLengths.isMapValid(),
      newWeights: testWeights,
      newPathLengths: testPathLengths,
    }
  }

  obstacleOverlapsEntrance(location, width, height) {
    const entranceZone = this.helpers.getEntranceZone()

    if (location.x < entranceZone.x + entranceZone.width && location.x + width > entranceZone.x
      && location.y < entranceZone.y + entranceZone.height && location.y + height > entranceZone.y) {
        console.log("Cannot place tower over the entrance!");
        return true
    }
    return false
  }

  isAreaFree(location, width, height) {
    const gridLocation = this.calculateGridLocation(location)
    const gridWidth = this.convertToGridValue(width)
    const gridHeight = this.convertToGridValue(height)

    return this.weights.isAreaFree(gridLocation, gridWidth, gridHeight)
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
    options.pathLengths.reset()
    options.pathLengths.calculate(options.weights, options.endX, options.endY)
    // console.log(this.pathLengths.values);
  }

  // @TODO Split into smaller functions!
  getDirection(realX, realY) {
    const gridLocation = this.calculateGridLocation({ x: realX, y: realY })
    const { x, y } = gridLocation

    // @TODO What to do if on final space? ie. value of current value is 0?
    const currentValue = this.pathLengths.directionAt(x, y)
    if (currentValue === 0) {
      return this.actualEndGoal
    }

    const north = this.pathLengths.directionAt(x, y - 1)
    const south = this.pathLengths.directionAt(x, y + 1)
    const east = this.pathLengths.directionAt(x + 1, y)
    const west = this.pathLengths.directionAt(x - 1, y)

    let directions = [
      { value: north, location: { x: x, y: y - 1 } },
      { value: south, location: { x: x, y: y + 1 } },
      { value: east, location: { x: x + 1, y: y } },
      { value: west, location: { x: x - 1, y: y } },
    ]

    const diagonals = this.getValidDiagonals(x, y, north, south, east, west)
    directions = directions.concat(diagonals)

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
      // console.log("No directions - sending left. Unit at:", gridLocation.x, gridLocation.y);
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
    return this.convertToRealLocation(finalDirection.location)
  }

  /*
   * Return an array of diagonal locations that are valid.
   * A valid diagonal requires that both primary directions are valid.
   */
  getValidDiagonals(x, y, northValue, southValue, eastValue, westValue) {
    const northEastValue = this.pathLengths.directionAt(x + 1, y - 1)
    const northWestValue = this.pathLengths.directionAt(x - 1, y - 1)
    const southEastValue = this.pathLengths.directionAt(x + 1, y + 1)
    const southWestValue = this.pathLengths.directionAt(x - 1, y + 1)

    const northEast = { value: northEastValue, location: { x: x + 1, y: y - 1 } }
    const northWest = { value: northWestValue, location: { x: x - 1, y: y - 1 } }
    const southEast = { value: southEastValue, location: { x: x + 1, y: y + 1 } }
    const southWest = { value: southWestValue, location: { x: x - 1, y: y + 1 } }

    const diagonals = []

    if (northValue > 0 && eastValue > 0) {
      diagonals.push(northEast)
    }
    if (northValue > 0 && westValue > 0) {
      diagonals.push(northWest)
    }
    if (southValue > 0 && eastValue > 0) {
      diagonals.push(southEast)
    }
    if (southValue > 0 && westValue > 0) {
      diagonals.push(southWest)
    }

    return diagonals
  }

  degreesToRadians(degrees) {
    return degrees * Math.PI / 180
  }

  calculateGridDimensions() {
    this.tilesWide = this.convertToGridValue(this.dimensions.width)
    this.tilesHigh = this.convertToGridValue(this.dimensions.height)
  }

  /*
   * Accepts a real location and converts it to a grid location.
   * Note that it will not allow for values too large, and will instead round
   * them down to the nearest tile.
   */
  calculateGridLocation(location) {
    let gridX = this.convertToGridValue(location.x)
    if (gridX >= this.tilesWide) { gridX = this.tilesWide - 1 }

    let gridY = this.convertToGridValue(location.y)
    if (gridY >= this.tilesHigh) { gridY = this.tilesHigh - 1 }

    return {
      x: gridX,
      y: gridY,
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

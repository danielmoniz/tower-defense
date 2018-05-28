
import WeightsGrid from './WeightsGrid'
import PathsGrid from './PathsGrid'

export default class Pathing {
  constructor(dimensions, grid_size, endGoal, helpers) {
    this.dimensions = dimensions
    this.helpers = helpers
    this.GRID_SIZE = grid_size
    this.calculateGridDimensions()

    this.endGoal = this.setEndGoal(endGoal)
    this.actualEndGoal = endGoal // the actual coordinates of the end goal
    if (endGoal === undefined) {
      this.actualEndGoal = this.convertToRealLocation(this.endGoal)
    }
    this.objectives = [endGoal]


    this.weights = new WeightsGrid(this.tilesWide, this.tilesHigh)
    this.pathLengths = new PathsGrid(this.tilesWide, this.tilesHigh)


    this.compute()
  }

  reset() {
    this.weights.reset()
    this.compute()
  }

  // @TERRAIN
  generateTerrain() {
    this.weights.terrain.generateTerrain()
    this.weights.compute()
    this.compute()
  }

  setTerrain(terrainData) {
    this.weights.terrain.setTerrain(terrainData)
    this.weights.compute()
    this.compute()
  }

  getTerrain() {
    return this.weights.terrain.values
  }

  getTerrainAt(x, y) {
    const location = { x: x, y: y}
    const gridLocation = this.calculateGridLocation(location)
    return this.weights.terrain.difficultyAt(gridLocation.x, gridLocation.y)
  }

  /*
   * Attempts to add an obstacle to the map. This involves updating both
   * the weights and pathLengths grids.
   * If the obstacle is not valid, will not update anything.
   * Returns true or false based on success.
   */
  addTowerObstacle(location, width, height) {
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

    const { allowed, newWeights, newPathLengths } = this.checkTowerObstacleValidity(gridLocation, gridWidth, gridHeight)
    if (!allowed) { return false }

    this.weights.setValues(newWeights.copyValues())
    // console.log(this.weights);
    this.pathLengths.setValues(newPathLengths.copyValues())
    // console.log(this.pathLengths);

    return true
  }

  removeObstacle(location, width, height) {
    const gridLocation = this.calculateGridLocation(location)
    const gridWidth = this.convertToGridValue(width)
    const gridHeight = this.convertToGridValue(height)

    this.weights.removeObstacle(gridLocation, gridWidth, gridHeight)
    this.compute()
  }

  /*
   * Determines whether or not an obstacle would be blocking the pathfinding.
   * Returns an object of information about the obstacle placement.
   */
  checkTowerObstacleValidity(gridLocation, gridWidth, gridHeight) {
    const testWeights = new WeightsGrid(this.tilesWide, this.tilesHigh)
    testWeights.setValues(this.weights.copyValues()) // copy existing weights
    testWeights.addTowerObstacle(gridLocation, gridWidth, gridHeight)
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

  getDirection(realX, realY) {
    const gridLocation = this.calculateGridLocation({ x: realX, y: realY })
    const { x, y } = gridLocation

    // if on final space, simply return that space in actual values
    const currentValue = this.pathLengths.directionAt(x, y)
    if (currentValue === 0) {
      return this.actualEndGoal
    }

    const directions = this.getDirections(x, y)
    const validDirections = this.getValidDirections(directions)

    // Return false if there is nowhere to go
      // ^^^ Shouldn't happen if we prevent towers from being placed anywhere!
      // however, terrain might still cause issues
    if (validDirections.length === 0) {
      const oneTileLeft = this.calculateGridLocation({ x: gridLocation.x - 1, y: gridLocation.y })
      return oneTileLeft
    }

    const finalDirection = this.getBestDirection(validDirections)
    return this.convertToRealLocation(finalDirection.location)
  }

  /*
   * Given a set of valid directions, will suggest a best direction.
   */
  getBestDirection(validDirections) {
    const smallestValue = validDirections.map((direction) => {
      return direction.value
    }).reduce((smallest, value) => {
      return value < smallest ? value : smallest
    })

    const bestDirections = validDirections.filter((direction) => {
      return direction.value === smallestValue
    })

    return bestDirections[bestDirections.length - 1]
  }

  getDirections(x, y) {
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
    return directions.concat(diagonals)
  }

  /*
   * Given an array of direction objects, returns an array of valid direction
   * objects.
   */
  getValidDirections(directions) {
    return directions.filter((direction) => {
      return direction.value >= 0
    })
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

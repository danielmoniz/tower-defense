import Grid from './Grid'

export default class TerrainGrid extends Grid {
  constructor(tilesWide, tilesHigh) {
    super(tilesWide, tilesHigh, 1)
    this.setTerrainProperties()
    this.reset()
  }

  setTerrainProperties() {
    this.terrainProperties = {
      normal: 1,
      crater: 5,
      ridge: 3,
      obstacle: 0,
    }
  }

  getTerrainProperties(type) {
    if (this.terrainProperties.hasOwnProperty(type)) {
      return {
        type: type,
        difficulty: this.terrainProperties[type],
      }
    return {
      type: "normal",
      difficulty: 1,
    }
    }
  }

  reset() {
    this.initialValue = this.getTerrainProperties("normal")
    super.reset()
    this.generateTerrain()
  }

  generateTerrain() {
    // TODO: Simple randomizer for terrain features
    this.addTestCrater({x:17,y:17}, 4)
    this.addTestCrater({x:30,y:30}, 4)
    this.addTestCrater({x:30,y:4}, 4)
  }

  addTestCrater(gridLocation, size) {
    // square crater
    for (let x = gridLocation.x - size; x <= gridLocation.x + size; x++) {
      for (let y = gridLocation.y - size; y <= gridLocation.y + size; y++) {
        if (this.coordinateIsValid(x, y)) {
          this.set(x, y, this.getTerrainProperties("crater"))
        }
      }
    }
  }

  randomize(wallProbability = 0.1) {
    for (let i = 0; i < this.tilesWide; i++) {
      for (let j = 0; j < this.tilesHigh; j++) {
        let random = Math.random()
        if (random < wallProbability) {
          this.set(i, j, this.getTerrainProperties("obstacle"))
        } else {
          this.set(i, j, this.getTerrainProperties("normal"))
        }
      }
    }
  }

  /*
   * Adds an obstacle onto the weights grid. Simply sets relevant values to 0.
   * Takes a position, a width, and a height.
   */
  addObstacle(gridLocation, gridWidth, gridHeight) {
    for (let x = gridLocation.x; x < gridLocation.x + gridWidth; x++) {
      for (let y = gridLocation.y; y < gridLocation.y + gridHeight; y++) {
        this.set(x, y, this.getTerrainProperties("obstacle"))
      }
    }
  }

  isAreaFree(gridLocation, gridWidth, gridHeight) {
    if ([gridLocation, gridWidth, gridHeight].indexOf(undefined) !== -1) {
      throw TypeError('Must supply real values to isAreaFree().')
    }
    for (let x = gridLocation.x; x < gridLocation.x + gridWidth; x++) {
      for (let y = gridLocation.y; y < gridLocation.y + gridHeight; y++) {
        if (this.difficultyAt(x, y) === 0) {
          return false
        }
      }
    }
    return true
  }

  /*
   * Adds invisible wall in the middle of the map. Enemies have to go above
   * or below it.
   */
  testTerrainWall() {
    const x = Math.floor(this.tilesWide / 2)
    const startY = Math.floor(this.tilesHigh * (1 / 4))
    const endY = Math.floor(this.tilesHigh * (3 / 4))

    for (let y = startY; y < endY; y++) {
      this.set(x, y, this.getTerrainProperties("obstacle"))
    }
  }

  typeAt(x, y) {
    return this.at(x, y).type
  }

  difficultyAt(x, y) {
    return this.at(x, y).difficulty
  }
}

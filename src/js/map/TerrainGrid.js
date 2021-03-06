import Grid from './Grid'

export default class TerrainGrid extends Grid {
  constructor(tilesWide, tilesHigh) {
    super(tilesWide, tilesHigh, 1)
    this.initialize()
  }

  initialize() {
    this.terrainProperties = {
      normal: {
        difficulty: 1,
      },
      crater: {
        difficulty: 3,
      },
      ridge: {
        difficulty: 2,
      },
      obstacle: {
        difficulty: 0,
      },
    }
    this.initialValue = this.getTerrainProperties("normal")
    this.reset()
  }

  reset() {
    super.reset()
    this.generated = false;
  }

  getTerrainProperties(type) {
    if (this.terrainProperties.hasOwnProperty(type)) {
      return {
        type: type,
        difficulty: this.terrainProperties[type].difficulty,
      }
    }
    return {
      type: "normal",
      difficulty: this.terrainProperties.normal.difficulty,
    }
  }

  generateTerrain() {
    if (this.generated) { return }
    // Minimum crater size 1, maximum 3
    const totalGridSpaces = this.tilesWide * this.tilesHigh
    const defaultTerrainCoverage = 0.2
    const targetTerrainCoverage = totalGridSpaces * defaultTerrainCoverage
    let terrainCoverage = 0

    do {
      terrainCoverage +=
          this.addCrater(this.getRandomGridLocation(),
                             Math.floor(3 * Math.random()) + 1)
    } while (terrainCoverage < targetTerrainCoverage)
    this.generated = true;
  }

  setTerrain(terrainData) {
    this.values = terrainData
  }

  addCrater(gridLocation, size) {
    // square crater
    let tilesChanged = 0
    for (let x = gridLocation.x - size; x <= gridLocation.x + size; x++) {
      for (let y = gridLocation.y - size; y <= gridLocation.y + size; y++) {
        if (!this.coordinateIsValid(x, y) || this.typeAt(x, y) != "normal") { continue }
        if (x == gridLocation.x - size || x == gridLocation.x + size ||
            y == gridLocation.y - size || y == gridLocation.y + size) {
          this.set(x, y, this.getTerrainProperties("ridge"))
        } else if (x == gridLocation.x && y == gridLocation.y) {
          this.set(x, y, this.getTerrainProperties("obstacle"))
        } else {
          this.set(x, y, this.getTerrainProperties("crater"))
        }
        tilesChanged++
      }
    }
    return tilesChanged
  }

  getRandomGridLocation() {
    return {
      x: Math.floor(this.tilesWide * Math.random()),
      y: Math.floor(this.tilesHigh * Math.random()),
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

  typeAt(x, y) {
    return this.at(x, y).type
  }

  difficultyAt(x, y) {
    return this.at(x, y).difficulty
  }
}

import Grid from './Grid'

export default class TowerGrid extends Grid {
  constructor(tilesWide, tilesHigh) {
    super(tilesWide, tilesHigh, 1)
  }

  /*
   * Adds an obstacle onto the weights grid. Simply sets relevant values to 0.
   * Takes a position, a width, and a height.
   */
  addObstacle(gridLocation, gridWidth, gridHeight) {
    for (let x = gridLocation.x; x < gridLocation.x + gridWidth; x++) {
      for (let y = gridLocation.y; y < gridLocation.y + gridHeight; y++) {
        this.set(x, y, 0)
      }
    }
  }

  isAreaFree(gridLocation, gridWidth, gridHeight) {
    if ([gridLocation, gridWidth, gridHeight].indexOf(undefined) !== -1) {
      throw TypeError('Must supply real values to isAreaFree().')
    }
    for (let x = gridLocation.x; x < gridLocation.x + gridWidth; x++) {
      for (let y = gridLocation.y; y < gridLocation.y + gridHeight; y++) {
        if (this.at(x, y) === 0) {
          return false
        }
      }
    }
    return true
  }
}


export default class Grid {
  constructor(tilesWide, tilesHigh, initialValue) {
    this.tilesWide = tilesWide
    this.tilesHigh = tilesHigh

    this.values = this.newMapArray(initialValue)
  }

  newMapArray(initialValue = 0) {
    let mapArray = new Array(this.tilesWide)
    for (let i = 0; i < mapArray.length; i++) {
      mapArray[i] = new Array(this.tilesHigh).fill(initialValue)
    }
    return mapArray
  }

  /*
   * Returns a falsy value if not a coordinate.
   * Returns the value at that location if valid.
   */
  at(x, y) {
    return this.coordinateIsValid(x, y) && this.values[x][y]
  }

  set(x, y, newValue) {
    if (!this.coordinateIsValid(x, y)) { return false }
    this.values[x][y] = newValue
  }

  coordinateIsValid(x, y) {
    if (x < 0 || x >= this.tilesWide || y < 0 || y >= this.tilesHigh) {
      return false
    }
    return true
  }

  calculateGridDimensions() {
    this.tilesWide = Math.floor( this.game.width / this.GRID_SIZE )
    this.tilesHigh = Math.floor( this.game.height / this.GRID_SIZE )
  }

  calculateGridLocation(location) {
    return { x: Math.floor( location.x / this.GRID_SIZE ), y: Math.floor( location.y / this.GRID_SIZE) }
  }
}

// export function newMapArray(tilesWide, tilesHigh, initialValue = 0) {
//   let mapArray = new Array(tilesWide)
//   for (let i = 0; i < mapArray.length; i++) {
//     mapArray[i] = new Array(tilesHigh).fill(initialValue)
//   }
//   return mapArray
// }

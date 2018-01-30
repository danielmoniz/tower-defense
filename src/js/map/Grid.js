
export default class Grid {
  constructor(tilesWide, tilesHigh, initialValue) {
    this.tilesWide = tilesWide
    this.tilesHigh = tilesHigh

    this.values = this.newMapArray(initialValue)
  }

  /*
   * Builds a new map (2D array) of initial values.
   */
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
   * WARNING: If the value at that location is zero, this is still falsy!
   */
  at(x, y) {
    return this.coordinateIsValid(x, y) && this.values[x][y]
  }

  /*
   * Sets the value at a location.
   */
  set(x, y, newValue) {
    if (!this.coordinateIsValid(x, y)) { return false }
    this.values[x][y] = newValue
  }

  /*
   * Completely replace the values in a grid.
   */
  setValues(newValues) {
    this.values = newValues
  }

  /*
   * Returns true if the coordinate is valid (ie. fits on the map.
   * Returns false otherwise.
   */
  coordinateIsValid(x, y) {
    if (x < 0 || x >= this.tilesWide || y < 0 || y >= this.tilesHigh) {
      return false
    }
    return true
  }

  /*
   * Returns a deep copy of every value in the grid.
   */
  copyValues() {
    return this.values.map((column) => {
      return column.slice()
    })
  }
}

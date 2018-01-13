
import Grid from './Grid'

export default class PathsGrid extends Grid {
  constructor(tilesWide, tilesHigh) {
    // this.grid = new Grid(tilesWide, tilesHigh)
    super(tilesWide, tilesHigh)
    this.reset()
  }

  reset() {
    this.values = this.newMapArray(null)
  }

}

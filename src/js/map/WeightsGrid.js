
import Grid from './Grid'

export default class WeightsGrid extends Grid {
  constructor(tilesWide, tilesHigh) {
    // this.grid = new Grid(tilesWide, tilesHigh)
    super(tilesWide, tilesHigh, 1)
  }

  randomize(wallProbability = 0.1) {
    for (let i = 0; i < this.tilesWide; i++) {
      for (let j = 0; j < this.tilesHigh; j++) {
        let random = Math.random()
        if (random < wallProbability) {
          this.set(i, j, 0)
        } else {
          this.set(i, j, 1)
        }
      }
    }
  }

  testTerrainWall() {
    const x = Math.floor(this.tilesWide / 2)
    const endY = Math.floor(this.tilesHigh * (3 / 4))

    for (let y = 0; y < endY; y++) {
      this.set(x, y, 0)
    }
  }
}

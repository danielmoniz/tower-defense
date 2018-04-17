import Grid from './Grid'
import TerrainGrid from './TerrainGrid'
import TowerGrid from './TowerGrid'

export default class WeightsGrid extends Grid {
  constructor(tilesWide, tilesHigh) {
    super(tilesWide, tilesHigh, 1)
    this.terrain = new TerrainGrid(tilesWide, tilesHigh)
    this.tower = new TowerGrid(tilesWide, tilesHigh)
    this.initialize()
  }

  initialize() {
    this.recalculate({x: 0, y: 0}, this.tilesWide, this.tilesHigh)
  }

  reset() {
    super.reset()
    this.terrain.reset()
    this.tower.reset()
    this.initialize()
  }

  addTerrainObstacle(gridLocation, gridWidth, gridHeight) {
    this.terrain.addObstacle(gridLocation, gridWidth, gridHeight)
    this.recalculate(gridLocation, gridWidth, gridHeight)
  }

  addTowerObstacle(gridLocation, gridWidth, gridHeight) {
    this.tower.addObstacle(gridLocation, gridWidth, gridHeight)
    this.recalculate(gridLocation, gridWidth, gridHeight)
  }

  recalculate(gridLocation, gridWidth, gridHeight) {
    for (let x = gridLocation.x; x < gridLocation.x + gridWidth; x++) {
      for (let y = gridLocation.y; y < gridLocation.y + gridHeight; y++) {
        this.set(x, y, this.tower.at(x, y) && this.terrain.difficultyAt(x, y))
      }
    }
  }

  isAreaFree(gridLocation, gridWidth, gridHeight) {
    return this.terrain.isAreaFree(gridLocation, gridWidth, gridHeight) &&
           this.tower.isAreaFree(gridLocation, gridWidth, gridHeight)
  }

  copyValues() {
    return {
      values: super.copyValues(),
      terrainValues: this.terrain.copyValues(),
      towerValues: this.tower.copyValues(),
    }
  }

  setValues(newValues) {
    this.values = newValues.values
    this.terrain.values = newValues.terrainValues
    this.tower.values = newValues.towerValues
  }
}

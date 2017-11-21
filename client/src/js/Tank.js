
import { GRID_SIZE } from 'appConstants'
import Unit from 'Unit'

export default class Tank extends Unit {
  constructor(game, options) {
    super(game, options)
    this.name = 'Tank'
    this.width = GRID_SIZE * 2
    this.height = this.width
    this.speed = 20
    this.maxHitPoints = 50
    this.currentHitPoints = this.maxHitPoints
  }
}
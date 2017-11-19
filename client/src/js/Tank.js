
import { GRID_SIZE } from 'appConstants'
import Unit from 'Unit'

export default class Tank extends Unit {
  constructor(options) {
    super(options)
    this.name = 'Tank'
    this.width = GRID_SIZE * 2
    this.height = this.width
  }
}

import { GRID_SIZE } from 'appConstants'
import Unit from 'Unit'

export default class Cannon extends Unit {
  constructor(options) {
    super(options)
    this.name = 'Cannon'
    this.width = GRID_SIZE * 3
    this.height = this.width
  }
}

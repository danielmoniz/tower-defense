
import { GRID_SIZE } from 'appConstants'
import Unit from 'Unit'

export default class Tank extends Unit {
  constructor(options) {
    super(options)
    this.name = 'Tank'
    this.size = GRID_SIZE * 2
    this.width = this.size // Should be using these instead of this.size!
    this.height = this.size // Should be using these instead of this.size!
  }
}
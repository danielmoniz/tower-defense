
import { GRID_SIZE } from 'appConstants'
import Unit from 'Unit'

export default class Cannon extends Unit {
  constructor(options) {
    super(options)
    this.name = 'Cannon'
    this.size = GRID_SIZE * 3
    this.width = this.size // Should be using these instead of this.size!
    this.height = this.size // Should be using these instead of this.size!
  }
}

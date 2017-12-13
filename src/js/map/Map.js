import { GRID_SIZE } from '../appConstants'

export default class Map {
  constructor(game) {
    this.game = game

    this.calculateGridDimensions()
    this.setupMapArray()

    console.log(this.weights);
  }

  calculateGridDimensions() {
    this.tilesWide = Math.floor( this.game.width / GRID_SIZE )
    this.tilesHigh = Math.floor( this.game.height / GRID_SIZE )
  }

  setupMapArray() {
    if (this.hasOwnProperty('weights')) {
      return
    }

    this.weights = new Array(this.tilesWide)
    for (let i = 0; i < this.weights.length; i++) {
      this.weights[i] = new Array(this.tilesHigh).fill(1)
    }
  }
}

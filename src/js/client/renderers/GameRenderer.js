
import { autorun } from 'mobx'

import { GRID_SIZE } from '../../appConstants'
import BoardRenderer from './BoardRenderer'
import GameEvents from './GameEvents'

export default class GameRenderer {
  constructor(game) {
    this.game = game

    this.board = new BoardRenderer()
    this.events = new GameEvents()

    this.createGameBoard()

    this.setUpEvents() // relies on game board being set up
  }

  createGameBoard() {
    this.board.setupGameBox(this.game)
  }

  setUpEvents() {
    this.events.addEventHandlers(this.game, this.board.gameBox)
  }

}

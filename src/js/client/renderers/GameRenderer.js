
import { autorun } from 'mobx'

import { GRID_SIZE } from '../../appConstants'
import BoardRenderer from './BoardRenderer'
import GameEvents from './GameEvents'

export default class GameRenderer {
  constructor(game) {
    this.board = new BoardRenderer()
    this.events = new GameEvents()

    this.createGameBoard(game)

    this.setUpEvents(game, this.board) // relies on game board being set up
  }

  createGameBoard(game) {
    this.board.setupGameBox(game)
  }

  setUpEvents(game, board) {
    this.events.addEventHandlers(game, board.gameBox)
  }

  destroyGame() {
    // destroy board
    // destroy events
    // destroy units
  }

}

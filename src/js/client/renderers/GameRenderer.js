
import { autorun } from 'mobx'

import BoardRenderer from './BoardRenderer'
import GameEvents from './GameEvents'
import UnitRenderer from './UnitRenderer'

export default class GameRenderer {
  constructor(game) {
    this.board = new BoardRenderer()
    this.events = new GameEvents()
    this.unitRenderer = new UnitRenderer(this.board)

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

  renderUnit(unit) {
    this.unitRenderer.addUnit(unit)
  }

}

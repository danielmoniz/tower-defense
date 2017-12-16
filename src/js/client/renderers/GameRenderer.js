
import { autorun } from 'mobx'

import BoardRenderer from './BoardRenderer'
import GameEvents from './GameEvents'
import PixiUnitRenderer from './PixiUnitRenderer'
import UnitRenderer from './UnitRenderer'
import EnemyRenderer from './EnemyRenderer'
import TowerRenderer from './TowerRenderer'

export default class GameRenderer {
  constructor(game) {
    this.board = new BoardRenderer()
    this.events = new GameEvents()
    this.unitRenderer = new UnitRenderer(this.board)
    this.enemyRenderer = new EnemyRenderer(this.board)
    this.towerRenderer = new TowerRenderer(this.board)

    // EXPERIMENTAL
    this.pixiUnitRenderer = new PixiUnitRenderer(this.board)


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

  renderEntity(entity) {
    this.unitRenderer.render(entity)
    this.pixiUnitRenderer.render(entity)
  }

  renderEnemy(enemy) {
    this.enemyRenderer.render(enemy)
    this.pixiUnitRenderer.render(enemy)
  }

  renderTower(tower) {
    this.towerRenderer.render(tower)
    this.pixiUnitRenderer.render(tower)
  }

}

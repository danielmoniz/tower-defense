
import { autorun } from 'mobx'

import BoardRenderer from './BoardRenderer'
import GameEvents from './GameEvents'
import UnitRenderer from './UnitRenderer'
import PixiUnitRenderer from './PixiUnitRenderer'
import EnemyRenderer from './EnemyRenderer'
import PixiEnemyRenderer from './PixiEnemyRenderer'
import TowerRenderer from './TowerRenderer'
import PixiTowerRenderer from './PixiTowerRenderer'

export default class GameRenderer {
  constructor(game) {
    // @TODO Game should have an object of actions - shouldn't be done here!
    const actions = {
      selectEntity: game.selectEntity.bind(game),
    }

    this.board = new BoardRenderer()
    this.events = new GameEvents()
    this.unitRenderer = new UnitRenderer(this.board)
    this.enemyRenderer = new EnemyRenderer(this.board)
    this.towerRenderer = new TowerRenderer(this.board)

    // EXPERIMENTAL
    this.pixiUnitRenderer = new PixiUnitRenderer(this.board, actions)
    this.pixiTowerRenderer = new PixiTowerRenderer(this.board, actions)
    this.pixiEnemyRenderer = new PixiEnemyRenderer(this.board, actions)


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
    // this.pixiUnitRenderer.render(enemy)
    this.pixiEnemyRenderer.render(enemy)
  }

  renderTower(tower) {
    this.towerRenderer.render(tower)
    // this.pixiUnitRenderer.render(tower)
    this.pixiTowerRenderer.render(tower)
  }

}

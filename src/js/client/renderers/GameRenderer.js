
import { autorun } from 'mobx'

import BoardRenderer from './BoardRenderer'
import GameEvents from './GameEvents'
import UnitRenderer from './UnitRenderer'
import PixiUnitRenderer from './PixiUnitRenderer'
import EnemyRenderer from './EnemyRenderer'
import PixiEnemyRenderer from './PixiEnemyRenderer'
import TowerRenderer from './TowerRenderer'
import PixiTowerRenderer from './PixiTowerRenderer'
import { CannonRenderer, PixiCannonRenderer, FlamethrowerRenderer, PixiFlamethrowerRenderer } from './towers'


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
    this.cannonRenderer = new CannonRenderer(this.board)
    this.flamethrowerRenderer = new FlamethrowerRenderer(this.board, actions)

    // EXPERIMENTAL - PIXI SPECIFIC
    this.pixiUnitRenderer = new PixiUnitRenderer(this.board, actions)
    this.pixiTowerRenderer = new PixiTowerRenderer(this.board, actions)
    this.pixiEnemyRenderer = new PixiEnemyRenderer(this.board, actions)
    this.pixiCannonRenderer = new PixiCannonRenderer(this.board, actions)
    this.pixiFlamethrowerRenderer = new PixiFlamethrowerRenderer(this.board, actions)

    this.towerRenderers = {
      Tower: this.towerRenderer, // default?
      Cannon: this.cannonRenderer,
      Flamethrower: this.flamethrowerRenderer
    }

    this.pixiTowerRenderers = {
      Tower: this.pixiTowerRenderer, // default?
      Cannon: this.pixiCannonRenderer,
      Flamethrower: this.pixiFlamethrowerRenderer
    }


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
    this.pixiEnemyRenderer.render(enemy)
  }

  renderTower(tower) {
    const renderer = this.towerRenderers[tower.type]
    renderer.render(tower)
    const pixiRenderer = this.pixiTowerRenderers[tower.type]
    pixiRenderer.render(tower)
  }

}

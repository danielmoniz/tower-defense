
import { autorun } from 'mobx'

import BoardRenderer from './BoardRenderer'
import GameEvents from './GameEvents'
import PixiUnitRenderer from './PixiUnitRenderer'
import PixiEnemyRenderer from './PixiEnemyRenderer'
import PixiTowerRenderer from './towers/PixiTowerRenderer'
import { PixiCannonRenderer, PixiFlamethrowerRenderer } from './towers'


export default class GameRenderer {
  constructor(game) {
    // @TODO Game should have an object of actions - shouldn't be done here!
    const actions = {
      selectEntity: game.selectEntity.bind(game),
    }

    this.board = new BoardRenderer()
    this.events = new GameEvents()

    // @TODO This system is clearly horrendous. Find a way to do this dynamically.
    this.pixiUnitRenderer = new PixiUnitRenderer(this.board, actions, this.registerEmitter.bind(this))
    this.pixiTowerRenderer = new PixiTowerRenderer(this.board, actions, this.registerEmitter.bind(this))
    this.pixiEnemyRenderer = new PixiEnemyRenderer(this.board, actions, this.registerEmitter.bind(this))
    this.pixiCannonRenderer = new PixiCannonRenderer(this.board, actions, this.registerEmitter.bind(this))
    this.pixiFlamethrowerRenderer = new PixiFlamethrowerRenderer(this.board, actions, this.registerEmitter.bind(this))

    this.towerRenderers = {
      Tower: this.pixiTowerRenderer, // default?
      Cannon: this.pixiCannonRenderer,
      Flamethrower: this.pixiFlamethrowerRenderer
    }

    this.emitterCallbacks = []

    this.createGameBoard(game)

    this.setUpEvents(game, this.board) // relies on game board being set up
  }

  createGameBoard(game) {
    this.board.setupGameBox(game)
  }

  tick() {
    this.emitterCallbacks.forEach((emitter) => {
      emitter()
    })
  }

  registerEmitter(emitterCallback) {
    this.emitterCallbacks.push(emitterCallback)
  }

  setUpEvents(game, board) {
    this.events.addEventHandlers(game, board.app.view)
  }

  destroyGame() {
    // destroy board
    // destroy events
    // destroy units
  }

  getValidTower(towerType) {
    if (!(towerType in this.towerRenderers)) {
      towerType = 'Cannon' // default tower for rendering purposes
    }
    return towerType
  }

  renderEntity(entity) {
    this.pixiUnitRenderer.render(entity)
  }

  renderEnemy(enemy) {
    this.pixiEnemyRenderer.render(enemy)
  }

  renderTower(tower) {
    const towerType = this.getValidTower(tower.type)
    const pixiRenderer = this.towerRenderers[towerType]
    pixiRenderer.render(tower)
  }

}

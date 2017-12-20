
import { autorun } from 'mobx'

import BoardRenderer from './BoardRenderer'
import GameEvents from './GameEvents'
import UnitRenderer from './UnitRenderer'
import EnemyRenderer from './enemies/EnemyRenderer'
import TowerRenderer from './towers/TowerRenderer'
import { CannonRenderer, FlamethrowerRenderer } from './towers'


export default class GameRenderer {
  constructor(game) {
    // @TODO Game should have an object of actions - shouldn't be done here!
    const actions = {
      selectEntity: game.selectEntity.bind(game),
    }

    this.board = new BoardRenderer()
    this.events = new GameEvents()

    // @TODO This system is clearly horrendous. Find a way to do this dynamically.
    this.unitRenderer = new UnitRenderer(this.board, actions, this.registerEmitter.bind(this))
    this.towerRenderer = new TowerRenderer(this.board, actions, this.registerEmitter.bind(this))
    this.enemyRenderer = new EnemyRenderer(this.board, actions, this.registerEmitter.bind(this))
    this.cannonRenderer = new CannonRenderer(this.board, actions, this.registerEmitter.bind(this))
    this.flamethrowerRenderer = new FlamethrowerRenderer(this.board, actions, this.registerEmitter.bind(this))

    this.towerRenderers = {
      Tower: this.towerRenderer, // default?
      Cannon: this.cannonRenderer,
      Flamethrower: this.flamethrowerRenderer
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
    this.unitRenderer.render(entity)
  }

  renderEnemy(enemy) {
    this.enemyRenderer.render(enemy)
  }

  renderTower(tower) {
    const towerType = this.getValidTower(tower.type)
    const pixiRenderer = this.towerRenderers[towerType]
    pixiRenderer.render(tower)
  }

}

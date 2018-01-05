
import { autorun } from 'mobx'

import BoardRenderer from './BoardRenderer'
import GameEvents from './GameEvents'
import UnitRenderer from './UnitRenderer'
import EnemyRenderer from './enemies/EnemyRenderer'
import TowerRenderer from './towers/TowerRenderer'
import { CannonRenderer, FlamethrowerRenderer } from './towers'


export default class GameRenderer {
  constructor(game, gameHelpers) {
    // @TODO Game should have an object of actions - shouldn't be done here!
    const actions = {
      selectEntity: game.selectEntity.bind(game),
    }

    this.gameHelpers = gameHelpers
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
    this.renderStack = []

    this.createGameBoard(game)

    this.setUpEvents(game, this.board) // relies on game board being set up
  }

  createGameBoard(game) {
    this.board.setupGameBox(game)
  }

  queueRender(entity) {
    if (!entity) { return false }
    this.renderStack.push(entity)
  }

  queueRenderList(entities) {
    entities.forEach((entity) => {
      this.renderStack.push(entity)
    })
  }

  assetsLoaded() {
    return this.board.assetsReady
  }

  tick() {
    window.requestAnimationFrame(() => {
      if (!this.assetsLoaded()) {
        return this.tick();
      }

      for (let i = this.renderStack.length - 1; i >= 0; i--) {
        const entity = this.renderStack[i]
        if (entity.render === undefined) {
          this.renderEntity(entity)
        }
        if (entity.removeMe) {
          entity.derender()
          this.renderStack.splice(i, 1)
          continue
        }
        entity.render()
      }

      this.emitterCallbacks.forEach((emitter) => {
        emitter()
      })

      this.tick()
    })
  }

  registerEmitter(emitterCallback) {
    this.emitterCallbacks.push(emitterCallback)
  }

  setUpEvents(game, board) {
    this.events.addEventHandlers(game, board.app.view)
  }

  destroyGame() {
    // @TODO destroy board
    // @TODO destroy events
    // @TODO destroy towers
    this.destroyEnemies()
  }

  destroyEnemies() {
    const units = this.gameHelpers.getEnemies()
    units.forEach((unit) => {
      this.destroyEntity(unit)
    })
  }

  getValidTower(towerType) {
    if (!(towerType in this.towerRenderers)) {
      towerType = 'Cannon' // default tower for rendering purposes
    }
    return towerType
  }

  renderEntity(entity) {
    if (entity.type === 'Tower') {
      return this.renderTower(entity)
    } else if (entity.type === 'Enemy') {
      return this.renderEnemy(entity)
    }
    return this.unitRenderer.render(entity)
  }

  renderEnemy(enemy) {
    this.enemyRenderer.render(enemy)
  }

  renderTower(tower) {
    const towerType = this.getValidTower(tower.name)
    const pixiRenderer = this.towerRenderers[towerType]
    pixiRenderer.render(tower)
  }

  destroyEntity(entity) {
    entity.destroy()
    entity.render()
  }

}

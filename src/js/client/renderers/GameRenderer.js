
import { autorun } from 'mobx'

import BoardRenderer from './BoardRenderer'
import GameEvents from './GameEvents'
import UnitRenderer from './UnitRenderer'
import EnemyRenderer from './enemies/EnemyRenderer'
import TowerRenderer from './towers/TowerRenderer'
import { CannonRenderer, FlamethrowerRenderer, MachineGunRenderer, PlasmaBatteryRenderer } from './towers'
import getAltId from '../../utility/altId'


export default class GameRenderer {
  constructor(game, gameHelpers) {
    // @TODO Game should have an object of actions - shouldn't be done here!
    const actions = {
      selectEntity: game.selectEntity.bind(game),
      setSelectedTowerTarget: game.setSelectedTowerTarget.bind(game),
    }

    this.gameHelpers = gameHelpers
    this.board = new BoardRenderer()
    this.events = new GameEvents()

    const registerEmitter = {
      persistent: this.registerEmitter.bind(this),
      oneTime: this.registerOneTimeEmitter.bind(this),
    }
    // @TODO This system is clearly horrendous. Find a way to do this dynamically.
    this.unitRenderer = new UnitRenderer(this.board, actions, registerEmitter)
    this.towerRenderer = new TowerRenderer(this.board, actions, registerEmitter)
    this.enemyRenderer = new EnemyRenderer(this.board, actions, registerEmitter)
    this.cannonRenderer = new CannonRenderer(this.board, actions, registerEmitter)
    this.flamethrowerRenderer = new FlamethrowerRenderer(this.board, actions, registerEmitter)
    this.machineGunRenderer = new MachineGunRenderer(this.board, actions, registerEmitter)
    this.plasmaBatteryRenderer = new PlasmaBatteryRenderer(this.board, actions, registerEmitter)

    this.towerRenderers = {
      Tower: this.towerRenderer, // default?
      Cannon: this.cannonRenderer,
      Flamethrower: this.flamethrowerRenderer,
      MachineGun: this.machineGunRenderer,
      PlasmaBattery: this.plasmaBatteryRenderer,
    }

    this.emitterCallbacks = []
    this.oneTimeEmitterCallbacks = {}
    this.renderStack = []

    this.createGameBoard(game)

    this.setUpEvents(game, this.board) // relies on game board being set up
  }

  createGameBoard(game) {
    this.board.setupGameBox(game)
  }

  startGame() {
    this.board.startGame()
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

  tick(lastTime = 0) {
    window.requestAnimationFrame((time) => {
      if (!this.assetsLoaded()) { // only start rendering once assets are loaded
        return this.tick();
      }

      if (this.render) {
        this.renderEntities(this.renderStack)
        this.emit(this.emitterCallbacks)
        this.emitOnce(this.oneTimeEmitterCallbacks, time - lastTime)
      }

      this.tick(time)
    })
  }

  pause() {
    this.render = false
  }

  play() {
    this.render = true
  }

  /*
   * Given an array of entities, renders them last to first.
   * Removes and derenders any entities if required.
   * Initializes their render methods if not yet initialized.
   */
  renderEntities(entities) {
    for (let i = entities.length - 1; i >= 0; i--) {
      const entity = entities[i]
      if (entity.render === undefined) {
        this.renderEntity(entity)
      }
      if (entity.removeMe) {
        entity.derender()
        entities.splice(i, 1)
        continue
      }
      entity.render()
    }
  }

  /*
   * Iterates over a list of emitter callbacks and calls them.
   * NOTE: There may be the odd emitter that should be removed, eg. a
   * Flamethrower that has been sold. But the array of callbacks will currently
   * not grow too large.
   */
  emit(emitterCallbacks) {
    emitterCallbacks.forEach((emitter) => {
      emitter()
    })
  }

  /*
   * Iterates over an object of emitters intended to be removed after one play.
   * Destroy them and delete them from the object once finished.
   * Handling emitter updating manually allows for graphics to be properly
   * paused when pausing the game. Otherwise they will play through as long as
   * the renderer is ticking.
   * timeElapsed is in milliseconds.
   */
  emitOnce(emitterInfo, timeElapsed = 5) {
    for (let key in emitterInfo) {
      const emitter = emitterInfo[key]
      if (!emitter.__playing) {
        emitter.playOnce(() => { // use playOnce to get the callback feature
          emitter.destroy()
          delete emitterInfo[key]
        })
        emitter.autoUpdate = false // ensure we can update it manually
      } else {
        emitter.update(timeElapsed / 1000) // convert to seconds
      }
      emitter.__playing = true
    }
  }

  registerEmitter(emitterCallback) {
    this.emitterCallbacks.push(emitterCallback)
  }

  registerOneTimeEmitter(emitter, updateFrequency) {
    const key = getAltId()
    this.oneTimeEmitterCallbacks[getAltId()] = emitter
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

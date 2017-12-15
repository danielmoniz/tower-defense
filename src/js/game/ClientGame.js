
import { observable, computed, action, autorun } from 'mobx'

import Game from './Game'
import GameRenderer from '../client/renderers/GameRenderer'
import Unit from '../units/Unit'
import Cannon from '../units/Cannon'

class ClientGame extends Game {

  constructor(emitter, actions) {
    super(emitter, actions)
    this.setupUI()
  }

  setupUI() {
    // @TODO This block should move to somewhere UI-specific
    // this.app = new this.renderingEngine.Application({
    //   width: this.width,
    //   height: this.height,
    //   antialias: true,
    //   transparent: false,
    //   resolution: 1,
    // })
    // console.log(this.app);
    // document.body.appendChild(this.app.view)
    // this.app.renderer.backgroundColor = 0xFFFFFF
    // this.app.renderer.view.style.border = '2px solid black'

    this.renderer = new GameRenderer(this)
  }

  render(entities) {
    entities.forEach((entity) => this.renderer.renderEntity(entity))
  }

  spawnWave() {
    const newEnemies = super.spawnWave()
    this.render(newEnemies)
    return newEnemies
  }

  /*
   * Selects a new (disabled/inactive) cannon to be placed on the map.
   */
  selectNewCannon() {
    if (!this.inProgress) { return }
    this.placingTower = new Cannon(this)
    this.renderer.renderEntity(this.placingTower)
    return this.placingTower
  }

  sendPause() {
    this.pause()
  }

  sendPlay() {
    this.play()
  }

  sendPlaceTower(tower) {
    return this.placeTower(tower)
  }

  /*
   * Place a tower as normal, but render it as well.
   */
  placeTower(tower) {
    tower = super.placeTower(tower)
    if (!tower) { return }
    this.renderer.renderEntity(tower)
    return tower
  }

  spawnWaveEarly() {}
}

export default ClientGame

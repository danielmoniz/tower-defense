
import { observable, computed, action, autorun } from 'mobx'

import Game from './Game'
import GameRenderer from '../client/GameRenderer'

class ClientGame extends Game {

  constructor(emitter, actions) {
    super(emitter, actions)
    this.setupUI()
  }

  setupUI() {
    this.renderer = new GameRenderer(this)
  }

  spawnWave() {
    const newEnemies = super.spawnWave()
    this.render(newEnemies)
    return newEnemies
  }

  sendPause() {
    this.pause()
  }

  sendPlay() {
    this.play()
  }

  sendPlaceTower() {
    return this.placeTower()
  }

  spawnWaveEarly() {}
}

export default ClientGame


import { observable, computed, action, autorun } from 'mobx'

import { GAME_REFRESH_RATE, GRID_SIZE } from '../appConstants'

import ClientGame from './ClientGame'
import WaveSpawnerLocal from '../WaveSpawnerLocal'

class SoloGame extends ClientGame {

  constructor(emitter, actions) {
    super(emitter, actions)
  }

  start() {
    // Duplicated from Game.js @TODO set this up properly
    if (this.inProgress) { return }
    this.inProgress = true
    this.reset()
    this.play()
    this.wave.initializeWaveTimer(GAME_REFRESH_RATE)
    //

    this.pathHelper.generateTerrain()
    this.renderer.tick()
    this.renderer.board.renderTerrain(this)
    this.renderer.board.startGame(this)
  }

  setUpWaveSpawner() {
    this.wave = new WaveSpawnerLocal(this.createEnemy.bind(this))
  }

  spawnWaveEarly() {
    if (!this.inProgress) { return }
    this.spawnWave()
  }

  spawnWave() {
    const newEnemies = super.spawnWave()
    this.renderer.queueRenderList(newEnemies)
    return newEnemies
  }
}

export default SoloGame

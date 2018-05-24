
import { observable, computed, action, autorun } from 'mobx'

import { GAME_REFRESH_RATE, GRID_SIZE } from '../appConstants'

import ClientGame from './ClientGame'
import WaveSpawnerLocal from '../WaveSpawnerLocal'

class SoloGame extends ClientGame {

  constructor(emitter, actions) {
    super(emitter, actions)
  }

  start() {
    super.start()
    this.pathHelper.generateTerrain()
    this.renderer.board.renderTerrain(this)
  }

  reset() {
    super.reset()
    this.pathHelper.reset()
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

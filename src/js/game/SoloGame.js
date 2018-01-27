
import { observable, computed, action, autorun } from 'mobx'

import ClientGame from './ClientGame'
import WaveSpawnerLocal from '../WaveSpawnerLocal'

class SoloGame extends ClientGame {

  constructor(emitter, actions) {
    super(emitter, actions)
  }

  setUpWaveSpawner() {
    this.wave = new WaveSpawnerLocal(this.createEnemy.bind(this), this.ENEMY_TYPES)
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


import { observable, computed, action, autorun } from 'mobx'

import ClientGame from './ClientGame'
import WaveSpawnerLocal from '../WaveSpawnerLocal'

class SoloGame extends ClientGame {

  constructor(emitter, actions) {
    super(emitter, actions)
    this.wave = new WaveSpawnerLocal(this.createEnemy.bind(this))
  }

  spawnWaveEarly() {
    if (!this.inProgress) { return }
    this.spawnWave()
  }
}

export default SoloGame


import { observable, computed, action, autorun } from 'mobx'

import ClientGame from './ClientGame'

class SoloGame extends ClientGame {

  spawnWaveEarly() {
    if (!this.inProgress) { return }
    this.spawnWave()
  }
}

export default SoloGame

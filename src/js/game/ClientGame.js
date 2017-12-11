
import { observable, computed, action, autorun } from 'mobx'

import Game from './Game'

class ClientGame extends Game {

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

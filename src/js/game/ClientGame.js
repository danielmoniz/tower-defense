
import { observable, computed, action, autorun } from 'mobx'

import Game from './Game'

class ClientGame extends Game {

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

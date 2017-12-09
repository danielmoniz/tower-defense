
import { observable, computed, action, autorun } from 'mobx'

import ClientGame from './ClientGame'

class ClientMultiGame extends ClientGame {

  sendPause() {
    super.sendPause()
    if (!this.inProgress) { return }
    this.emitter.pause()
  }

  sendPlay() {
    super.sendPlay()
    if (!this.inProgress) { return }
    this.emitter.play()
  }

  sendPlaceTower() {
    const placedTower = super.sendPlaceTower()
    if (!placedTower) { return }
    this.emitter.placeTower(placedTower)
  }

  newGame() {
    this.emitter.addNewGame()
  }

  spawnWave(newEnemies) {
    super.spawnWave()
    this.addEnemies(newEnemies)
  }

  spawnWaveEarly() {
    if (!this.inProgress) { return }
    this.emitter.spawnWaveEarly()
  }
}

export default ClientMultiGame

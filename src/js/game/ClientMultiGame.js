
import { observable, computed, action, autorun } from 'mobx'

import ClientGame from './ClientGame'
import Performance from '../Performance'
import Cooldown from '../Cooldown'
import { GAME_REFRESH_RATE } from '../appConstants'

class ClientMultiGame extends ClientGame {

  constructor(emitter, actions) {
    super(emitter, actions)

    // for calculating performance
    this.performance = new Performance(200, GAME_REFRESH_RATE)

    // for sending performance data to the server
    this.performanceCooldown = Cooldown.createTimeBased(1000, GAME_REFRESH_RATE, {
      callback: this.sendPerformance.bind(this),
      autoActivate: true,
    })
  }

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

  /*
   * Simply update the timer rather than spawn units. Assumes units are
   * coming from elsewhere.
   */
  updateWave() {
    this.wave.updateWaveTimer()
  }

  acceptSpawnedWave(newEnemies) {
    this.wave.nextWave()
    this.addEnemies(newEnemies)
  }

  spawnWaveEarly() {
    if (!this.inProgress) { return }
    this.emitter.spawnWaveEarly()
  }

  sendPerformance() {
    this.emitter.sendPerformance(this.performance.getAverage())
  }

  // CALCULATE SERVER SPEED - can use to slow down game to keep it better synced
  checkPerformance() {
    this.performance.next()
    this.performanceCooldown.tick()
  }

  gameLogic() {
    super.gameLogic()
    this.checkPerformance()
  }

}

export default ClientMultiGame

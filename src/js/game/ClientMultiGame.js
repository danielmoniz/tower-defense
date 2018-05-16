
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
    this.setUpSendPerformance()
  }

  sendPause() {
    super.sendPause()
    if (!this.inProgress) { return }
    this.emitter.pause()
  }

  pause() {
    super.pause()
    this.pausePerformance()
  }

  sendPlay() {
    super.sendPlay()
    if (!this.inProgress) { return }
    this.emitter.play()
  }

  play() {
    super.play()
    this.resumePerformance()
  }

  sendPlaceTower() {
    const placedTower = this.placeTower()
    if (!placedTower) { return }
    this.emitter.placeTower(placedTower)
  }

  sendSellTower(tower) {
    super.sendSellTower(tower)
    this.emitter.sellTower(tower)
  }

  sendSellSelectedTower() {
    const tower = this.selectedEntity
    if (tower.type !== 'Tower') {
      return
    }
    this.sendSellTower(tower)
  }

  sendUpgradeSelectedTower(upgradeType) {
    const tower = super.sendUpgradeSelectedTower(upgradeType)
    this.emitter.upgradeTower(tower, upgradeType)
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
    this.updateEnemies(newEnemies)
  }

  spawnWaveEarly() {
    if (!this.inProgress) { return }
    this.emitter.spawnWaveEarly()
  }

  sendPerformance() {
    this.emitter.sendPerformance(this.performance.getSpeedSuggestion())
  }

  gameLogic() {
    super.gameLogic()
    this.checkPerformance()
  }

}

export default ClientMultiGame

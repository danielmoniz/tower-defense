
import { observable, computed, action, autorun } from 'mobx'

import Game from './Game'
import WaveSpawnerLocal from '../WaveSpawnerLocal'
import Performance from '../Performance'
import Cooldown from '../Cooldown'
import { GAME_REFRESH_RATE } from '../appConstants'

class ServerGame extends Game {

  constructor(emitter, endGameCallback, serverInfo) {
    super(emitter, endGameCallback)
    this.runningOnServer = true
    this.serverInfo = serverInfo
    this.wave = new WaveSpawnerLocal(this.createEnemy.bind(this))

    // for calculating performance
    this.performance = new Performance(1000, GAME_REFRESH_RATE)

    this.performanceCooldown = Cooldown.createTimeBased(2000, GAME_REFRESH_RATE, {
      callback: this.sendPerformance.bind(this),
      autoActivate: true,
    })
  }

  spawnWave() {
    const newEnemies = super.spawnWave()
    this.emitter.spawnWave(this.serverInfo.gameNumber, newEnemies)
    return newEnemies
  }

  sendPerformance() {
    // this.emitter.sendPerformance(this.performance.getAverage())
    console.log('Should be sending performance instructions to all clients!');
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

export default ServerGame

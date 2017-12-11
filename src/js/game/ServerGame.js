
import { observable, computed, action, autorun } from 'mobx'

import Game from './Game'
import WaveSpawnerLocal from '../WaveSpawnerLocal'

class ServerGame extends Game {

  constructor(emitter, endGameCallback, serverInfo) {
    super(emitter, endGameCallback)
    this.runningOnServer = true
    this.serverInfo = serverInfo
    this.wave = new WaveSpawnerLocal(this.createEnemy.bind(this))
  }

  spawnWave() {
    const newEnemies = super.spawnWave()
    this.emitter.spawnWave(this.serverInfo.gameNumber, newEnemies)
    return newEnemies
  }

}

export default ServerGame

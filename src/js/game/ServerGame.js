
import { observable, computed, action, autorun } from 'mobx'

import Game from './Game'

class ServerGame extends Game {

  constructor(emitter, endGameCallback, runningOnServer, isSolo, serverInfo) {
    super(emitter, endGameCallback, runningOnServer, isSolo)
    this.serverInfo = serverInfo
  }

  spawnWave() {
    const newEnemies = super.spawnWave()
    this.emitter.spawnWave(this.serverInfo.gameNumber, newEnemies)
    return newEnemies
  }

}

export default ServerGame


import { observable, computed, action, autorun } from 'mobx'

import Game from './Game'
import WaveSpawnerLocal from '../WaveSpawnerLocal'
import Performance from '../Performance'
import Cooldown from '../Cooldown'
import { GAME_REFRESH_RATE } from '../appConstants'

class ServerGame extends Game {

  constructor(emitter, actions, serverInfo) {
    super(emitter, actions)
    this.runningOnServer = true
    this.serverInfo = serverInfo
    this.wave = new WaveSpawnerLocal(this.createEnemy.bind(this))

    // for calculating performance
    this.performance = new Performance(200, GAME_REFRESH_RATE)
    this.setUpSendPerformance()
  }

  spawnWave() {
    const newEnemies = super.spawnWave()
    this.emitter.spawnWave(this.serverInfo.gameNumber, newEnemies)
    return newEnemies
  }

  sendTerrain() {
    // @TERRAIN @TODO Grab terrain data
    const terrainData = this.pathHelper.getTerrain()
    console.log("Sending terrain");
    console.log(terrainData);
    this.emitter.sendTerrain(this.serverInfo.gameNumber, terrainData)
  }

  sendPerformance() {
    this.actions.updatePerformance(
      this.serverInfo.gameNumber,
      'server',
      this.performance.getSpeedSuggestion(),
    )
  }

  gameLogic() {
    super.gameLogic()
    this.checkPerformance()
  }

  start() {
    super.start()
    this.pathHelper.generateTerrain()
    this.sendTerrain()
  }

  pause() {
    super.pause()
    this.pausePerformance()
  }

  play() {
    super.play()
    this.resumePerformance()
  }

}

export default ServerGame

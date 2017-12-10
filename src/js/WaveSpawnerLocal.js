
import { observable, action } from 'mobx'

import WaveSpawner from './WaveSpawner'

/*
 * Handles actually spawning units.
 * This is run by any client/server requiring units to be spawned, rather than
 * waiting to be sent information about existing units.
 */
class WaveSpawnerLocal extends WaveSpawner {

  constructor(createEnemy) {
    super()
    this.createEnemy = createEnemy
  }

  /*
   * Describes the waves for each level.
   */
  waveList = {
    1: {
      normal: 5,
    },
    2: {
      normal: 5,
      fast: 1,
    },
    3: {
      normal: 5,
      fast: 2,
    },
  }

  /*
   * Generates and returns the enemies for a new spawn.
   * Also triggers the next wave.
   */
  spawn() { // @TODO spawn box/timer so that all enemies don't appear simultaneously?
    this.nextWave()
    console.log(`Spawning wave ${this.number}!`);
    return this.getNewEnemies()
  }

  /*
   * Returns a randomized array of new enemies for a spawn.
   */
  getNewEnemies() {
    const currentWave = this.getCurrentWave(this.waveList, this.number)
    const enemiesInWave = this.getNumberOfEnemies(currentWave)
    return this.getEnemiesFromWaveData(currentWave)
  }

  /*
   * Determines how many enemies should be in a particular wave.
   */
  getNumberOfEnemies(currentWave) {
    let numEnemies = 0
    for (let numberOfEnemies of Object.values(currentWave)) {
      numEnemies += numberOfEnemies
    }
    return numEnemies
  }

  /*
   * Return an array of enemies given data about what the wave should contain.
   */
  getEnemiesFromWaveData(currentWave) {
    const newEnemies = []
    for (let enemyType of Object.keys(currentWave)) {
      for (let i = 0; i < currentWave[enemyType]; i++) {
        // @TODO Remove hardcoded Tank
        let enemy = this.createEnemy('Tank', enemyType)
        newEnemies.push(enemy)
      }
    }

    return this.randomizeSpawnArray(newEnemies)
  }

  /*
   * Return information about the current wave.
   */
  getCurrentWave(waveList, waveNumber) {
    if (waveList.hasOwnProperty(waveNumber)) { // @TODO fetching wave list should be handled by another method
      return waveList[waveNumber]
    }
    return {
      normal: waveNumber,
      fast: waveNumber,
    }
  }


  // HELPERS --------------------

  /*
   * Shuffles an array of units.
   */
  randomizeSpawnArray(unitsArray) {
    let spawnArray = []
    while (unitsArray.length > 0) {
      if (unitsArray.length == 1) {
        spawnArray.push(unitsArray.pop())
      } else {
        let randomIndex = Math.floor(Math.random() * unitsArray.length)
        spawnArray.push(unitsArray.splice(randomIndex, 1)[0])
      }
    }

    return spawnArray
  }
}

export default WaveSpawnerLocal

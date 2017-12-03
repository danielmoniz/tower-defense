
import { observable, action } from 'mobx'

import Cooldown from './Cooldown'
import Tank from './units/Tank'

class WaveSpawner {
  @observable number = 0
  @observable enemiesInWave = 0
  @observable timeBetweenWaves = 15000
  waveList = { // should be handled in another class
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

  constructor(gameCallback, placeEnemyCallback, runningOnServer) {
    this.cooldown = null
    this.gameCallback = gameCallback
    this.placeEnemyCallback = placeEnemyCallback
    this.runningOnServer = runningOnServer
  }

  initializeWaveTimer() {
    console.log('initializing wave timer');
    if (!this.cooldown) {
      this.cooldown = new Cooldown(this.timeBetweenWaves, { delayActivation: false, })
    }
  }

  @action reset() {
    this.number = 0
  }

  @action increment() {
    this.number++
  }

  @action setNumber(newNumber) {
    this.number = newNumber
  }

  updateWaveTimer() {
    if (!this.cooldown) {
      return
    }
    this.cooldown.tick()
    if (this.cooldown.ready()) {
      console.log('spawning wave');
      this.spawn()
    }
  }

  @action spawn() { // @TODO spawn box/timer so that all enemies don't appear simultaneously?
    this.cooldown.activate()
    this.increment()

    if (!this.runningOnServer) { return } // force server to spawn units

    console.log(`Spawning wave ${this.number}!`);
    this.enemiesInWave = 0

    let currentWave
    if (this.waveList.hasOwnProperty(this.number)) { // @TODO fetching wave list should be handled by another method
      currentWave = this.waveList[this.number]
    } else {
      currentWave = {
        normal: this.number,
        fast: this.number,
      }
    }
    for (let numberOfEnemies of Object.values(currentWave)) {
      this.enemiesInWave += numberOfEnemies
    }

    const newEnemies = []
    let enemySpawnArray = this.randomizeSpawnArray(this.enemiesInWave)

    // @TODO There is a lot of jumping between WaveSpawner and Game here.
    for (let enemyType of Object.keys(currentWave)) {
      for (let i = 0; i < currentWave[enemyType]; i++) {
        let enemy = this.placeEnemyCallback(enemyType, this.enemiesInWave, enemySpawnArray.pop())
        newEnemies.push(enemy)
      }
    }

    this.gameCallback(newEnemies)
    return newEnemies
  }



  // HELPERS --------------------

  randomizeSpawnArray(arrayLength) {
    // returns array of length arrayLength, with integers from 0 to arrayLength - 1 in random order
    // individual unit spawns simply .pop from array
    let spawnArray = []
    let randomArray = []
    for (let i = 0; i < arrayLength; i++) {
      randomArray.push(i)
    }
    while (randomArray.length > 0) {
      if (randomArray.length == 1) {
        spawnArray.push(randomArray.pop())
      } else {
        let randomIndex = Math.floor(Math.random() * randomArray.length)
        spawnArray.push(randomArray.splice(randomIndex, 1)[0])
      }
    }

    return spawnArray
  }
}

export default WaveSpawner

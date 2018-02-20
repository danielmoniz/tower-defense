
import { observable, action } from 'mobx'

import WaveSpawner from './WaveSpawner'
import Enemy from './units/Enemy'
import { getEnemyData, getEnemySubtypes, getEnemyTypes } from './units/Enemies'

/*
 * Handles actually spawning units.
 * This is run by any client/server requiring units to be spawned, rather than
 * waiting to be sent information about existing units.
 */
class WaveSpawnerLocal extends WaveSpawner {

  /*
   * Describes the waves for each hardcoded level. Need not specify all waves.
   */
  waveList = {
    10: {
      'Tank': { // @FIXME Must be capitalized
        'large': 5, // @FIXME Must be lowercase
      },
    },
  }

  constructor(createEnemy) {
    super()
    this.createEnemy = createEnemy

    this.startingPoints = 1000
    // this.wavePointsIncrease = 1.15
    this.wavePointsIncrease = 1

    this.enemyTypes = this.sortEnemyTypes(this.getEnemyTypes())
    console.log(this.enemyTypes);
  }

  getEnemyTypes() {
    const enemyTypes = getEnemyTypes()
    const newEnemyTypes = []
    const typeNames = Object.keys(enemyTypes)
    const enemyTypesList = Object.values(enemyTypes)

    enemyTypesList.forEach((enemyType, index) => {
      const typeName = typeNames[index]
      const typeData = getEnemySubtypes(typeName)

      const subTypesList = Object.values(typeData)
      const subTypeNames = Object.keys(typeData)

      subTypesList.forEach((subTypeData, index) => {
        const subTypeName = subTypeNames[index]
        const enemySubType = {
          typeName,
          subTypeName,
          data: subTypeData,
        }
        newEnemyTypes.push(enemySubType)
      })
    })

    return newEnemyTypes
  }

  sortEnemyTypes(enemyTypes) {
    return enemyTypes.sort((enemyType1, enemyType2) => {
      const priority1 = enemyType1.data.priority
      const priority2 = enemyType2.data.priority
      return priority2 - priority1
    })
  }

  /*
   * Generates and returns the enemies for a new spawn.
   * Also triggers the next wave.
   */
  spawn() { // @TODO spawn box/timer so that all enemies don't appear simultaneously?
    this.nextWave()
    console.log(`Spawning wave ${this.number}!`);
    return this.spawnNewEnemies()
  }

  /*
   * Returns a randomized array of new enemies for a spawn.
   */
  spawnNewEnemies() {
    const currentWave = this.getCurrentWave(this.waveList, this.number)
    let enemyData = []

    if (this.waveList[this.number]) { // use hardcoded wave if possible
      enemyData = this.getEnemiesFromWaveData(this.waveList[this.number])
    } else { // otherwise, generate enemies from scratch with an algorithm
      enemyData = this.generateEnemies()
    }

    const randomizedEnemyData = this.randomizeSpawnArray(enemyData)
    return this.spawnEnemiesFromData(randomizedEnemyData)
  }

  getEnemiesFromWaveData(waveData) {
    const enemiesData = []

    for (let enemyType of Object.keys(waveData)) {
      const enemyTypeData = waveData[enemyType]
      for (let enemySubType of Object.keys(enemyTypeData)) {
        const numEnemies = enemyTypeData[enemySubType]
        for (let i = 0; i < numEnemies; i++) {
          const enemyData = this.getNewEnemyData(enemyType, enemySubType)
          enemiesData.push(enemyData)
        }
      }
    }

    return enemiesData
  }

  getPointsInWave(waveNumber) {
    return Math.ceil(this.startingPoints * Math.pow(this.wavePointsIncrease, waveNumber))
  }

  /*
   * Return an array of enemies given data about what the wave should contain.
   */
  generateEnemies() {
    const newEnemyData = []
    const newEnemies = []
    // console.log(this.number);
    let pointsLeft = this.getPointsInWave(this.number)
    // console.log('Total points in wave:', pointsLeft);
    let currentEnemyIndex = 0
    let allocatedPoints
    // console.log('----------');

    while (pointsLeft > 0 && currentEnemyIndex < this.enemyTypes.length) {
      const currentEnemy = this.enemyTypes[currentEnemyIndex]
      const typeName = currentEnemy.typeName
      const subTypeName = currentEnemy.subTypeName
      const enemyData = getEnemyData(typeName, subTypeName)

      const pointsValue = enemyData.points
      const isLastUnit = currentEnemyIndex === this.enemyTypes.length - 1

      if (enemyData.minWaveStart && enemyData.minWaveStart > this.number) {
        currentEnemyIndex += 1
        continue
      }

      // is enemy affordable?
      if (pointsValue > pointsLeft) {
        // console.log(`Moving on - enemy ${typeName} (${subTypeName}) not affordable.`);
        currentEnemyIndex += 1
        continue
      }

      // should enemy show up? If not last unit and probability not met, skip this unit
      if (!isLastUnit && currentEnemy.data.probability <= Math.random()) {
        // console.log(`Moving on - enemy ${typeName} (${subTypeName}) did not meet probability`);
        currentEnemyIndex += 1
        continue
      }

      // how many should show up? (min. 1)
      const maxEnemies = Math.floor(pointsLeft / pointsValue)
      let numEnemies = Math.ceil(Math.random() * maxEnemies)
      if (isLastUnit) {
        numEnemies = maxEnemies
      }
      const pointsUsed = numEnemies * pointsValue
      // console.log('Points left:', pointsLeft);
      // console.log(currentEnemy.subTypeName, numEnemies, numEnemies * pointsValue);

      for (let i = 0; i < numEnemies; i++) {
        const enemy = this.createEnemy(typeName, subTypeName)
        newEnemyData.push(this.getNewEnemyData(typeName, subTypeName))
      }

      pointsLeft -= pointsUsed

      currentEnemyIndex += 1
    }

    return newEnemyData
  }

  spawnEnemiesFromData(enemiesData) {
    const enemies = []
    enemiesData.forEach((enemyData) => {
      const enemy = this.createEnemy(enemyData.type, enemyData.subType)
      enemies.push(enemy)
    })
    return enemies
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
   * Returns a common format for a new enemy to be spawned.
   */
  getNewEnemyData(type, subType) {
    return {
      type,
      subType,
    }
  }

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

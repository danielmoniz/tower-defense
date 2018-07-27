
import { observable, action } from 'mobx'

import WaveSpawner from './WaveSpawner'
import Enemy from './units/Enemy'
import { getEnemyData, getEnemySubtypes, getEnemyTypes, applyAttributes } from './units/Enemies'
import { attributes } from './units/Attributes'
import { getRandomSubarray } from './utility/random'

/*
 * Handles actually spawning units.
 * This is run by any client/server requiring units to be spawned, rather than
 * waiting to be sent information about existing units.
 */
class WaveSpawnerLocal extends WaveSpawner {

  /*
   * Describes the waves for each hardcoded level. Need not specify all waves.
   */
  // waveList = {
  //   8: {
  //     'Tank': { // @FIXME Must be capitalized
  //       'large': 5, // @FIXME Must be lowercase
  //     },
  //   },
  // }
  waveList = {}

  constructor(createEnemy) {
    super()
    this.createEnemy = createEnemy

    this.startingPoints = 1000
    // this.wavePointsIncrease = 1.15
    this.wavePointsIncrease = 1

    this.enemyTypes = this.sortEnemyTypes(this.getEnemyTypes())
    // console.log(this.enemyTypes);

    this.numBossAttributes = 3
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
      enemyData = this.generateEnemies(this.number)
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
   * Generate a boss using the current set of random attributes.
   */
  getBossData() {
    return applyAttributes(
      getEnemyData('Carrier', 'normal'),
      this.currentAttributes,
    )
  }

  /*
   * Handles moving to the next round.
   * Eg. sets the random attributes for the given round.
   */
  nextRound() {
    const newAttributes = getRandomSubarray(attributes, this.numBossAttributes)
    this.setRoundAttributes(newAttributes)
    console.log('NEXT ROUND ATTRIBUTES:');
    console.log(this.currentAttributes.map(attr => attr.name));
  }

  /*
   * Return an array of enemies given data about what the wave should contain.
   */
  generateEnemies(waveNumber) {
    if (waveNumber === 0) { return [] }
    if (waveNumber % this.bossSpawnOnWave === 0) { // boss wave!
      return [this.getBossData()] // enemies include just one boss
    }

    const newEnemyData = []
    const newEnemies = []
    let pointsLeft = this.getPointsInWave(waveNumber)
    // console.log('Total points in wave:', pointsLeft);
    let currentEnemyIndex = -1
    let allocatedPoints

    // should there be any attributes?
    const numAttributes = this.getNumAttributes(waveNumber)
    let randomAttributes = getRandomSubarray(this.currentAttributes, numAttributes)
    randomAttributes = randomAttributes.sort((a, b) => a.name > b.name)
    console.log("Wave " + waveNumber + ':', randomAttributes.map(attr => attr.name));

    while (pointsLeft > 0 && currentEnemyIndex < this.enemyTypes.length - 1) {
      currentEnemyIndex += 1
      const currentEnemy = this.enemyTypes[currentEnemyIndex]
      const isLastUnit = currentEnemyIndex === this.enemyTypes.length - 1

      const enemyData = applyAttributes(
        getEnemyData(currentEnemy.typeName, currentEnemy.subTypeName),
        randomAttributes,
      )

      const pointsValue = enemyData.points

      if (this.waveTooEarly(enemyData, waveNumber) ||
          pointsValue > pointsLeft || // is enemy affordable?
          !this.shouldSelectEnemy(enemyData, isLastUnit)
      ) {
        continue
      }

      // how many should show up? (min. 1)
      const numEnemies = this.getNumEnemies(pointsLeft, pointsValue, isLastUnit)
      const pointsUsed = numEnemies * pointsValue

      for (let i = 0; i < numEnemies; i++) {
        newEnemyData.push(enemyData)
      }

      pointsLeft -= pointsUsed
    }

    return newEnemyData
  }

  /*
   * Returns boolean - whether or not the unit can be spawned this early.
   */
  waveTooEarly(enemyData, waveNumber) {
    return enemyData.minWaveStart && enemyData.minWaveStart > waveNumber
  }

  /*
   * Returns boolean - whether or not the enemy type will be used this wave.
   */
  shouldSelectEnemy(enemyData, isLastUnit) {
    return isLastUnit || enemyData.probability >= Math.random()
  }

  /*
   * Returns the number of enemies to be used this wave.
   */
  getNumEnemies(pointsLeft, pointsValue, isLastUnit) {
    const maxEnemies = Math.floor(pointsLeft / pointsValue)
    let numEnemies = Math.ceil(Math.random() * maxEnemies)
    if (isLastUnit) {
      numEnemies = maxEnemies
    }
    return numEnemies
  }

  spawnEnemiesFromData(enemiesData) {
    const enemies = []
    enemiesData.forEach((enemyData) => {
      const enemy = this.createEnemy(enemyData)
      enemies.push(enemy)
    })
    return enemies
  }

  nextWave() {
    super.nextWave()
    if (this.number % this.bossSpawnOnWave === 1) { // first wave in new round
      this.nextRound()
    }
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

  getNumAttributes(waveNumber) {
    switch (this.number % 5) {
      case 1:
        return 0
      case 2:
        return 1
      case 3:
        return 2
      case 4:
        return 3
      case 5:
        return 3
    }
  }

}

export default WaveSpawnerLocal

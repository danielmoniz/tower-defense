
import { GRID_SIZE } from '../appConstants'
import Enemy from './Enemy'
import { getPointsValue, getEnemyData } from './Enemies'

export default class Tank extends Enemy {

  // @TODO This code should really be in Enemy. Need better way of specifying
  // different unit types with minimizing code (eg. JSON configuration).
  setAttributes(enemyType) {

    let enemyAttributes = getEnemyData('Tank', enemyType)

    for (let attribute of Object.keys(enemyAttributes)) {
      this[attribute] = enemyAttributes[attribute]
    }
  }
}

Tank.subTypes = {
  boss: {
    width: GRID_SIZE * 3,
    height: GRID_SIZE * 3,
    speed: 15,
    maxHitPoints: 500,
    killValue: {
      credits: 50,
      xp: 100,
    },
    probability: 0.1,
    priority: 500,
  },
  normal: {
    width: GRID_SIZE * 2,
    height: GRID_SIZE * 2,
    speed: 20,
    maxHitPoints: 50,
    killValue: {
      credits: 5,
      xp: 10,
    },
    probability: 1,
    priority: 0,
  },
  fast: {
    width: GRID_SIZE * 1.5,
    height: GRID_SIZE * 1.5,
    speed: 40,
    maxHitPoints: 40,
    killValue: {
      credits: 7,
      xp: 10,
    },
    probability: 0.5,
    priority: 20,
  },
  tiny: {
    width: GRID_SIZE * 1,
    height: GRID_SIZE * 1,
    speed: 30,
    maxHitPoints: 20,
    killValue: {
      credits: 3,
      xp: 5,
    },
    probability: 0.5,
    priority: 10,
  },
}


import { GRID_SIZE } from '../appConstants'
import Enemy from './Enemy'

export default class Tank extends Enemy {
  // constructor(game, enemyType, gameLevel) { // options moved to this constructor, not super
  //   super(game, enemyType, gameLevel)
  // }

  // @TODO This code should really be in Enemy. Need better way of specifying
  // different unit types with minimizing code (eg. JSON configuration).
  setAttributes(enemyType) {
    let enemyTypes = Tank.subTypes
    let enemyAttributes

    if (enemyTypes.hasOwnProperty(enemyType)) {
      enemyAttributes = enemyTypes[enemyType]
    } else {
      enemyAttributes = enemyTypes["normal"]
    }

    for (let attribute of Object.keys(enemyAttributes)) {
      this[attribute] = enemyAttributes[attribute]
    }

    // @TODO Have credits be determined dynamically
    // @TODO Have XP be determined dynamically (or just be points value)
    // if (this.killValue === undefined) {
    //   this.killValue = {}
    // }
    // this.killValue.credits = Enemy.getCredits(this)

    this.name = `Tank (${enemyType})`
    this.enemyType = 'Tank'
    this.subtype = enemyType
    this.currentHitPoints = this.maxHitPoints
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


import { GRID_SIZE } from '../appConstants'
import Enemy from './Enemy'

export default class Tank extends Enemy {
  constructor(game, enemyType) { // options moved to this constructor, not super
    super(game)
    let enemyTypes = {
      normal: {
        width: GRID_SIZE * 2,
        height: GRID_SIZE * 2,
        speed: 20,
        maxHitPoints: 50,
        killValue: {
          credits: 5,
          xp: 20,
        },
      },
      fast: {
        width: GRID_SIZE * 1.5,
        height: GRID_SIZE * 1.5,
        speed: 40,
        maxHitPoints: 40,
        killValue: {
          credits: 7,
          xp: 20,
        },
      },
    }
    let enemyAttributes

    if (enemyTypes.hasOwnProperty(enemyType)) {
      enemyAttributes = enemyTypes[enemyType]
    } else {
      enemyAttributes = enemyTypes["normal"]
    }

    for (let attribute of Object.keys(enemyAttributes)) {
      this[attribute] = enemyAttributes[attribute]
    }

    this.name = enemyType
    this.currentHitPoints = this.maxHitPoints
  }
}

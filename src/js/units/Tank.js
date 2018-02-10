
import { GRID_SIZE } from '../appConstants'
import Enemy from './Enemy'
import { getEnemyData } from './Enemies'

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

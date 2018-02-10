
// @TODO Should have enemy sizes as ratios of GRID_SIZE (eg. 1, 2, 0.5, etc.)
import { GRID_SIZE } from '../appConstants'

export function getPointsValue(type, subtype) {
  if (!(type in enemies) || !(subtype in enemies[type])) {
    throw 'Must supply a valid enemy type and subtype'
  }
  const data = enemies[type][subtype]
  return data.maxHitPoints * data.speed / 100
}

export function getEnemyData(type, subtype) {
  if (!(type in enemies) || !(subtype in enemies[type])) {
    throw 'Must supply a valid enemy type and subtype'
  }
  const data = enemies[type][subtype]
  data.enemyType = type
  data.subtype = subtype
  data.name = `${type} (${subtype})`
  return data
}

export const enemies = {
  'Tank': {
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
  },

  // more enemy types here
}

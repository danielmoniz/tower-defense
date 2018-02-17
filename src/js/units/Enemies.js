
import { GRID_SIZE } from '../appConstants'

export function getPointsValue(enemyData) {
  return enemyData.maxHitPoints * enemyData.speed / 10
}

export function getEnemyData(type, subtype) {
  if (!(type in enemies) || !(subtype in enemies[type])) {
    throw 'Must supply a valid enemy type and subtype.'
  }
  const data = enemies[type][subtype]

  data.points = getPointsValue(data)
  data.killValue = data.killValue || {}
  data.killValue.xp = data.killValue.xp || data.points
  const newCredits = Math.floor(data.points / 10)
  data.killValue.credits = data.killValue.credits || newCredits

  data.enemyType = type
  data.subtype = subtype
  data.name = `${type} (${subtype})`

  return data
}

export function scaleEnemy(enemyData, gameLevel) {
  const data = { ...enemyData } // copy original data
  // const scaleFactor = Math.pow(1.20, gameLevel) // exponential
  const scaleFactor = Math.pow(gameLevel, 1.2) // slow power
  data.maxHitPoints = Math.ceil(data.maxHitPoints * scaleFactor)
  return data
}

export function getEnemySubtypes(type) {
  if (!(type in enemies)) {
    throw 'Must supply a valid enemy type.'
  }
  const result = {}
  for (const subTypeName in enemies[type]) {
    result[subTypeName] = getEnemyData(type, subTypeName)
  }
  return result
}

export function getEnemyTypes() {
  const result = {}
  for (const typeName in enemies) {
    result[typeName] = getEnemySubtypes(typeName)
  }
  return result
}

// @TODO Should have enemy sizes as ratios of GRID_SIZE (eg. 1, 2, 0.5, etc.)
/*
 * NOTE: Can hardcode credits and xp by adding killValue object.
 */
export const enemies = {
  'Swarm': {
    'normal': {
      width: GRID_SIZE * 0.5,
      height: GRID_SIZE * 0.5,
      speed: 25,
      maxHitPoints: 2,
      probability: 0.4,
      priority: 4,
    },
  },

  'Scout': {
    'normal': {
      width: GRID_SIZE * 1,
      height: GRID_SIZE * 1,
      speed: 40,
      maxHitPoints: 10,
      probability: 0.4,
      priority: 22,
    }
  },

  'Carrier': {
    'normal': {
      width: GRID_SIZE * 4,
      height: GRID_SIZE * 4,
      speed: 10,
      maxHitPoints: 1000,
      probability: 0.2,
      priority: 100,
      minWaveStart: 10,
    },
  },

  'Invader': {
    'normal': {
      width: GRID_SIZE * 1,
      height: GRID_SIZE * 1,
      speed: 20,
      maxHitPoints: 20,
      probability: 1,
      priority: 0,
    },
    fast: {
      width: GRID_SIZE * 0.75,
      height: GRID_SIZE * 0.75,
      speed: 30,
      maxHitPoints: 20,
      probability: 0.2,
      priority: 20,
    },
  },

  'Tank': {
    normal: {
      width: GRID_SIZE * 2,
      height: GRID_SIZE * 2,
      speed: 20,
      maxHitPoints: 50,
      probability: 0.2,
      priority: 15,
    },
    large: {
      width: GRID_SIZE * 3,
      height: GRID_SIZE * 3,
      speed: 14,
      maxHitPoints: 80,
      probability: 0.05,
      priority: 50,
    },
  },
}

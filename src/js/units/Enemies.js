
import { GRID_SIZE } from '../appConstants'

/*
 * Given data for an enemy, returns the number of points they cost to be placed
 * in a wave.
 */
export function getPointsValue(enemyData) {
  let total = enemyData.maxHitPoints * enemyData.speed / 10
  if (enemyData.regenerates) {
    total *= (1 + enemyData.regenerates)
  }
  return total
}

/*
 * Given an amount of points for an enemy, returns the number of credits that
 * enemy would be worth to kill.
 */
export function getCreditsValue(points) {
  return points / 10
}

/*
 * Given basic data for an enemy, returns an object of stats that includes
 * points-based info such as killValue xp and credits.
 */
export function getEnemyStats(enemyData) {
  const enemyStats = { ...enemyData }
  enemyStats.points = getPointsValue(enemyStats)
  enemyStats.killValue = enemyStats.killValue || {}

  enemyStats.killValue.xp = enemyStats.killValue.xp || enemyStats.points
  enemyStats.killValue.xp = Math.ceil(enemyStats.killValue.xp)

  const newCredits = getCreditsValue(enemyStats.points)
  enemyStats.killValue.credits = enemyStats.killValue.credits || newCredits
  enemyStats.killValue.credits = Math.ceil(enemyStats.killValue.credits)
  return enemyStats
}

/*
 * Given some enemy data and an array of attributes, applies each attribute to
 * the data as keys and values. Requires some small amount of intelligence to
 * either set a new value or modify the existing value.
 */
export function applyAttributes(oldEnemyData, attributes) {
  const enemyData = { ...oldEnemyData }
  attributes.forEach((attribute) => {
    Object.keys(attribute).forEach((key) => {
      if (key === 'name') { return }
      if (isNaN(enemyData[key])) {
        enemyData[key] = attribute[key]
      } else {
        enemyData[key] *= attribute[key]
      }
    })
  })
  enemyData.attributes = attributes.map((attribute) => attribute.name)

  delete enemyData.killValue // remove this so getEnemyStats will not ignore it // @FIXME Hacky!
  return getEnemyStats(enemyData)
}

/*
 * Finds that stats for a given enemy. Ensures they have a type, subtype, etc.
 */
export function getEnemyData(type, subtype, attributes = []) {
  if (!(type in enemies) || !(subtype in enemies[type])) {
    throw 'Must supply a valid enemy type and subtype.'
  }
  const data = getEnemyStats(enemies[type][subtype])
  // const finalEnemyData = applyAttributes(data, attributes)
  const finalEnemyData = data

  finalEnemyData.enemyType = type
  finalEnemyData.subtype = subtype
  finalEnemyData.name = `${type} (${subtype})`

  return finalEnemyData
}

/*
 * Scales an enemy by the given game level.
 * @TODO Enemies may only scale once every round (eg. 5 levels).
 */
export function scaleEnemy(enemyData, gameLevel) {
  const data = { ...enemyData } // copy original data
  // const scaleFactor = Math.pow(1.20, gameLevel) // exponential
  const scaleFactor = Math.pow(gameLevel, 1.2) // slow power
  data.maxHitPoints = Math.ceil(data.maxHitPoints * scaleFactor)
  return data
}

/*
 * Return all subtypes (and their data) for a given type of enemy.
 */
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

/*
 * Return all types of enemies. Contains their subtypes and data.
 */
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

  'Swarm': {
    'normal': {
      width: GRID_SIZE * 0.5,
      height: GRID_SIZE * 0.5,
      speed: 25,
      maxHitPoints: 5,
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
      probability: 0, // only spawns under specific circumstances
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

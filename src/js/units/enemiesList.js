
import { GRID_SIZE } from '../appConstants'


const stats = {
  speed: {
    low: 15,
    medium: 22,
    high: 33,
    veryHigh: 55,
  },
  hp: {
    veryLow: 5,
    low: 20,
    high: 50,
  },
  armour: {
    none: 1, // @FIXME This should be zero, but it's causing a bug
    low: 10,
    medium: 30,
    high: 50,
  },
  size: {
    tiny: GRID_SIZE * 0.5,
    small: GRID_SIZE * 1,
    medium: GRID_SIZE * 2,
    large: GRID_SIZE * 3,
    huge: GRID_SIZE * 4,
  },
  probability: {
    certain: 1,
    likely: 0.4,
    common: 0.2,
    uncommon: 0.1,
    rare: 0.05,
    impossible: 0,
  },
}

// @TODO Should have enemy sizes as ratios of GRID_SIZE (eg. 1, 2, 0.5, etc.)
  // ie. should not need to import GRID_SIZE here
/*
 * NOTE: Can hardcode credits and xp profit by adding killValue object.
 */
export default {
  'Scout': {
    'normal': {
      width: stats.size.small,
      height: stats.size.small,
      speed: stats.speed.veryHigh,
      maxHitPoints: stats.hp.low,
      maxArmour: stats.armour.low,
      probability: stats.probability.common,
      priority: 6,
    },
  },
  'Insectoid': {
    'normal': {
      width: stats.size.small,
      height: stats.size.small,
      speed: stats.speed.low,
      maxHitPoints: stats.hp.low,
      maxArmour: stats.armour.high,
      probability: stats.probability.common,
      priority: 7,
    },
  },
  'Freighter': {
    'normal': {
      width: stats.size.large,
      height: stats.size.large,
      speed: stats.speed.low,
      maxHitPoints: stats.hp.high,
      maxArmour: stats.armour.none,
      probability: stats.probability.certain,
      priority: 1,
    },
  },
  'Swarm': {
    'normal': {
      width: stats.size.tiny,
      height: stats.size.tiny,
      speed: stats.speed.medium,
      maxHitPoints: stats.hp.veryLow,
      maxArmour: stats.armour.low,
      probability: stats.probability.uncommon,
      priority: 5,
    },
  },
  'Tank': {
    'normal': {
      width: stats.size.small,
      height: stats.size.small,
      speed: stats.speed.medium,
      maxHitPoints: stats.hp.low,
      maxArmour: stats.armour.high,
      probability: stats.probability.common,
      priority: 8,
    },
  },
  'Hovercraft': {
    'normal': {
      width: stats.size.medium,
      height: stats.size.medium,
      speed: stats.speed.high,
      maxHitPoints: stats.hp.high,
      maxArmour: stats.armour.low,
      probability: stats.probability.common,
      priority: 4,
    },
  },
  'Juggernaut': {
    'normal': {
      width: stats.size.large,
      height: stats.size.large,
      speed: stats.speed.low,
      maxHitPoints: stats.hp.high,
      maxArmour: stats.armour.high,
      probability: stats.probability.uncommon,
      priority: 3,
    },
  },
  'Chosen': {
    'normal': {
      width: stats.size.large,
      height: stats.size.large,
      speed: stats.speed.high,
      maxHitPoints: stats.hp.high,
      maxArmour: stats.armour.high,
      probability: stats.probability.rare,
      priority: 2,
    },
  },
  'Carrier': {
    'normal': {
      width: stats.size.huge,
      height: stats.size.huge,
      speed: 15,
      maxHitPoints: 330,
      maxArmour: 330,
      probability: stats.probability.impossible, // used on specific waves
      priority: 0, // doesn't matter
    },
  },
}

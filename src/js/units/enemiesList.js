
import { GRID_SIZE } from '../appConstants'

// @TODO Should have enemy sizes as ratios of GRID_SIZE (eg. 1, 2, 0.5, etc.)
  // ie. should not need to import GRID_SIZE here
/*
 * NOTE: Can hardcode credits and xp profit by adding killValue object.
 */
export default {
  'Invader': {
    'normal': {
      width: GRID_SIZE * 1,
      height: GRID_SIZE * 1,
      speed: 20,
      maxHitPoints: 25,
      maxArmour: 10,
      probability: 1,
      priority: 0,
    },
    fast: {
      width: GRID_SIZE * 0.75,
      height: GRID_SIZE * 0.75,
      speed: 30,
      maxHitPoints: 20,
      maxArmour: 0,
      probability: 0.2,
      priority: 20,
    },
  },

  'Swarm': {
    'normal': {
      width: GRID_SIZE * 0.5,
      height: GRID_SIZE * 0.5,
      speed: 25,
      maxHitPoints: 4,
      maxArmour: 1,
      probability: 0.4,
      priority: 4,
    },
  },

  'Scout': {
    'normal': {
      width: GRID_SIZE * 1,
      height: GRID_SIZE * 1,
      speed: 40,
      maxHitPoints: 11,
      maxArmour: 2,
      probability: 0.4,
      priority: 22,
    }
  },

  'Carrier': {
    'normal': {
      width: GRID_SIZE * 4,
      height: GRID_SIZE * 4,
      speed: 20,
      maxHitPoints: 400,
      maxArmour: 400,
      probability: 0, // only spawns under specific circumstances
    },
  },

  'Tank': {
    normal: {
      width: GRID_SIZE * 2,
      height: GRID_SIZE * 2,
      speed: 20,
      maxHitPoints: 12,
      maxArmour: 50,
      probability: 0.2,
      priority: 15,
    },
    large: {
      width: GRID_SIZE * 3,
      height: GRID_SIZE * 3,
      speed: 14,
      maxHitPoints: 18,
      maxArmour: 85,
      probability: 0.05,
      priority: 50,
    },
  },
}


import { observable, computed, action, autorun } from 'mobx'

import Unit from './Unit'
import { GAME_REFRESH_RATE } from '../appConstants'
import getUnitRenderTools from '../client/UnitRenderer'

class Enemy extends Unit {
  // defaults (observables)
  @observable speed = 100 // pixels per second
  @observable completed = false
  @observable killValue // should be overridden

  constructor(game, options) {
    super(game, options)
    this.movementId = undefined
  }

  /*
   * Clears the movement for the unit. Needs a new target before moving again.
   */
  @action clearMovement() {
    delete this.act
  }

  /*
   * This method should set a new move target for the unit.
   * It should NOT actually trigger the unit to move if stopped.
   * If the unit is already moving, it ensures they continue in the new direction.
   */
  @action setMoveTarget(finalX, finalY) {
    this.act = () => {
      const reachedGoal = this.moveXAndY(finalX, finalY)
      if (reachedGoal) {
        this.complete() // assumes enemies only get one goal
      }
    }
    if (this.movementId) { // if already moving, continue in a new direction
      this.startMovement()
    }
  }

  /*
   * Moves the unit by one 'turn' or tick. They should move up to their speed (or less
   * if they are close to their objective).
   */
  @action moveXAndY(finalX, finalY) {
    if (this.x === finalX && this.y === finalY) {
      return true
    }

    const actualSpeed = this.speed / (1000 / GAME_REFRESH_RATE)

    // use polar coordinates to generate X and Y given target destination
    const deltaX = finalX - this.x
    const deltaY = finalY - this.y
    let distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2))
    distance = Math.min(actualSpeed, distance)
    const angle = this.getAngleToPoint(finalX, finalY)

    const xMovement = distance * Math.cos(angle)
    const yMovement = distance * Math.sin(angle)

    this.x += xMovement
    this.y += yMovement
  }

  @action complete() {
    this.completed = true
    this.destroy()
  }
}

/*
 * Creates a new unit of the given class provided (eg. Cannon, Tank, etc.).
 * Also triggers their initial rendering loop.
 */
Enemy.create = function(UnitClass, game, options) {
  return new UnitClass(game, options)
}

export default Enemy

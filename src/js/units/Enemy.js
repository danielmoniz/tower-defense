
import { observable, computed, action, autorun } from 'mobx'

import Unit from './Unit'
import { GAME_REFRESH_RATE } from '../appConstants'

class Enemy extends Unit {
  // defaults (observables)
  @observable speed = 100 // pixels per second
  @observable completed = false
  @observable killValue // should be overridden

  constructor(game, options) {
    super(game, options)
    this.movementId = undefined
    this.type = 'Enemy'
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
  @action setMoveTarget() {
    this.act = (nextLocation, terrainDifficulty) => {
      this.moveXAndY(nextLocation.x, nextLocation.y, terrainDifficulty)
    }
    if (this.movementId) { // if already moving, continue in a new direction
      this.startMovement()
    }
  }

  /*
   * Moves the unit by one 'turn' or tick. They should move up to their speed (or less
   * if they are close to their objective).
   */
  @action moveXAndY(finalX, finalY, terrainDifficulty) {
    if (this.x === finalX && this.y === finalY) {
      return true
    }

    const actualSpeed = this.speed / (1000 / GAME_REFRESH_RATE) / terrainDifficulty

    // use polar coordinates to generate X and Y given target destination
    const deltaX = finalX - this.x
    const deltaY = finalY - this.y
    let distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2))
    distance = Math.min(actualSpeed, distance)
    const angle = this.getAngleToPoint(finalX, finalY)

    const xMovement = distance * Math.cos(angle)
    const yMovement = distance * Math.sin(angle)

    // round current position coordinate to two decimals
    this.x = Math.round((this.x + xMovement) * 100) / 100
    this.y = Math.round((this.y + yMovement) * 100) / 100
  }

  @action complete() {
    this.completed = true
    this.destroy()
  }
}

export default Enemy

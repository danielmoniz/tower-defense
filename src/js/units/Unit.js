
import { observable, computed, action, autorun } from 'mobx'

import { GAME_REFRESH_RATE } from '../appConstants'

let ID = 1

class Unit {
  // defaults (observables)
  @observable x = 0
  @observable y = 0
  @observable id
  @observable name
  @observable display = true
  @observable disabled = false // setting to true disables and greys the unit
  @observable removed = false // setting to true allows for units to be removed from the game
  @observable derender = false
  @observable maxHitPoints = 50
  @observable currentHitPoints
  @observable selected = false
  @observable burning = false

  constructor(game, options) {
    options = options || {}
    this.id = ID
    ID += 1

    // add a reference to game which avoids circular referencing
    Object.defineProperty(this, 'game', { value: game, writable: true})

    // set defaults
    this.width = undefined // must override
    this.height = undefined // must override
    this.name = undefined // must override
    this.currentHitPoints = this.maxHitPoints


    // override defaults
    for (let key in options) {
      if (options.hasOwnProperty(key)) {
        this[key] = options[key]
      }
    }
  }

  @computed get xFloor() {
    return Math.floor(this.x)
  }

  @computed get yFloor() {
    return Math.floor(this.y)
  }

  /*
   * Used for setting any key/value pair on the object.
   * Good for building a mid-game active unit from scratch.
   */
  @action setAttr(key, value) {
    this[key] = value
  }

  @action destroy() {
    this.remove()
    this.derender = true
  }

  @action hide() {
    this.display = false
  }

  @action show() {
    this.display = true
  }

  @action disable() {
    this.disabled = true
  }

  @action enable() {
    this.disabled = false
  }

  @action remove() {
    this.removed = true
  }

  @action select() {
    this.selected = true
  }

  @action deselect() {
    this.selected = false
  }

  /*
   * Jumps/teleports a unit to the given position.
   */
  @action jumpTo(newX, newY) {
    this.x = newX
    this.y = newY
  }

  /*
   * Makes the unit take damage.
   * Returns true if the unit is killed.
   */
  @action takeDamage(amount) {
    if (this.currentHitPoints <= 0) {
      return
    }
    this.currentHitPoints = Math.max(this.currentHitPoints - amount, 0)
    if (this.currentHitPoints <= 0) {
      this.kill()
      return true
    }
  }

  @action kill() {
    // @TODO should explode
    this.destroy()
  }

  @action ignite() {
    this.burning = true
  }

  @action extinguish() {
    this.burning = false
  }

  isAlive() {
    return this.currentHitPoints > 0
  }

  getAngleToPoint(x, y) {
    return Math.atan2(y - this.y, x - this.x)
  }

  getCentre() {
    return { x: this.x + this.width / 2, y: this.y + this.height / 2}
  }

  getDistanceToPoint(point) {
    const xDistance = Math.abs(this.getCentre().x - point.x) - (this.width / 2)
    const yDistance = Math.abs(this.getCentre().y - point.y) - (this.height / 2)
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2))
  }

}

export default Unit


import { observable, computed, action, autorun } from 'mobx'

import { GAME_REFRESH_RATE } from '../appConstants'
import getAltId from '../utility/altId'

class Unit {
  // defaults (observables)
  @observable x = 0
  @observable y = 0
  @observable id
  @observable name
  @observable type
  @observable display = true
  @observable disabled = false // setting to true disables and greys the unit
  @observable removeMe = false // setting to true allows for units to be removed from the game
  @observable maxHitPoints = 50
  @observable currentHitPoints
  @observable selected = false
  @observable burning = false
  @observable burningInfo = {
    killProfitMultiplier: 1,
    dps: 1,
  }
  @observable hitBy = null

  constructor(game, options) {
    options = options || {}
    this.id = getAltId()
    this.createdAt = Date.now()
    this.type = 'Unit' // should be overwritten

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
    this.removeMe = true
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

  // handle any actions that are global to all unit types
  @action act() {
    this.clearHit()
    this.handleEffects()
  }

  /*
   * Makes the unit take damage.
   * Returns true if the unit is killed.
   */
  @action takeDamage(amount, type) {
    if (this.currentHitPoints <= 0) {
      return
    }
    this.takeHit(type)
    this.currentHitPoints = Math.max(this.currentHitPoints - amount, 0)
    if (this.currentHitPoints <= 0) {
      if (type === 'burning') { // handle profit in case of passive damage
        const attacker = this.burningInfo.attacker
        if (attacker) {
          console.log(attacker);
          attacker.killEnemy(this.killValue)
        } else {
          // @TODO @NOTE burningInfo.attacker is never cleaned up if tower is sold. So else never fires!
          const multiplier = this.burningInfo.killProfitMultiplier
          this.game.profit(this.killValue.credits * multiplier)
        }
      }
      this.kill()
      return true
    }
  }

  handleEffects() {
    this.regenerate()
    this.burn()
  }

  regenerate() {
    if (!this.regenerates) { return }
    const ticksPerSecond = 1000 / GAME_REFRESH_RATE
    const hpToHeal = Math.sqrt(this.maxHitPoints) * this.regenerates / ticksPerSecond
    this.heal(hpToHeal)
  }

  burn() {
    if (!this.burning) { return }
    this.takeDamage(this.burningInfo.dps, 'burning')
    // this.takeHit('burning')
  }

  @action heal(amount) {
    this.currentHitPoints = Math.min(this.currentHitPoints + amount, this.maxHitPoints)
  }

  @action takeHit(type) {
    this.hitBy = type
  }

  @action clearHit() {
    this.hitBy = null
  }

  @action kill() {
    // @TODO should explode
    this.destroy()
  }

  @action ignite(attacker, killProfitMultiplier) {
    this.burning = true
    this.burningInfo.killProfitMultiplier = killProfitMultiplier
    this.burningInfo.attacker = attacker
  }

  @action extinguish() {
    this.burning = false
    this.burningInfo.killProfitMultiplier = 1 // reset just in case
  }

  /*
   * The additional logic may have twisted the purpose of this method.
   * 'Alive' is defined as: has hit points, hasn't reached the exit, and
   * doesn't want to be removed.
   */
  isAlive() {
    return this.currentHitPoints > 0 && !this.completed && !this.removeMe
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

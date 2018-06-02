
import { observable, computed, action, autorun } from 'mobx'

import { GAME_REFRESH_RATE } from '../appConstants'
import getAltId from '../utility/altId'
import Cooldown from '../Cooldown'

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
  @observable maxHitPoints
  @observable currentHitPoints
  @observable maxArmour
  @observable currentArmour
  @observable selected = false
  @observable burning = false
  @observable burningInfo = {
    killProfitMultiplier: 1,
    dps: 0,
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
  @action takeDamage(ammo, totalDamage) {
    if (totalDamage === undefined) {
      if (ammo.damage === undefined) {
        throw 'Must pass damage in ammo object or separately.'
      }
      totalDamage = ammo.damage
    }
    if (this.currentHitPoints <= 0) {
      return
    }
    this.takeHit(ammo.type)
    let armourRatio = parseFloat(this.currentArmour) / this.maxArmour
    if (ammo.armourPiercing) {
      armourRatio /= 3 // ensure less damage goes to armour
    }
    const armourDamage = Math.min(totalDamage * armourRatio, this.currentArmour)
    this.currentArmour -= armourDamage
    const hpDamage = totalDamage - armourDamage
    this.currentHitPoints = Math.max(this.currentHitPoints - hpDamage, 0)

    if (this.currentHitPoints <= 0) {
      if (ammo.type === 'burning') { // handle profit in case of passive damage
        const attacker = this.burningInfo.attacker
        if (attacker) {
          // @TODO This hardcodes attackers being towers. Ideally this is more generic.
          const tower = this.game.towers.byId[attacker]
          tower.killEnemy(this.killValue)
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
    // @TODO @FIXME This is a bit awkward because it's not ammo doing the damage.
    const burn = { type: 'burning', damage: this.burningInfo.dps }
    this.takeDamage(burn)
    this.burningInfo.cooldown && this.burningInfo.cooldown.tick()
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

  @action ignite(attacker, killProfitMultiplier, dps, time) {
    this.setBurningCooldown(time)

    this.burning = true
    this.burningInfo.killProfitMultiplier = killProfitMultiplier
    if (dps > this.burningInfo.dps) {
      this.burningInfo.dps = dps // override only if higher dps
    }
    this.burningInfo.attacker = attacker.id
  }

  setBurningCooldown(time = 0) {
    if (time === 0) { return }
    if (this.burningInfo.cooldown) {
      this.burningInfo.cooldown.reset()
    } else {
      this.burningInfo.cooldown = Cooldown.createTimeBased(time, GAME_REFRESH_RATE, {
        callback: function() {
          this.extinguish()
          delete this.burningInfo.cooldown
        }.bind(this),
        autoActivate: true,
        delayActivation: true,
      })
    }
  }

  @action extinguish() {
    this.burning = false
    this.burningInfo.killProfitMultiplier = 0 // reset just in case
    this.burningInfo.dps = 0 // reset just in case
    this.burningInfo.attacker = undefined
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

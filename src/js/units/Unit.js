
import { observable, computed, action, autorun } from 'mobx'

import { GAME_REFRESH_RATE } from '../appConstants'
import Cooldown from '../Cooldown'
import Entity from './Entity'

class Unit extends Entity {
  @observable name
  @observable type

  @observable maxHitPoints
  @observable currentHitPoints
  @observable maxArmour
  @observable currentArmour
  @observable burning = false
  @observable burningInfo = {
    killProfitMultiplier: 1,
    dps: 0,
  }
  @observable hitBy = null
  @observable maxShields = 0
  @observable currentShields = 0

  constructor(game, options) {
    super(game)
    options = options || {}
    this.type = 'Unit' // should be overwritten

    // override defaults // @TODO Remove this if not being used
    for (let key in options) {
      if (options.hasOwnProperty(key)) {
        this[key] = options[key]
      }
    }
  }

  // handle any actions that are global to all unit types
  @action act() {
    this.clearHit()
    this.handleEffects()
  }

  /*
   * Makes the unit to receive an attack (delivered by ammo).
   * Can optionally specific damage. Will override ammo attack power.
   * Returns true if the unit is killed.
   */
  @action receiveAttack(ammo, damage) {
    if (this.currentHitPoints <= 0) {
      return
    }

    if (damage === undefined) {
      if (ammo.damage === undefined) {
        throw 'Must pass damage in ammo object or separately.'
      }
      damage = ammo.damage
    }

    this.takeHit(ammo.type)
    return this.takeDamage(damage, ammo.type, ammo.armourPiercing)
  }

  /*
   * Forces the unit to take damage. Will divide it between armour and HP.
   * Returns true if the unit is killed.
   */
  @action takeDamage(damage, type, armourPiercing) {
    // const shieldDamage = Math.min(damage, this.currentShields)
    // let undealtShieldDamage = damage - shieldDamage
    // this.currentShields -= shieldDamage
    const undealtShieldDamage = this.damageShields(damage, type)
    const armourDamageRatio = this.getArmourDamageRatio(armourPiercing)
    const armourDamageAllocation = undealtShieldDamage * armourDamageRatio
    let undealtArmourDamage = this.damageArmour(armourDamageAllocation, type)
    return this.damageHP(undealtShieldDamage - armourDamageAllocation + undealtArmourDamage, type)
  }

  /*
   * Damages the HP specifically. Will also handle its death if needed.
   * Returns true if the unit is killed.
   */
  @action damageHP(damage, type) {
    // @TODO Should eventually deal more or less damage depending on type
    this.currentHitPoints = Math.max(this.currentHitPoints - damage, 0)
    return this.handleDeath(type)
  }

  /*
   * Damages the armour specifically.
   * If the armour is used up, the excess damage is returned to be later
   * applied to HP.
   * NOTE: Must return base undealt damage (before bonuses/penalties).
   */
  @action damageArmour(damage, type) {
    const actualBaseDamage = Math.min(damage, this.currentArmour)
    // most damage types should be less effective against armour than HP
    let damageDealt = actualBaseDamage / 2
    if (type === 'fire' || type === 'burning') {
      damageDealt /= 20
    }
    this.currentArmour -= damageDealt
    return damage - actualBaseDamage
  }

  /*
   * Damages the unit's shields. The excess damage is returned to be applied
   * to the next layer of the unit.
   * NOTE: Must return base undealt damage (before bonuses/penalties).
   */
  @action damageShields(damage, type) {
    // @TODO Should eventually deal more or less damage depending on type
    const shieldDamage = Math.min(damage, this.currentShields)
    let undealtShieldDamage = damage - shieldDamage
    this.currentShields -= shieldDamage
    return undealtShieldDamage
  }

  /*
   * Returns the ratio at which the armour will soak damage.
   */
  getArmourDamageRatio(armourPiercing) {
    let armourRatio = parseFloat(this.currentArmour) / this.maxArmour
    if (armourPiercing) {
      armourRatio /= 3 // ensure less damage goes to armour
    }
    return armourRatio
  }

  /*
   * Kills a unit if need be. Returns true if it did.
   */
  handleDeath(damageType) {
    if (this.currentHitPoints > 0) { return }
    this.handlePassiveKillReward(damageType)
    this.kill()
    return true
  }

  /*
   * Provides kill rewards for when the unit is killed by passive effects
   * such as fire (in contrast to being hit with ammo).
   */
  handlePassiveKillReward(damageType) {
    // @TODO Ideally this checks whether the damage is 'passive', not just burning
    if (damageType === 'burning') { // handle profit in case of passive damage
      // @TODO @NOTE burningInfo.attacker is never cleaned up if tower is sold.
      const attacker = this.burningInfo.attacker
      // @TODO This hardcodes attackers being towers. Ideally this is more generic.
      const tower = this.game.towers.byId[attacker]

      if (!attacker || !tower) {
        const multiplier = this.burningInfo.killProfitMultiplier
        return this.game.profit(this.killValue.credits * multiplier)
      }

      return tower.killEnemy(this.killValue)
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

}

export default Unit

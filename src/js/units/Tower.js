
import { observable, computed, action, autorun } from 'mobx'

import { GRID_SIZE, GAME_REFRESH_RATE } from '../appConstants'
import Unit from './Unit'
import Cooldown from '../Cooldown'

export default class Tower extends Unit {
  // default stats
  @observable target
  @observable placed = false // towers generally start unplaced and become placed

  // @NOTE All of the below must be overwritten on every Tower!
  @observable name
  @observable type
  @observable attackPower
  @observable firingTime
  @observable range // pixels
  @observable purchaseCost
  @observable killProfitMultiplier // certain towers can gain extra credits when killing units
  @observable clipSize
  @observable reloadTime


  // default size: 1 tile
  @observable width = GRID_SIZE
  @observable height = GRID_SIZE

  constructor(game, options) {
    super(game, options)

    this.type = 'Tower'
    this.disabled = true // towers start unplaced and disabled
    this.display = false // towers start invisible due to being unplaced
  }

  setCooldowns() {
    // note that a change of firingTime will not affect the firingTimeCooldown automatically! (@TODO fix this)
    this.firingTimeCooldown = Cooldown.createTimeBased(this.firingTime, GAME_REFRESH_RATE)
    this.ammoCooldown = new Cooldown(this.clipSize, {
      delayActivation: true,
    })
    this.reloadCooldown = Cooldown.createTimeBased(this.reloadTime, GAME_REFRESH_RATE, {
      delayActivation: true,
    })
  }

  /*
   * Generally prepares the unit for actual use in-game.
   */
  @action place() {
    this.setCooldowns()
    this.enable()
    this.placed = true
  }

  act() {
    this.firingTimeCooldown.tick()
    if (this.canAttack()) {
      this.attack()
      this.firingTimeCooldown.activate()
      this.expendAmmo()
    } else if (this.reloading) {
      this.attemptReload()
    }
  }

  expendAmmo() {
    this.ammoCooldown.tick()
    if (this.ammoCooldown.spent()) {
      this.reloading = true
      this.ammoCooldown.activate()
    }
  }

  attemptReload() {
    this.reloadCooldown.tick()
    if (this.reloadCooldown.ready()) {
      this.reloading = false
      this.reloadCooldown.activate()
    }
  }

  canAttack() {
    return this.firingTimeCooldown.ready() && !this.reloading
  }

  @action selectTarget() {
    if (!this.target || !this.targetIsValid()) {
      this.target = this.findNearestEnemyInRange()
    }
  }

  /*
   * Attacks the current target if possible.
   * Returns the target if still alive.
   */
  @action attack() {
    this.selectTarget()
    if (!this.target) { return }

    var targetValue = this.target.killValue
    const killedUnit = this.target.takeDamage(this.attackPower)
    if (killedUnit) {
      // console.log('Killed enemy!');
      // do cool stuff! Add experience? Make money? Mow the lawn?
      this.game.profit(targetValue * this.killProfitMultiplier)
      return
    }
    return this.target
  }

  targetIsValid() {
    // test that the target even has an isAlive function
    // -> must be a server-updated target that no longer exists
    return this.target && this.target.isAlive && this.unitInRange(this.target) && this.target.isAlive()
  }

  unitInRange(unit) {
    return this.distanceToUnit(unit) < this.range
  }

  findNearestEnemyInRange() {
    // @TODO Target down enemies with less health?
    let nearest, minDistance

    this.game.enemies.forEach((enemy) => {
      const enemyDistance = this.distanceToUnit(enemy)
      if (enemy.isAlive() && this.unitInRange(enemy) && (nearest === undefined || enemyDistance < minDistance)) {
        nearest = enemy
        minDistance = enemyDistance
      }
    })
    return nearest
  }

  distanceToUnit(target) {
    return target.getDistanceToPoint(this.getCentre())
  }
}

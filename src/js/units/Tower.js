
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
  @observable baseAttackPower
  @observable firingTime
  @observable range = {}
  @observable purchaseCost
  @observable killProfitMultiplier // certain towers can gain extra credits when killing units
  @observable clipSize
  @observable reloadTime

  @observable isFiring = false
  @observable ammo = {
    type: 'bullet',
  }

  // tower performance data
  @observable kills = 0
  @observable xp = 0
  @observable level = 1

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
    super.act()
    this.resetFiring()
    this.firingTimeCooldown.tick()
    if (this.canAttack()) {
      this.attack()
      this.firingTimeCooldown.activate()
      this.expendAmmo()
    } else if (this.reloading) {
      this.attemptReload()
    }
  }

  @action resetFiring() {
    this.isFiring = false
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
      this.setTarget(this.findNearestEnemyInRange())
    }
  }

  @action setTarget(target) {
    this.target = target
  }

  /*
   * Attacks the current target if possible.
   * Returns the target if still alive.
   */
  @action attack() {
    this.selectTarget()
    if (!this.target) { return }
    this.isFiring = true

    return this.damageEnemy(this.target)
  }

  @action damageEnemy(enemy) {
    var targetValue = enemy.killValue
    const killedUnit = enemy.takeDamage(this.ammo.damage, this.ammo)
    if (!killedUnit) { return enemy }

    this.killEnemy(targetValue)
    return
  }

  @action killEnemy(enemyValue) {
    this.game.profit(enemyValue.credits * this.killProfitMultiplier)
    this.kills++
    this.xp += enemyValue.xp
    this.checkLevel()
  }

  @action checkLevel() {
    /**
     * Calculations based on 100xp for level 1 -> 2, each subsequent level
     * requiring 1.15x the xp of the previous level (115, 132, etc.)
     *
     * Cumulative xp = (1st level xp) * (1 - (1+r) ^ (level - 1)) / (-r)
     * Re-arranged to convert xp --> level, as below
     */
    const currentLevel = this.Level
    this.level = Math.floor(1 + Math.log(1 + 0.0015 * this.xp) / Math.log(1.15))
    if (currentLevel !== this.level) {
      this.updateStats()
    }
  }

  @action updateStats() {
    this.ammo.damage = this.baseAttackPower * Math.pow(1.05, this.level - 1)
    this.range.current = this.range.base * Math.pow(1.01, this.level - 1)
  }

  targetIsValid() {
    // test that the target even has an isAlive function
    // -> must be a server-updated target that no longer exists
    return this.target && this.target.isAlive && this.target.isAlive() && this.unitInRange(this.target)
  }

  unitInRange(unit) {
    return this.distanceToUnit(unit) < this.range.current
  }

  findNearestEnemyInRange() {
    // @TODO Target down enemies with less health?
    let nearest, minDistance

    this.game.enemies.all.forEach((enemy) => {
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

  getSellValue() {
    return Math.floor(this.purchaseCost / 2)
  }

  /*
   * Returns the top-left coordinate of the tower.
   * Needed because coordinates are based on the centre point.
   * Note that towers can only be on grid lines.
   */
  getTopLeft() {
    const halfGridWidth = this.width / 2 - ((this.width / 2) % GRID_SIZE)
    const halfGridHeight = this.height / 2 - ((this.height / 2) % GRID_SIZE)
    return {
      x: this.x - halfGridWidth,
      y: this.y - halfGridHeight,
    }
    return {
      x: Math.floor(this.width / 2 - (this.width / 2) % GRID_SIZE),
      y: Math.floor(this.height / 2 - (this.height / 2) % GRID_SIZE),
    }
    return {
      x: this.x - Math.floor(this.width / 2),
      y: this.y - Math.floor(this.height / 2),
    }
  }
}

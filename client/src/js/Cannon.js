
import { observable, computed, action, autorun } from 'mobx'

import { GRID_SIZE, UNIT_REFRESH_RATE } from 'appConstants'
import Unit from 'Unit'

export default class Cannon extends Unit {
  @observable attackPower = 11
  @observable cooldownLength = 1000
  @observable cooldownStatus = 1000
  @observable range = 200 // pixels
  @observable target = undefined
  @observable purchaseCost = 25
  @observable placed = false // towers generally start unplaced and become placed
  @observable killProfitMultiplier = 1 // certain towers can gain extra credits when killing units

  constructor(game, options) {
    super(game, options)
    this.name = 'Cannon'
    this.width = GRID_SIZE * 3
    this.height = this.width
    this.updateLoopId = undefined
    this.disabled = true // towers start unplaced and disabled
    this.display = false // towers start invisible due to being unplaced
  }

  @action place() {
    this.enable()
    this.placed = true
  }

  @action enable() {
    super.enable()
    this.activate()
  }

  @action disable() {
    super.disable()
    this.deactivate()
  }

  deactivate() {
    clearInterval(this.updateLoopId)
    delete this.updateLoopId
  }

  activate() {
    this.updateLoopId = setInterval(() => {
      this.updateCooldown()
      if (this.canAttack()) {
        this.attack()
      }
    }, UNIT_REFRESH_RATE)
  }

  canAttack() {
    return this.cooldownStatus === this.cooldownLength
  }

  updateCooldown() {
    this.cooldownStatus = Math.min(this.cooldownStatus + UNIT_REFRESH_RATE, this.cooldownLength)
  }

  resetCooldown() {
    this.cooldownStatus = 0
  }

  @action attack() {
    if (!this.target || !this.targetIsValid()) {
      this.target = this.findNearestEnemyInRange()
      if (!this.target) { return }
    }

    var targetValue = this.target.killValue
    const killedUnit = this.target.takeDamage(this.attackPower)
    if (killedUnit) {
      // do cool stuff! Add experience? Make money? Mow the lawn?
      this.game.profit(targetValue * this.killProfitMultiplier)
    }
    this.resetCooldown()
  }

  targetIsValid() {
    return this.unitInRange(this.target) && this.target.isAlive()
  }

  unitInRange(unit) {
    return this.distanceToTarget(unit) <= this.range
  }

  findNearestEnemyInRange() {
    let nearest, minDistance

    this.game.enemies.forEach((enemy) => {
      if (enemy.isAlive() && this.unitInRange(enemy) && (nearest === undefined || this.distanceToTarget(enemy) < minDistance)) {
        nearest = enemy
        minDistance = this.distanceToTarget(enemy)
      }
    })
    return nearest
  }

  distanceToTarget(target) {
    return this.getDistanceToPoint(target.x, target.y)
  }
}

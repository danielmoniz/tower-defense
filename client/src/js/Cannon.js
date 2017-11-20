
import { observable, computed, action, autorun } from 'mobx'

import { GRID_SIZE, UNIT_REFRESH_RATE } from 'appConstants'
import Unit from 'Unit'

export default class Cannon extends Unit {
  @observable attackPower = 11
  @observable cooldownLength = 1000
  @observable cooldownStatus = 1000
  @observable range = 200 // pixels
  @observable target = undefined

  constructor(options) {
    super(options)
    this.name = 'Cannon'
    this.width = GRID_SIZE * 3
    this.height = this.width
    this.updateLoopId = undefined
  }

  @action enable() {
    super.enable()
    this.updateLoopId = setInterval(() => {
      this.updateCooldown()
      if (this.canAttack()) {
        this.attack()
      }
    }, UNIT_REFRESH_RATE)
  }

  @action disable() {
    super.disable()
    clearInterval(this.updateLoopId)
    delete this.updateLoopId
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

  validateTarget() {
    if (this.target) {}
  }

  attack() {
    if (!this.target || !this.targetIsValid()) {
      this.target = this.findNearestEnemyInRange()
      if (!this.target) { return }
    }

    this.target.takeDamage(this.attackPower)
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

    this.enemies.forEach((enemy) => {
      if (enemy.isAlive() && this.unitInRange(enemy) && (nearest === undefined || this.distanceToTarget(enemy) < minDistance)) {
        nearest = enemy
        minDistance = this.distanceToTarget(enemy)
      }
    })
    return nearest
  }

  distanceToTarget(target) {
    return Math.sqrt(Math.pow(this.x - target.x, 2) + Math.pow(this.y - target.y, 2))
  }
}

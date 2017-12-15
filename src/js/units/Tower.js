
import { observable, computed, action, autorun } from 'mobx'

import { GRID_SIZE, GAME_REFRESH_RATE } from '../appConstants'
import Unit from './Unit'
import Cooldown from '../Cooldown'

export default class Tower extends Unit {
  // default stats
  @observable attackPower = 0
  @observable cooldownLength = 1000
  @observable range = 300 // pixels
  @observable target
  @observable purchaseCost = 100
  @observable placed = false // towers generally start unplaced and become placed
  @observable killProfitMultiplier = 1 // certain towers can gain extra credits when killing units

  // default size: 1 tile
  @observable width = GRID_SIZE
  @observable height = GRID_SIZE

  constructor(game, options) {
    super(game, options)

    this.disabled = true // towers start unplaced and disabled
    this.display = false // towers start invisible due to being unplaced

    // note that a change of cooldownLength will not affect the cooldown automatically! (@TODO fix this)
    this.cooldown = Cooldown.createTimeBased(this.cooldownLength, GAME_REFRESH_RATE)
  }

  @action place() {
    this.enable()
    this.placed = true
  }

  act() {
    this.cooldown.tick()
    if (this.canAttack()) {
      this.attack()
      this.cooldown.activate()
    }
  }

  canAttack() {
    return this.cooldown.ready()
  }

  @action selectTarget() {
    if (!this.target || !this.targetIsValid()) {
      this.target = this.findNearestEnemyInRange()
    }
  }

  @action attack() {
    this.selectTarget()
    if (!this.target) { return }

    var targetValue = this.target.killValue
    const killedUnit = this.target.takeDamage(this.attackPower)
    if (killedUnit) {
      // console.log('Killed enemy!');
      // do cool stuff! Add experience? Make money? Mow the lawn?
      this.game.profit(targetValue * this.killProfitMultiplier)
    }
  }

  targetIsValid() {
    // test that the target even has an isAlive function
    // -> must be a server-updated target that no longer exists
    return this.target.isAlive && this.unitInRange(this.target) && this.target.isAlive()
  }

  unitInRange(unit) {
    return this.distanceToTarget(unit) <= this.range
  }

  findNearestEnemyInRange() {
    // @TODO Target down enemies with less health?
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

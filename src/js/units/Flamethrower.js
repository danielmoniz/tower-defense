
import { observable, computed, action, autorun } from 'mobx'

import { GRID_SIZE, GAME_REFRESH_RATE } from '../appConstants'
import Tower from './Tower'
import Cooldown from '../Cooldown'

export default class Flamethrower extends Tower {

  @observable isFiring = false

  constructor(game, options) {
    super(game, options)

    this.name = 'Flamethrower'

    this.attackPower = {
      base: 1,
      current: 1,
    }
    this.range = {
      base: 200,
      current: 200,
    }
    this.firingTime = 0
    this.clipSize = 30
    this.reloadTime = 2000
    this.killProfitMultiplier = 0.8
    this.purchaseCost = 30
    this.ammoType = 'fire'

    this.width = GRID_SIZE * 3
    this.height = GRID_SIZE * 3
  }

  @action attack() {
    this.selectTarget()
    if (!this.target) { return }
    this.isFiring = true

    const enemiesInCone = this.findEnemiesInCone()
    enemiesInCone.forEach((enemy) => {
      this.damageEnemy(enemy)
      enemy.ignite()
    })
  }

  findEnemiesInCone() {
    const enemies = []
    this.game.enemies.all.forEach((enemy) => {
      // @TODO Calculate whether enemy is in cone
      const enemyDistance = this.distanceToUnit(enemy)
      if (enemy.isAlive() && this.unitInRange(enemy)) {
        enemies.push(enemy)
      }
    })
    return enemies
  }

  @action damageEnemy(enemy) {
    var targetValue = enemy.killValue
    const killedUnit = enemy.takeDamage(this.attackPower.current, this.ammoType)
    if (!killedUnit) { return }

    // @TODO move these state changes into separate method
    this.game.profit(targetValue.credits * this.killProfitMultiplier)
    this.kills++
    this.xp += targetValue.xp
    this.checkLevel()
    return
  }

}

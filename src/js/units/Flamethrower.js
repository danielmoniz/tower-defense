
import { observable, computed, action, autorun } from 'mobx'

import { GRID_SIZE, GAME_REFRESH_RATE } from '../appConstants'
import Tower from './Tower'
import Cooldown from '../Cooldown'

export default class Flamethrower extends Tower {

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

    this.coneWidth = 0.5 // radians

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
      enemy.ignite(this, this.killProfitMultiplier)
    })
  }

  findEnemiesInCone() {
    // get tower's current facing angle
    const towerFacingAngle = this.getAngleToPoint(this.target.xFloor, this.target.yFloor)
    const enemies = []

    this.game.enemies.all.forEach((enemy) => {
      if (!enemy.isAlive() || !this.unitInRange(enemy)) { return }

      // get angle to enemy
      const angleToEnemy = this.getAngleToPoint(enemy.xFloor, enemy.yFloor)
      const minConeAngle = towerFacingAngle - (this.coneWidth / 2)
      const maxConeAngle = towerFacingAngle + (this.coneWidth / 2)
      if (angleToEnemy < maxConeAngle && angleToEnemy > minConeAngle) {
        enemies.push(enemy)
      }
    })
    return enemies
  }

}

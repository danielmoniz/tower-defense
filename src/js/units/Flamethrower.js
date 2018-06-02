
import { observable, computed, action, autorun } from 'mobx'

import { GRID_SIZE, GAME_REFRESH_RATE } from '../appConstants'
import Tower from './Tower'
import Cooldown from '../Cooldown'
import { degreesToRadians } from '../utility/angle'

export default class Flamethrower extends Tower {

  constructor(game, options) {
    super(game, options)

    this.name = 'Flamethrower'

    this.attackPower = {
      base: 1,
      current: 1,
      burning: {
        base: 1,
        current: 1,
      }
    }
    this.range = {
      base: 200,
      current: 200,
    }

    this.burningLength = {
      base: 0,
      current: 0,
    }

    this.firingTime = 0
    this.clipSize = 30
    this.reloadTime = 2000
    this.killProfitMultiplier = 0.8
    this.purchaseCost = 30
    this.ammo = {
      type: 'fire',
    }

    this.coneWidth = 20 // degrees

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
      enemy.ignite(this,
        this.killProfitMultiplier,
        this.attackPower.burning.current,
        this.burningLength.current,
      )
    })
  }

  findEnemiesInCone() {
    // get tower's current facing angle
    const coneAngle = degreesToRadians(this.coneWidth)
    const towerFacingAngle = this.getAngleToPoint(this.target.xFloor, this.target.yFloor)
    const enemies = []

    this.game.enemies.all.forEach((enemy) => {
      if (!enemy.isAlive() || !this.unitInRange(enemy)) { return }

      // get angle to enemy
      const angleToEnemy = this.getAngleToPoint(enemy.xFloor, enemy.yFloor)
      const minConeAngle = towerFacingAngle - (coneAngle / 2)
      const maxConeAngle = towerFacingAngle + (coneAngle / 2)
      if (angleToEnemy < maxConeAngle && angleToEnemy > minConeAngle) {
        enemies.push(enemy)
      }
    })
    return enemies
  }

}

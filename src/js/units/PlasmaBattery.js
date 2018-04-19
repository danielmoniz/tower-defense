
import { observable, computed, action, autorun } from 'mobx'

import { GRID_SIZE, GAME_REFRESH_RATE } from '../appConstants'
import Tower from './Tower'
import Cooldown from '../Cooldown'

export default class PlasmaBattery extends Tower {

  constructor(game, options) {
    super(game, options)

    this.name = 'PlasmaBattery'

    this.attackPower = {
      base: 500,
      current: 500,
    }
    this.range = {
      base: 300,
      current: 300,
    }
    this.firingTime = 2000
    this.clipSize = 2
    this.reloadTime = 5000
    this.killProfitMultiplier = 1
    this.purchaseCost = 50
    this.ammoType = 'shell'

    this.explosionRadius = 100 // pixels

    this.width = GRID_SIZE * 4
    this.height = GRID_SIZE * 4
  }

  @action attack() {
    // super.attack()
    this.selectTarget()
    if (!this.target) { return }
    this.isFiring = true

    // damage enemies around target within this.explosionRadius
    const enemiesInExplosionData = this.findEnemiesInRadius(this.explosionRadius, this.target)
    enemiesInExplosionData.forEach((enemyData) => {
      this.damageEnemyWithExplosion(enemyData.enemy, enemyData.distance)
      // enemy.ignite()
    })

    // @TODO Should damage units decreasingly by distance from explosion
  }

  findEnemiesInRadius(radius, location) {
    const enemies = []
    this.game.enemies.all.forEach((enemy) => {
      if (!enemy.isAlive()) { return }

      const xDistance = Math.abs(location.x - enemy.x)
      const yDistance = Math.abs(location.y - enemy.y)
      const distance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2))
      if (distance < radius) {
        enemies.push({ enemy, distance })
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

  @action damageEnemyWithExplosion(enemy, distance) {
    var targetValue = enemy.killValue
    const damage = this.calculateExplosionDamage(
      this.attackPower.current,
      distance,
      this.explosionRadius,
    )
    const killedUnit = enemy.takeDamage(damage, this.ammoType)
    if (!killedUnit) { return }

    // @TODO move these state changes into separate method
    this.game.profit(targetValue.credits * this.killProfitMultiplier)
    this.kills++
    this.xp += targetValue.xp
    this.checkLevel()
    return
  }

  calculateExplosionDamage(maxDamage, distance, radius) {
    if (distance <= radius / 5) {
      console.log(maxDamage);
      return maxDamage
    }
    const ratio = radius / distance
    return maxDamage * ratio / 5
  }

}

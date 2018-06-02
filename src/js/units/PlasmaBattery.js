
import { observable, computed, action, autorun } from 'mobx'

import { GRID_SIZE, GAME_REFRESH_RATE } from '../appConstants'
import Tower from './Tower'
import Cooldown from '../Cooldown'

export default class PlasmaBattery extends Tower {

  constructor(game, options) {
    super(game, options)

    this.name = 'PlasmaBattery'

    this.attackPower = {
      base: 20,
      current: 20,
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
    this.ammo = {
      type: 'shell',
      armourPiercing: true,
    }
    this.armourPiercing = true

    this.explosion = {
      radius: 100,
      type: 'explosion',
    }

    this.width = GRID_SIZE * 4
    this.height = GRID_SIZE * 4
  }

  @action attack() {
    // @TODO
     // Separate direct hit damage from explosion damage.
     // That is, the target should receive both, and all other enemies within
     // the explosion radius are hit only with the explosion.


    // super.attack()
    this.selectTarget()
    if (!this.target) { return }
    this.isFiring = true

    // damage enemies around target within this.explosionRadius
    const enemiesInExplosionData = this.findEnemiesInRadius(this.explosion.radius, this.target)
    enemiesInExplosionData.forEach((enemyData) => {
      // target hit directly; others hit by 'explosion'
      if (enemyData.enemy === this.target) {
        this.damageEnemy(this.target)
      } else {
        this.damageEnemyWithExplosion(enemyData.enemy, enemyData.distance)
      }
    })
  }

  /*
   * @TODO Use a quadtree to more efficiently find enemies in radius
   */
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

  @action damageEnemyWithExplosion(enemy, distance) {
    var targetValue = enemy.killValue
    const damage = this.calculateExplosionDamage(
      this.attackPower.current,
      distance,
      this.explosion.radius,
    )
    const killedUnit = enemy.takeDamage(damage, this.explosion)
    if (!killedUnit) { return }

    this.killEnemy(targetValue)
    return
  }

  calculateExplosionDamage(maxDamage, distance, radius) {
    if (distance <= radius / 5) {
      return maxDamage
    }
    const ratio = radius / distance
    return maxDamage * ratio / 5
  }

}

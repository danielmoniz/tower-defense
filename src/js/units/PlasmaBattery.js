
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
    this.firingTime = 1000
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
    const enemiesInExplosion = this.findEnemiesInRadius(this.explosionRadius, this.target)
    enemiesInExplosion.forEach((enemy) => {
      this.damageEnemy(enemy)
      // enemy.ignite()
    })

    // @TODO Should damage units decreasingly by distance from explosion


    // this.selectTarget()
    // if (!this.target) { return }
    // this.isFiring = true
    //
    // const enemiesInCone = this.findEnemiesInCone()
    // enemiesInCone.forEach((enemy) => {
    //   this.damageEnemy(enemy)
    //   enemy.ignite()
    // })
  }

  findEnemiesInRadius(radius, location) {
    const enemies = []
    this.game.enemies.all.forEach((enemy) => {
      if (!enemy.isAlive()) { return }
      console.log(location.x);
      if (Math.abs(location.x - enemy.x) < radius && Math.abs(location.y - enemy.y) < radius) {
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

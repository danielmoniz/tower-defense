
import { observable, computed, action, autorun } from 'mobx'

import Game from './Game'
import GameRenderer from '../client/renderers/GameRenderer'
import Unit from '../units/Unit'
import Cannon from '../units/Cannon'

class ClientGame extends Game {

  constructor(emitter, actions) {
    super(emitter, actions)
    this.setupUI()
  }

  setupUI() {
    this.renderer = new GameRenderer(this)
  }

  renderEnemies(enemies) {
    enemies.forEach((enemy) => this.renderer.renderEntity(enemy))
  }

  spawnWave() {
    const newEnemies = super.spawnWave()
    this.renderEnemies(newEnemies)
    return newEnemies
  }

  /*
   * Selects a new (disabled/inactive) cannon to be placed on the map.
   */
  selectNewCannon() {
    if (!this.inProgress) { return }
    this.placingTower = new Cannon(this)
    this.renderer.renderTower(this.placingTower)
    return this.placingTower
  }

  sendPause() {
    this.pause()
  }

  sendPlay() {
    this.play()
  }

  sendPlaceTower(tower) {
    return this.placeTower(tower)
  }

  /*
   * Place a tower as normal, but render it as well.
   */
  placeTower(tower) {
    tower = super.placeTower(tower)
    if (!tower) { return }
    this.renderer.renderTower(tower)
    return tower
  }

  spawnWaveEarly() {}

  /*
   * Add and render enemies to the game given data describing those enemies.
   */
  addEnemies(enemies) {
    enemies.forEach((enemyData) => {
      if (enemyData.currentHitPoints <= 0) { return }
      // @TODO Allow for other unit types\
      const EnemyType = this.UNIT_TYPES['Tank']
      let enemy = new EnemyType(this, enemyData.name)
      this.buildEntityFromData(enemy, enemyData)

      // @TODO? if enemy has no health, maybe have to kill enemy
      this.renderer.renderEnemy(enemy)
      this.enemies.push(enemy)
      const enemyTarget = this.getEnemyGoal(enemy)
      enemy.setMoveTarget(enemyTarget.x, enemyTarget.y)
    })
  }

  /*
   * Add and render towers to the game given data describing those enemies.
   */
  addTowers(towers) {
    towers.forEach((towerData) => {
      // @TODO Allow for other tower types
      const TowerType = this.UNIT_TYPES['Cannon']
      let tower = new TowerType(this, towerData.name)
      this.buildEntityFromData(tower, towerData)

      this.renderer.renderTower(tower)
      tower.selectTarget() // unnecessary, but can be smoother
      tower.cooldown.setTicksPassed(towerData.cooldown.ticksPassed)
      this.towers.push(tower)
    })
  }

}

export default ClientGame


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
    this.renderer = new GameRenderer(this, {
      getEnemies: this.getEnemies.bind(this),
      getUnits: this.getUnits.bind(this),
    })
  }

  start() {
    super.start()
    this.renderer.tick()
  }

  /*
   * Selects a new (disabled/inactive) cannon to be placed on the map.
   */
  selectNewTower(towerType) {
    if (!this.inProgress) { return }
    const TowerType = this.UNIT_TYPES[towerType]
    this.placingTower = new TowerType(this)
    this.renderer.queueRender(this.placingTower)
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
    this.renderer.queueRender(tower)
    return tower
  }

  spawnWaveEarly() {}


  @action updateAll(data) {
    console.log('Updating all');
    this.clearEnemies()
    this.addEnemies(data.enemies)
    // Below is an attempt to update existing enemies instead of rebuilding them
    // data.enemies.forEach((enemy) => {
    //   if (enemy.id in this.enemiesById) {
    //     this.buildEntityFromData(this.enemiesById[enemy.id], enemy)
    //   } else {
    //     this.addEnemy(enemy)
    //   }
    // })
    // @TODO Handle case where the game has extra enemies the server did not?
    // --> May not need to because enemies are spawned via waves (not player actions)

    this.clearTowers()
    this.addTowers(data.towers)

    this.credits.current = data.credits
    this.wave.setNumber(data.waveNumber)
    this.inProgress = data.inProgress
    this.control.run = data.control.run
    if (this.inProgress && this.control.run) {
      this.play()
    } else {
      this.pause()
    }
  }

  /*
   * Add and render enemies to the game given data describing those enemies.
   */
  addEnemies(enemies) {
    enemies.forEach((enemyData) => {
      this.addEnemy(enemyData)
    })
  }

  deselectPlacingTower() {
    if (this.placingTower) {
      this.renderer.destroyEntity(this.placingTower)
      this.placingTower = false
    }
  }

  deselectAll() {
    this.deselectPlacingTower()
    this.deselectEntity()
    if (this.selectedEntity) {
      this.selectedEntity.deselect()
      delete this.selectEntity
    }
  }

  deselectEntity() {
    if (this.selectedEntity) {
      this.selectedEntity.deselect()
      delete this.selectEntity
    }
  }

  selectEntity(entity) {
    this.deselectEntity()
    entity.select()
    this.selectedEntity = entity
  }

  addEnemy(enemyData) {
    if (enemyData.currentHitPoints <= 0) { return }
    // @TODO Allow for other unit types\
    const EnemyType = this.UNIT_TYPES['Tank']
    let enemy = new EnemyType(this, enemyData.name)
    this.buildEntityFromData(enemy, enemyData)

    this.enemies.push(enemy)
    const enemyTarget = this.getEnemyGoal(enemy)
    enemy.setMoveTarget(enemyTarget.x, enemyTarget.y)

    this.renderer.queueRender(enemy)
    return enemy
  }

  /*
   * Add and render towers to the game given data describing those enemies.
   */
  addTowers(towers) {
    towers.forEach((towerData) => {
      const TowerType = this.UNIT_TYPES[towerData.name]
      let tower = new TowerType(this, towerData.name)
      this.buildEntityFromData(tower, towerData)

      // @TODO Refactor setting of cooldown ticksPassed
      tower.setCooldowns()
      tower.selectTarget() // makes towers pick a (new) target, making it look more continuous
      tower.firingTimeCooldown.setTicksPassed(towerData.firingTimeCooldown.ticksPassed)
      tower.ammoCooldown.setTicksPassed(towerData.ammoCooldown.ticksPassed)
      tower.reloadCooldown.setTicksPassed(towerData.reloadCooldown.ticksPassed)
      this.towers.push(tower)
      this.renderer.queueRender(tower)
    })
  }

}

export default ClientGame

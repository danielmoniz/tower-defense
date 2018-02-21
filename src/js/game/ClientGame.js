
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
  @action selectNewTower(towerType) {
    if (!this.inProgress) { return }
    this.deselectAll()
    const TowerType = this.TOWER_TYPES[towerType]
    this.placingTower = new TowerType(this)
    this.selectedEntity = this.placingTower
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

  sendSellTower(tower) {
    this.sellTower(tower)
  }

  spawnWaveEarly() {}


  @action updateAll(data) {
    console.log('Updating all');
    this.enemies.clear()
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

    // this.towers.clear()
    // this.addTowers(data.towers)
    // @TODO Handle towers that exist here but not on the server
    this.updateTowers(data.towers)
    this.removeTowers(data.towers)



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

  @action deselectPlacingTower() {
    if (this.placingTower) {
      this.renderer.destroyEntity(this.placingTower)
      this.placingTower = false
    }
  }

  @action deselectAll() {
    this.deselectPlacingTower()
    this.deselectEntity()
  }

  @action deselectEntity() {
    if (this.selectedEntity) {
      this.selectedEntity.deselect()
      this.selectedEntity = null
    }
  }

  @action selectEntity(entity) {
    if (this.placingTower) {
      return
    }
    this.deselectEntity()
    entity.select()
    this.selectedEntity = entity
  }

  addEnemy(enemyData) {
    if (enemyData.currentHitPoints <= 0) { return }
    let enemy = this.createEnemy(enemyData.enemyType, enemyData.subtype)
    this.buildEntityFromData(enemy, enemyData)

    this.enemies.add(enemy)
    const enemyTarget = this.getEnemyGoal(enemy)
    enemy.setMoveTarget()

    this.renderer.queueRender(enemy)
    return enemy
  }

  removeTowers(towers) {
    const serverTowersById = {}
    towers.forEach((tower) => {
      serverTowersById[tower.id] = tower
    })

    console.log('Server towers:', towers.length);
    console.log('Client towers:', this.towers.all.length);
    for (let i = this.towers.all.length - 1; i >= 0; i--) {
      const tower = this.towers.all[i]
      console.log(tower.id);
      console.log();
      if (!(tower.id in serverTowersById)) {
        console.log("Removed tower with ID:", tower.id);
        // @TODO Recalculate pathing - there should be a reset/recalculate weights function
        this.pathHelper.removeObstacle(tower.getTopLeft(), tower.width, tower.height)
        this.towers.remove(i)
        tower.destroy()
      }
    }
  }

  /*
   * Update existing towers given data describing those towers.
   */
  updateTowers(towers) {
    // console.log('Number of towers on server:', towers.length);
    towers.forEach((towerData) => {
      let tower = this.towers.byId[towerData.id]
      let towerIsNew = false
      if (!tower) { // Create tower if needed
        // console.log('Tower is new. It has ID', towerData.id);
        towerIsNew = true
        const TowerType = this.UNIT_TYPES[towerData.name]
        tower = new TowerType(this, towerData.name)
      } else {
        // console.log('Tower already exists! It has ID', towerData.id);
      }
      // console.log(towerData);
      this.buildEntityFromData(tower, towerData)

      if (towerIsNew) {
        this.pathHelper.addObstacle(
          tower.getTopLeft(), tower.width, tower.height)
        this.towers.add(tower)
        tower.place()
        this.renderer.queueRender(tower)
      }

      // @TODO Refactor setting of cooldown ticksPassed
      tower.setCooldowns()
      tower.firingTimeCooldown.setTicksPassed(towerData.firingTimeCooldown.ticksPassed)
      tower.ammoCooldown.setTicksPassed(towerData.ammoCooldown.ticksPassed)
      tower.reloadCooldown.setTicksPassed(towerData.reloadCooldown.ticksPassed)

      if (tower.target && tower.target.id && this.enemies.byId[tower.target.id]) {
        tower.setTarget(this.enemies.byId[tower.target.id])
      } else {
        tower.selectTarget()
      }
    })
  }

}

export default ClientGame

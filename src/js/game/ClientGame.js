
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


  @action updateAll(data, serverTime) {
    console.log('Updating all');

    this.updateEnemies(data.enemies)
    // @TODO Remove enemies

    this.updateTowers(data.towers)
    this.removeTowers(data.towers, serverTime)

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
   * Update existing enemies given data describing those enemies.
   */
  updateEnemies(enemiesData) {
    enemiesData.forEach(this.updateEnemy.bind(this))
  }

  /*
   * Update/creates a single tower given data about that tower.
   * Useful for when the game updates and wave spawning.
   */
  updateEnemy(enemyData) {
    if (enemyData.currentHitPoints <= 0) { return }
    let enemy = this.enemies.byId[enemyData.id]

    let enemyIsNew = false
    if (!enemy) { // Create enemy if needed
      // console.log('Enemy is new. It has ID', enemyData.id);
      enemyIsNew = true
      enemy = this.createEnemy(enemyData.enemyType, enemyData.subtype)
    }
    // console.log(enemyData);
    this.buildEntityFromData(enemy, enemyData)

    if (enemyIsNew) {
      this.enemies.add(enemy)
      enemy.setMoveTarget()
      this.renderer.queueRender(enemy)
    }
  }

  addTower(tower) {
    const placed = super.addTower(tower)
    if (!placed) { return false }
    this.renderer.queueRender(tower)
    return tower
  }

  setTowerTarget(tower) {
    if (tower.target && tower.target.id && this.enemies.byId[tower.target.id]) {
      tower.setTarget(this.enemies.byId[tower.target.id])
    } else {
      tower.selectTarget()
    }
  }

  undoPlaceTower(tower) {
    const refund = tower.purchaseCost
    const success = this.removeTower(tower)
    if (!success) { return false }
    this.profit(refund)
    console.log("Refunded", refund, "for undoing tower placement.");
  }

  removeTower(towerData, towerIndex) {
    const tower = this.towers.byId[towerData.id]
    if (!tower) { return }
    // @FIXME @TODO Recalculate pathing - there should be a reset/recalculate weights function (at least for a specific area)
    this.pathHelper.removeObstacle(tower.getTopLeft(), tower.width, tower.height)
    if (towerIndex !== undefined) {
      this.towers.remove(towerIndex)
    } else {
      this.towers.removeByValue(tower)
    }
    tower.destroy()
    return true
  }

  removeTowers(towers, serverTime) {
    const clientTime = Date.now()
    const serverTowersById = {}
    towers.forEach((tower) => {
      serverTowersById[tower.id] = tower
    })

    for (let i = this.towers.all.length - 1; i >= 0; i--) {
      const tower = this.towers.all[i]
      const towerIsNew = tower.createdAt > serverTime
      if (towerIsNew) {
        console.log('Tower is new! Cannot remove. ID:', tower.id);
        continue
      }
      if (!(tower.id in serverTowersById)) {
        this.removeTower(tower, i)
      }
    }
  }

  /*
   * Update existing towers given data describing those towers.
   */
  updateTowers(towersData) {
    towersData.forEach(this.updateTower.bind(this))
  }

  /*
   * Update/creates a single tower given data about that tower.
   */
  updateTower(towerData) {
    let tower = this.towers.byId[towerData.id]

    let towerIsNew = false
    if (!tower) { // Create tower if needed
      // console.log('Tower is new. It has ID', towerData.id);
      towerIsNew = true
      const TowerType = this.TOWER_TYPES[towerData.name]
      tower = new TowerType(this, towerData.name)
    }
    // console.log(towerData);
    this.buildEntityFromData(tower, towerData)

    if (towerIsNew) {
      this.addTower(tower)
    }

    this.updateTowerCooldowns(tower, towerData)
    this.setTowerTarget(tower)
  }

  updateTowerCooldowns(tower, towerData) {
    // @TODO Refactor setting of cooldown ticksPassed
    tower.setCooldowns()
    tower.firingTimeCooldown.setTicksPassed(towerData.firingTimeCooldown.ticksPassed)
    tower.ammoCooldown.setTicksPassed(towerData.ammoCooldown.ticksPassed)
    tower.reloadCooldown.setTicksPassed(towerData.reloadCooldown.ticksPassed)
  }

}

export default ClientGame

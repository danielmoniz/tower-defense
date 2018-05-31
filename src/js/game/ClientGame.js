
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
    this.renderer.board.startGame(this)
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

  pause() {
    super.pause()
    this.renderer.pause()
  }

  sendPause() {
    this.pause()
  }

  play() {
    const play = super.play()
    if (!play) { return }
    this.renderer.play()
  }

  sendPlay() {
    this.play()
  }

  sendPlaceTower(tower) {
    console.log('sending placed tower');
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

  undoPlaceTower(tower) {
    const refund = tower.purchaseCost
    const success = this.removeTower(tower)
    if (!success) { return false }
    this.profit(refund)
    console.log("Refunded", refund, "for undoing tower placement.");
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

  /*
   * Set the currently selected tower to have a new target.
   */
  setSelectedTowerTarget(target) {
    const tower = this.selectedEntity
    if (!target || !tower || tower.type !== 'Tower') { return }
    this.sendSetTowerTarget(tower, target)
  }

  /*
   * Simply set the tower target. Inherit & override to send data to server.
   */
  sendSetTowerTarget(tower, target) {
    console.log('In sendSetTowerTarget');
    this.setTowerTarget(tower, target)
  }

  /*
   * Given a tower and a target object, sets the tower to have that target.
   * If a target is not passed, the tower tries to use data about its current
   * target to set the target (for multiplayer syncing).
   * If the tower also has no target, it attempts to select one.
   */
  setTowerTarget(tower, target) {
    if (target !== undefined) {
      return super.setTowerTarget(tower, target)
    }
    if (tower.target && tower.target.id && this.enemies.byId[tower.target.id]) {
      return tower.setTarget(this.enemies.byId[tower.target.id])
    }
    tower.selectTarget()
  }

  @action updateAll(data, serverTime) {
    console.log('Updating all');

    this.updateEnemies(data.enemies)
    this.removeEnemies(data.enemies)

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
    let enemy = this.enemies.byId[enemyData.id]

    let enemyIsNew = false
    if (!enemy) { // Create enemy if needed
      enemyIsNew = true
      enemy = this.createEnemy(enemyData.enemyType, enemyData.subtype)
    }

    this.buildEntityFromData(enemy, enemyData)
    this.updateBurningCooldown(enemy, enemyData)

    if (enemyIsNew) {
      this.enemies.add(enemy)
      enemy.setMoveTarget()
      this.renderer.queueRender(enemy)
    }
  }

  removeEnemies(enemiesData) {
    const enemiesToRemove = this.getRemovableUnits(enemiesData, this.enemies)
    enemiesToRemove.forEach((enemy, i) => {
      enemy.destroy()
      // NOTE: Do NOT remove enemy from this.enemies. It will not derender.
    })
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

    this.buildEntityFromData(tower, towerData)

    if (towerIsNew) {
      this.addTower(tower)
    }

    this.updateTowerCooldowns(tower, towerData)
    this.setTowerTarget(tower)
  }

  addTower(tower) {
    const placed = super.addTower(tower)
    if (!placed) { return false }
    this.renderer.queueRender(tower)
    return tower
  }

  updateTowerCooldowns(tower, towerData) {
    // @TODO Refactor setting of cooldown ticksPassed
    tower.setCooldowns()
    tower.firingTimeCooldown.setTicksPassed(towerData.firingTimeCooldown.ticksPassed)
    tower.ammoCooldown.setTicksPassed(towerData.ammoCooldown.ticksPassed)
    tower.reloadCooldown.setTicksPassed(towerData.reloadCooldown.ticksPassed)
    this.updateBurningCooldown(tower, towerData)
  }

  /*
   * Updates the burning cooldown for a unit.
   */
  updateBurningCooldown(unit, data) {
    if (!data.burningInfo.cooldown) { return }
    if (!unit.burningInfo.cooldown) {
      unit.setBurningCooldown(data.burningInfo.cooldown.cooldownLength)
    }
    unit.burningInfo.cooldown.setTicksPassed(data.burningInfo.cooldown.ticksPassed)
  }

  removeTowers(towersData, serverTime) {
    const clientTime = Date.now()
    const towersToRemove = this.getRemovableUnits(towersData, this.towers)
    towersToRemove.forEach((tower, i) => {
      const towerIsNew = tower.createdAt > serverTime
      if (towerIsNew) {
        console.log('Tower is new! Cannot remove. ID:', tower.id);
        return
      }
      this.removeTower(tower, i)
    })
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

  /*
   * Returns an array of units (ie. enemies or towers) whose IDs are
   * not in the provided unitsData. That is, they should be removed.
   */
  getRemovableUnits(unitsData, units) {
    const removableUnits = []

    const serverUnitsById = {}
    unitsData.forEach((unitData) => {
      serverUnitsById[unitData.id] = unitData
    })

    for (let i = units.all.length - 1; i >= 0; i--) {
      const unit = units.all[i]
      if (!(unit.id in serverUnitsById)) {
        removableUnits.push(unit)
      }
    }

    return removableUnits
  }

}

export default ClientGame

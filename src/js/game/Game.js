
import { observable, computed, action, autorun } from 'mobx'

import UnitManager from '../UnitManager'
import WaveSpawner from '../WaveSpawner'
import Cooldown from '../Cooldown'
import Performance from '../Performance'
import Unit from '../units/Unit'
import Cannon from '../units/Cannon'
import Flamethrower from '../units/Flamethrower'
import MachineGun from '../units/MachineGun'
import PlasmaBattery from '../units/PlasmaBattery'
import Enemy from '../units/Enemy'

import Pathing from '../map/Pathing'
import { GAME_REFRESH_RATE, GRID_SIZE } from '../appConstants'
import { setCorrectingInterval } from '../utility/time'
import { scaleEnemy } from '../units/Enemies'


export default class Game {
  @observable placingTower = false

  @observable gameCanvas = undefined
  @observable gameCanvasContext = undefined
  @observable credits = {
    start: 55,
    current: 55,
  }
  @observable lives = 20
  @observable inProgress = false

  @observable selectedEntity = null

  @observable control = {
    run: false,
    speedMultiplier: 1,
  }

  firstSpawnDelay = 3000

  height = 700
  width = 700

  constructor(emitter, actions) {
    this.actions = actions
    this.emitter = emitter


    this.TOWER_TYPES = { Cannon, Flamethrower, MachineGun, PlasmaBattery }

    this.enemies = new UnitManager()
    this.towers = new UnitManager()

    this.pathHelper = new Pathing(this, GRID_SIZE, this.getEndGoal(), {
      getEntranceZone: this.getEntranceZone.bind(this),
    })
    // this.pathHelper.setUpRandomMap()

    this.setUpWaveSpawner()
  }

  // to be overwritten by a subclass if another wave spawner is needed
  setUpWaveSpawner() {
    this.wave = new WaveSpawner(this.createEnemy.bind(this))
  }

  newGame() {
    this.start()
  }

  start() {
    if (this.inProgress) { return }
    this.inProgress = true
    this.reset()
    this.play()
    this.wave.initializeWaveTimer(GAME_REFRESH_RATE, this.firstSpawnDelay)
  }

  @action reset() {
    // @TODO Likely needs to be updated for proper New Game behaviour (terrain, etc.)
    this.wave.reset()
    this.lives = 20
    this.credits.current = this.credits.start
  }

  /*
   * Simply starts the game loop. Does NOT actually start the game.
   * Ie. play vs pause rather than starting a new game.
   */
  play() {
    if (this.control.run) { return }
    this.control.run = true
    this.initializeLoop()
    return true
  }

  @action pause() {
    this.control.run = false
  }

  initializeLoop() {
    // handle moving units, tower scanning, spawning waves, etc.
    return setCorrectingInterval(
      this.gameLogic.bind(this),
      GAME_REFRESH_RATE * this.control.speedMultiplier,
      this.control,
    )
  }

  /*
   * The core logic for the game.
   * Called as part of the game loop. Should likely never be called separately.
   */
  gameLogic() {
    this.updateWave()
    // @TODO Pass the enemies or towers unit manager
    this.commandEnemies(this.enemies)
    this.commandTowers(this.towers)
    if (this.lives <= 0) {
      this.endGame()
      this.actions.destroyGame() // could possibly pass scores/end-state here
    }
  }

  @action loseLife() {
    return --this.lives
  }

  /*
   * Causes enemies to act. Removes them when needed.
   * Detects when a unit has completed its objective and subtracts a life.
   * Accepts a UnitManager object containing the enemies.
   */
  commandEnemies(unitManager) {
    for (let i = unitManager.all.length - 1; i >= 0; i--) {
      let unit = unitManager.all[i]
      const shiftedExit = this.getTileCoordinate(this.getEndGoal())
      const distanceFromExit = unit.getDistanceToPoint(shiftedExit)
      if (distanceFromExit < 3) { // assume it also has `removeMe = true`
        unit.complete()
        const livesLeft = this.loseLife()
        console.log(`Unit reached goal! Remaining lives: ${livesLeft}`);
      }
      if (unit.removeMe) {
        unitManager.remove(i)
        continue
      }
      if (!unit.disabled && unit.act) {
        const nextTargetLocation = this.pathHelper.getDirection(unit.x, unit.y)
        const adjustedTargetLocation = {
          x: nextTargetLocation.x + Math.floor(GRID_SIZE / 2),
          y: nextTargetLocation.y + Math.floor(GRID_SIZE / 2),
        }

        const currentTerrain = this.pathHelper.getTerrainAt(unit.x, unit.y)
        unit.act(adjustedTargetLocation, currentTerrain)
      }
    }
  }

  /*
   * Causes towers to act. Removes them when needed.
   * Accepts a UnitManager object containing the towers.
   */
  commandTowers(unitManager) {
    for (let i = unitManager.all.length - 1; i >= 0; i--) {
      let unit = unitManager.all[i]
      if (unit.removeMe) {
        unitManager.remove(i)
        continue
      }
      if (!unit.disabled && unit.act) {
        unit.act()
      }
    }
  }

  updateWave() {
    this.wave.updateWaveTimer()
    if (this.wave.ready()) {
      this.spawnWave()
    }
  }

  spawnWave() {
    const newEnemies = this.wave.spawn()
    this.placeWaveEnemies(newEnemies)
    this.enemies.concat(newEnemies)

    // for fun! To see how many enemies there are.
    // Note that enemies are not yet removed from the array upon death.
    console.log("Wave size:", newEnemies.length);
    console.log("Total enemies:", this.enemies.all.length);
    return newEnemies
  }

  createEnemy(enemyData) {
    const scaledEnemyData = scaleEnemy(enemyData, this.wave.number)
    return new Enemy(this, scaledEnemyData)
  }

  placeWaveEnemies(newEnemies) {
    newEnemies.forEach((enemy, index) => {
      this.placeEnemy(enemy, newEnemies.length, index)
      const enemyTarget = this.getEnemyGoal(enemy)
      enemy.setMoveTarget()
    })
  }

  placeEnemy(enemy, enemiesInWave, numEnemy) {

    const entrance = this.getEntranceZone()
    const heightCut = 4 * GRID_SIZE
    const actualEntranceHeight = entrance.height - heightCut
    // push down units depending on quantity of enemies
    const yBumper = actualEntranceHeight / (1 + enemiesInWave) + (heightCut / 2)

    const xPosition = entrance.x + entrance.width
    const enemySpacing = actualEntranceHeight / enemiesInWave

    const yPosition = entrance.y + numEnemy * enemySpacing + yBumper - (enemy.height / 2)

    enemy.jumpTo(xPosition, yPosition)
  }

  canAfford(unit) {
    return this.credits.current >= unit.purchaseCost
  }

  @action buyTower(tower) {
    if (!this.canAfford(tower)) {
      return false
    }
    this.spend(tower.purchaseCost)
    return true
  }

  @action profit(amount) {
    this.credits.current += amount
  }

  @action spend(amount) {
    this.credits.current -= amount
  }

  placeTower(tower) {
    if (!this.inProgress) { return }
    const placingTower = tower || this.placingTower
    if (!placingTower) { return }

    const TowerType = this.TOWER_TYPES[placingTower.name]
    const finalTower = new TowerType(this)
    finalTower.jumpTo(placingTower.x, placingTower.y)
    if (tower && tower.id) { finalTower.id = tower.id }
    // @TODO Should probably be copying over all stats, not just id and location

    if (finalTower && this.canAfford(finalTower)) {
      const placed = this.addTower(finalTower)
      if (!placed) {
        // @TODO Add message that says tower cannot be placed to block enemies
        console.log("Tower placement not allowed! You cannot block the goal or place on top of existing towers.");
        return false
      }

      this.buyTower(finalTower)
      return finalTower
    }
    console.log("Tower not placed - can't afford or no finalTower exists.");
  }

  addTower(tower) {
    const placed = this.pathHelper.addTowerObstacle(
      tower.getTopLeft(), tower.width, tower.height)
    if (!placed) { return false }

    tower.place()
    tower.show()
    this.towers.add(tower)
    return tower
  }

  @action sellSelectedTower() {
    const entity = this.selectedEntity;
    if (entity.type !== 'Tower' || !entity.placed) { return }
    this.sellTower(entity)
  }

  @action sellTower(tower) {
    this.profit(tower.getSellValue())
    this.pathHelper.removeTowerObstacle(tower.getTopLeft(), tower.width, tower.height)
    tower.destroy()
  }

  /*
   * Given data about a tower and a target, finds those objects and sets
   * the tower to have that target. Useful for server syncing.
   */
  setTowerTargetFromData(towerId, targetId) {
    const tower = this.towers.byId[towerId]
    const target = this.enemies.byId[targetId]
    return this.setTowerTarget(tower, target)
  }

  /*
   * Given a tower and a target object, sets the tower to have that target.
   * Fails if either are not provided.
   */
  setTowerTarget(tower, target) {
    if (!tower || !target) { return }
    tower.setTarget(target)
    return true
  }

  endGame() {
    this.pause()
    this.towers.clear()
    this.enemies.clear()
    this.waveTimer = null
    this.inProgress = false
  }

  upgradeSelectedTower(upgradeType) {
    if (!(this.selectedEntity && this.selectedEntity.type === 'Tower')) {
      console.log('Not a tower!');
      return
    }
    console.log('Upgrading selected tower!');
    const tower = this.selectedEntity
    this.upgradeTower(tower, upgradeType)
    return tower
  }

  upgradeTower(tower, upgradeType) {
    const cost = tower.getUpgradeCost(upgradeType)
    if (cost === undefined || cost > this.credits.current) { return }
    const upgradeInfo = tower.getUpgradeInfo(upgradeType)
    if (upgradeInfo.type === 'towerToTower') {
      return this.changeTower(tower, upgradeInfo)
    }
    this.spend(cost)
    tower.upgrade(upgradeType)
    return tower
  }

  /*
   * Changes a tower from one type to another given info about upgrading.
   * The new tower must be the same size as the old tower.
   */
  changeTower(tower, upgradeInfo) {
    const TowerType = this.TOWER_TYPES[upgradeInfo.newTowerType]
    const newTower = new TowerType(this)

    // This is for pathing/placement reasons. A larger tower might not be valid.
    if (newTower.width !== tower.width || newTower.height !== tower.height) {
      return false
    }

    newTower.copyUpgradeStats(tower)

    tower.destroy()
    // update pathing - allows for new tower placement
    this.pathHelper.removeTowerObstacle(tower.getTopLeft(), tower.width, tower.height)
    this.addTower(newTower)
    this.spend(upgradeInfo.cost)
    return newTower
  }

  getEnemyGoal(enemy) {
    return this.getEndGoal()
  }

  getEndGoal() {
    const halfHeight = this.height / 2
    return {
      x: 0,
      y: halfHeight - (halfHeight % GRID_SIZE),
    }
  }

  /*
   * Returns a coordinate, but shifts down-right by the distance of half a tile.
   * Very naive. Maybe be useful to make this method smarter.
   */
  getTileCoordinate(coordinate) {
    return {
      x: coordinate.x + Math.floor(GRID_SIZE / 2),
      y: coordinate.y + Math.floor(GRID_SIZE / 2),
    }
  }

  /*
   * Return a rectangular area where towers cannot be built.
   */
  getEntranceZone() {
    return {
      x: this.width - GRID_SIZE,
      y: 0,
      width: GRID_SIZE,
      height: this.height,
    }
  }

  getEnemies() {
    return this.enemies.all
  }

  getUnits() {
    const units = this.enemies.all.concat(this.towers.all)
    if (this.placingTower) {
      units.push(this.placingTower)
    }
    return units
  }


  // GAME UPDATE METHODS ---------------------

  buildEntityFromData(entity, data) {
    const attrsToIgnore = ['target', 'cooldown', 'selected']
    Object.keys(data).forEach((datum) => {
      if (attrsToIgnore.indexOf(datum) !== -1) { return } // ignore certain keys
      entity.setAttr(datum, data[datum])
    })
    return entity
  }

  // WEB FUNCTIONS --------------------------
  // These functions are web related - they are shared between ClientMultiGame and ServerGame.

  @action receiveSellTower(towerId) {
    const tower = this.towers.byId[towerId]
    if (!tower) {
      console.log("No tower with id", towerId);
      return
    }
    this.sellTower(tower)
    return true
  }

  @action receiveUpgradeTower(towerId, upgradeType) {
    const tower = this.towers.byId[towerId]
    if (!tower) {
      console.log("No tower with id", towerId);
      return
    }
    this.upgradeTower(tower, upgradeType)
    return true
  }

  @action adjustGameSpeed(multiplier) {
    // console.log('Setting game speed to:', multiplier);
    this.control.speedMultiplier = multiplier
    // this.performance.setTickLength(multiplier * GAME_REFRESH_RATE)
  }

  setUpSendPerformance() {
    this.performanceCooldown = Cooldown.createTimeBased(1000, GAME_REFRESH_RATE, {
      callback: this.sendPerformance.bind(this),
      autoActivate: true,
    })
  }

  // CALCULATE SERVER SPEED - can use to slow down game to keep it better synced
  checkPerformance() {
    this.performance.next()
    this.performanceCooldown.tick()
  }

  pausePerformance() {
    this.performance.pause()
  }

  resumePerformance() {
    this.performance.resume()
  }

  // ----------------------------------------

}

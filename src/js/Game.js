
import { observable, computed, action, autorun } from 'mobx'

import Cooldown from './Cooldown'
import Unit from './Unit'
import Cannon from './Cannon'
import Tank from './Tank'
import GameRenderer from './GameRenderer'
import GameListener from './GameListener'
import { UNIT_REFRESH_RATE } from './appConstants'
import { setCorrectingInterval } from './utility/time'

export default class Game {
  @observable placingTower = false
  @observable enemies = []
  @observable towers = []
  @observable waveNumber = 0
  @observable enemiesInWave = 0 // @TODO This will likely become an array of wave sizes
  @observable gameCanvas = undefined
  @observable gameCanvasContext = undefined
  @observable credits = 55

  @observable control = {
    run: false,
    speedMultiplier: 1,
  }

  height = 700
  width = 700
  tickLength = 500
  waveList = { // should be handled in another class
    1: {
      normal: 5,
    },
    2: {
      normal: 5,
      fast: 1,
    },
    3: {
      normal: 5,
      fast: 2,
    },
  }

  constructor(runningOnServer) {
    this.runningOnServer = runningOnServer
    this.gameListener = new GameListener(this, runningOnServer)
    if (!this.runningOnServer) {
      this.setupUI()
    }
    this.performance = new Cooldown(1000, {
      callRate: UNIT_REFRESH_RATE,
      // log: true,
      autoActivate: true,
      delayActivation: true,
      softReset: true,
    })
  }

  setupUI() {
    this.renderer = new GameRenderer(this)
  }

  start() {
    this.play()
    this.spawnWave()
  }

  sendPlay() {
    this.play()
    this.gameListener.play()
  }

  play() {
    if (!this.control.run) {
      this.initializeLoop()
    }
  }

  sendPause() {
    this.pause()
    this.gameListener.pause()
  }

  @action pause() {
    this.control.run = false
  }

  initializeLoop() {
    // handle moving units, tower scanning, spawning waves, etc.
    this.control.run = true
    return setCorrectingInterval(() => {
      // console.log('---');
      this.checkPerformance()
      this.commandUnits(this.enemies)
      this.commandUnits(this.towers)
    }, UNIT_REFRESH_RATE, this.control)
  }

  // CALCULATE SERVER SPEED - can use to slow down game to keep it better synced
  checkPerformance() {
    this.performance.tick()
  }

  render(entities) {
    entities.forEach((entity) => entity.startRender())
  }

  commandUnits(units) {
    for (let i = units.length - 1; i >= 0; i--) {
      let unit = units[i]
      if (unit.removed) {
        units.splice(i, 1)
        continue
      }
      if (!unit.disabled && unit.act) {
        unit.act()
      }
    }
  }

  spawnWave() { // @TODO spawn box/timer so that all enemies don't appear simultaneously?
    console.log(`Spawning wave ${this.waveNumber}!`);
    this.waveNumber++
    this.enemiesInWave = 0
    let currentWave
    if (this.waveList.hasOwnProperty(this.waveNumber)) { // @TODO fetching wave list should be handled by another method
      currentWave = this.waveList[this.waveNumber]
    } else {
      currentWave = {
        normal: this.waveNumber,
        fast: this.waveNumber,
      }
    }
    for (let numberOfEnemies of Object.values(currentWave)) {
      this.enemiesInWave += numberOfEnemies
    }

    const newEnemies = []
    for (let enemyType of Object.keys(currentWave)) {
      for (let i = 0; i < currentWave[enemyType]; i++) {
        // @TODO Allow for other unit types
        let enemy = new Tank(this, enemyType)
        this.placeEnemy(enemy, i)
        const enemyTarget = this.getEnemyGoal(enemy)
        enemy.setMoveTarget(enemyTarget.x, enemyTarget.y)
        newEnemies.push(enemy)
        this.enemies.push(enemy)
      }
    }

    this.render(newEnemies)

    // for fun! To see how many enemies there are.
    // Note that enemies are not yet removed from the array upon death.
    console.log(this.enemies.length);
  }

  placeEnemy(enemy, numEnemy) {
    const enemyDistance = Math.floor(this.height / this.enemiesInWave)
    enemy.jumpTo(this.width, numEnemy * enemyDistance)
  }

  /*
   * Selects a new (disabled/inactive) cannon to be placed on the map.
   */
  selectNewCannon() {
    this.placingTower = Unit.create(Cannon, this)
    return this.placingTower
  }

  canAfford(unit) {
    return this.credits >= unit.purchaseCost
  }

  @action buyTower(tower) {
    if (!this.canAfford(tower)) {
      return false
    }
    this.credits -= tower.purchaseCost
    return true
  }

  @action profit(amount) {
    this.credits += amount
  }

  deselectPlacingTower() {
    this.placingTower.hide()
    this.placingTower = false
  }

  deselectAll() {
    this.deselectPlacingTower()
  }

  sendPlaceTower() {
    const placedTower = this.placeTower()
    if (!placedTower) { return }
    this.gameListener.placeTower(placedTower)
  }

  placeTower(tower) {
    const placingTower = tower || this.placingTower
    if (!placingTower) { return }

    // @TODO Handle placing other tower types
    const finalTower = Unit.create(Cannon, this)
    finalTower.jumpTo(placingTower.x, placingTower.y)

    if (finalTower && this.buyTower(finalTower)) {
      finalTower.place()
      this.towers.push(finalTower)
      finalTower.enable()
      finalTower.show()
      return finalTower
    }
  }

  clearEnemies() {
    this.enemies.forEach((enemy) => {
      enemy.destroy()
    })
    this.enemies = []
  }

  addEnemies(enemies) {
    enemies.forEach((enemyData) => {
      // @TODO Allow for other unit types
      let enemy = new Tank(this, enemyData.name)
      Object.keys(enemyData).forEach((datum) => {
        enemy.setAttr(datum, enemyData[datum])
      })

      // @TODO? if enemy has no health, maybe have to kill enemy
      enemy.startRender()
      this.enemies.push(enemy)
      const enemyTarget = this.getEnemyGoal(enemy)
      enemy.setMoveTarget(enemyTarget.x, enemyTarget.y)
    })
  }

  clearTowers() {
    this.towers.forEach((tower) => {
      tower.destroy()
    })
    this.towers = []
  }

  addTowers(towers) {
    towers.forEach((towerData) => {
      // @TODO Allow for other tower types
      let tower = new Cannon(this, towerData.name)
      Object.keys(towerData).forEach((datum) => {
        if (datum in ['target']) { return }
        tower.setAttr(datum, towerData[datum])
      })

      tower.startRender()
      tower.selectTarget() // unnecessary, but can be smoother
      this.towers.push(tower)
    })
  }

  @action updateAll(data) {
    // @TODO data should include all info about towers and enemies, money, etc.
    console.log('Updating all');
    this.clearEnemies()
    this.addEnemies(data.enemies)
    this.clearTowers()
    this.addTowers(data.towers)
    this.credits = data.credits
    this.waveNumber = data.waveNumber
  }

  getEnemyGoal(enemy) {
    return {
      x: -enemy.width,
      y: this.height / 2,
    }
  }

  tearDown() {
    // @TODO Should de-render the game and tear down any intervals.
    // Might be handy to keep the game object around for score keeping purposes.
  }

  getRandomPosition() {
    return Math.floor(Math.random() * this.height)
  }

  // DEPRECATED ----------------
  renderAll() {
    this.enemies.forEach((entity) => entity.startRender())
  }

}


import { observable, computed, action, autorun } from 'mobx'

import Cooldown from './Cooldown'
import Unit from './Unit'
import Cannon from './Cannon'
import Tank from './units/Tank'
import GameRenderer from './GameRenderer'
import GameEmitter from './GameEmitter'
import { UNIT_REFRESH_RATE } from './appConstants'
import { setCorrectingInterval } from './utility/time'
import WaveSpawner from './WaveSpawner'

export default class Game {
  @observable placingTower = false
  @observable enemies = []
  @observable towers = []
  @observable gameCanvas = undefined
  @observable gameCanvasContext = undefined
  @observable credits = {
    start: 55,
    current: 55,
  }
  @observable lives = 20
  @observable inProgress = false

  @observable control = {
    run: false,
    // speedMultiplier: 1,
  }

  height = 700
  width = 700
  tickLength = 500

  constructor(emitter, endGameCallback, runningOnServer) {
    this.endGameCallback = endGameCallback
    this.runningOnServer = runningOnServer
    this.emitter = emitter
    this.wave = new WaveSpawner(
      this.handleSpawnWave.bind(this),
      this.placeNewEnemy.bind(this),
      runningOnServer,
    )

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
    this.inProgress = true
    this.reset()
    this.play()
    this.wave.initializeWaveTimer()
  }

  @action reset() {
    this.wave.reset()
    this.lives = 20
    this.credits.current = this.credits.start
  }

  sendPlay() {
    if (!this.inProgress) { return }
    this.play()
    this.emitter.play()
  }

  /*
   * Simply starts the game loop. Does NOT actually start the game.
   * Ie. play vs pause rather than starting a new game.
   */
  play() {
    if (!this.control.run) {
      this.initializeLoop()
    }
  }

  sendPause() {
    if (!this.inProgress) { return }
    this.pause()
    this.emitter.pause()
  }

  @action pause() {
    if (!this.inProgress) { return }
    this.control.run = false
  }

  initializeLoop() {
    // handle moving units, tower scanning, spawning waves, etc.
    this.control.run = true
    return setCorrectingInterval(() => {
      // console.log('---');
      this.checkPerformance()
      this.wave.updateWaveTimer()
      this.commandUnits(this.enemies)
      this.commandUnits(this.towers)
      if (this.lives <= 0) {
        this.endGame()
        this.endGameCallback() // could possibly pass scores/end-state here
      }
    }, UNIT_REFRESH_RATE, this.control)
  }

  loseLife() {
    return --this.lives
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
      if (unit.completed) { // assume it also has `removed = true`
        const livesLeft = this.loseLife()
        console.log(`Unit reached goal! Remaining lives: ${livesLeft}`);
      }
      if (unit.removed) {
        units.splice(i, 1)
        continue
      }
      if (!unit.disabled && unit.act) {
        unit.act()
      }
    }
  }

  handleSpawnWave(newEnemies) {
    this.enemies = this.enemies.concat(newEnemies)
    this.render(newEnemies)

    // for fun! To see how many enemies there are.
    // Note that enemies are not yet removed from the array upon death.
    console.log("Wave size:", newEnemies.length);
    console.log("Total enemies:", this.enemies.length);
  }

  placeNewEnemy(enemyType, enemiesInWave, numEnemy) {
    // @TODO Allow for other unit types
    let enemy = new Tank(this, enemyType)
    this.placeEnemy(enemy, enemiesInWave, numEnemy)
    const enemyTarget = this.getEnemyGoal(enemy)
    enemy.setMoveTarget(enemyTarget.x, enemyTarget.y)
    return enemy
  }

  placeEnemy(enemy, enemiesInWave, numEnemy) {
    const enemyDistance = Math.floor(this.height / enemiesInWave)
    enemy.jumpTo(this.width, numEnemy * enemyDistance)
  }

  spawnWaveEarly() {
    if (!this.inProgress) { return }
    this.emitter.spawnWaveEarly()
  }

  /*
   * Selects a new (disabled/inactive) cannon to be placed on the map.
   */
  selectNewCannon() {
    if (!this.inProgress) { return }
    this.placingTower = Unit.create(Cannon, this)
    return this.placingTower
  }

  canAfford(unit) {
    return this.credits.current >= unit.purchaseCost
  }

  @action buyTower(tower) {
    if (!this.canAfford(tower)) {
      return false
    }
    this.credits.current -= tower.purchaseCost
    return true
  }

  @action profit(amount) {
    this.credits.current += amount
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
    this.emitter.placeTower(placedTower)
  }

  placeTower(tower) {
    if (!this.inProgress) { return }
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
      this.buildEntityFromData(enemy, enemyData)

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
      this.buildEntityFromData(tower, towerData)

      tower.startRender()
      tower.selectTarget() // unnecessary, but can be smoother
      this.towers.push(tower)
    })
  }

  buildEntityFromData(entity, data) {
    Object.keys(data).forEach((datum) => {
      if (datum in ['target']) { return } // ignore certain keys
      entity.setAttr(datum, data[datum])
    })
    return entity
  }

  @action updateAll(data) {
    console.log('Updating all');
    this.clearEnemies()
    this.addEnemies(data.enemies)
    this.clearTowers()
    this.addTowers(data.towers)
    this.credits.current = data.credits
    this.wave.setNumber(data.waveNumber)
    this.inProgress = data.inProgress
    if (this.inProgress && this.control.run) {
      this.play()
    }
    // else {
    //   this.pause()
    // }
  }

  endGame() {
    this.pause()
    this.clearTowers()
    this.clearEnemies()
    this.waveTimer = null
    this.inProgress = false
  }

  getEnemyGoal(enemy) {
    return {
      x: -enemy.width,
      y: this.height / 2,
    }
  }

}

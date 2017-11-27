
import { observable, computed, action, autorun } from 'mobx'

import Cooldown from './Cooldown'
import Unit from './Unit'
import Cannon from './Cannon'
import Tank from './Tank'
import GameRenderer from './GameRenderer'
import GameListener from './GameListener'
import { UNIT_REFRESH_RATE } from './appConstants'

export default class Game {
  @observable placingTower = false
  @observable enemies = []
  @observable towers = []
  @observable waveNumber = 0
  @observable enemiesInWave = 0 // @TODO This will likely become an array of wave sizes
  @observable gameCanvas = undefined
  @observable gameCanvasContext = undefined
  @observable credits = 55

  height = 400
  width = 400
  tickLength = 500
  gameLoopId = undefined
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
    // this.gameListener = {}
    this.gameListener = new GameListener(this, runningOnServer)
    if (!this.runningOnServer) {
      this.setupUI()
    }
    this.performance = new Cooldown(1000, {
      callRate: UNIT_REFRESH_RATE,
      // log: true,
      autoActivate: true,
      delayActivation: true,
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
    this.gameLoopId = this.initializeLoop()
    // @TODO Also run loop for towers
  }

  sendPause() {
    this.pause()
    this.gameListener.pause()
  }

  pause() {
    clearInterval(this.gameLoopId)
    delete this.gameLoopId
  }

  initializeLoop() {
    // handle moving units, tower scanning, spawning waves, etc.
    return setInterval(() => {
      this.checkPerformance()
      this.commandUnits(this.enemies)
      this.commandUnits(this.towers)
    }, UNIT_REFRESH_RATE)
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
        let enemy = new Tank(this, enemyType)
        this.placeEnemy(enemy, i)
        enemy.setMoveTarget(-enemy.width, this.height / 2)
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
    this.placingTower = false
  }

  sendPlaceTower() {
    const placedTower = this.placeTower()
    if (!placedTower) { return }
    this.gameListener.placeTower(placedTower)
  }

  placeTower(tower) {
    const placingTower = tower || this.placingTower
    if (!placingTower) { return }
    placingTower.hide && placingTower.hide()
    // @TODO Handle placing other tower types
    const finalTower = Unit.create(Cannon, this)
    finalTower.jumpTo(placingTower.x, placingTower.y)

    if (finalTower && this.buyTower(finalTower)) {
      finalTower.place()
      this.towers.push(finalTower)
      this.deselectPlacingTower()
      finalTower.enable()
      finalTower.show()
      return finalTower
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


import { observable, computed, action, autorun } from 'mobx'

import Unit from 'Unit'
import Cannon from 'Cannon'
import Tank from 'Tank'
import GameRenderer from 'GameRenderer'
import { UNIT_REFRESH_RATE } from 'appConstants'

export default class Game {
  @observable placingTower = false
  @observable enemies = []
  @observable towers = []
  @observable waveNumber = 0
  @observable enemiesInWave = 0 // @TODO This will likely become an array of wave sizes
  @observable gameBox = undefined
  @observable gameBoxBound = undefined
  @observable gameCanvas = undefined
  @observable gameCanvasContext = undefined
  @observable credits = 55

  height = 700
  width = 700
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

  constructor(ignore_ui) {
    this.ignore_ui = ignore_ui
    this.setup()
    if (!this.ignore_ui) {
      this.renderer = new GameRenderer(this)
    }

    // @TODO Move this somewhere reasonable!
    const gameNumber = document.querySelector('input[name=gameNumber]').value
    console.log(gameNumber);
    if (gameNumber) {
      socket.emit('join game', gameNumber)
    }
  }

  setup() {
    this.setupGameBox()
  }

  start() {
    this.play()
    this.spawnWave()
  }

  play() {
    this.gameLoopId = this.initializeLoop()
    // @TODO Also run loop for towers
  }

  pause() {
    clearInterval(this.gameLoopId)
    delete this.gameLoopId
    // @TODO Also pause towers
  }

  setupGameBox() {
    this.gameBox = document.querySelector("#display-box")
    this.gameBox.style.width = this.width + 'px'
    this.gameBox.style.height = this.height + 'px'
    this.gameBoxBound = this.gameBox.getBoundingClientRect()
    this.gameCanvas = this.setupGameCanvas(this.gameBox, 'gameCanvas')
    this.gameCanvasContext = this.gameCanvas.getContext('2d')
  }

  setupGameCanvas(frame, id, width = this.width, height = this.height) {
    let canvas = document.createElement('canvas');
    canvas.id = id
    canvas.width = width
    canvas.height = height
    frame.append(canvas)
    return canvas
  }

  initializeLoop() {
    // handle moving units, tower scanning, spawning waves, etc.
    return setInterval(() => {
      this.commandUnits(this.enemies)
      this.commandUnits(this.towers)
    }, UNIT_REFRESH_RATE)
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

  placeTower() {
    if (this.placingTower && this.buyTower(this.placingTower)) {
      this.placingTower.place()
      this.towers.push(this.placingTower)
      this.deselectPlacingTower()
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

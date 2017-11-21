
import { observable, computed, action, autorun } from 'mobx'

import Unit from 'Unit'
import Cannon from 'Cannon'
import Tank from 'Tank'
import GameRenderer from 'GameRenderer'

export default class Game {
  @observable placingTower = false
  @observable enemies = []
  @observable towers = []
  @observable wave = 1
  @observable enemiesInWave = 5 // @TODO This will likely become an array of wave sizes
  @observable gameBox = undefined
  @observable gameBoxBound = undefined
  @observable gameCanvas = undefined
  @observable gameCanvasContext = undefined
  @observable credits = 55

  height = 700
  width = 700
  tickLength = 500
  gameLoopId = undefined

  constructor() {
    this.setup()
    this.renderer = new GameRenderer(this)
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
    this.moveUnits(this.enemies)
    this.towers.forEach((tower) => tower.activate())
  }

  pause() {
    clearInterval(this.gameLoopId)
    delete this.gameLoopId
    this.enemies.forEach((unit) => unit.pauseMovement())
    this.towers.forEach((tower) => tower.deactivate())
  }

  moveUnits(units) {
    units.forEach((unit) => unit.startMovement())
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
    return setInterval(this.gameLogic.bind(this), this.tickLength)
  }

  render(entities) {
    entities.forEach((entity) => entity.startRender())
  }

  gameLogic() {
    // handle spawning waves, etc.
  }

  spawnWave() {
    const newEnemies = []
    for (let i = 0; i < this.enemiesInWave; i++) {
      let enemy = new Tank()
      this.placeEnemy(enemy, i)
      enemy.setMoveTarget(0, this.height / 2)
      newEnemies.push(enemy)
      this.enemies.push(enemy)
    }

    this.render(newEnemies)
    this.moveUnits(newEnemies)
    // newEnemies.forEach((enemy) => enemy.startMovement())
  }

  placeEnemy(enemy, numEnemy) {
    const enemyDistance = Math.floor(this.height / this.enemiesInWave)
    enemy.jumpTo(this.width, numEnemy * enemyDistance)
  }

  /*
   * Selects a new (disabled/inactive) cannon to be placed on the map.
   */
  selectNewCannon() {
    this.placingTower = Unit.create(Cannon, {
      disabled: true,
      display: false,
      enemies: this.enemies,
    })
    return this.placingTower
  }

  buyTower(tower) {
    if (this.credits < tower.purchaseCost) {
      return false
    }
    this.credits -= tower.purchaseCost
    return true
  }

  deselectPlacingTower() {
    this.placingTower = false
  }

  placeTower() {
    if (this.placingTower && this.buyTower(this.placingTower)) {
      this.placingTower.enable()
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

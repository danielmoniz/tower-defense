
import { observable, computed, action, autorun } from 'mobx'

import Unit from 'Unit'
import Cannon from 'Cannon'
import Tank from 'Tank'
import GameRenderer from 'GameRenderer'

export default class Game {
  @observable placingTower = false
  @observable allies = []
  @observable enemies = []
  @observable wave = 1
  @observable enemiesInWave = 5 // @TODO This will likely become an array of wave sizes
  @observable gameBox = undefined
  @observable gameBoxBound = undefined

  height = 700
  width = 700
  tickLength = 500
  gameLoopId = undefined

  constructor() {
    this.setup()
    this.renderer = new GameRenderer(this)
  }

  start() {
    this.play()
  }

  setup() {
    this.setupGameBox()
    this.generateAllies()
    this.spawnWave()
    this.renderAll()
    // @TEST/example - remove later!
    this.allies.forEach((ally) => {
      ally.setMoveTarget(this.getRandomPosition(), this.getRandomPosition())
    })
  }

  setupGameBox() {
    this.gameBox = document.querySelector("#display-box")
    this.gameBox.style.width = this.width + 'px'
    this.gameBox.style.height = this.height + 'px'
    this.gameBoxBound = this.gameBox.getBoundingClientRect()
  }

  initializeLoop() {
    return setInterval(this.gameLogic.bind(this), this.tickLength)
  }

  renderAll() {
    const allEntities = this.allies.concat(this.enemies)
    allEntities.forEach((entity) => entity.startRender())
  }

  gameLogic() {
    // handle spawning waves, etc.
  }

  generateAllies() {
    this.allies = this.allies.concat([new Tank(), new Tank()])
  }

  spawnWave() {
    const newEnemies = []
    for (let i = 0; i < this.enemiesInWave; i++) {
      let enemy = new Tank()
      this.placeEnemy(enemy, i)
      enemy.setMoveTarget(0, this.height / 2)
      newEnemies.push(enemy)
    }
    this.enemies = this.enemies.concat(newEnemies)
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
    })
    return this.placingTower
  }

  deselectPlacingTower() {
    this.placingTower = false
  }

  addRandomAllyMoves() {
    this.allies.forEach((ally) => {
      ally.setMoveTarget(this.getRandomPosition(), this.getRandomPosition())
      ally.startMovement()
    })
  }

  pause() {
    clearInterval(this.gameLoopId)
    delete this.gameLoopId
    const allEntities = this.allies.concat(this.enemies)
    allEntities.forEach((entity) => entity.pauseMovement())
  }

  play() {
    this.gameLoopId = this.initializeLoop()
    const allEntities = this.allies.concat(this.enemies)
    allEntities.forEach((entity) => entity.startMovement())
  }

  tearDown() {
    // @TODO Should de-render the game and tear down any intervals.
    // Might be handy to keep the game object around for score keeping purposes.
  }

  getRandomPosition() {
    return Math.floor(Math.random() * this.height)
  }

}


import { observable, computed, action, autorun } from 'mobx'

import UnitManager from '../UnitManager'
import WaveSpawner from '../WaveSpawner'
import Cooldown from '../Cooldown'
import Performance from '../Performance'
import Unit from '../units/Unit'
import Cannon from '../units/Cannon'
import Flamethrower from '../units/Flamethrower'
import MachineGun from '../units/MachineGun'
import Tank from '../units/Tank'

import Pathing from '../map/Pathing'
import { GAME_REFRESH_RATE, GRID_SIZE } from '../appConstants'
import { setCorrectingInterval } from '../utility/time'


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

  height = 700
  width = 700

  constructor(emitter, actions) {
    this.actions = actions
    this.emitter = emitter


    this.UNIT_TYPES = { Tank, Cannon, Flamethrower, MachineGun }

    this.enemies = new UnitManager()
    this.towers = new UnitManager()

    this.pathHelper = new Pathing(this, GRID_SIZE, this.getEndGoal())
    this.pathHelper.setUpRandomMap()
    // this.map = new Map(this, GRID_SIZE)
    // this.map.setUpRandomMap()
    // this.map.compute() // Will have to compute after each change

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
    this.wave.initializeWaveTimer(GAME_REFRESH_RATE)
  }

  @action reset() {
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
    this.commandUnits(this.enemies)
    this.commandUnits(this.towers)
    if (this.lives <= 0) {
      this.endGame()
      this.actions.destroyGame() // could possibly pass scores/end-state here
    }
  }

  @action loseLife() {
    return --this.lives
  }

  /*
   * Causes units act. Removes them when needed.
   * Detects when a unit has completed its objective and subtracts a life.
   * Accepts a UnitManager object to command & manipulate various unit types.
   */
  commandUnits(unitManager) {
    for (let i = unitManager.all.length - 1; i >= 0; i--) {
      let unit = unitManager.all[i]
      if (unit.completed) { // assume it also has `removeMe = true`
        const livesLeft = this.loseLife()
        console.log(`Unit reached goal! Remaining lives: ${livesLeft}`);
      }
      if (unit.removeMe) {
        unitManager.remove(i)
        continue
      }
      if (!unit.disabled && unit.act) {
        // @TODO Get terrain type and pass it to unit (for speed/cover purposes)
        const nextTargetLocation = this.pathHelper.getDirection(unit.x, unit.y)
        unit.act(nextTargetLocation)
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

  createEnemy(type, subtype) {
    const UnitClass = this.UNIT_TYPES[type]
    return new UnitClass(this, subtype)
  }

  placeWaveEnemies(newEnemies) {
    newEnemies.forEach((enemy, index) => {
      this.placeEnemy(enemy, newEnemies.length, index)
      const enemyTarget = this.getEnemyGoal(enemy)
      enemy.setMoveTarget(enemyTarget.x, enemyTarget.y)
    })
  }

  placeEnemy(enemy, enemiesInWave, numEnemy) {
    const enemyDistance = Math.floor(this.height / enemiesInWave)
    enemy.jumpTo(this.width, numEnemy * enemyDistance)
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

  placeTower(tower) {
    if (!this.inProgress) { return }
    const placingTower = tower || this.placingTower
    if (!placingTower) { return }

    const TowerType = this.UNIT_TYPES[placingTower.name]
    const finalTower = new TowerType(this)
    finalTower.jumpTo(placingTower.x, placingTower.y)

    if (finalTower && this.buyTower(finalTower)) {
      finalTower.place()
      finalTower.show()
      this.towers.add(finalTower)
      return finalTower
    }
  }

  endGame() {
    this.pause()
    this.towers.clear()
    this.enemies.clear()
    this.waveTimer = null
    this.inProgress = false
  }

  getEnemyGoal(enemy) {
    return this.getEndGoal()
    // return {
    //   x: -enemy.width,
    //   y: this.height / 2,
    // }
  }

  getEndGoal() {
    return {
      x: 0,
      y: this.height / 2,
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
    Object.keys(data).forEach((datum) => {
      if (['target', 'cooldown'].indexOf(datum) !== -1) { return } // ignore certain keys
      entity.setAttr(datum, data[datum])
    })
    return entity
  }

  // WEB FUNCTIONS --------------------------
  // These functions are web related - they are shared between ClientMultiGame and ServerGame.

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

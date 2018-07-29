
import { observable, action, computed } from 'mobx'
import { GAME_REFRESH_RATE } from './appConstants'

import Cooldown from './Cooldown'

/*
 * Handles tracking spawns and indicating when a wave is ready to spawn.
 */
class WaveSpawner {
  @observable number = 0
  @observable timeBetweenWaves = 20000
  @observable currentAttributes = []
  @observable cooldown = null

  constructor() {
    this.bossSpawnOnWave = 5
    this.updateFrequency = undefined
  }

  @computed get timeUntilNextWave() {
    if (this.cooldown) {
      return Math.floor((this.cooldown.ticksUntilReady() - 1) * this.updateFrequency / 1000) + 1
    }
    return null
  }

  /*
   * Initializes the cooldown for waves.
   */
  @action initializeWaveTimer(updateFrequency, firstSpawnDelay) {
    this.updateFrequency = updateFrequency
    if (!this.cooldown) {
      const callback = action(() => {
        console.log('Waves beginning!');
        this.cooldown = Cooldown.createTimeBased(this.timeBetweenWaves, updateFrequency)
      })
      const options = {
        autoActivate: true,
        delayActivation: true,
        callback,
      }

      console.log('Setting up initial wave delay...');
      this.cooldown = Cooldown.createTimeBased(
        firstSpawnDelay,
        updateFrequency,
        options,
      )

    }
  }

  @computed get round() {
    return Math.ceil(this.number / this.bossSpawnOnWave)
  }

  /*
   * Resets the wave spawning.
   */
  @action reset() {
    this.number = 0
    delete this.cooldown
  }

  /*
   * Given a new set of attributes, set them.
   */
  @action setRoundAttributes(newAttributes) {
    this.currentAttributes = newAttributes
  }

  /*
   * Adds one to the current wave number.
   */
  @action increment() {
    this.number++
  }

  /*
   * Sets the wave number to be any number. Useful for hard game updates.
   */
  @action setNumber(newNumber) {
    this.number = newNumber
  }

  /*
   * Tells the wave cooldown to tick (bringing it closer to the next wave).
   */
  @action updateWaveTimer() {
    if (!this.cooldown) { return }
    this.cooldown.tick()
  }

  /*
   * Starts the next wave. NOTE: does not actually spawn units.
   */
  nextWave() {
    this.cooldown.activate()
    this.increment()
  }

  /*
   * Returns whether or not the cooldown is ready.
   */
  ready() {
    return this.cooldown.ready()
  }
}

export default WaveSpawner

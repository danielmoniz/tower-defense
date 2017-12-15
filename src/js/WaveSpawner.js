
import { observable, action } from 'mobx'

import Cooldown from './Cooldown'

/*
 * Handles tracking spawns and indicating when a wave is ready to spawn.
 */
class WaveSpawner {
  @observable number = 0
  @observable timeBetweenWaves = 7000

  constructor() {
    this.cooldown = null
  }

  /*
   * Initializes the cooldown for waves.
   */
  initializeWaveTimer(updateFrequency) {
    if (!this.cooldown) {
      console.log('Waves beginning!');
      this.cooldown = Cooldown.createTimeBased(this.timeBetweenWaves, updateFrequency)
    }
  }

  /*
   * Resets the wave spawning.
   */
  @action reset() {
    this.number = 0
    delete this.cooldown
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
  updateWaveTimer() {
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

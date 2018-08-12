
import { observable, action } from 'mobx'

class Cooldown {

  @observable ticksPassed = 0
  totalTicks = 0
  numActivations = 0

  /*
   * cooldownLength: the length of the cooldown period
   * options:
   *   softReset: when resetting/activating, only reset ticks by cooldownLength.
   *     ie. do not reset to zero if activation is late
   *   autoActivate: activate on its own - don't wait for activate() to be
   *     called manually
   *   callback: a function to be called (automatically or not) when complete
   *   delayActivation: wait for the cooldownLength before activating.
   *     Otherwise, activate immediately
   */
  constructor(cooldownLength, options={}) {
    this.cooldownLength = cooldownLength
    this.softReset = options.softReset
    this.autoActivate = options.autoActivate
    this.callback = options.callback || (() => {})

    if (!options.delayActivation) {
      this.ticksPassed = cooldownLength
    }

  }

  toJSON() {
    return {
      ticksPassed: this.ticksPassed,
      cooldownLength: this.cooldownLength,
    }
  }

  /*
   * Increment time. Main function. Cooldown will become ready or closer to use.
   */
  tick() {
    this.ticksPassed++
    this.totalTicks++
    if (this.autoActivate && this.ready()) {
      this.activate()
    }
  }

  /*
   * Inform the Cooldown class that the ability has been activated.
   * This will trigger the cooldown and potentially call a callback.
   */
  activate() {
    this.coolDown()
    this.callback()
    this.numActivations += 1
  }

  /*
   * Trigger the cooldown period.
   * Will either subtract time or reset to 0, depending on settings.
   */
  coolDown() {
    if (this.softReset) {
      this.ticksPassed -= this.cooldownLength
    } else {
      this.reset()
    }
  }

  /*
   * Restarts the cooldown - ensures the ticks pass are set to zero.
   */
  reset() {
    this.setTicksPassed(0)
  }

  /*
   * Returns whether or not the ability is ready to use.
   */
  ready() {
    return this.ticksPassed >= this.cooldownLength
  }

  /*
   * A synonym for ready() for certain contexts (eg. ammo used up)
   */
  spent() {
    return this.ready()
  }

  /*
   * Set ticksPassed to a new value (required for game updates/corrections).
   */
  @action setTicksPassed(newTicksPassed) {
    this.ticksPassed = newTicksPassed
  }

  ticksUntilReady() {
    return Math.max(0, this.cooldownLength - this.ticksPassed)
  }
}

/*
 * This function allows for passing time-based information to build a tick-based
 * Cooldown.
 * This allows for cooldowns that are not dependent on the frequency of ticks.
 */
Cooldown.createTimeBased = function(cooldownLength, tickLength, options={}) {
  const numTicks = parseInt(cooldownLength / tickLength)
  return new Cooldown(numTicks, options)
}

export default Cooldown

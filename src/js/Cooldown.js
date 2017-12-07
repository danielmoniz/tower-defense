
class Cooldown {
  // for cooldown mechanics
  timePassed = 0
  ticks = 0
  numActivations = 0

  // for performance checks - @TODO Should be handled by a separate class
  originalTime = undefined
  latestTime = undefined
  average = undefined
  performance = 1 // speed performance (1 is perfect)

  constructor(tickLength, options={}) {
    this.tickLength = tickLength
    this.callback = options.callback || (() => {})
    this.intendedCallRate = options.callRate
    this.logOutput = options.log
    this.softReset = options.softReset
    this.autoActivate = options.autoActivate
    if (!options.delayActivation) {
      this.timePassed = tickLength
    }
  }

  toJSON() {
    return {
      timePassed: this.timePassed,
    }
  }

  /*
   * Increment time. Main function. Cooldown will become ready or closer to use.
   */
  tick() {
    const now = Date.now()
    if (this.originalTime === undefined) {
      this.initialize(now)
      return
    }

    this.timePassed += (now - this.latestTime)
    this.latestTime = now
    this.calculateMetrics()
    if (this.autoActivate && this.ready()) {
      this.activate(now)
    }
    this.ticks++
  }

  /*
   * Set up variables for first time check.
   */
  initialize(now) {
    this.originalTime = now
    this.latestTime = now
  }

  /*
   * Inform the Cooldown class that the ability has been activated.
   * This will trigger the cooldown and potentially call a callback.
   */
  activate(now) {
    now = now || Date.now()
    this.callback()
    this.coolDown(now)
    this.numActivations += 1
    this.log()
  }

  /*
   * Trigger the cooldown period.
   * Will either subtract time or reset to 0, depending on settings.
   */
  coolDown(now) {
    now = now || Date.now()
    if (this.softReset) {
      this.timePassed -= this.tickLength
    } else {
      this.timePassed = 0
    }
  }

  /*
   * Returns whether or not the ability is ready to use.
   */
  ready() {
    return this.timePassed > this.tickLength
  }

  /*
   * Calculates some metrics for performance purposes.
   * Used for determining which devices (clients/server) are running slow.
   */
  calculateMetrics() {
    this.average = (this.latestTime - this.originalTime) / this.ticks
    this.performance = parseFloat(this.intendedCallRate) / this.average
  }

  /*
   * Output some information about the metrics.
   */
  log() {
    if (this.logOutput && this.average) {
      // console.log('Average interval:', this.average);
      console.log('Average slowdown:', this.performance);
      console.log("Number of activations:", this.numActivations);
    }
  }
}

export default Cooldown


class Cooldown {
  timePassed = 0
  ticks = 0
  originalTime = undefined
  latestTime = undefined
  average = undefined
  performance = 1 // speed performance (1 is perfect)
  numActivations = 0

  constructor(tickLength, callback, options) {
    this.tickLength = tickLength
    this.callback = callback || (() => {
      console.log('No activation callback supplied')
    })
    this.intendedCallRate = options.callRate
    this.logOutput = options.log
  }

  tick() {
    const now = Date.now()
    if (this.originalTime === undefined) {
      this.initialize(now)
      return
    }

    this.timePassed += (now - this.latestTime)
    this.latestTime = now
    this.calculateMetrics()
    if (this.timePassed > this.tickLength) {
      this.activate(now)
    }
    this.ticks++
  }

  initialize(now) {
    this.originalTime = now
    this.latestTime = now
  }

  activate(now) {
    this.callback()
    this.coolDown(now)
    this.numActivations += 1
    this.log()
  }

  coolDown(now) {
    this.timePassed -= this.tickLength
  }

  calculateMetrics() {
    this.average = (this.latestTime - this.originalTime) / this.ticks
    this.performance = parseFloat(this.intendedCallRate) / this.average
  }

  log() {
    if (this.logOutput && this.average) {
      // console.log('Average interval:', this.average);
      console.log('Average slowdown:', this.performance);
      console.log("Number of activations:", this.numActivations);
    }
  }
}

export default Cooldown

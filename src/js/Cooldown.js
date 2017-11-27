
class Cooldown {
  timePassed = 0
  ticks = 0
  originalTime = undefined
  latestTime = undefined
  average = undefined
  performance = 1 // speed performance (1 is perfect)
  numActivations = 0

  constructor(tickLength, options={}) {
    this.tickLength = tickLength
    this.callback = options.callback || (() => {})
    this.intendedCallRate = options.callRate
    this.logOutput = options.log
    this.autoActivate = options.autoActivate
    if (!options.delayActivation) {
      this.timePassed = tickLength
    }
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
    if (this.autoActivate && this.ready()) {
      this.activate(now)
    }
    this.ticks++
  }

  initialize(now) {
    this.originalTime = now
    this.latestTime = now
  }

  activate(now) {
    now = now || Date.now()
    this.callback()
    this.coolDown(now)
    this.numActivations += 1
    this.log()
  }

  coolDown(now) {
    now = now || Date.now()
    if (this.autoActivate) { // allows for more accurate activations
      this.timePassed -= this.tickLength
    } else {
      this.timePassed = 0
    }
  }

  ready() {
    return this.timePassed > this.tickLength
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


import Cooldown from './Cooldown'

class Performance {

  maxTimePoints = 5
  pauseTime = undefined
  totalPausedTime = 0

  // @TODO Allow for passing in current adjusted speed.
  // This should allow for the game to speed back up if performing well.
  constructor(cooldownLength, tickLength, options={}) {
    this.cooldown = Cooldown.createTimeBased(cooldownLength, tickLength, options)
    this.tickLength = tickLength
    this.times = []
    this.ticks = []
    this.marks = []
  }

  // @TODO Refactor this function into smaller pieces.
  next() {
    if (this.pauseTime) { return }

    const now = Date.now()
    this.cooldown.tick()
    this.ticks = this.ticks.map((numTicks) => {
      return numTicks + 1
    })

    if (!this.cooldown.ready()) { return }

    this.cooldown.activate()

    // calculate time, but subtract the total paused time.
    const adjustedTime = now - this.totalPausedTime
    this.times.push(adjustedTime)
    this.ticks.push(0)

    if (this.times.length <= 1) { return }

    const numData = this.times.length
    const latestTimePassed = this.times[numData - 1] - this.times[numData - 2]
    const latestTicksPassed = this.ticks[numData - 2]
    const timePerTick = latestTimePassed / latestTicksPassed
    const performance = this.tickLength / timePerTick
    this.marks.push(performance)
    // console.log('-----');
    // console.log(this.marks);

    // console.log(this.getAverage());

    if (this.times.length > this.maxTimePoints) {
      this.times.splice(0, 1)
      this.ticks.splice(0, 1)
      this.marks.splice(0, 1)
    }

    // console.log(this.marks);
    // console.log('Latest mark:', this.marks[this.marks.length - 1]);
  }

  getAverage() {
    if (this.marks.length < 2) { return 1 }
    const currentAverage = this.marks.length / this.marks.reduce((memo, mark) => {
      return memo + mark
    })
    // console.log("Average over last " + this.marks.length + " data points:", currentAverage);
    return currentAverage
  }

  getSpeedSuggestion() {
    const average = this.getAverage()
    const difference = Math.max(1, average) - 1
    return 1 + (difference * 0.9)
  }

  ready() {
    return this.cooldown.ready()
  }

  pause() {
    // avoid resetting pauseTime if already paused
    if (this.pauseTime !== undefined) { return }
    this.pauseTime = new Date()
  }

  resume() {
    // avoid resuming performance if not currently paused
    if (this.pauseTime === undefined) { return }
    const elapsedTime = new Date() - this.pauseTime
    this.totalPausedTime += elapsedTime
    delete this.pauseTime
  }
}

export default Performance

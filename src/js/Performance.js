
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

  incrementTicks(ticks) {
    return ticks.map((numTicks) => {
      return numTicks + 1
    })
  }

  // @TODO Refactor this function into smaller pieces.
  next() {
    if (this.pauseTime) { return }

    this.cooldown.tick()
    this.ticks = this.incrementTicks(this.ticks)

    this.sample()
  }

  sample() {
    if (!this.cooldown.ready()) { return }

    this.cooldown.activate()

    this.addNewTime(this.times)
    this.addNewTick(this.ticks)
    this.sampleMark()

    this.trimSamples()
  }

  sampleMark() {
    if (this.times.length <= 1) { return }
    const newMark = this.getNewMark(this.tickLength, this.times, this.ticks)
    this.marks.push(newMark)
    // console.log('Latest mark:', this.marks[this.marks.length - 1]);
  }

  // calculate time, but subtract the total paused time.
  addNewTime(times) {
    const adjustedTime = Date.now() - this.totalPausedTime
    times.push(adjustedTime)
  }

  addNewTick(ticks) {
    ticks.push(0)
  }

  trimSamples() {
    if (this.times.length > this.maxTimePoints) {
      this.times.splice(0, 1)
      this.ticks.splice(0, 1)
      this.marks.splice(0, 1)
    }
  }

  getNewMark(tickLength, times, ticks) {
    const numData = times.length
    const latestTimePassed = times[numData - 1] - times[numData - 2]
    const latestTicksPassed = ticks[numData - 2]
    const timePerTick = latestTimePassed / latestTicksPassed
    return tickLength / timePerTick // @TODO This should be flipped! Use inverse instead.
  }

  getAverage(marks) {
    if (marks.length < 2) { return 1 }
    const currentAverage = marks.length / marks.reduce((memo, mark) => {
      return memo + mark
    })
    // console.log("Average over last " + this.marks.length + " data points:", currentAverage);
    return currentAverage
  }

  getSpeedSuggestion() {
    const average = this.getAverage(this.marks)
    const difference = Math.max(1, average) - 1
    return 1 + (difference * 0.9)
  }

  ready() {
    return this.cooldown.ready()
  }

  pause() {
    // avoid resetting pauseTime if already paused
    if (this.pauseTime !== undefined) { return }

    this.next()
    this.marks[this.marks.length] = this.getAverage(this.marks) // override latest mark

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

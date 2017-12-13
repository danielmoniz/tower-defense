
import Cooldown from './Cooldown'

class Performance {

  maxTimePoints = 5

  constructor(cooldownLength, tickLength, options={}) {
    this.cooldown = Cooldown.createTimeBased(cooldownLength, tickLength, options)
    this.tickLength = tickLength
    this.times = []
    this.ticks = []
    this.marks = []
  }

  next() {
    const now = Date.now()
    this.cooldown.tick()
    this.ticks = this.ticks.map((numTicks) => {
      return numTicks + 1
    })

    if (!this.cooldown.ready()) { return }

    this.cooldown.activate()
    this.times.push(now)
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
  }

  getAverage() {
    if (this.marks.length < 2) { return 1 }
    const currentAverage = this.marks.length / this.marks.reduce((memo, mark) => {
      return memo + mark
    })
    console.log("Average over last " + this.marks.length + " data points:", currentAverage);
    return Math.max(1, currentAverage) // < 1 is faster than normal, so cap out at 1
  }

  ready() {
    return this.cooldown.ready()
  }
}

export default Performance

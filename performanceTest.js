
import Performance from './src/js/PerformanceCooldown'


performance = new Performance(2000, 500)

setInterval(() => {
  performance.next()
}, 250)



class GameListener {
  constructor(io) {

    this.io = io
    this.games = {}
    this.setUpListeners()
  }

  setUpListeners() {
    console.log('adding new game listener');
    this.io.on('connection', (socket) => {
      console.log('a user connected');
      socket.on('new game', (socket) => {
        console.log('new game test');
        this.io.emit('start game', Date.now())
      })

      socket.on('latency', (beforeTime, thereTime) => {
        var nowTime = Date.now()
        var twoWayLatency = nowTime - beforeTime
        var oneWayLatency = nowTime - thereTime
        console.log(oneWayLatency);
        console.log(twoWayLatency);
      })
    })
  }
}

module.exports = GameListener

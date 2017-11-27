

class GameListener {
  constructor(io) {

    this.io = io
    this.games = {}
    this.users = {}
    this.io.on('connection', (socket) => {
      console.log('a user connected');
      this.setUpListeners(socket)
    })
  }

  setUpListeners(socket) {
    socket.on('new game', (socket) => {
      console.log('new game test');
      this.io.emit('start game', Date.now())
    })

    socket.on('latency', (thereTime) => {
      var nowTime = Date.now()
      var oneWayLatency = nowTime - thereTime
      console.log('Latency (one-way):', oneWayLatency, 'ms');
    })

    socket.on('join game', (gameNumber) => {
      socket.join(gameNumber) // join room
      socket.broadcast.to(gameNumber).emit('user joins room')

      var game = this.games[gameNumber];
      if (game === undefined) {
        game = {} // @FIXME Make new game object (and start it?)
        this.games[gameNumber] = game
      }
    })
  }
}

module.exports = GameListener

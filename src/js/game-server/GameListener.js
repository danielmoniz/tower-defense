
import Game from '../Game'

class GameListener {

  constructor(io) {
    this.io = io
    // this.games = {}
    // this.users = {}
    this.io.on('connection', (socket) => {
      console.log('a user connected');
      this.setUpListeners(socket)
    })
  }

  setUpListeners(socket) {
    socket.on('new game', (gameNumber) => {
      // const game = this.games[gameNumber]
      // if (!game) {
      //   console.log('Game not found!');
      //   // @TODO Create new one?
      //   return
      // }

      // if (socket.game) {
      //   socket.game.pause()
      //   delete socket.game
      // }
      if (!socket.game) {

      }
      socket.game.start()
      this.io.emit('start game', Date.now())
    })

    socket.on('latency', (thereTime) => {
      var nowTime = Date.now()
      var oneWayLatency = nowTime - thereTime
      console.log('Latency (one-way):', oneWayLatency, 'ms');
    })

    socket.on('join game', (gameNumber) => {
      socket.roomId = gameNumber
      socket.join(gameNumber) // join room
      socket.broadcast.to(gameNumber).emit('user joins room')

      // let game = this.games[gameNumber];
      // if (game === undefined) {
        // game = {} // @FIXME Make new game object
        if (!socket.game) {
          socket.game = new Game('server')
        }
        // this.games[gameNumber] = game
      // }
    })

    socket.on('pause', () => {
      console.log('pausing');
      socket.game.pause()
      socket.broadcast.to(socket.roomId).emit('pause')
    })

    socket.on('play', () => {
      console.log('playing');
      socket.game.play()
      socket.broadcast.to(socket.roomId).emit('play')
    })

    socket.on('place tower', (tower) => {
      console.log('placing tower at:', tower.x, tower.y);
      socket.game.placeTower(tower)
      socket.broadcast.to(socket.roomId).emit('place tower', tower)
    })
  }
}

module.exports = GameListener


import Game from '../Game'
import Cooldown from '../Cooldown'

class GameListener {

  constructor(io) {
    this.io = io
    this.games = {}
    // this.users = {}
    this.io.on('connection', (socket) => {
      console.log('a user connected');
      this.setUpListeners(socket)
    })
    this.setUpSyncer()
  }

  setUpSyncer() {
    const interval = 4000
    console.log('Setting up syncer');
    this.updateCooldown = new Cooldown(interval, {
      callback: this.updateGames.bind(this),
      autoActivate: true,
    })
    setInterval(() => {
      this.updateCooldown.tick()
    }, 1000)

  }

  updateGames() {
    console.log('Updating all games');
    Object.keys(this.games).forEach((gameId) => {
      const game = this.games[gameId]
      this.io.to(gameId).emit('update all', {
        enemies: game.enemies,
      })
      // this.games[gameId]
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

      let game = this.games[gameNumber];
      console.log('Games:', Object.keys(this.games));
      if (game === undefined) {
        game = new Game('server')
      } else {
        console.log("Game already exists!");
      }
      socket.game = game
      this.games[gameNumber] = game
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

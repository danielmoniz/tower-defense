
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
    const syncInterval = 4000, tickInterval = 1000
    console.log('Setting up syncer');
    this.updateCooldown = new Cooldown(syncInterval, {
      callback: this.syncGames.bind(this),
      autoActivate: true,
      log: true,
      callRate: tickInterval,
    })
    setInterval(() => {
      this.updateCooldown.tick()
    }, tickInterval)

  }

  syncGames() {
    // console.log('Updating all games');
    const performance = this.updateCooldown.performance
    Object.keys(this.games).forEach((gameId) => {
      const game = this.games[gameId]
      this.io.to(gameId).emit('update all', this.getGameData(game))
    })
  }

  /*
   * Update a the game for a single player (usually a newly entered player).
   */
  syncPlayer(socket) {
    socket.emit('update all', this.getGameData(socket.game))
  }

  getGameData(game, performance=1) {
    return {
      enemies: game.enemies,
      towers: game.towers,
      credits: game.credits.current,
      waveNumber: game.waveNumber,
      gameSpeedMultiplier: performance,
    }
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
      socket.game.start()
      // @TODO should only go to this game/room specifically
      this.io.to(gameNumber).emit('start game', Date.now())
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
      this.syncPlayer(socket)
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

    socket.on('spawn wave', () => {
      console.log('spawning next wave');
      socket.game.spawnWave()
      this.io.to(socket.roomId).emit('spawn wave')
    })

    socket.on('place tower', (tower) => {
      console.log('placing tower at:', tower.x, tower.y);
      socket.game.placeTower(tower)
      socket.broadcast.to(socket.roomId).emit('place tower', tower)
    })
  }
}

module.exports = GameListener

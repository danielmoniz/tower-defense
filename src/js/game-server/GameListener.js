
import GameManager from '../GameManager'
import Cooldown from '../Cooldown'
import GameEmitter from './GameEmitter'

class GameListener {

  constructor(io) {
    this.io = io
    this.emitter = new GameEmitter(io)

    this.gameManagers = {}
    // this.users = {}
    this.io.on('connection', (socket) => {
      console.log('a user connected');
      this.setUpListeners(socket)
      this.pollForGameNumber(socket)
    })
    this.setUpSyncer()
  }

  /*
   * Ask player to join game. Helps if connection is lost (eg. server restart).
   */
  pollForGameNumber(socket) {
    socket.emit('poll for game number')
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
    Object.keys(this.gameManagers).forEach((gameId) => {
      const gameManager = this.gameManagers[gameId]
      this.io.to(gameId).emit('update all', this.getGameData(gameManager.game))
    })
  }

  /*
   * Update a the game for a single player (usually a newly entered player).
   */
  syncPlayer(socket) {
    socket.emit('update all', this.getGameData(socket.gameManager.game))
  }

  getGameData(game, performance=1) {
    return {
      enemies: game.enemies,
      towers: game.towers,
      credits: game.credits.current,
      waveNumber: game.wave.number,
      gameSpeedMultiplier: performance,
      inProgress: game.inProgress,
    }
  }

  joinGame(socket, gameNumber) {
    socket.roomId = gameNumber
    socket.join(gameNumber)
    socket.broadcast.to(gameNumber).emit('user joins room')

    let gameManager = this.gameManagers[gameNumber];
    console.log('Games:', Object.keys(this.gameManagers));
    if (gameManager === undefined) {
      gameManager = new GameManager('server')
    } else {
      console.log("Game already exists!");
    }
    socket.gameManager = gameManager
    this.gameManagers[gameNumber] = gameManager
    this.syncPlayer(socket)
  }

  setUpListeners(socket) {
    socket.on('new game', (gameNumber) => {
      // const game = this.gameManagers[gameNumber]
      // if (!game) {
      //   console.log('Game not found!');
      //   // @TODO Create new one?
      //   return
      // }

      // if (socket.game) {
      //   socket.game.pause()
      //   delete socket.game
      // }
      socket.gameManager.start()
      // @TODO should only go to this game/room specifically
      this.emitter.startGame(gameNumber)
      // this.io.to(gameNumber).emit('start game', Date.now())
    })

    socket.on('latency', (thereTime) => {
      var nowTime = Date.now()
      var oneWayLatency = nowTime - thereTime
      console.log('Latency (one-way):', oneWayLatency, 'ms');
    })

    socket.on('join game', (gameNumber) => {
      this.joinGame(socket, gameNumber)
    })

    socket.on('pause', () => {
      console.log('pausing');
      socket.gameManager.game.pause()
      socket.broadcast.to(socket.roomId).emit('pause')
    })

    socket.on('play', () => {
      console.log('playing');
      socket.gameManager.game.play()
      socket.broadcast.to(socket.roomId).emit('play')
    })

    socket.on('spawn wave early', () => {
      console.log('spawning next wave');
      const newEnemies = socket.gameManager.game.wave.spawn()
      this.io.to(socket.roomId).emit('spawn wave', newEnemies)
    })

    socket.on('place tower', (tower) => {
      console.log('placing tower at:', tower.x, tower.y);
      socket.gameManager.game.placeTower(tower)
      socket.broadcast.to(socket.roomId).emit('place tower', tower)
    })
  }
}

module.exports = GameListener


import GameManager from '../GameManager'
import Cooldown from '../Cooldown'
import GameEmitter from './GameEmitter'
import socketListeners from './socketListeners'

class GameServer {

  constructor(io) {
    this.io = io
    this.emitter = new GameEmitter(io)

    this.gameManagers = {}
    // this.users = {}
    this.io.on('connection', (socket) => {
      console.log('a user connected');
      socketListeners(socket, this.emitter, {
        joinGame: this.joinGame.bind(this),
      })

      this.emitter.pollForGameNumber(socket)
    })
    this.setUpSyncer()
  }

  setUpSyncer() {
    const syncInterval = 4000, tickInterval = 1000
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
}

module.exports = GameServer

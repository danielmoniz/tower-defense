
import GameManager from '../GameManager'
import Cooldown from '../Cooldown'
import GameEmitter from './GameEmitter'
import socketListeners from './socketListeners'

class GameServer {

  constructor(io) {
    this.io = io
    this.emitter = new GameEmitter(io)

    // @TODO May want to store both in same object to avoid desyncing of user/game data
    this.rooms = {}
    this.users = getObjectProxy()

    this.io.on('connection', (socket) => {
      socket.on('disconnect', () => {
        console.log('a user disconnected');
        this.removeUserFromGame(socket.id, socket.roomId)
        this.clearRoomIfEmpty(socket.roomId)
      })
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
    this.updateCooldown = Cooldown.createTimeBased(syncInterval, tickInterval, {
      callback: this.syncGames.bind(this),
      autoActivate: true,
      callRate: tickInterval,
    })
    setInterval(() => {
      this.updateCooldown.tick()
    }, tickInterval)

  }

  syncGames() {
    // console.log('Updating all games');
    const performance = this.updateCooldown.performance
    Object.keys(this.rooms).forEach((gameId) => {
      const gameManager = this.getGameManager(gameId)
      if (gameManager.gameInProgress()) { // only update games in progress
        const gameData = this.getGameData(gameManager.game)
        this.io.to(gameId).emit('update all', gameData)
      }
    })
  }

  /*
   * Update a the game for a single player (usually a newly entered player).
   */
  syncPlayer(socket) {
    const gameManager = this.getGameManager(socket.roomId)
    if (gameManager.gameInProgress()) {
      socket.emit('update all', this.getGameData(socket.gameManager.game))
    }
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

    let gameManager = this.getGameManager(gameNumber);
    if (gameManager === undefined) {
      gameManager = new GameManager(gameNumber, 'server', false, this.emitter)
      gameManager.gameNumber = gameNumber
    } else {
      console.log("Game already exists!");
    }
    this.removeClearGameTimeout(gameNumber)
    socket.gameManager = gameManager
    this.rooms[gameNumber] = { manager: gameManager }

    this.addUserToGame(socket.id, gameNumber)
    this.syncPlayer(socket)
  }

  addUserToGame(id, gameNumber) {
    const users = this.users[gameNumber]
    if (users.indexOf(id) === -1) {
      users.push(id)
      this.users[gameNumber] = users
      this.removeClearGameTimeout(gameNumber)
    }
    console.log(this.users);
  }

  removeUserFromGame(id, gameNumber) {
    const index = this.users[gameNumber].indexOf(id)
    if (index === -1) { return }
    this.users[gameNumber].splice(index, 1)
    console.log(this.users);
  }

  clearRoomIfEmpty(gameNumber) {
    const gameManager = this.getGameManager(gameNumber)
    if (!gameManager) { return } // game is solo - do not clear!

    if (this.users[gameNumber].length === 0) {
      // Trigger 30 second timeout - destroy game after that
      this.rooms[gameNumber].timeout = setTimeout(() => {
        console.log("Clearing room " + gameNumber);
        gameManager.game.endGame()
        gameManager.destroyGame()
        delete this.rooms[gameNumber]
      }, 30000)
    }
  }

  removeClearGameTimeout(gameNumber) {
    if (!this.rooms[gameNumber]) { return } // nothing to clear
    clearTimeout(this.rooms[gameNumber].timeout)
    delete this.rooms[gameNumber].timeout
  }

  endGame(gameNumber) {
    this.getGameManager(gameNumber).destroyGame()
  }

  getGameManager(roomId) {
    if (this.rooms[roomId] === undefined) { return undefined }
    return this.rooms[roomId].manager
  }
}

function getObjectProxy() {
  return new Proxy({}, {
    get: function(object, property) {
      return object.hasOwnProperty(property) ? object[property] : []
    },
  })
}

module.exports = GameServer


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

    this.io.on('connection', (socket) => {
      socket.on('disconnect', () => {
        console.log('a user disconnected');
        this.removeUserFromGame(socket.id, socket.roomId)
        this.clearRoomIfEmpty(socket.roomId)
      })
      console.log('a user connected');
      socketListeners(socket, this.emitter, {
        joinGame: this.joinGame.bind(this),
        updatePerformance: this.updatePerformance.bind(this),
        getGameData: this.getGameData.bind(this),
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

    setInterval(() => {
      this.syncSpeed()
    }, 1000)

  }

  syncGames() {
    // console.log('Updating all games');
    Object.keys(this.rooms).forEach((roomId) => {
      const gameManager = this.getGameManager(roomId)
      if (gameManager.gameInProgress()) { // only update games in progress
        const gameData = this.getGameData(gameManager.game)
        this.io.to(roomId).emit('update all', gameData, Date.now())
      }
    })
  }

  // @TODO Refactor to re-use code from syncGames()
  syncSpeed() {
    Object.keys(this.rooms).forEach((roomId) => {
      const gameManager = this.getGameManager(roomId)
      if (gameManager.gameInProgress()) { // only update games in progress
        const gameSpeed = this.getSlowestGameSpeed(roomId)
        this.io.to(roomId).emit('set game speed', gameSpeed)
        // set game speed on server
        gameManager.game.adjustGameSpeed(gameSpeed)
      }
    })
  }

  getSlowestGameSpeed(roomId) {
    const performanceData = this.rooms[roomId].performance
    const speeds = Object.values(performanceData)
    // handle case when room is empty
    if (speeds.length === 0) { return 1 }

    const slowestGameSpeed = speeds.reduce((memo, speed) => {
      return Math.max(memo, speed)
    })
    this.printGameSpeeds(roomId, performanceData, slowestGameSpeed);
    return slowestGameSpeed
  }

  printGameSpeeds(roomId, performanceData, slowestGameSpeed) {
    console.log(`Game speeds for room ${roomId}:`);
    console.log(`  Server: ${performanceData.server}`)
    console.log(`  Slowest game speed: ${slowestGameSpeed}`)
  }

  /*
   * Update a the game for a single player (usually a newly entered player).
   */
  syncNewPlayer(socket) {
    const gameManager = this.getGameManager(socket.roomId)
    if (gameManager.gameInProgress()) {
      socket.emit('join existing game', this.getGameData(socket.gameManager.game))
    }
  }

  getGameData(game, performance=1) {
    return {
      enemies: game.enemies.all,
      towers: game.towers.all,
      credits: game.credits.current,
      waveNumber: game.wave.number,
      gameSpeedMultiplier: performance,
      inProgress: game.inProgress,
      control: game.control,
    }
  }

  joinGame(socket, gameNumber) {
    socket.roomId = gameNumber
    socket.join(gameNumber)
    socket.broadcast.to(gameNumber).emit('user joins room')

    let gameManager = this.getGameManager(gameNumber);
    if (gameManager === undefined) {
      gameManager = new GameManager(
        gameNumber,
        'server',
        false,
        this.emitter,
        {
          updatePerformance: this.updatePerformance.bind(this)
        },
      )
      gameManager.gameNumber = gameNumber
      this.rooms[gameNumber] = this.createNewRoom(gameManager)
    } else {
      console.log("Game already exists!");
    }
    this.removeClearGameTimeout(gameNumber)
    socket.gameManager = gameManager

    this.addUserToGame(socket.id, gameNumber)
    this.syncNewPlayer(socket)
  }

  createNewRoom(gameManager) {
    return {
      manager: gameManager,
      users: [],
      performance: {},
    }
  }

  addUserToGame(id, gameNumber) {
    const users = this.getUsers(gameNumber)
    if (users.indexOf(id) === -1) {
      users.push(id)
      this.removeClearGameTimeout(gameNumber)
    }
    console.log(`Room ${gameNumber} users: ${this.getUsers(gameNumber)}`);
  }

  removeUserFromGame(id, roomId) {
    if (roomId === undefined) { return } // must be in solo game
    console.log(`removing user from game (room ${roomId})`);
    const index = this.getUsers(roomId).indexOf(id)
    if (index === -1) { return }
    this.getUsers(roomId).splice(index, 1)
    console.log(`Room ${roomId} users: ${this.getUsers(roomId)}`);

    delete this.rooms[roomId].performance[id]
  }

  clearRoomIfEmpty(gameNumber) {
    const gameManager = this.getGameManager(gameNumber)
    if (!gameManager) { return } // game is solo - do not clear!

    if (this.getUsers(gameNumber).length === 0) {
      // Trigger 30 second timeout - destroy game after that
      this.rooms[gameNumber].timeout = setTimeout(() => {
        if (!gameManager || !gameManager.game) { return }
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

  /*
   * Updates the performance object for a room with a specific key-value pair.
   * Keys are usually socket ids, but can also be 'server'.
   */
  updatePerformance(roomId, key, performance) {
    if (!this.rooms[roomId]) { return }
    this.rooms[roomId].performance[key] = performance
    // console.log(this.rooms[roomId].performance);
  }

  getGameManager(roomId) {
    if (this.rooms[roomId] === undefined) { return undefined }
    return this.rooms[roomId].manager
  }

  getUsers(roomId) {
    return this.rooms[roomId] && this.rooms[roomId].users
  }
}

module.exports = GameServer

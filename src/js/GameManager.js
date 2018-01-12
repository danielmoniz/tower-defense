
import ClientMultiGame from './game/ClientMultiGame'
import SoloGame from './game/SoloGame'
import ServerGame from './game/ServerGame'
import ClientEmitter from './client/GameEmitter'
import socketListeners from './client/socketListeners'

class GameManager {
  constructor(roomNumber, runningOnServer, isSolo, emitter, actions) {
    this.runningOnServer = runningOnServer
    this.isSolo = isSolo
    this.actions = actions
    this.roomNumber = roomNumber

    if (emitter === undefined && !runningOnServer && !isSolo) {
      emitter = new ClientEmitter()
    }
    this.emitter = emitter

    this.createGame()
    // this.game.play()
  }

  createGame() {
    const GameClass = this.getGameClass(this.runningOnServer, this.isSolo)
    this.game = new GameClass(
      this.emitter,
      {
        ...this.actions,
        destroyGame: this.destroyGame.bind(this),
      },
      { gameNumber: this.roomNumber },
    )

    if (!this.runningOnServer) {
      socketListeners(this.game, this.emitter)
    }

    if (typeof window !== 'undefined') {
      window.game = this.game
    }
  }

  getGameClass(runningOnServer, isSolo) {
    if (isSolo) { return SoloGame }
    if (runningOnServer) { return ServerGame }
    return ClientMultiGame
  }

  start() {
    if (!this.game) {
      this.createGame()
    }
    this.game.start()
  }

  destroyGame() {
    delete this.game
  }

  gameInProgress() {
    return this.game && this.game.inProgress
  }
}

export default GameManager

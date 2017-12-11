
import ClientMultiGame from './game/ClientMultiGame'
import SoloGame from './game/SoloGame'
import ServerGame from './game/ServerGame'
import ClientEmitter from './client/GameEmitter'
import socketListeners from './client/socketListeners'

class GameManager {
  constructor(gameNumber, runningOnServer, isSolo, emitter) {
    if (emitter === undefined && !runningOnServer && !isSolo) {
      emitter = new ClientEmitter()
    }

    const GameClass = this.getGameClass(runningOnServer, isSolo)
    this.game = new GameClass(
      emitter,
      this.destroyGame.bind(this),
      runningOnServer,
      isSolo,
      { gameNumber },
    )

    if (isSolo) {
      this.solo = true
      console.log('PLAYING SOLO');
    }

    if (!runningOnServer) {
      socketListeners(this.game, emitter)
    }
    // this.game.play()
  }

  getGameClass(runningOnServer, isSolo) {
    if (isSolo) { return SoloGame }
    if (runningOnServer) { return ServerGame }
    return ClientMultiGame
  }

  start() {
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

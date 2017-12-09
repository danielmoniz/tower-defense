
import ClientMultiGame from './game/ClientMultiGame'
import SoloGame from './game/SoloGame'
import ServerGame from './game/ServerGame'
import GameEmitter from './client/GameEmitter'
import socketListeners from './client/socketListeners'

class GameManager {
  constructor(runningOnServer, isSolo) {
    let emitter
    if (!runningOnServer && !isSolo) {
      emitter = new GameEmitter()
    }
    this.game = this.getGameObject(emitter, runningOnServer, isSolo)
    if (isSolo) {
      this.solo = true
      console.log('PLAYING SOLO');
    }

    socketListeners(this.game, emitter)
    // this.game.play()
  }

  getGameObject(emitter, runningOnServer, isSolo) {
    if (isSolo) {
      return new SoloGame(emitter, this.destroyGame.bind(this), runningOnServer, isSolo)
    }
    if (runningOnServer) {
      return new ServerGame(emitter, this.destroyGame.bind(this), runningOnServer, isSolo)
    }
    return new ClientMultiGame(emitter, this.destroyGame.bind(this), runningOnServer, isSolo)
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

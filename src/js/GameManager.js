
import ClientGame from './game/ClientGame'
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

    socketListeners(this.game, emitter)
    this.game.play()
  }

  getGameObject(emitter, runningOnServer, isSolo) {
    if (isSolo) {
      console.log('PLAYING SOLO');
      return new SoloGame(emitter, this.destroyGame.bind(this), runningOnServer)
    } else if (runningOnServer) {
      return new ServerGame(emitter, this.destroyGame.bind(this), runningOnServer)
    } else {
      return new ClientGame(emitter, this.destroyGame.bind(this), runningOnServer)
    }
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


import Game from './Game'
import GameEmitter from './GameEmitter'
import socketListeners from './socketListeners'

class GameManager {
  constructor(runningOnServer) {
    let emitter
    if (!runningOnServer) { // @TODO should use the server emitter if on server
      emitter = new GameEmitter()
    }
    this.game = new Game(emitter, this.destroyGame.bind(this), runningOnServer)
    socketListeners(this.game, emitter)
    this.game.play()
  }

  start() {
    this.game.start()
  }

  destroyGame() {
    // delete this.game
  }
}

export default GameManager

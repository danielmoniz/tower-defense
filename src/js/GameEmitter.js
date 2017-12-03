
import socketListeners from './socketListeners'

class GameEmitter {

  constructor(game, server) {
    this.game = game
    if (!server) {
      this.server = server
      this.socket = socket
      this.gameNumber = document.querySelector('input[name=gameNumber]').value
      if (this.gameNumber) {
        this.joinGame()
      } else {
        console.log("No game number. Failed to join game.");
      }
    }
  }

  joinGame() {
    this.emit('join game', this.gameNumber)
  }

  addNewGame() {
    socket.emit('new game', this.gameNumber)
  }

  pause() {
    this.emit('pause')
  }

  play() {
    this.emit('play')
  }

  spawnWaveEarly() {
    this.emit('spawn wave early')
  }

  placeTower(tower) {
    this.emit('place tower', tower)
  }

  /*
   * Emit to the server, but only if this is a client.
   * Otherwise, do nothing (or log for testing).
   */
  emit(action, ...theArgs) {
    if (!this.server) {
      this.socket.emit(action, ...theArgs)
    }
  }
}

export default GameEmitter


import socketListeners from './socketListeners'

class GameListener {

  constructor(game, server) {
    this.game = game
    if (!server) {
      this.server = server
      this.socket = socket
      this.gameNumber = document.querySelector('input[name=gameNumber]').value
      if (this.gameNumber) {
        this.joinGame(this.gameNumber)
      } else {
        console.log("No game number. Failed to join game.");
      }

      this.setUpListeners()
    }
  }

  setUpListeners() {
    socketListeners(this.game, this)
  }

  joinGame(gameNumber) {
    this.emit('join game', gameNumber)
  }

  addNewGame() {
    socket.emit('new game', this.gameNumber)
    socket.emit('connection', 'test')
    console.log('emitting new game signal');
  }

  pause() {
    this.emit('pause')
  }

  play() {
    this.emit('play')
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

export default GameListener

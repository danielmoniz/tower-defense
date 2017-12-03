
class GameEmitter {
  constructor(io) {
    this.io = io
  }

  startGame(gameNumber) {
    this.io.to(gameNumber).emit('start game', Date.now())
  }

  /*
   * Ask player to join game. Helps if connection is lost (eg. server restart).
   */
  pollForGameNumber(socket) {
    socket.emit('poll for game number')
  }
}

export default GameEmitter


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

  spawnWave(gameNumber, newEnemies) {
    this.io.to(gameNumber).emit('spawn wave', newEnemies)
  }

  play(socket) {
    socket.broadcast.to(socket.roomId).emit('play')
  }

  pause(socket) {
    socket.broadcast.to(socket.roomId).emit('pause')
  }

  sendPerformance(roomId, performance) {
    this.io.to(roomId).emit('send performance', performance)
  }
}

export default GameEmitter

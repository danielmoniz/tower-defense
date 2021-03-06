
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

  spawnWave(gameNumber, newEnemies, roundAttributes) {
    this.io.to(gameNumber).emit('spawn wave', newEnemies, roundAttributes)
  }

  sendTerrain(gameNumber, terrainData) {
    this.io.to(gameNumber).emit('send terrain', terrainData)
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

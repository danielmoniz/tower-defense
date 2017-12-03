
class GameEmitter {
  constructor(io) {
    this.io = io
  }

  startGame(gameNumber) {
    this.io.to(gameNumber).emit('start game', Date.now())
  }
}

export default GameEmitter


export default function socketListeners(socket, emitter, serverFunctions) {
  socket.on('place tower', (tower) => {
    console.log('placing tower at:', tower.x, tower.y);
    socket.gameManager.game.placeTower(tower)
    socket.broadcast.to(socket.roomId).emit('place tower', tower)
  })

  socket.on('spawn wave early', () => {
    const newEnemies = socket.gameManager.game.spawnWave()
    emitter.spawnWave(socket.roomId, newEnemies)
  })

  socket.on('pause', () => {
    console.log('pausing');
    socket.gameManager.game.pause()
    emitter.pause(socket)
  })

  socket.on('play', () => {
    console.log('playing');
    socket.gameManager.game.play()
    emitter.play(socket)
  })

  socket.on('new game', (gameNumber) => {
    socket.gameManager.start()
    // @TODO should only go to this game/room specifically
    emitter.startGame(gameNumber)
  })

  socket.on('latency', (thereTime) => {
    var nowTime = Date.now()
    var oneWayLatency = nowTime - thereTime
    console.log('Latency (one-way):', oneWayLatency, 'ms');
  })

  socket.on('join game', (gameNumber) => {
    serverFunctions.joinGame(socket, gameNumber)
  })
}


export default function socketListeners(socket, emitter, serverFunctions) {
  socket.on('place tower', (tower) => {
    console.log('placing tower at:', tower.x, tower.y);
    if (socket.gameManager && socket.gameManager.game) {
      socket.gameManager.game.placeTower(tower)
      socket.broadcast.to(socket.roomId).emit('place tower', tower)
    }
  })
    socket.on('sell tower', (tower) => {
      console.log('selling tower at:', tower.x, tower.y);
      if (socket.gameManager && socket.gameManager.game) {
        // socket.gameManager.game.sellTower(tower)
        // socket.broadcast.to(socket.roomId).emit('sell tower', tower)
      }
    })

  socket.on('spawn wave early', () => {
    if (socket.gameManager && socket.gameManager.game) {
      const newEnemies = socket.gameManager.game.spawnWave()
    }
  })

  socket.on('pause', () => {
    console.log('pausing');
    if (socket.gameManager && socket.gameManager.game) {
      socket.gameManager.game.pause()
      emitter.pause(socket)
    }
  })

  socket.on('play', () => {
    console.log('playing');
    if (socket.gameManager && socket.gameManager.game) {
      socket.gameManager.game.play()
      emitter.play(socket)
    }
  })

  socket.on('new game', (gameNumber) => {
    // @TODO Handle case where there is no GameManager? When would this happen?
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

  socket.on('send performance', (performanceData) => {
    serverFunctions.updatePerformance(socket.roomId, socket.id, performanceData)
  })
}


export default function socketListeners(socket, emitter, serverFunctions) {
  socket.on('place tower', (tower) => {
    console.log('placing tower at:', tower.x, tower.y);
    if (socket.gameManager && socket.gameManager.game) {
      const success = socket.gameManager.game.placeTower(tower)
      if (success) {
        socket.broadcast.to(socket.roomId).emit('place tower', tower)
      }
    }
  })

  socket.on('sell tower', (towerId) => {
    console.log('selling tower with ID:', towerId);
    if (socket.gameManager && socket.gameManager.game) {
      const sellSuccess = socket.gameManager.game.receiveSellTower(towerId)
      if (sellSuccess) {
        console.log('Sell tower success on server side!');
        socket.broadcast.to(socket.roomId).emit('sell tower', towerId)
      }
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

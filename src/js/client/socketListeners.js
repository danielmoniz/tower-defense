
function setUpListeners(game, emitter) {
  if (!emitter) { return }
  emitter.socket.on('update', () => {
    console.log('updating');
  })

  socket.on('start game', () => {
    // kick off the game for the current user
    game.start()
    console.log('starting game!');
  })

  socket.on('user joins room', () => {
    console.log('A new user has joined the game!');
  })

  socket.on('pause', () => {
    console.log('Received pausing signal');
    game.pause()
  })

  socket.on('play', () => {
    console.log('Received play signal');
    game.play()
  })

  socket.on('place tower', (tower) => {
    console.log('placing tower at:', tower.x, tower.y);
    game.placeTower(tower)
  })

  socket.on('sell tower', (towerId) => {
    console.log('selling tower with ID:', towerId);
    game.receiveSellTower(towerId)
  })

  socket.on('update all', (data, serverTime) => {
    game.updateAll(data, serverTime)
  })

  socket.on('join existing game', (gameData) => {
    game.start()
    game.updateAll(gameData)
    console.log('Joined existing game');
  })

  socket.on('spawn wave', (newEnemies) => {
    game.acceptSpawnedWave(newEnemies)
  })

  socket.on('poll for game number', () => {
    emitter.joinGame()
  })

  socket.on('set game speed', (newSpeed) => {
    game.adjustGameSpeed(newSpeed)
  })
}

export default setUpListeners

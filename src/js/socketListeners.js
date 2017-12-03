
function setUpListeners(game, gameListener) {
  gameListener.socket.on('update', () => {
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

  socket.on('update all', (data) => {
    game.updateAll(data)
  })

  socket.on('spawn wave', (newEnemies) => {
    game.wave.spawn()
    game.addEnemies(newEnemies)
  })

  socket.on('poll for game number', () => {
    gameListener.joinGame()
  })
}

export default setUpListeners

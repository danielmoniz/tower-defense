
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
}

export default setUpListeners

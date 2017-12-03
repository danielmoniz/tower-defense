
export default function socketListeners(socket, emitter) {
  socket.on('place tower', (tower) => {
    console.log('placing tower at:', tower.x, tower.y);
    socket.gameManager.game.placeTower(tower)
    socket.broadcast.to(socket.roomId).emit('place tower', tower)
  })
}

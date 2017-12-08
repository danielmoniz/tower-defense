
export function sendSpawnWave(io, gameNumber) {
  io.to(gameNumber).emit('send')
}

function serverWebSender() {

}

class ServerWebSender {
  sendSpawnWave(socket) {

  }
}

export default ServerWebSender

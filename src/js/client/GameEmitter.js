
class GameEmitter {

  constructor(game, server) {
    this.game = game
    if (!server) {
      this.server = server
      this.socket = socket
      this.gameNumber = document.querySelector('input[name=gameNumber]').value
      if (this.gameNumber) {
        this.joinGame()
      } else {
        console.log("No game number. Failed to join game.");
      }
    }
  }

  joinGame() {
    this.emit('join game', this.gameNumber)
  }

  addNewGame() {
    socket.emit('new game', this.gameNumber)
  }

  pause() {
    this.emit('pause')
  }

  play() {
    this.emit('play')
  }

  spawnWaveEarly() {
    this.emit('spawn wave early')
  }

  placeTower(tower) {
    this.emit('place tower', tower)
  }

  sellTower(tower) {
    this.emit('sell tower', tower.id)
    console.log('EMITTED SELL TOWER');
  }

  upgradeTower(tower, upgradeType) {
    this.emit('upgrade tower', tower.id, upgradeType)
    console.log('EMITTED UPGRADE TOWER', tower.id, upgradeType);
  }

  setTowerTarget(tower, target) {
    this.emit('set tower target', tower.id, target.id)
    console.log('set tower target', tower.id, target.id);
  }

  sendPerformance(data) {
    this.emit('send performance', data)
  }

  /*
   * Emit to the server, but only if this is a client.
   * Otherwise, do nothing (or log for testing).
   */
  emit(action, ...theArgs) {
    if (!this.server) {
      this.socket.emit(action, ...theArgs)
    }
  }
}

export default GameEmitter

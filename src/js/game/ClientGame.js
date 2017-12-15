
import { observable, computed, action, autorun } from 'mobx'

import Game from './Game'
import GameRenderer from '../client/GameRenderer'

class ClientGame extends Game {

  constructor(emitter, actions) {
    super(emitter, actions)
    this.setupUI()
  }

  setupUI() {
    // @TODO This block should move to somewhere UI-specific
    // this.app = new this.renderingEngine.Application({
    //   width: this.width,
    //   height: this.height,
    //   antialias: true,
    //   transparent: false,
    //   resolution: 1,
    // })
    // console.log(this.app);
    // document.body.appendChild(this.app.view)
    // this.app.renderer.backgroundColor = 0xFFFFFF
    // this.app.renderer.view.style.border = '2px solid black'

    this.renderer = new GameRenderer(this)
  }

  spawnWave() {
    const newEnemies = super.spawnWave()
    this.render(newEnemies)
    return newEnemies
  }

  sendPause() {
    this.pause()
  }

  sendPlay() {
    this.play()
  }

  sendPlaceTower() {
    return this.placeTower()
  }

  spawnWaveEarly() {}
}

export default ClientGame

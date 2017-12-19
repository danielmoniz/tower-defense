
import { autorun } from 'mobx'

import { GRID_SIZE } from '../../appConstants'

export default class BoardRenderer {

  setupGameBox(game) {
    this.app = new PIXI.Application({
      width: game.width,
      height: game.height,
      antialias: true,
      transparent: false,
      resolution: 1,
    })
    this.app.view.id = "game-viewport"
    document.body.appendChild(this.app.view)
    this.app.renderer.backgroundColor = 0xFFFFFF
    this.app.renderer.view.style.border = '2px solid black'

    this.loadUnitAssets()

    this.setupCredits(game)

    this.gameBox = document.querySelector("#display-box")
    this.gameBox.style.width = game.width + 'px'
    this.gameBox.style.height = game.height + 'px'
    this.gameBoxBound = this.gameBox.getBoundingClientRect()
  }

  loadUnitAssets() {
    // @TODO Move this into another file
    // load assets into PIXI
    const loader = new PIXI.loaders.Loader()
    loader.add('tank', '/images/tank.png')
          .add('tank_normal', '/images/normal.png')
          .add('tank_fast', '/images/fast.png')
    console.log("Loading images...");
    loader.on("progress", (loader, resource) => {
      const completion = `${Math.floor(loader.progress)}%`
      console.log(completion);
    })
    loader.load((loader, resources) => {
      console.log("All images loaded!");
      // console.log(loader);
    })
  }

  setupCredits(game) {
    const creditsDisplay = document.querySelector(".remainingCredits")
    autorun(() => {
      creditsDisplay.innerHTML = Math.floor(game.credits.current)
    })
  }

  addElement(element) {
    this.gameBox.appendChild(element)
  }

}

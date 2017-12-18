
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
    document.body.appendChild(this.app.view)
    this.app.renderer.backgroundColor = 0xFFFFFF
    this.app.renderer.view.style.border = '2px solid black'

    this.setupCredits(game)

    this.gameBox = document.querySelector("#display-box")
    this.gameBox.style.width = game.width + 'px'
    this.gameBox.style.height = game.height + 'px'
    this.gameBoxBound = this.gameBox.getBoundingClientRect()
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

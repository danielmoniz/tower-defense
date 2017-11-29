
import { autorun } from 'mobx'

import { GRID_SIZE } from './appConstants'

export default class GameRenderer {
  constructor(game) {
    this.game = game
    this.setupGameBox()
    this.addEventHandlers()
    this.creditsDisplay = document.querySelector(".remainingCredits")

    autorun(() => {
      this.creditsDisplay.innerHTML = game.credits.current
    })
  }

  setupGameBox() {
    this.gameBox = document.querySelector("#display-box")
    this.gameBox.style.width = this.game.width + 'px'
    this.gameBox.style.height = this.game.height + 'px'
    this.gameBoxBound = this.gameBox.getBoundingClientRect()
    this.gameCanvas = this.setupGameCanvas(this.gameBox, 'gameCanvas')
    this.gameCanvasContext = this.gameCanvas.getContext('2d')
  }

  setupGameCanvas(frame, id, width = this.game.width, height = this.game.height) {
    let canvas = document.createElement('canvas');
    canvas.id = id
    canvas.width = width
    canvas.height = height
    frame.append(canvas)
    return canvas
  }

  addEventHandlers() {
    this.addEscape()
    this.addPause()
    this.addResume()
    this.addPlaceTower()
    this.addPlaceTowerFollow()
    this.addPlacingTowerHide()
    this.addPlacingTowerShow()
    this.addPlaceTowerOnMap()
    this.addSpawnWave()
    this.addNewGame()
  }

  addNewGame() {
    const newGameButton = document.querySelector("button#new-game")
    newGameButton.addEventListener('click', () => {
      this.game.gameListener.addNewGame()
    })
  }

  addPause() {
    const pauseMoveButton = document.querySelector("button#pause")
    pauseMoveButton.addEventListener('click', () => {
      this.game.sendPause()
    })
  }

  addResume() {
    const resumeMoveButton = document.querySelector("button#resume")
    resumeMoveButton.addEventListener('click', () => {
      this.game.sendPlay()
    })
  }

  addPlaceTower() {
    const placeTowerButton = document.querySelector("button#place-tower")
    placeTowerButton.addEventListener('click', () => {
      this.game.selectNewCannon()
    })
  }

  addPlaceTowerFollow() {
    this.gameBox.addEventListener('mousemove', (event) => {
      if (this.game.placingTower) {
        const bound = this.gameBoxBound
        const placingTower = this.game.placingTower

        const actualX = event.offsetX - placingTower.width / 2.0 + (GRID_SIZE / 2)
        const actualY = event.offsetY - placingTower.height / 2.0 + (GRID_SIZE / 2)
        let gridX = Math.floor(actualX / GRID_SIZE) * GRID_SIZE
        let gridY = Math.floor(actualY / GRID_SIZE) * GRID_SIZE

        // prevent towers being placed over left/top edges
        gridX = Math.max(gridX, 0)
        gridY = Math.max(gridY, 0)

        // prevent towers overlapping right/bottom edges
        gridX = Math.min(gridX, this.game.width - placingTower.width)
        gridY = Math.min(gridY, this.game.height - placingTower.height)

        placingTower.jumpTo(gridX, gridY)
      }
    })
  }

  addPlacingTowerHide() {
    this.gameBox.addEventListener('mouseleave', (event) => {
      if (this.game.placingTower) {
        this.game.placingTower.hide()
      }
    })
  }

  addPlacingTowerShow() {
    this.gameBox.addEventListener('mouseenter', (event) => {
      if (this.game.placingTower) {
        this.game.placingTower.show()
      }
    })
  }

  addPlaceTowerOnMap() {
    this.gameBox.addEventListener('click', (event) => {
      this.game.sendPlaceTower()
    })
  }

  addSpawnWave() {
    const button = document.querySelector("button#spawn-wave")
    button.addEventListener('click', (event) => {
      this.game.sendSpawnWave()
    })
  }

  addEscape() {
    document.addEventListener('keydown', (event) => {
      console.log(event.key);
      if (event.key === 'Escape') {
        this.game.deselectAll()
      } else if (event.key === ' ') {
        event.preventDefault()
        this.game.sendSpawnWave()
      }
    })
  }

}

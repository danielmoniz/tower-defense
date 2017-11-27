
import { autorun } from 'mobx'

import { GRID_SIZE } from './appConstants'

export default class GameRenderer {
  constructor(game) {
    this.game = game
    this.addEventHandlers()
    this.creditsDisplay = document.querySelector(".remainingCredits")

    autorun(() => {
      this.creditsDisplay.innerHTML = game.credits
    })
  }

  addEventHandlers() {
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
      socket.emit('new game')
      socket.emit('connection', 'test')
      console.log('emitting new game signal');
    })

    // @FIXME Put these somewhere reasonable!
    socket.on('start game', () => {
      // kick off the game for the current user
    })

    socket.on('user joins room', () => {
      console.log('A new user has joined the game!');
    })
  }

  addPause() {
    const pauseMoveButton = document.querySelector("button#pause")
    pauseMoveButton.addEventListener('click', () => {
      this.game.pause()
    })
  }

  addResume() {
    const resumeMoveButton = document.querySelector("button#resume")
    resumeMoveButton.addEventListener('click', () => {
      this.game.play()
    })
  }

  addPlaceTower() {
    const placeTowerButton = document.querySelector("button#place-tower")
    placeTowerButton.addEventListener('click', () => {
      this.game.selectNewCannon()
    })
  }

  addPlaceTowerFollow() {
    this.game.gameBox.addEventListener('mousemove', (event) => {
      if (this.game.placingTower) {
        const bound = this.game.gameBoxBound
        const placingTower = this.game.placingTower

        const actualX = event.pageX - placingTower.width / 2.0 - bound.left + (GRID_SIZE / 2)
        const actualY = event.pageY - placingTower.height / 2.0 - bound.top + (GRID_SIZE / 2)
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
    this.game.gameBox.addEventListener('mouseleave', (event) => {
      if (this.game.placingTower) {
        this.game.placingTower.hide()
      }
    })
  }

  addPlacingTowerShow() {
    this.game.gameBox.addEventListener('mouseenter', (event) => {
      if (this.game.placingTower) {
        this.game.placingTower.show()
      }
    })
  }

  addPlaceTowerOnMap() {
    this.game.gameBox.addEventListener('click', (event) => {
      this.game.placeTower()
    })
  }

  addSpawnWave() {
    const button = document.querySelector("button#spawn-wave")
    button.addEventListener('click', (event) => {
      this.game.spawnWave()
    })
  }

}

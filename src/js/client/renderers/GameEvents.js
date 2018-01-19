
import { autorun } from 'mobx'

import { GRID_SIZE } from '../../appConstants'
import BoardRenderer from './BoardRenderer'

export default class GameEvents {

  addEventHandlers(game, gameBox) {
    this.addKeyPresses(game)
    this.addPause(game)
    this.addResume(game)
    this.addPlaceTower(game)
    this.addPlaceTowerFollow(game, gameBox)
    this.addPlacingTowerHide(game, gameBox)
    this.addPlacingTowerShow(game, gameBox)
    this.addPlaceTowerOnMap(game, gameBox)
    this.addSpawnWave(game)
    this.addNewGame(game)
  }

  addNewGame(game) {
    const newGameButton = document.querySelector("button#new-game")
    newGameButton.addEventListener('click', () => {
      game.newGame()
    })
  }

  addPause(game) {
    const pauseMoveButton = document.querySelector("button#pause")
    pauseMoveButton.addEventListener('click', () => {
      game.sendPause()
    })
  }

  addResume(game) {
    const resumeMoveButton = document.querySelector("button#resume")
    resumeMoveButton.addEventListener('click', () => {
      game.sendPlay()
    })
  }

  addPlaceTower(game) {
    const placeTowerButtons = document.querySelectorAll("button.place-tower")
    placeTowerButtons.forEach((button) => {
      button.addEventListener('click', function() {
        game.selectNewTower(this.dataset.towertype)
      })
    })
  }

  addPlaceTowerFollow(game, gameBox) {
    gameBox.addEventListener('mousemove', (event) => {
      if (game.placingTower) {
        const placingTower = game.placingTower

        const actualX = event.offsetX// - placingTower.width / 2.0 + (GRID_SIZE / 2)
        const actualY = event.offsetY// - placingTower.height / 2.0 + (GRID_SIZE / 2)
        let gridX = Math.floor(actualX / GRID_SIZE) * GRID_SIZE
        let gridY = Math.floor(actualY / GRID_SIZE) * GRID_SIZE

        // prevent towers being placed over left/top edges

        const minTowerX = Math.floor(game.placingTower.width / 2 - (game.placingTower.width / 2) % GRID_SIZE)
        const minTowerY = Math.floor(game.placingTower.height / 2 - (game.placingTower.height / 2) % GRID_SIZE)
        gridX = Math.max(gridX, minTowerX)
        gridY = Math.max(gridY, minTowerY)

        // prevent towers overlapping right/bottom edges
        gridX = Math.min(gridX, game.width - Math.floor(game.placingTower.width / 2 + (game.placingTower.width / 2) % GRID_SIZE))
        gridY = Math.min(gridY, game.height - Math.floor(game.placingTower.height / 2 - (game.placingTower.height / 2) % GRID_SIZE))

        // console.log(gridX, gridY);
        placingTower.jumpTo(gridX, gridY)
      }
    })
  }

  addPlacingTowerHide(game, gameBox) {
    gameBox.addEventListener('mouseleave', (event) => {
      if (game.placingTower) {
        game.placingTower.hide()
      }
    })
  }

  addPlacingTowerShow(game, gameBox) {
    gameBox.addEventListener('mouseenter', (event) => {
      if (game.placingTower) {
        game.placingTower.show()
      }
    })
  }

  addPlaceTowerOnMap(game, gameBox) {
    gameBox.addEventListener('click', (event) => {
      game.sendPlaceTower()
    })
  }

  addSpawnWave(game) {
    const button = document.querySelector("button#spawn-wave")
    button.addEventListener('click', (event) => {
      game.spawnWaveEarly()
    })
  }

  addKeyPresses(game) {
    document.addEventListener('keydown', (event) => {
      // console.log(event.key);
      if (event.key === 'Escape') {
        game.deselectAll()
      } else if (event.key === ' ') {
        event.preventDefault()
        game.spawnWaveEarly()
      }
    })
  }

}

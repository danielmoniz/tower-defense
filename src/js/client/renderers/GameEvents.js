
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
    this.setUpTowerUpgrades(game)
    this.setUpTowerMenuSell(game)
  }

  setUpTowerUpgrades(game) {
    const elements = document.querySelectorAll(".tower-actions .upgrade")
    elements.forEach((element) => {
      element.addEventListener('click', () => {
        game.upgradeSelectedTower(element.dataset.upgrade)
      })
    })
  }

  setUpTowerMenuSell(game) {
    const elements = document.querySelectorAll(".tower-actions .sell")
    elements.forEach((element) => {
      element.addEventListener('click', () => {
        console.log('Selling tower!');
        game.sellSelectedTower()
      })
    })
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

        // calculate left x and top y
        const leftX = actualX - (placingTower.width / 2)
        const topY = actualY - (placingTower.height / 2)

        // ensure left x and top y are shifted to a grid point
        let gridX = Math.floor(leftX / GRID_SIZE) * GRID_SIZE
        let gridY = Math.floor(topY / GRID_SIZE) * GRID_SIZE

        // prevent towers being placed over left/top edges
        gridX = Math.max(gridX, 0)
        gridY = Math.max(gridY, 0)

        // prevent towers overlapping right/bottom edges
        // @FIXME @TODO This is not secure! Tower placement over the entrance needs to be handled
        // somewhere in Game so that the server can prevent it.
        gridX = Math.min(gridX, game.width - placingTower.width)
        gridY = Math.min(gridY, game.height - placingTower.height)


        // shift left x and top y to refer to the centre of the unit again for placement (because placement is based on centre)
        gridX += placingTower.width / 2
        gridY += placingTower.height / 2

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

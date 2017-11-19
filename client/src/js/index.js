import { useStrict } from 'mobx'

import Unit from 'Unit'
import Cannon from 'Cannon'
import Tank from 'Tank'
import { GRID_SIZE } from 'appConstants'

useStrict(true)

const gameSize = 700 // size in pixels of game box (square)
const gameBox = document.querySelector("#display-box")
gameBox.style.width = gameSize + 'px'
gameBox.style.height = gameSize + 'px'

let placingTower = false
const allies = [new Tank(), new Tank()]
// const allies = []

let enemiesInWave = 5
const enemies = []
const enemyDistance = Math.floor(gameSize / enemiesInWave)
for (let i = 0; i < enemiesInWave; i++) {
  let enemy = new Tank()
  enemy.jumpTo(gameSize, i * enemyDistance)
  enemy.moveTo(0, i * enemyDistance)
  enemies.push(enemy)
}

allies.concat(enemies).forEach((unit) => unit.startRender())

allies.forEach((ally) => ally.moveTo(getRandomPosition(), getRandomPosition()))

// game loop
window.setInterval(() => {
  // handle spawning waves, etc.
}, 500)

const randomMoveButton = document.querySelector("button#random-move")
randomMoveButton.addEventListener('click', function() {
  allies.forEach((ally) => ally.moveTo(getRandomPosition(), getRandomPosition()))
})


const pauseMoveButton = document.querySelector("button#pause")
pauseMoveButton.addEventListener('click', function() {
  allies.forEach((ally) => ally.pauseMovement())
  enemies.forEach((enemy) => enemy.pauseMovement())
})

const restartMoveButton = document.querySelector("button#restart")
restartMoveButton.addEventListener('click', function() {
  allies.forEach((ally) => ally.startMovement())
  enemies.forEach((enemy) => enemy.startMovement())
})

const placeTowerButton = document.querySelector("button#place-tower")
placeTowerButton.addEventListener('click', function() {
  // make unplaced tower that follows cursor
  placingTower = Unit.create(Cannon, {
    disabled: true,
    display: false,
  })
})

const bound = gameBox.getBoundingClientRect()
gameBox.addEventListener('mousemove', function(event) {
  if (placingTower) {
    const actualX = event.pageX - placingTower.width / 2.0 - bound.left + (GRID_SIZE / 2)
    const actualY = event.pageY - placingTower.height / 2.0 - bound.top + (GRID_SIZE / 2)
    const gridX = Math.floor(actualX / GRID_SIZE) * GRID_SIZE
    const gridY = Math.floor(actualY / GRID_SIZE) * GRID_SIZE
    placingTower.jumpTo(gridX, gridY)
  }
})

gameBox.addEventListener('mouseleave', function(event) {
  if (placingTower) {
    placingTower.hide()
  }
})

gameBox.addEventListener('mouseenter', function(event) {
  if (placingTower) {
    placingTower.show()
  }
})

gameBox.addEventListener('click', function(event) {
  if (placingTower) {
    placingTower.enable()
    placingTower = false
  }
})

function getRandomPosition() {
  return Math.floor(Math.random() * gameSize)
}
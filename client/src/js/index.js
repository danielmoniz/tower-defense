import { useStrict } from 'mobx'

import Unit from 'Unit'

useStrict(true)

const gameSize = 700 // size in pixels of game box (square)

const jasper = new Unit("Jasper")
const daniel = new Unit("DMoney")

let enemiesInWave = 5
const enemies = []
const enemyDistance = Math.floor(gameSize / enemiesInWave)
for (let i = 0; i < enemiesInWave; i++) {
  let enemy = new Unit('Enemy ' + (i + 1))
  enemy.jumpTo(gameSize, i * enemyDistance)
  enemy.moveTo(0, i * enemyDistance)
  enemies.push(enemy)
}

jasper.moveTo(getRandomPosition(), getRandomPosition())
daniel.moveTo(getRandomPosition(), getRandomPosition())

// game loop

window.setInterval(() => {
  // do stuff?
}, 500)

const randomMoveButton = document.querySelector("button#random-move")
randomMoveButton.addEventListener('click', function() {
  jasper.moveTo(getRandomPosition(), getRandomPosition())
  daniel.moveTo(getRandomPosition(), getRandomPosition())
})


const pauseMoveButton = document.querySelector("button#pause")
pauseMoveButton.addEventListener('click', function() {
  jasper.pauseMovement()
  daniel.pauseMovement()
  enemies.forEach((enemy) => enemy.pauseMovement())
})

const restartMoveButton = document.querySelector("button#restart")
restartMoveButton.addEventListener('click', function() {
  jasper.startMovement()
  daniel.startMovement()
  enemies.forEach((enemy) => enemy.startMovement())
})

const placeTowerButton = document.querySelector("button#place-tower")
placeTowerButton.addEventListener('click', function() {
  // make unplaced tower that follows cursor
})

function getRandomPosition() {
  return Math.floor(Math.random() * gameSize)
}
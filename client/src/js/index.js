import { useStrict } from 'mobx'

import Unit from 'Unit'

useStrict(true)

const gameSize = 700 // size in pixels of game box (square)

const allies = [new Unit("Jasper"), new Unit("DMoney")]

let enemiesInWave = 5
const enemies = []
const enemyDistance = Math.floor(gameSize / enemiesInWave)
for (let i = 0; i < enemiesInWave; i++) {
  let enemy = new Unit('Enemy ' + (i + 1))
  enemy.jumpTo(gameSize, i * enemyDistance)
  enemy.moveTo(0, i * enemyDistance)
  enemies.push(enemy)
}

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
})

function getRandomPosition() {
  return Math.floor(Math.random() * gameSize)
}
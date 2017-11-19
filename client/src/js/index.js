import { useStrict } from 'mobx'

import Unit from 'Unit'

useStrict(true)

const gameSize = 700 // size in pixels of game box (square)
const gameBox = document.querySelector("#display-box")
gameBox.style.width = gameSize + 'px'
gameBox.style.height = gameSize + 'px'

const allies = [new Unit("Jasper"), new Unit("DMoney")]
// const allies = []

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

const tower = new Unit('tower', {
  temporary: true,
})
const bound = gameBox.getBoundingClientRect()
let placingTower = true
gameBox.addEventListener('mousemove', function(event) {
  if (placingTower) {
    // @TODO only render tower in grid positions
    console.log(event);
    const actualX = event.pageX - tower.width / 2.0 - bound.left
    const actualY = event.pageY - tower.height / 2.0 - bound.top
    // @FIXME ^^^ Not sure why I need to subtract bound.top if I'm getting the page y-value
    tower.jumpTo(actualX, actualY)
  }
})

gameBox.addEventListener('mouseleave', function(event) {
  tower.hide()
})

gameBox.addEventListener('mouseenter', function(event) {
  tower.show()
})

function getRandomPosition() {
  return Math.floor(Math.random() * gameSize)
}
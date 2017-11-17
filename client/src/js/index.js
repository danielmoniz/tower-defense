import { useStrict } from 'mobx'

import Unit from 'Unit'

useStrict(true)

const jasper = new Unit("Jasper")
const daniel = new Unit("DMoney")

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
})

const restartMoveButton = document.querySelector("button#restart")
restartMoveButton.addEventListener('click', function() {
  jasper.restartMovement()
  daniel.restartMovement()
})

function getRandomPosition() {
  return Math.floor(Math.random() * 800)
}
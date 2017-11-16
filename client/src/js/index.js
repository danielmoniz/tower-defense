import { useStrict } from 'mobx'

import Unit from 'Unit'

useStrict(true)

const jasper = new Unit("Jasper")
const daniel = new Unit("DMoney")
jasper.talk()

jasper.moveTo(20, 40)
jasper.moveTo(40, 80)
jasper.moveTo(200, 350)

// game loop

window.setInterval(() => {
  // do stuff?
}, 500)

const randomMoveButton = document.querySelector("button#random-move")
randomMoveButton.addEventListener('click', function() {
  jasper.moveTo(getRandomPosition(), getRandomPosition())
  daniel.moveTo(getRandomPosition(), getRandomPosition())
})

function getRandomPosition() {
  return Math.floor(Math.random() * 500)
}
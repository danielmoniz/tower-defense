import Unit from 'Unit'

const jasper = new Unit("Jasper")
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
  const randomX = Math.floor(Math.random() * 500)
  const randomY = Math.floor(Math.random() * 500)
  jasper.moveTo(randomX, randomY)
})
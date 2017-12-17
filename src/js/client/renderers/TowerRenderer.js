
import { autorun } from 'mobx'

import UnitRenderer from './UnitRenderer'

export default class TowerRenderer extends UnitRenderer {

  startRender(unit, board) {
    const element = super.startRender(unit, board)

    element.id = "tower-" + unit.id
    element.classList.add('tower')

    const image = document.createElement("img")
    image.src = `../images/${unit.name.toLowerCase()}.png`
    element.append(image)


    autorun(() => {
      renderTower(unit, element, image)
    })

    return element
  }

}

function renderTower(unit, unitElement, image) {

  // tower-specific styles can go here (for now)
  // @TODO This belongs in a class/method specific to rendering towers
  if (unit.purchaseCost !== undefined) { // ie. is purchasable, so must be a tower. @FIXME hacky!

    // background highlight (affordability)
    if (!unit.placed && !unit.game.canAfford(unit)) {
      unitElement.style['background-color'] = 'red'
    } else if (!unit.placed && unit.game.canAfford(unit)) {
      unitElement.style['background-color'] = 'rgba(0, 0, 0, 0.5)'
    } else {
      unitElement.style['background-color'] = 'rgba(0, 0, 0, 0.15)'
    }

    // tower rotation toward target (ideally only gun rotation)
    if (unit.target) {
      const angle = unit.getAngleToPoint(unit.target.xFloor, unit.target.yFloor)
      image.style.transform = `rotate(${angle}rad)`
    }
  }

}


import { autorun } from 'mobx'

import UnitRenderer from './UnitRenderer'

export default class EnemyRenderer extends UnitRenderer {

  startRender(unit, board) {
    const element = super.startRender(unit, board)

    element.id = "enemy-" + unit.id
    element.classList.add('enemy')

    const image = document.createElement("img")
    image.src = `../images/${unit.name.toLowerCase()}.png`
    element.append(image)

    const hitPointsBar = document.createElement("div")
    hitPointsBar.classList.add('hitPointsBar')
    element.append(hitPointsBar)

    autorun(() => {
      renderHitPointsBar(unit, element, hitPointsBar)
    })

    return element
  }

}

function renderHitPointsBar(unit, unitElement, hitPointsBar) {
  hitPointsBar.innerHTML = Math.ceil(unit.currentHitPoints)
}

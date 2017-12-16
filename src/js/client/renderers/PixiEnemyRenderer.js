
import { autorun } from 'mobx'

import PixiUnitRenderer from './PixiUnitRenderer'

export default class PixiEnemyRenderer extends PixiUnitRenderer {

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


    // let rectangle = new PIXI.Graphics()
    // rectangle.beginFill(0x66CCFF)
    // rectangle.lineStyle(4, 0xFF3300, 1);
    // rectangle.drawRect(0, 0, 20, 20);
    // rectangle.endFill();
    // app.stage.addChild(rectangle)

    autorun(() => {
      renderHitPointsBar(unit, element, hitPointsBar)
    })

    return element
  }

}

function renderHitPointsBar(unit, unitElement, hitPointsBar) {
  hitPointsBar.innerHTML = unit.currentHitPoints
}

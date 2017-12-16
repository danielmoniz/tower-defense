
import { autorun } from 'mobx'

import PixiUnitRenderer from './PixiUnitRenderer'

export default class PixiEnemyRenderer extends PixiUnitRenderer {

  startRender(unit, board) {
    const container = super.startRender(unit, board)

    const healthBarHeight = 10
    const unitColour = 0x66CCFF
    const outlineColour = 0xFF3300

    const unitBase = new PIXI.Graphics()
    unitBase.beginFill(unitColour)
    unitBase.lineStyle(4, outlineColour, 1);
    unitBase.drawRect(0, 0, unit.width, unit.height);
    unitBase.endFill();
    container.addChild(unitBase)

    const nose = new PIXI.Graphics()
    nose.beginFill(unitColour)
    nose.lineStyle(4, outlineColour, 1)
    nose.drawPolygon([
      0, 10,
      0, unit.height - 10,
      -(unit.width / 4), unit.height / 2,
      0, 10,
    ])
    nose.endFill()
    container.addChild(nose)

    const healthBar = new PIXI.Graphics()
    healthBar.beginFill(0x40ef4c)
    healthBar.lineStyle(1, 0x000000, 1)
    healthBar.drawRect(0, unit.height - healthBarHeight, unit.width, healthBarHeight)
    healthBar.endFill()
    container.addChild(healthBar)

    autorun(() => {
      renderHitPointsBar(unit, container, healthBar)
    })

    return container
  }

}

function renderHitPointsBar(unit, container, healthBar) {
  healthBar.width = container.width * (unit.currentHitPoints / unit.maxHitPoints)
}

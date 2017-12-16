
import { autorun } from 'mobx'

import PixiUnitRenderer from './PixiUnitRenderer'

export default class PixiEnemyRenderer extends PixiUnitRenderer {

  startRender(unit, board) {
    const container = super.startRender(unit, board)

    const healthBarHeight = 10

    let unitBase = new PIXI.Graphics()
    unitBase.beginFill(0x66CCFF)
    unitBase.lineStyle(4, 0xFF3300, 1);
    unitBase.drawRect(0, 0, unit.width, unit.height);
    unitBase.endFill();
    container.addChild(unitBase)

    let healthBar = new PIXI.Graphics()
    healthBar.beginFill(0x8000)
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


import { autorun } from 'mobx'

import UnitRenderer from '../UnitRenderer'

export default class EnemyRenderer extends UnitRenderer {

  startRender(unit, board) {
    const container = super.startRender(unit, board)

    const healthBarHeight = 6
    const unitColour = 0x66CCFF
    const outlineColour = 0xFF3300

    const unitBase = new PIXI.Sprite(PIXI.utils.TextureCache["tank"])
    unitBase.width = unit.width
    unitBase.height = unit.height
    container.addChild(unitBase)

    const healthBar = new PIXI.Graphics()
    healthBar.beginFill(0x40ef4c)
    healthBar.lineStyle(1, 0x000000, 1)
    healthBar.drawRect(0, unit.height - healthBarHeight, unit.width, healthBarHeight)
    healthBar.endFill()
    container.addChild(healthBar)

    autorun(() => {
      renderHitPointsBar(unit, healthBar)
    })

    return container
  }

}

function renderHitPointsBar(unit, healthBar) {
  healthBar.width = unit.width * (unit.currentHitPoints / unit.maxHitPoints)
}

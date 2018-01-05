
import { autorun } from 'mobx'

import UnitRenderer from '../UnitRenderer'

export default class EnemyRenderer extends UnitRenderer {

  startRender(unit, board) {
    const container = super.startRender(unit, board)

    const unitBase = new PIXI.Sprite(PIXI.utils.TextureCache["tank"])
    unitBase.width = unit.width
    unitBase.height = unit.height
    container.addChild(unitBase)

    this.createHealthBar(unit, container)
    return container
  }

  createHealthBar(unit, container) {
    const healthBarHeight = 6    // because the image is 6 pixels high
    const healthBarBackground = new PIXI.Sprite(PIXI.utils.TextureCache["healthBarBackground"])
    healthBarBackground.position.y = unit.height - healthBarHeight - 2
    container.addChild(healthBarBackground)

    const healthBar = new PIXI.Sprite(PIXI.utils.TextureCache["healthBar"])
    healthBar.position.y = unit.height - healthBarHeight - 1
    healthBar.position.x = 1
    container.addChild(healthBar)

    autorun(() => {
      renderHitPointsBar(unit, healthBar, healthBarBackground)
    })
  }

}

function renderHitPointsBar(unit, healthBar, healthBarBackground) {
  const backgroundWidth = unit.width * (unit.currentHitPoints / unit.maxHitPoints)
  healthBar.width = backgroundWidth - 2
  healthBarBackground.width = backgroundWidth
}

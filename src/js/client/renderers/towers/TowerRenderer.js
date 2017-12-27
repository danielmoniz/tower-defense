
import { autorun } from 'mobx'

import { GAME_REFRESH_RATE } from '../../../appConstants'
import UnitRenderer from '../UnitRenderer'

export default class TowerRenderer extends UnitRenderer {

  startRender(unit, board) {
    const container = super.startRender(unit, board)

    const unitContainer = new PIXI.Container()
    container.addChild(unitContainer)

    const gunHeight = 8
    const gunLength = unit.width * 0.6
    const circleRadius = unit.width / 2

    const disableBackground = new PIXI.Graphics()
    disableBackground.beginFill(0xFF4444)
    disableBackground.drawRect(0, 0, unit.width, unit.height)
    disableBackground.endFill()
    disableBackground.alpha = 0
    unitContainer.addChild(disableBackground)


    const background = new PIXI.Graphics()
    background.beginFill(0xCCCCCC)
    background.lineStyle(1, 0x000000, 0.5);
    background.drawRect(0, 0, unit.width, unit.height);
    background.endFill();
    unitContainer.addChild(background)

    const towerBase = new PIXI.Graphics()
    towerBase.beginFill(0x66CCFF)
    towerBase.lineStyle(2, 0x000000, 1);
    towerBase.drawCircle(circleRadius, circleRadius, circleRadius - 3);
    towerBase.endFill();
    unitContainer.addChild(towerBase)

    // Create container for the gun so it can be rotated separately
    const gunContainer = new PIXI.Container()
    gunContainer.height = unit.height
    gunContainer.width = unit.width
    gunContainer.anchor = 0.5
    gunContainer.x = unit.width / 2
    gunContainer.y = unit.height / 2
    unitContainer.addChild(gunContainer)

    const gun = new PIXI.Graphics()
    gun.beginFill(0x666666)
    gun.lineStyle(1, 0x000000, 1)
    gun.drawRect(0, 0, gunLength, gunHeight)
    gun.endFill()
    gun.pivot.y = gunHeight / 2
    gunContainer.addChild(gun)

    const maxRange = new PIXI.Graphics()
    maxRange.beginFill(0x40ef4c)
    maxRange.lineStyle(3, 0x000000, 1)
    maxRange.drawCircle(circleRadius, circleRadius, unit.range)
    maxRange.endFill()
    maxRange.alpha = 0.2
    container.addChildAt(maxRange, 0) // add to overall container, not to unit

    board.app.stage.addChild(container)


    autorun(() => {
      disable(unit, background, disableBackground, maxRange)
    })

    autorun(() => {
      rotateToTarget(unit, gunContainer)
    })

    autorun(() => {
      displayRange(unit, maxRange)
    })

    autorun(() => {
      ghostUnit(unit, unitContainer)
    })

    return { container, unitContainer, gunContainer, gunLength, gunHeight }
  }

}

function displayRange(unit, maxRange) {
  if (!unit.placed || unit.selected) {
    maxRange.visible = true
  } else {
    maxRange.visible = false
  }
}

function rotateToTarget(unit, unitElement) {
  // tower rotation toward target (ideally only gun rotation)
  if (unit.target) {
    const angle = unit.getAngleToPoint(unit.target.xFloor, unit.target.yFloor)
    unitElement.rotation = angle
  }
}

function ghostUnit(unit, unitCoreElement) {
  if (unit.disabled) {
    unitCoreElement.alpha = 0.3
  } else {
    unitCoreElement.alpha = 1
  }
}

function disable(unit, background, disableBackground) {
  if (unit.placed) {
    background.alpha = 0.2
    disableBackground.alpha = 0
  } else if (unit.game.canAfford(unit)) {
    background.alpha = 1
    disableBackground.alpha = 0
  } else {
    background.alpha = 0
    disableBackground.alpha = 1
  }
}

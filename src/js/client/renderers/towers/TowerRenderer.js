
import { autorun } from 'mobx'

import { GAME_REFRESH_RATE } from '../../../appConstants'
import UnitRenderer from '../UnitRenderer'

export default class TowerRenderer extends UnitRenderer {

  startRender(unit, board) {
    const circleRadius = unit.width / 2
    const gunHeight = 8
    const gunLength = unit.width * 0.6

    const backgroundOptions = {
      backgroundColor: 0xCCCCCC,
      disableBackgroundColor: 0xFF4444,
      lineStyle: { width: 1, color: 0x000000, alpha: 0.5, },
    }
    const towerBaseOptions = {
      color: 0x66CCFF,
      lineStyle: { width: 2, color: 0x000000, alpha: 1, },
    }
    const gunOptions = {
      color: 0x666666,
      lineStyle: { width: 1, color: 0x000000, alpha: 1, },
    }
    const maxRangeOptions = {
      color: 0x40ef4c,
      alpha: 0.2,
      lineStyle: { width: 3, color: 0x000000, alpha: 1, },
    }

    const { container, unitContainer } = this.getContainer(unit, board)
    const { disableBackground, background } = this.setBackground(unit, unitContainer, backgroundOptions)
    this.setTowerBase(unitContainer, circleRadius, towerBaseOptions)
    const gunContainer = this.setGun(unit, unitContainer, gunHeight, gunLength, gunOptions)
    const maxRange = this.setMaxRange(unit, container, circleRadius, maxRangeOptions)
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

    return container
  }

  getContainer(unit, board) {
    const container = super.startRender(unit, board)

    const unitContainer = new PIXI.Container()
    container.addChild(unitContainer)

    return { container, unitContainer }
  }

  setBackground(unit, unitContainer, options) {
    const disableBackground = new PIXI.Graphics()
    disableBackground.beginFill(options.disableBackgroundColor)
    disableBackground.drawRect(0, 0, unit.width, unit.height)
    disableBackground.endFill()
    disableBackground.alpha = 0
    unitContainer.addChild(disableBackground)

    const background = new PIXI.Graphics()
    background.beginFill(options.backgroundColor)
    background.lineStyle(options.lineStyle.width,
      options.lineStyle.color, options.lineStyle.alpha);
    background.drawRect(0, 0, unit.width, unit.height);
    background.endFill();
    unitContainer.addChild(background)

    return { disableBackground, background }
  }

  setTowerBase(unitContainer, circleRadius, options) {
    const towerBase = new PIXI.Graphics()

    towerBase.beginFill(options.color)
    towerBase.lineStyle(options.lineStyle.width, options.lineStyle.color,
      options.lineStyle.alpha)
    towerBase.drawCircle(circleRadius, circleRadius, circleRadius - 3)
    towerBase.endFill()
    unitContainer.addChild(towerBase)
  }

  setGun(unit, unitContainer, gunHeight, gunLength, options) {
    const gunContainer = new PIXI.Container()
    gunContainer.height = unit.height
    gunContainer.width = unit.width
    gunContainer.anchor = 0.5
    gunContainer.x = unit.width / 2
    gunContainer.y = unit.height / 2
    unitContainer.addChild(gunContainer)

    const gun = new PIXI.Graphics()
    gun.beginFill(options.color)
    gun.lineStyle(options.lineStyle.width, options.lineStyle.color,
      options.lineStyle.alpha)
    gun.drawRect(0, 0, gunLength, gunHeight)
    gun.endFill()
    gun.pivot.y = gunHeight / 2
    gunContainer.addChild(gun)

    return gunContainer
  }

  setMaxRange(unit, container, circleRadius, options) {
    const maxRange = new PIXI.Graphics()
    maxRange.beginFill(options.color)
    maxRange.lineStyle(options.lineStyle.width, options.lineStyle.color,
      options.lineStyle.alpha)
    maxRange.drawCircle(circleRadius, circleRadius, unit.range.current)
    maxRange.endFill()
    maxRange.alpha = options.alpha
    container.addChildAt(maxRange, 0) // add to overall container, not to unit

    return maxRange
  }

  setAutorun(unit, background, disableBackground, unitContainer, gunContainer, maxRange) {
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

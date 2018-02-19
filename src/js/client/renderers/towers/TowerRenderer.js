
import { autorun } from 'mobx'

import { GAME_REFRESH_RATE } from '../../../appConstants'
import UnitRenderer from '../UnitRenderer'

export default class TowerRenderer extends UnitRenderer {

  constructor(...args) {
    super(...args)

    this.maxRangeOptions = {
      color: 0x40ef4c,
      alpha: 0.2,
      lineStyle: { width: 3, color: 0x000000, alpha: 1, },
    }
    this.backgroundOptions = {
      backgroundColor: 0xCCCCCC,
      disableBackgroundColor: 0xFF4444,
      lineStyle: { width: 1, color: 0x000000, alpha: 0.5, },
    }
  }

  startRender(unit, board) {
    const circleRadius = unit.width / 2
    const gunOptions = this.getGunOptions(unit) // requires getGunOptions() to be defined in child class

    const { container, unitContainer } = this.getContainer(unit, board)
    const { disableBackground, background } = this.setBackground(unit, unitContainer, this.backgroundOptions)
    this.setTowerBase(unitContainer, circleRadius, this.towerBaseOptions)
    const gunContainer = this.setGun(unit, unitContainer, gunOptions)
    const maxRange = this.setMaxRange(container)
    const sellButton = this.setSellButton(container, unit)

    // @TODO This should probably be done in UnitRenderer
    board.app.stage.addChild(container)


    autorun(() => {
      disable(unit, background, disableBackground, maxRange)
    })

    autorun(() => {
      rotateToTarget(unit, gunContainer)
    })

    autorun(() => {
      this.drawMaxRange(maxRange, unit, circleRadius)
      displayRange(unit, maxRange)
    })

    autorun(() => {
      ghostUnit(unit, unitContainer)
    })

    autorun(() => {
      toggleSellButton(unit, sellButton)
    })

    return { container, unitContainer, maxRange }
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

  setGun(unit, unitContainer, options) {
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
    gun.drawRect(0, 0, options.gunLength, options.gunHeight)
    gun.endFill()
    gun.pivot.y = options.gunHeight / 2
    gunContainer.addChild(gun)

    return gunContainer
  }

  setSellButton(container, tower) {
    const sellButton = new PIXI.Sprite(PIXI.utils.TextureCache["sell"])
    sellButton.x = -30
    sellButton.y = -50
    sellButton.width = 40
    sellButton.height = 40
    sellButton.alpha = 0.75
    sellButton.interactive = true
    sellButton.buttonMode = true
    sellButton.on('click', () => {
      tower.game.sellTower(tower)
    })

    container.addChild(sellButton)
    return sellButton
  }

  setMaxRange(container) {
    const maxRange = new PIXI.Graphics()
    container.addChildAt(maxRange, 0) // add to bottom of container
    return maxRange
  }

  drawMaxRange(graphics, unit, circleRadius) {
    const options = this.maxRangeOptions

    graphics.clear()
    graphics.beginFill(options.color)
    graphics.lineStyle(options.lineStyle.width, options.lineStyle.color,
      options.lineStyle.alpha)
    graphics.drawCircle(circleRadius, circleRadius, unit.range.current)
    graphics.endFill()
    graphics.alpha = options.alpha
  }

  getGunLength(unit) {
    return unit.width * 0.6
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

function toggleSellButton(unit, sellButton) {
  if (unit.selected) {
    sellButton.visible = true
  } else {
    sellButton.visible = false
  }
}

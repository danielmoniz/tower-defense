
import { autorun } from 'mobx'

import { GAME_REFRESH_RATE } from '../../appConstants'
import PixiUnitRenderer from './PixiUnitRenderer'

export default class PixiTowerRenderer extends PixiUnitRenderer {

  startRender(unit, board) {
    const container = super.startRender(unit, board)

    const gunHeight = 8

    let disableBackground = new PIXI.Graphics()
    disableBackground.beginFill(0xFF4444)
    disableBackground.drawRect(0, 0, unit.width, unit.height)
    disableBackground.endFill()
    disableBackground.alpha = 0
    container.addChild(disableBackground)


    let background = new PIXI.Graphics()
    background.beginFill(0xCCCCCC)
    // background.lineStyle(2, 0x000000, 1);
    background.drawRect(0, 0, unit.width, unit.height);
    background.endFill();
    container.addChild(background)

    let towerBase = new PIXI.Graphics()
    const circleRadius = unit.width / 2
    towerBase.beginFill(0x66CCFF)
    towerBase.lineStyle(2, 0x000000, 1);
    towerBase.drawCircle(circleRadius, circleRadius, circleRadius - 3);
    towerBase.endFill();
    container.addChild(towerBase)

    let gun = new PIXI.Graphics()
    gun.beginFill(0x666666)
    gun.lineStyle(1, 0x000000, 1)
    gun.drawRect(unit.width / 2, unit.height / 2, unit.width * 0.6, gunHeight)
    gun.endFill()
    gun.pivot.y = gunHeight / 2
    container.addChild(gun)

    board.app.stage.addChild(container)

    autorun(() => {
      renderTower(unit, container, background, disableBackground)
    })

    return container
  }

}

function renderTower(unit, unitElement, background, disableBackground) {

  // tower-specific styles can go here (for now)
  // @TODO This belongs in a class/method specific to rendering towers
  if (unit.purchaseCost !== undefined) { // ie. is purchasable, so must be a tower. @FIXME hacky!

    // background highlight (affordability)
    if (!unit.placed && !unit.game.canAfford(unit)) {
      // @TODO Make red 'disabled' background visible
      background.alpha = 0
      disableBackground.alpha = 1
    } else if (!unit.placed && unit.game.canAfford(unit)) {
      background.alpha = 0.5
      disableBackground.alpha = 0
    } else {
      background.alpha = 0.15
      disableBackground.alpha = 0
    }

    // tower rotation toward target (ideally only gun rotation)
    if (unit.target) {
      const angle = unit.getAngleToPoint(unit.target.xFloor, unit.target.yFloor)
      unitElement.rotation = angle
    }
  }

}

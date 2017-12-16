
import { autorun } from 'mobx'

import { GAME_REFRESH_RATE } from '../../appConstants'
import PixiUnitRenderer from './PixiUnitRenderer'

export default class PixiTowerRenderer extends PixiUnitRenderer {

  startRender(unit, board) {
    const container = super.startRender(unit, board)

    const gunHeight = 8

    let background = new PIXI.Graphics()
    background.beginFill(0xCCCCCC)
    // background.lineStyle(2, 0x000000, 1);
    background.drawRect(0, 0, unit.width, unit.height);
    background.endFill();

    let towerBase = new PIXI.Graphics()
    const circleRadius = unit.width / 2
    towerBase.beginFill(0x66CCFF)
    towerBase.lineStyle(2, 0x000000, 1);
    towerBase.drawCircle(circleRadius, circleRadius, circleRadius - 3);
    towerBase.endFill();

    let gun = new PIXI.Graphics()
    gun.beginFill(0x666666)
    gun.lineStyle(1, 0x000000, 1)
    gun.drawRect(unit.width / 2, unit.height / 2, unit.width * 0.6, gunHeight)
    gun.endFill()
    gun.pivot.y = gunHeight / 2

    container.addChild(background)
    container.addChild(towerBase)
    container.addChild(gun)
    board.app.stage.addChild(container)

    autorun(() => {
      renderTower(unit, container, background, gun)
    })

    return container
  }

}

function renderTower(unit, unitElement, background) {

  // tower-specific styles can go here (for now)
  // @TODO This belongs in a class/method specific to rendering towers
  if (unit.purchaseCost !== undefined) { // ie. is purchasable, so must be a tower. @FIXME hacky!

    // background highlight (affordability)
    if (!unit.placed && !unit.game.canAfford(unit)) {
      // @TODO Make red 'disabled' background visible
      background.alpha = 1
    } else if (!unit.placed && unit.game.canAfford(unit)) {
      background.alpha = 0.5
    } else {
      background.alpha = 0.15
    }

    // tower rotation toward target (ideally only gun rotation)
    if (unit.target) {
      const angle = unit.getAngleToPoint(unit.target.xFloor, unit.target.yFloor)
      unitElement.rotation = angle
    }
  }

}

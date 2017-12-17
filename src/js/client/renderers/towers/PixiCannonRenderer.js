
import { autorun } from 'mobx'

import { GAME_REFRESH_RATE } from '../../../appConstants'
import PixiTowerRenderer from '../PixiTowerRenderer'

export default class PixiCannonrRenderer extends PixiTowerRenderer {

  startRender(unit, board) {
    const container = super.startRender(unit, board)

    // const gunHeight = 8
    // const gunLength = unit.width * 0.6
    // const circleRadius = unit.width / 2
    //
    // const disableBackground = new PIXI.Graphics()
    // disableBackground.beginFill(0xFF4444)
    // disableBackground.drawRect(0, 0, unit.width, unit.height)
    // disableBackground.endFill()
    // disableBackground.alpha = 0
    // container.addChild(disableBackground)
    //
    //
    // const background = new PIXI.Graphics()
    // background.beginFill(0xCCCCCC)
    // // background.lineStyle(2, 0x000000, 1);
    // background.drawRect(0, 0, unit.width, unit.height);
    // background.endFill();
    // container.addChild(background)
    //
    // const towerBase = new PIXI.Graphics()
    // towerBase.beginFill(0x66CCFF)
    // towerBase.lineStyle(2, 0x000000, 1);
    // towerBase.drawCircle(circleRadius, circleRadius, circleRadius - 3);
    // towerBase.endFill();
    // container.addChild(towerBase)
    //
    // // Create container for the gun so it can be rotated separately
    // const gunContainer = new PIXI.Container()
    // gunContainer.height = unit.height
    // gunContainer.width = unit.width
    // gunContainer.anchor = 0.5
    // gunContainer.x = unit.width / 2
    // gunContainer.y = unit.height / 2
    // container.addChild(gunContainer)
    //
    // const gun = new PIXI.Graphics()
    // gun.beginFill(0x666666)
    // gun.lineStyle(1, 0x000000, 1)
    // gun.drawRect(0, 0, gunLength, gunHeight)
    // gun.endFill()
    // gun.pivot.y = gunHeight / 2
    // gunContainer.addChild(gun)
    //
    // const maxRange = new PIXI.Graphics()
    // maxRange.beginFill(0x40ef4c)
    // maxRange.lineStyle(3, 0x000000, 1)
    // maxRange.drawCircle(0, 0, unit.range)
    // maxRange.endFill()
    // maxRange.alpha = 0.2
    // container.addChild(maxRange)
    //
    // board.app.stage.addChild(container)

    return container
  }

}


import { autorun } from 'mobx'

import { GAME_REFRESH_RATE } from '../../../appConstants'
import TowerRenderer from './TowerRenderer'

export default class CannonRenderer extends TowerRenderer {

  constructor(...args) {
    super(...args)

    this.towerBaseOptions = {
      color: 0x66CCFF,
      lineStyle: { width: 2, color: 0x000000, alpha: 1, },
    }

  }

  startRender(unit, board) {
    // super.startRender(unit, board)

    const circleRadius = unit.width / 2
    const gunOptions = this.getGunOptions(unit)

    const { container, unitContainer } = this.getContainer(unit, board)
    const { disableBackground, background } = this.setBackground(unit, unitContainer, this.backgroundOptions)
    this.setTowerBase(unitContainer, circleRadius, this.towerBaseOptions)
    const gunContainer = this.setGun(unit, unitContainer, gunOptions.gunHeight, gunOptions.gunLength, gunOptions)
    const maxRange = this.setMaxRange(unit, container, circleRadius)
    board.app.stage.addChild(container)

    this.setAutorun(unit, background, disableBackground, unitContainer, gunContainer, maxRange)

    return container
  }

  getGunOptions(unit) {
    return {
      color: 0x666666,
      lineStyle: { width: 1, color: 0x000000, alpha: 1, },
      gunHeight: 8,
      gunLength: unit.width * 0.6,
    }
  }
}

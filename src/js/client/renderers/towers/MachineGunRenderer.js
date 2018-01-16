
import { autorun } from 'mobx'

import { GAME_REFRESH_RATE } from '../../../appConstants'
import TowerRenderer from './TowerRenderer'

export default class MachineGunRenderer extends TowerRenderer {

  startRender(unit, board) {
    const circleRadius = unit.width / 2
    const gunHeight = 12
    const gunLength = unit.width * 0.6

    const backgroundOptions = {
      backgroundColor: 0xCCCCCC,
      disableBackgroundColor: 0xFF4444,
      lineStyle: { width: 1, color: 0x000000, alpha: 0.5, },
    }
    const towerBaseOptions = {
      color: 0xbababa,
      lineStyle: { width: 4, color: 0x000000, alpha: 1, },
    }
    const gunOptions = {
      color: 0x444444,
      lineStyle: { width: 1, color: 0x000000, alpha: 1, },
    }
    const maxRangeOptions = {
      color: 0x40ef4c,
      alpha: 0.2,
      lineStyle: { width: 3, color: 0x000000, alpha: 1, },
    }

    const { container, unitContainer } = super.getContainer(unit, board)
    const { disableBackground, background } = super.setBackground(unit, unitContainer, backgroundOptions)
    super.setTowerBase(unitContainer, circleRadius, towerBaseOptions)
    const gunContainer = super.setGun(unit, unitContainer, gunHeight, gunLength, gunOptions)
    const maxRange = super.setMaxRange(unit, container, circleRadius, maxRangeOptions)
    board.app.stage.addChild(container)

    super.setAutorun(unit, background, disableBackground, unitContainer, gunContainer, maxRange)

    return container
  }
  
}

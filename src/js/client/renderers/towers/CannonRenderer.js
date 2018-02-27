
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
    const { container, unitContainer, gunContainer } = super.startRender(unit, board)

    autorun(() => {
      // @TODO @FIXME Why is this running twice?
      if (unit.isFiring) {
        const laserWidth = 4
        const laser = new PIXI.Graphics()
        laser.beginFill(0x00FF00)
        laser.lineStyle(2, 0xFF0000, 1)
        const gunOptions = this.getGunOptions(unit)

        laser.moveTo(gunOptions.gunLength, laserWidth / 2)
        const targetLocation = unit.target.getCentre()
        const distance = unit.distanceToUnit(unit.target)

        laser.lineTo(distance + gunOptions.gunLength, laserWidth / 2)
        laser.lineTo(distance + gunOptions.gunLength, -laserWidth / 2)
        laser.lineTo(gunOptions.gunLength, -laserWidth / 2)
        laser.endFill()

        gunContainer.addChild(laser)
        setTimeout(() => {
          laser.destroy()
        }, 50)
      }
    })

  }

  getGunOptions(unit) {
    return {
      color: 0x666666,
      lineStyle: { width: 1, color: 0x000000, alpha: 1, },
      gunHeight: 8,
      gunLength: this.getGunLength(unit),
    }
  }
}

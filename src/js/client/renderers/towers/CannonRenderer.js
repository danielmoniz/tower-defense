
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
      // console.log('triggering autorun');
      if (unit.isFiring) {
        const laser = new PIXI.Graphics()
        laser.beginFill(0x00FF00)
        laser.lineStyle(3, 0xFF0000, 1)
        const gunOptions = this.getGunOptions(unit)

        laser.moveTo(gunOptions.gunLength, 0)
        // console.log(gunContainer.x, gunContainer.y);
        const targetLocation = unit.target.getCentre()
        // console.log(unit.target.x - unit.x + gunContainer.x, unit.target.y - unit.y + gunContainer.y);
        // laser.lineTo(unit.target.x - unit.x + gunContainer.x, unit.target.y - unit.y + gunContainer.y)
        // laser.lineTo(targetLocation.x - unit.x, targetLocation.y - unit.y)
        const distance = unit.distanceToUnit(unit.target)
        console.log(distance);
        // laser.lineTo(targetLocation.x, 0)
        laser.lineTo(distance + unit.target.width, 0)
        laser.endFill()
        gunContainer.addChild(laser)
        // muzzleFlash.visible = true
        setTimeout(() => {
          // muzzleFlash.visible = false
          laser.destroy()
        }, 500)
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

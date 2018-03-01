
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
    this.setUpLaser(unit, gunContainer)
  }

  setUpLaser(unit, container) {
    autorun(() => {
      if (!unit.isFiring) { return }
      const laserWidth = 4

      const gunOptions = this.getGunOptions(unit)
      const startX = gunOptions.gunLength
      const startY = laserWidth / 2
      const targetLocation = unit.target.getCentre()
      const distance = unit.distanceToUnit(unit.target)

      const laser = this.createLaser(container, startX, startY, distance)
      setTimeout(() => {
        laser.destroy()
      }, 50)
    })
  }

  createLaser(container, startX, startY, length) {
    const laser = new PIXI.Graphics()
    laser.beginFill(0x00FF00)
    laser.lineStyle(2, 0xFF0000, 1)

    laser.moveTo(startX, startY)
    laser.lineTo(length + startX, startY)
    laser.lineTo(length + startX, -startY)
    laser.lineTo(startX, -startY)
    laser.endFill()

    container.addChild(laser)
    return laser
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

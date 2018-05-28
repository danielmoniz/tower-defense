
import { autorun } from 'mobx'

import { GAME_REFRESH_RATE } from '../../../appConstants'
import TowerRenderer from './TowerRenderer'

export default class PlasmaBatteryRenderer extends TowerRenderer {

  constructor(...args) {
    super(...args)

    this.towerBaseOptions = {
      color: 0xaaffaa,
      lineStyle: { width: 4, color: 0x000000, alpha: 1, },
    }

    this.useMuzzleFlash = true
    this.muzzleFlashSize = { width: 40, height: 40 }
  }

  getGunOptions(unit) {
    return {
      color: 0x444444,
      lineStyle: { width: 1, color: 0x000000, alpha: 1, },
      gunHeight: 20,
      gunLength: this.getGunLength(unit),
    }
  }

}

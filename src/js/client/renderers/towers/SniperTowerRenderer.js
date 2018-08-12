
import { autorun } from 'mobx'

import { GAME_REFRESH_RATE } from '../../../appConstants'
import TowerRenderer from './TowerRenderer'

export default class SniperTowerRenderer extends TowerRenderer {

  constructor(...args) {
    super(...args)

    this.towerBaseOptions = {
      color: 0x0087cc,
      lineStyle: { width: 4, color: 0x000000, alpha: 1, },
    }
  }

  getGunOptions(unit) {
    return {
      color: 0x444444,
      lineStyle: { width: 1, color: 0x000000, alpha: 1, },
      gunHeight: 6,
      gunLength: 1.2 * this.getGunLength(unit),
    }
  }

}


import { autorun } from 'mobx'

import { GAME_REFRESH_RATE } from '../../../appConstants'
import TowerRenderer from './TowerRenderer'

export default class MachineGunRenderer extends TowerRenderer {

  constructor(...args) {
    super(...args)

    this.towerBaseOptions = {
      color: 0xbababa,
      lineStyle: { width: 4, color: 0x000000, alpha: 1, },
    }
  }

  getGunOptions(unit) {
    return {
      color: 0x444444,
      lineStyle: { width: 1, color: 0x000000, alpha: 1, },
      gunHeight: 12,
      gunLength: unit.width * 0.6,
    }
  }

}

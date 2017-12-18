
import { observable, computed, action, autorun } from 'mobx'

import { GRID_SIZE, GAME_REFRESH_RATE } from '../appConstants'
import Tower from './Tower'
import Cooldown from '../Cooldown'

export default class MachineGun extends Tower {

  constructor(game, options) {
    super(game, options)

    this.type = 'MachineGun'
    this.name = 'MachineGun'

    this.attackPower = 7
    this.range = 300
    this.purchaseCost = 60
    this.firingTime = 130
    this.clipSize = 25
    this.reloadTime = 3000
    this.killProfitMultiplier = 1

    this.width = GRID_SIZE * 3
    this.height = GRID_SIZE * 3
  }

}

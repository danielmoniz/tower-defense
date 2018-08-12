
import { observable, computed, action, autorun } from 'mobx'

import { GRID_SIZE, GAME_REFRESH_RATE } from '../appConstants'
import Tower from './Tower'
import Cooldown from '../Cooldown'

export default class MachineGun extends Tower {

  constructor(game, options) {
    super(game, options)

    this.name = 'MachineGun'

    this.attackPower = {
      base: 7,
      current: 7,
    }
    this.range = {
      base: 300,
      current: 300,
    }
    this.purchaseCost = 60
    this.firingTime = 130
    this.clipSize = 25
    this.reloadTime = 3000
    this.killProfitMultiplier = 1

    // DPS: 28.59
    // DPS/cost: 0.4765

    this.width = GRID_SIZE * 3
    this.height = GRID_SIZE * 3
  }

}

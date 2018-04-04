
import { observable, computed, action, autorun } from 'mobx'

import { GRID_SIZE, GAME_REFRESH_RATE } from '../appConstants'
import Tower from './Tower'
import Cooldown from '../Cooldown'

export default class Flamethrower extends Tower {

  @observable isFiring = false

  constructor(game, options) {
    super(game, options)

    this.name = 'Flamethrower'

    this.attackPower = {
      base: 1,
      current: 1,
    }
    this.range = {
      base: 200,
      current: 200,
    }
    this.firingTime = 0
    this.clipSize = 30
    this.reloadTime = 2000
    this.killProfitMultiplier = 0.8
    this.purchaseCost = 30
    this.ammoType = 'fire'

    this.width = GRID_SIZE * 3
    this.height = GRID_SIZE * 3
  }

  @action attack() {
    const target = super.attack()
    if (target) {
      target.ignite()
    }
  }

}

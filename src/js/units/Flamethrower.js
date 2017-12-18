
import { observable, computed, action, autorun } from 'mobx'

import { GRID_SIZE, GAME_REFRESH_RATE } from '../appConstants'
import Tower from './Tower'
import Cooldown from '../Cooldown'

export default class Flamethrower extends Tower {

  @observable isFiring = false

  constructor(game, options) {
    super(game, options)

    this.type = 'Flamethrower'
    this.name = 'Flamethrower'

    this.attackPower = 1
    this.range = 200
    this.firingTime = 0
    this.clipSize = 30
    this.reloadTime = 2000
    this.killProfitMultiplier = 0.8
    this.purchaseCost = 30

    this.width = GRID_SIZE * 3
    this.height = GRID_SIZE * 3
  }

  @action act() {
    super.act()
    this.firingTest += 1

    if (this.targetIsValid() && this.canAttack()) {
      this.isFiring = true
    } else {
      this.isFiring = false
    }
  }

}

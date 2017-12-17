
import { observable, computed, action, autorun } from 'mobx'

import { GRID_SIZE, GAME_REFRESH_RATE } from '../appConstants'
import Tower from './Tower'
import Cooldown from '../Cooldown'

export default class Flamethrower extends Tower {

  @observable firingTest = 0
  @observable lastFired
  @observable isFiring = false

  constructor(game, options) {
    super(game, options)

    this.attackPower = 11
    this.cooldownLength = 1000
    this.range = 300
    this.purchaseCost = 25
    this.killProfitMultiplier = 1
    this.type = 'Flamethrower'
    this.name = 'Flamethrower'
    this.width = GRID_SIZE * 3
    this.height = GRID_SIZE * 3
  }

  @action act() {
    super.act()
    this.firingTest += 1

    if (this.targetIsValid()) {
      this.isFiring = true
    } else {
      this.isFiring = false
    }
  }

}

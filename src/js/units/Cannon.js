
import { observable, computed, action, autorun } from 'mobx'

import { GRID_SIZE, GAME_REFRESH_RATE } from '../appConstants'
import Tower from './Tower'
import Cooldown from '../Cooldown'

export default class Cannon extends Tower {

  constructor(game, options) {
    super(game, options)

    this.type = 'Cannon'
    this.name = 'Cannon'

    this.attackPower = 11
    this.range = 300
    this.purchaseCost = 25
    this.firingTime = 0
    this.clipSize = 1
    this.reloadTime = 1000
    this.killProfitMultiplier = 1

    this.width = GRID_SIZE * 3
    this.height = GRID_SIZE * 3
  }

}

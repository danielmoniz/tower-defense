
import { observable, computed, action, autorun } from 'mobx'

import { GRID_SIZE, GAME_REFRESH_RATE } from '../appConstants'
import Tower from './Tower'
import Cooldown from '../Cooldown'

export default class SniperTower extends Tower {

  constructor(game, options) {
    super(game, options)

    this.name = 'SniperTower'

    this.attackPower = {
      base: 125,
      current: 125,
    }
    this.range = {
      base: 450,
      current: 450,
    }
    this.purchaseCost = 100
    this.firingTime = 0
    this.clipSize = 1
    this.reloadTime = 2500
    this.killProfitMultiplier = 1

    // DPS: 50
    // DPS/cost: 0.5

    this.width = GRID_SIZE * 3
    this.height = GRID_SIZE * 3
  }

}

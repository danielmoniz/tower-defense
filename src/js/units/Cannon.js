
import { observable, computed, action, autorun } from 'mobx'

import { GRID_SIZE, GAME_REFRESH_RATE } from '../appConstants'
import Tower from './Tower'
import Cooldown from '../Cooldown'

export default class Cannon extends Tower {

  constructor(game, options) {
    super(game, options)

    this.name = 'Cannon'

    this.attackPower = {
      base: 11,
      current: 11,
    }
    this.range = {
      base: 300,
      current: 300,
    }
    this.purchaseCost = 25
    this.firingTime = 0
    this.clipSize = 1
    this.reloadTime = 1000
    this.killProfitMultiplier = 1

    // DPS: 11
    // DPS/cost: 0.44

    this.upgrades['PlasmaBattery'] = {
      cost: 25,
      type: 'towerToTower',
      newTowerType: 'PlasmaBattery',
      // @TODO This information is display related and should probably be elsewhere.
      description: 'Plas. Battery',
    }
    this.upgrades['SniperTower'] = {
      cost: 75,
      type: 'towerToTower',
      newTowerType: 'SniperTower',
      description: 'Sniper Tower',
    }

    this.width = GRID_SIZE * 3
    this.height = GRID_SIZE * 3
  }

}

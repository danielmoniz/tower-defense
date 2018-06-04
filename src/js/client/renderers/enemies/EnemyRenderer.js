
import { autorun } from 'mobx'

import UnitRenderer from '../UnitRenderer'
import { GRID_SIZE } from '../../../appConstants'
import { getBurningEmitter, getShellExplosionEmitter } from '../emitters'

export default class EnemyRenderer extends UnitRenderer {

  startRender(unit, board) {
    const container = super.startRender(unit, board)

    const unitBase = this.createUnitBase(unit, container)
    this.createHealthBar(unit, container)
    const explosion = this.createExplosion(unit, container)
    const burnAnimation = this.createBurning(unit, container)
    const shields = this.createShields(unit, container)

    container.on('rightclick', () => {
      this.actions.setSelectedTowerTarget(unit)
    })

    return container
  }

  createUnitBase(unit, container) {
    const unitType = unit.enemyType.toLowerCase()
    const unitBase = new PIXI.Sprite(PIXI.utils.TextureCache[unitType])
    unitBase.width = unit.width
    unitBase.height = unit.height
    container.addChild(unitBase)
    return unitBase
  }

  createExplosion(unit, container) {
    const explosion = new PIXI.Sprite(PIXI.utils.TextureCache['enemyExplosionBasic'])
    explosion.width = 10
    explosion.height = 10
    explosion.visible = false
    explosion.x = unit.width * 1 / 3
    explosion.y = unit.height * 1 / 3
    container.addChild(explosion)

    autorun(() => {
      if (!unit.hitBy) { return }
      if (unit.hitBy === 'shell') {
        let shellExplosion = getShellExplosionEmitter(
          unit, this.board.effectsLayer, { x: unit.x, y: unit.y })
        this.registerEmitter.oneTime(shellExplosion)
      } else if (unit.hitBy === 'fire') { // do nothing, because burning will trigger
      } else if (unit.hitBy === 'burning') { // do nothing, because burning will trigger
      } else {
        explosion.visible = true
        setTimeout(() => {
          explosion.visible = false
        }, 50)
      }
    })

    return explosion
  }

/*
 * This method needs to create an autorun function. That function should
 * trigger a burning animation when the unit is burning and remove it otherwise.
 * It is also responsible for making sure the emitter is cleaned up on unit
 * removal.
 */
  createBurning(unit, container) {
    let burningEmitter
    autorun(() => {
      // only allow burning if unit is still alive
      if (unit.burning && !unit.removeMe) {
        burningEmitter = getBurningEmitter(unit, container)
        this.registerEmitter.oneTime(burningEmitter)
      } else {
        if (!burningEmitter) { return }
        burningEmitter.emit = false
      }
    })
  }

  createHealthBar(unit, container) {
    // const healthBarHeight = 6    // because the image is 6 pixels high
    const healthBarHeight = Math.ceil(unit.height / 7)
    const healthBarBackground = new PIXI.Sprite(PIXI.utils.TextureCache["healthBarBackground"])
    healthBarBackground.height = healthBarHeight + 2
    healthBarBackground.position.y = unit.height - healthBarHeight - 2
    container.addChild(healthBarBackground)

    const healthBar = new PIXI.Sprite(PIXI.utils.TextureCache["healthBar"])
    healthBar.position.y = unit.height - healthBarHeight - 1
    healthBar.position.x = 1
    healthBar.height = healthBarHeight
    container.addChild(healthBar)

    const armourBar = new PIXI.Sprite(PIXI.utils.TextureCache['armourBar'])
    armourBar.position.y = unit.height - healthBarHeight - 1
    armourBar.position.x = 150
    armourBar.height = healthBarHeight
    container.addChild(armourBar)

    autorun(() => {
      renderHitPointsBar(unit, healthBar, healthBarBackground, armourBar)
    })
  }

  createShields(unit, container) {
    if (!unit.maxShields) { return }
    let shieldCircle

    autorun(() => {
      if (shieldCircle) {
        shieldCircle.destroy()
      }
      shieldCircle = new PIXI.Graphics();
      const shieldThickness = unit.currentShields / unit.maxShields * (unit.width / GRID_SIZE) * 4
      shieldCircle.lineStyle(shieldThickness, 0x6666FF);  //(thickness, color)
      shieldCircle.drawCircle(unit.width / 2, unit.height / 2, unit.width * 0.7);   //(x,y,radius)
      shieldCircle.endFill();
      container.addChild(shieldCircle);
    })
  }

}

function renderHitPointsBar(unit, healthBar, healthBarBackground, armourBar) {
  const currentStats = unit.currentHitPoints + unit.currentArmour
  const maxStats = unit.maxHitPoints + unit.maxArmour
  const backgroundWidth = unit.width * (currentStats / maxStats)
  healthBarBackground.width = backgroundWidth

  const maxWidth = backgroundWidth - 3
  healthBar.width = maxWidth * unit.currentHitPoints / currentStats
  armourBar.width = maxWidth * unit.currentArmour / currentStats
  armourBar.x = healthBar.width + 2
}

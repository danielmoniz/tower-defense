
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
    const speedy = this.createSpeedyIndicator(unit, unitBase)
    const elite = this.createEliteIndicator(unit, unitBase) // render before tough & regeneratie
    // const regenerative = this.createRegenerativeIndicator(unit, container)
    // const tough = this.createToughIndicator(unit, container)
    // const shields = this.createShields(unit, container) // renders below everything else

    // console.log(container.width);
    // console.log(unitBase.width);

    autorun(() => {
      rotateToTarget(unit, unitBase)
    })

    container.on('rightclick', () => {
      this.actions.setSelectedTowerTarget(unit)
    })

    return container
  }

  createUnitBase(unit, container) {
    const unitType = unit.enemyType.toLowerCase()
    const unitBase = new PIXI.Sprite(PIXI.utils.TextureCache[unitType])
    unitBase.anchor.set(0.5)
    unitBase.x = unit.width / 2
    unitBase.y = unit.height / 2
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
      container.addChildAt(shieldCircle, 0);
    })
  }

  createRegenerativeIndicator(unit, container) {
    if (unit.regenerates === undefined) { return }

    const regenIndicator = new PIXI.Sprite(PIXI.utils.TextureCache['regenerative'])
    regenIndicator.anchor.set(0.5)
    regenIndicator.width = unit.width / 2
    regenIndicator.height = regenIndicator.width
    regenIndicator.position.x = unit.width / 4
    regenIndicator.position.y = unit.height / 4
    container.addChild(regenIndicator)

    autorun(() => {
      if (unit.regenerates > 0) {
        regenIndicator.alpha = 1
      } else {
        regenIndicator.alpha = 0.5 // in case enemy loses regen for some reason
      }
    })
  }

  // @TODO Quite similar to createRegenerativeIndicator(). Refactor.
  createToughIndicator(unit, container) {
    if (!unit.hasAttribute('Tough')) { return }

    const toughIndicator = new PIXI.Sprite(PIXI.utils.TextureCache['tough'])
    toughIndicator.anchor.set(0.5)
    toughIndicator.width = unit.width / 2
    toughIndicator.height = toughIndicator.width
    toughIndicator.position.x = 3 * unit.width / 4
    toughIndicator.position.y = 3 * unit.height / 5
    container.addChild(toughIndicator)
  }

  createEliteIndicator(unit, container) {
    if (!unit.hasAttribute('Elite')) { return }

    const eliteIndicator = new PIXI.Sprite(PIXI.utils.TextureCache['elite'])
    eliteIndicator.anchor = { x: 0.5, y: 1 }
    eliteIndicator.width = unit.width * 2 / 3 / container.scale.y
    eliteIndicator.height = eliteIndicator.width
    eliteIndicator.position.y = -(3 * unit.height / 10) / container.scale.y// / 2// + unit.height / 10
    container.addChild(eliteIndicator)
  }

  createSpeedyIndicator(unit, container) {
    if (!unit.hasAttribute('Speedy')) { return }

    const speedyIndicator = new PIXI.Sprite(PIXI.utils.TextureCache['speedy'])
    console.log('---');
    const widthToHeightRatio = speedyIndicator.width / speedyIndicator.height
    speedyIndicator.anchor = { x: 0, y: 0.5 }
    // divide by container's scale to prevent image shrinking
    speedyIndicator.height = container.height / container.scale.y * 0.6
    speedyIndicator.width = speedyIndicator.height * widthToHeightRatio
    speedyIndicator.position.x = container.width * 5/6
    container.addChildAt(speedyIndicator, 0)
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

function rotateToTarget(unit, unitElement) {
  // unit rotation toward their current direction
  // const angle = unit.getAngleToPoint(unit.target.xFloor, unit.target.yFloor)
  unitElement.rotation = unit.currentDirection
}

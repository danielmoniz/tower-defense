
import { autorun } from 'mobx'

import UnitRenderer from '../UnitRenderer'

export default class EnemyRenderer extends UnitRenderer {

  startRender(unit, board) {
    const container = super.startRender(unit, board)

    const unitBase = this.createUnitBase(unit, container)
    this.createHealthBar(unit, container)
    const explosion = this.createExplosion(unit, container)
    const burnAnimation = this.createBurning(unit, container)

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
        let shellExplosion = this.getShellExplosionEmitter(unit, { x: unit.x, y: unit.y })
        this.registerOneTimeEmitterCallback(shellExplosion)
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

  createBurning(unit, container) {
    let burningEmitter
    autorun(() => {
      if (unit.burning) {
        if (burningEmitter) {
          burningEmitter.emit = true
        } else {
          let burningEmitter = this.getBurningEmitter(unit, container)
          this.registerEmitterCallback(() => {
            burningEmitter.update(0.005)
          })
        }
      } else {
        // @TODO stop burning animation
        if (burningEmitter) {
          burningEmitter.emit = false
        }
      }
    })
  }

  createHealthBar(unit, container) {
    // const healthBarHeight = 6    // because the image is 6 pixels high
    const healthBarHeight = Math.ceil(unit.height / 7)    // because the image is 6 pixels high
    const healthBarBackground = new PIXI.Sprite(PIXI.utils.TextureCache["healthBarBackground"])
    healthBarBackground.height = healthBarHeight + 2
    healthBarBackground.position.y = unit.height - healthBarHeight - 2
    container.addChild(healthBarBackground)

    const healthBar = new PIXI.Sprite(PIXI.utils.TextureCache["healthBar"])
    healthBar.position.y = unit.height - healthBarHeight - 1
    healthBar.position.x = 1
    healthBar.height = healthBarHeight
    container.addChild(healthBar)

    autorun(() => {
      renderHitPointsBar(unit, healthBar, healthBarBackground)
    })
  }

  getBurningEmitter(unit, container) {
    return new PIXI.particles.Emitter(
      container,
      [PIXI.Texture.fromImage('/images/particle.png')],
      {
        "alpha": {
					"start": 0.74,
					"end": 0.4
				},
				"scale": {
					"start": 0.3,
					"end": 0.4
				},
				"color": {
					"start": "ffdfa0",
					"end": "100f0c"
				},
				"speed": {
					"start": 110,
					"end": 55
				},
				"startRotation": {
					"min": 280,
					"max": 300
				},
				"rotationSpeed": {
					"min": 0,
					"max": 200
				},
				"lifetime": {
					"min": 0.3,
					"max": 0.9
				},
				"blendMode": "normal",
				"ease": [
					{
						"s": 0,
						"cp": 0.329,
						"e": 0.548
					},
					{
						"s": 0.548,
						"cp": 0.767,
						"e": 0.876
					},
					{
						"s": 0.876,
						"cp": 0.985,
						"e": 1
					}
				],
				"frequency": 0.001,
				"emitterLifetime": 0,
				"maxParticles": 100,
				"pos": {
					"x": unit.width / 2,
					"y": unit.height / 4
				},
				"addAtBack": true,
				"spawnType": "point",
      }
    )
  }

  getShellExplosionEmitter(unit, position) {
    return new PIXI.particles.Emitter(
      this.board.effectsLayer,
      [PIXI.Texture.fromImage('/images/particle.png')],
      {
        "alpha": {
					"start": 0.74,
					"end": 0.4
				},
				"scale": {
					"start": 3,
					"end": 1.2
				},
				"color": {
					"start": "ffdfa0",
					"end": "100f0c"
				},
				"speed": {
					"start": 200,
					"end": 0
				},
				"startRotation": {
					"min": 0,
					"max": 360
				},
				"rotationSpeed": {
					"min": 0,
					"max": 200
				},
				"lifetime": {
					"min": 0.3,
					"max": 0.9
				},
				"blendMode": "normal",
				"ease": [
					{
						"s": 0,
						"cp": 0.329,
						"e": 0.548
					},
					{
						"s": 0.548,
						"cp": 0.767,
						"e": 0.876
					},
					{
						"s": 0.876,
						"cp": 0.985,
						"e": 1
					}
				],
				"frequency": 0.001,
				"emitterLifetime": 0.1,
				"maxParticles": 100,
				"pos": {
					"x": position.x,
					"y": position.y
				},
				"addAtBack": true,
				"spawnType": "point",
      }
    )
  }

}

function renderHitPointsBar(unit, healthBar, healthBarBackground) {
  const backgroundWidth = unit.width * (unit.currentHitPoints / unit.maxHitPoints)
  healthBar.width = backgroundWidth - 2
  healthBarBackground.width = backgroundWidth
}

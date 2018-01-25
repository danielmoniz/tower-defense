
import { autorun } from 'mobx'

import { GAME_REFRESH_RATE } from '../../../appConstants'
import TowerRenderer from './TowerRenderer'

export default class FlamethrowerRenderer extends TowerRenderer {

  constructor(...args) {
    super(...args)

    this.towerBaseOptions = {
      color: 0xffd8c4,
      lineStyle: { width: 2, color: 0x000000, alpha: 1, },
    }
  }

  getGunOptions(unit) {
    return {
      color: 0x8c847a,
      lineStyle: { width: 1, color: 0x000000, alpha: 1, },
      gunHeight: 8,
      gunLength: this.getGunLength(unit),
    }
  }

  startRender(unit, board) {
    const circleRadius = unit.width / 2
    const gunHeight = 8
    const gunLength = unit.width * 0.6
    const gunOptions = this.getGunOptions(unit)

    const backgroundOptions = {
      backgroundColor: 0xCCCCCC,
      disableBackgroundColor: 0xFF4444,
      lineStyle: { width: 1, color: 0x000000, alpha: 0.5, },
    }
    const towerBaseOptions = {
      color: 0xffd8c4,
      lineStyle: { width: 2, color: 0x000000, alpha: 1, },
    }
    const maxRangeOptions = {
      color: 0x40ef4c,
      alpha: 0.2,
      lineStyle: { width: 3, color: 0x000000, alpha: 1, },
    }

    const { container, unitContainer } = this.getContainer(unit, board)
    const { disableBackground, background } = this.setBackground(unit, unitContainer, backgroundOptions)
    this.setTowerBase(unitContainer, circleRadius, towerBaseOptions)
    const gunContainer = this.setGun(unit, unitContainer, gunOptions)
    const maxRange = this.setMaxRange(container)
    this.drawMaxRange(maxRange, unit, circleRadius)
    board.app.stage.addChild(container)

    this.setAutorun(unit, background, disableBackground, unitContainer, gunContainer, maxRange)

    let flameEmitter = this.getFlameEmitter(container, unit, 0, 0)
    flameEmitter.updateOwnerPos(unit.width / 2, unit.height / 2)
    flameEmitter.updateSpawnPos(gunLength, gunHeight / 2)

    this.registerEmitterCallback(() => {
      flameEmitter.update(0.005) // higher numbers mean more/faster fire
    })

    autorun(() => {
      if (unit.isFiring) {
        this.startFlames(flameEmitter)
      } else {
        this.stopFlames(flameEmitter)
      }
    })

    autorun(() => {
      this.rotateFlames(unit, flameEmitter)
    })

    return container
  }

  rotateFlames(unit, flameEmitter) {
    if (unit.target) {
      const angle = unit.getAngleToPoint(unit.target.xFloor, unit.target.yFloor)
      flameEmitter.rotate(toDegrees(angle))
    }
  }

  startFlames(emitter) {
    emitter.emit = true
  }

  stopFlames(emitter) {
    emitter.emit = false
    // this.board.app.renderer.render(this.board.app.stage); // not needed?
    // this.board.app.renderer.plugins.sprite.sprites.length = 0
  }

  getFlameEmitter(container, unit) {
    return new PIXI.particles.Emitter(
      container,
      [PIXI.Texture.fromImage('/images/Fire.png')],
      {
        "alpha": {
					"start": 0.62,
					"end": 0
				},
				"scale": {
					"start": 0.25,
					"end": 0.75
				},
				"color": {
					"start": "fff191",
					"end": "ff622c"
				},
				"speed": {
					"start": 500,
					"end": 200
				},
				"startRotation": {
					"min": -5,
					"max": 5
				},
				"rotationSpeed": {
					"min": 50,
					"max": 50
				},
				"lifetime": {
					"min": 0.1,
					"max": 0.5
				},
				"blendMode": "normal",
				"frequency": 0.001,
				"emitterLifetime": 0,
				"maxParticles": 1000,
				"pos": {
					"x": 0,
					"y": 0,
				},
				"addAtBack": false,
				"spawnType": "circle",
				"spawnCircle": {
					"x": 0,
					"y": 0,
					"r": 10
				},
      }
    )
  }

}

function toDegrees(angle) {
  return angle * (180 / Math.PI);
}

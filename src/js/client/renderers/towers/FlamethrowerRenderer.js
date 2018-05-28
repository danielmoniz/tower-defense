
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

    this.useMuzzleFlash = false
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
    const { container, unitContainer } = super.startRender(unit, board)
    const gunOptions = this.getGunOptions(unit)

    let flameEmitter = this.getFlameEmitter(container, unit)
    flameEmitter.updateOwnerPos(unit.width / 2, unit.height / 2)
    flameEmitter.updateSpawnPos(gunOptions.gunLength, gunOptions.gunHeight / 2)

    this.registerEmitter.persistent(() => {
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
    let coneWidth = 20
    if (unit.coneWidth) {
      coneWidth = unit.coneWidth - 10 // account for width of flame image
    }
    // @TODO Base the width of particle spray on the tower's coneWidth property.
    // The width of the flame image is also relevant to the size of the
    // visible cone.
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
					"min": -unit.coneWidth / 2,
					"max": unit.coneWidth / 2
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

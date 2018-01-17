
import { autorun } from 'mobx'

import { GAME_REFRESH_RATE } from '../../../appConstants'
import TowerRenderer from './TowerRenderer'

export default class FlamethrowerRenderer extends TowerRenderer {

  startRender(unit, board) {
    const { container, gunLength, gunHeight } = super.startRender(unit, board)

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

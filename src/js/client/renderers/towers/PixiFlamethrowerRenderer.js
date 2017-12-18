
import { autorun } from 'mobx'

import { GAME_REFRESH_RATE } from '../../../appConstants'
import PixiTowerRenderer from '../PixiTowerRenderer'

export default class PixiFlamethrowerRenderer extends PixiTowerRenderer {

  startRender(unit, board) {
    const { container, gunContainer } = super.startRender(unit, board)

    const gunHeight = 8
    const gunLength = unit.width * 0.6
    const circleRadius = unit.width / 2

    let flameEmitter = this.getFlameEmitter(gunContainer, gunLength)

    this.registerEmitterCallback(() => {
      console.log('updating flame emitter');
      flameEmitter.update(0.005) // higher numbers mean more/faster fire
    })

    autorun(() => {
      if (unit.isFiring) {
        this.startFlames(flameEmitter)
      } else {
        this.stopFlames(flameEmitter)
      }
    })

    return container
  }

  startFlames(emitter) {
    console.log(emitter);
    emitter.emit = true
  }

  stopFlames(emitter) {
    emitter.emit = false
    // this.board.app.renderer.render(this.board.app.stage); // not needed?
    // this.board.app.renderer.plugins.sprite.sprites.length = 0
  }

  getFlameEmitter(container, xPosition = 0, yPosition = 0) {
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
					"x": xPosition,
					"y": yPosition,
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

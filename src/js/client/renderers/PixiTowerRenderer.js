
import { autorun } from 'mobx'

import { GAME_REFRESH_RATE } from '../../appConstants'
import PixiUnitRenderer from './PixiUnitRenderer'

export default class PixiTowerRenderer extends PixiUnitRenderer {

  startRender(unit, board) {
    const container = super.startRender(unit, board)

    const gunHeight = 8
    const gunLength = unit.width * 0.6
    const circleRadius = unit.width / 2

    const disableBackground = new PIXI.Graphics()
    disableBackground.beginFill(0xFF4444)
    disableBackground.drawRect(0, 0, unit.width, unit.height)
    disableBackground.endFill()
    disableBackground.alpha = 0
    container.addChild(disableBackground)


    const background = new PIXI.Graphics()
    background.beginFill(0xCCCCCC)
    // background.lineStyle(2, 0x000000, 1);
    background.drawRect(0, 0, unit.width, unit.height);
    background.endFill();
    container.addChild(background)

    const towerBase = new PIXI.Graphics()
    towerBase.beginFill(0x66CCFF)
    towerBase.lineStyle(2, 0x000000, 1);
    towerBase.drawCircle(circleRadius, circleRadius, circleRadius - 3);
    towerBase.endFill();
    container.addChild(towerBase)

    // Create container for the gun so it can be rotated separately
    const gunContainer = new PIXI.Container()
    gunContainer.height = unit.height
    gunContainer.width = unit.width
    gunContainer.anchor = 0.5
    gunContainer.x = unit.width / 2
    gunContainer.y = unit.height / 2
    container.addChild(gunContainer)

    const gun = new PIXI.Graphics()
    gun.beginFill(0x666666)
    gun.lineStyle(1, 0x000000, 1)
    gun.drawRect(0, 0, gunLength, gunHeight)
    gun.endFill()
    gun.pivot.y = gunHeight / 2
    gunContainer.addChild(gun)

    const maxRange = new PIXI.Graphics()
    maxRange.beginFill(0x40ef4c)
    maxRange.lineStyle(3, 0x000000, 1)
    maxRange.drawCircle(0, 0, unit.range)
    maxRange.endFill()
    maxRange.alpha = 0.2
    container.addChild(maxRange)

    board.app.stage.addChild(container)

    let myEmitter = new PIXI.particles.Emitter(
      gunContainer,
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
					"max": 0.75
				},
				"blendMode": "normal",
				"frequency": 0.001,
				"emitterLifetime": 0,
				"maxParticles": 1000,
				"pos": {
					"x": gunLength,
					"y": 0
				},
				"addAtBack": false,
				"spawnType": "circle",
				"spawnCircle": {
					"x": 0,
					"y": 0,
					"r": 10
				}
      }
    )
    console.log(myEmitter);

    var elapsed = Date.now()

    var update = function(){

    	// Update the next frame
    	requestAnimationFrame(update);

    	var now = Date.now();

    	// The emitter requires the elapsed
    	// number of seconds since the last update
    	myEmitter.update((now - elapsed) * 0.001);

    	elapsed = now;

    	// Should re-render the PIXI Stage
    	// renderer.render(stage);
    };

    myEmitter.emit = true
    update()

    // autorun(() => {
    //   if (!unit.lastFired) {
    //     unit.lastFired = Date.now()
    //     return
    //   }
    //   if (unit.firingTest) {
    //     const time = Date.now()
    //     myEmitter.update(time - unit.lastFired)
    //   }
    // })


    autorun(() => {
      disable(unit, background, disableBackground)
    })

    autorun(() => {
      rotateToTarget(unit, gunContainer, myEmitter)
    })

    autorun(() => {
      displayRange(unit, maxRange)
    })

    return container
  }

}

function displayRange(unit, maxRange) {
  if (!unit.placed || unit.selected) {
    maxRange.visible = true
  } else {
    maxRange.visible = false
  }
}

function rotateToTarget(unit, unitElement, emitter) {
  // tower rotation toward target (ideally only gun rotation)
  if (unit.target) {
    const angle = unit.getAngleToPoint(unit.target.xFloor, unit.target.yFloor)
    unitElement.rotation = angle
  }
}

function disable(unit, background, disableBackground) {
  if (unit.placed) {
    background.alpha = 0.2
    disableBackground.alpha = 0
  } else if (unit.game.canAfford(unit)) {
    background.alpha = 1
    disableBackground.alpha = 0
  } else {
    background.alpha = 0
    disableBackground.alpha = 1
  }
}

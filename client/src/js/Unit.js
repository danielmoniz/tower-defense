
import { observable, computed, action, autorun } from 'mobx'

import { UNIT_REFRESH_RATE } from 'appConstants'
import addRenderTools from 'RenderedUnit'

// this should come from an environment variable so the server can run code without rendering
const RENDER_UNITS = true

let ID = 1

class Unit {
  // defaults (observables)
  @observable x = 0
  @observable y = 0
  @observable id
  @observable name
  @observable speed = 100 // pixels per second
  @observable display = true
  @observable disabled = false

  constructor(options) {
    options = options || {}
    this.id = ID
    ID += 1
    this.movementId = undefined

    // set defaults
    this.width = undefined // must override
    this.height = undefined // must override
    this.name = undefined // must override


    // override defaults
    for (let key in options) {
      if (options.hasOwnProperty(key)) {
        this[key] = options[key]
      }
    }

    addRenderTools(this) // adds the render methods to this class
  }

  @action hide() {
    this.display = false
  }

  @action show() {
    this.display = true
  }

  @action disable() {
    this.disabled = true
  }

  @action enable() {
    this.disabled = false
  }

  @action jumpTo(newX, newY) {
    this.x = newX
    this.y = newY
  }

  @action pauseMovement() {
    clearInterval(this.movementId)
    delete this.movementId
  }

  @action startMovement() {
    this.movementId = setInterval(this.movement, UNIT_REFRESH_RATE)
  }

  @action moveTo(finalX, finalY) {
    if (this.movementId) {
      clearInterval(this.movementId) // stop old movement
    }
    this.movement = () => {
      const stopMoving = this.moveXAndY(finalX, finalY)
      if (stopMoving) {
        clearInterval(this.movementId)
        delete this.movementId
      }
    }
    this.startMovement()
  }

  @action moveXAndY(finalX, finalY) {
    if (this.x === finalX && this.y === finalY) {
      return true
    }

    const actualSpeed = this.speed / (1000 / UNIT_REFRESH_RATE)
    // use polar coordinates to generate X and Y given target destination
    const deltaX = finalX - this.x
    const deltaY = finalY - this.y
    let distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2))
    distance = Math.min(actualSpeed, distance)
    const angle = Math.atan2(deltaY, deltaX)

    const xMovement = distance * Math.cos(angle)
    const yMovement = distance * Math.sin(angle)

    this.x += xMovement
    this.y += yMovement
  }

}

Unit.create = function(UnitClass, options) {
  const unit = new UnitClass(options)
  unit.startRender()
  return unit
}

export default Unit

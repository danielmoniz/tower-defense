
import { observable, computed, action, autorun } from 'mobx'

import { UNIT_REFRESH_RATE } from 'appConstants'
import addRenderTools from 'RenderedUnit'

// this should come from an environment variable so the server can run code without rendering
const RENDER_UNITS = true


let ID = 1

export default class Unit {
  @observable x = 0
  @observable y = 0
  @observable id
  @observable name
  @observable speed = 1

  constructor(name) {


    this.id = ID
    this.name = name
    ID += 1
    
    this.movementId = undefined

    if (RENDER_UNITS) {
      addRenderTools(this) // adds the render methods to this class
      this.startRender()
    }
  }

  @action jumpTo(newX, newY) {
    this.x = newX
    this.y = newY
  }

  @action pauseMovement() {
    window.clearInterval(this.movementId)
    delete this.movementId
  }

  @action startMovement() {
    this.movementId = window.setInterval(this.movement, UNIT_REFRESH_RATE)
  }

  @action moveTo(finalX, finalY) {
    if (this.movementId) {
      window.clearInterval(this.movementId) // stop old movement
    }
    this.movement = () => {
      const stopMoving = this.moveXAndY(finalX, finalY)
      if (stopMoving) {
        window.clearInterval(this.movementId)
        delete this.movementId
      }
    }
    this.startMovement()
  }

  @action moveXAndY(finalX, finalY) {
    if (this.x === finalX && this.y === finalY) {
      return true
    }
    if (this.x < finalX) {
      this.x += this.speed
    } else if (this.x > finalX) {
      this.x -= this.speed
    }
    if (this.y < finalY) {
      this.y += this.speed
    } else if (this.y > finalY) {
      this.y -= this.speed
    }
  }

}
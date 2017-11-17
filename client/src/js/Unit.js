import { observable, computed, action, autorun } from 'mobx'

import { UNIT_REFRESH_RATE } from 'appConstants'


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

    this.startRender()
  }

  startRender() {
    const element = document.createElement("div")
    element.innerHTML = this.name
    element.id = "unit-" + this.id
    element.style.position = 'absolute'
    const body = document.querySelector("body")
    body.append(element)
    var disposer = autorun(() => {
      this.render()
    })
  }

  render() {
    const unitElement = document.querySelector("#unit-" + this.id)
    if (unitElement === undefined) {
      return
    }
    unitElement.style['left'] = this.x + 'px'
    unitElement.style['top'] = this.y + 'px'
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
    this.movementId = window.setInterval(this.movement, UNIT_REFRESH_RATE)
  }

  @action moveTo(finalX, finalY) {
    console.log(`${this.name}: ${finalX}, ${finalY}`);
    if (this.movementId) {
      clearInterval(this.movementId) // stop old movement
    }
    this.movement = () => {
      const stopMoving = this.moveXAndY(finalX, finalY)
      if (stopMoving) {
        console.log("clearing interval:", this.movementId);
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
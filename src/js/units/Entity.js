
import { observable, computed, action, autorun } from 'mobx'

import { GRID_SIZE } from '../appConstants'
import getAltId from '../utility/altId'

export default class Entity {

  @observable id
  @observable x = 0
  @observable y = 0
  @observable display = true
  @observable disabled = false // setting to true disables and greys the unit
  @observable removeMe = false // setting to true allows for units to be removed from the game
  @observable selected = false

  @observable width = GRID_SIZE
  @observable height = GRID_SIZE

  constructor(game) {
    this.id = getAltId()
    this.createdAt = Date.now()

    // add a reference to game which avoids circular referencing
    Object.defineProperty(this, 'game', { value: game, writable: true})

    // this.width = undefined // must override
    // this.height = undefined // must override
  }

  @computed get xFloor() {
    return Math.floor(this.x)
  }

  @computed get yFloor() {
    return Math.floor(this.y)
  }

  /*
   * Used for setting any key/value pair on the entity.
   */
  @action setAttr(key, value) {
    this[key] = value
  }

  @action destroy() {
    this.remove()
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

  @action remove() {
    this.removeMe = true
  }

  @action select() {
    this.selected = true
  }

  @action deselect() {
    this.selected = false
  }

  /*
   * Jumps/teleports an entity to the given position.
   */
  @action jumpTo(newX, newY) {
    this.x = newX
    this.y = newY
  }

  getAngleToPoint(x, y) {
    return Math.atan2(y - this.y, x - this.x)
  }

  getCentre() {
    return { x: this.x + this.width / 2, y: this.y + this.height / 2}
  }

  getDistanceToPoint(point) {
    const xDistance = Math.abs(this.getCentre().x - point.x) - (this.width / 2)
    const yDistance = Math.abs(this.getCentre().y - point.y) - (this.height / 2)
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2))
  }
}

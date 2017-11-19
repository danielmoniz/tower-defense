
/*
 * This file holds the tools for rendering a unit. There should be no usage @action in here because
 * render methods should not be modifying state (but can rely upon it).
 */

import { autorun } from 'mobx'

export default function addRenderTools(unit) {
  unit.startRender = function() {
    const element = document.createElement("img")
    // element.innerHTML = unit.name
    element.id = "unit-" + unit.id
    element.style.position = 'absolute'
    element.src = "../static/assets/tank_side.png"
    element.style.width = this.size + 'px'
    element.style.height = this.size + 'px'
    const gameBox = document.querySelector("#display-box")
    gameBox.append(element)
    var disposer = autorun(() => {
      unit.render()
    })
  }

  unit.render = function() {
    const unitElement = document.querySelector("#unit-" + unit.id)
    if (unitElement === undefined) {
      return
    }
    unitElement.style['left'] = unit.x + 'px'
    unitElement.style['top'] = unit.y + 'px'
  }
}
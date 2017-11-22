
/*
 * This file holds the tools for rendering a unit. There should be no usage @action in here because
 * render methods should not be modifying state (but can rely upon it).
 */

import { autorun } from 'mobx'

export default function getUnitRenderer(unit) {
  return function() {
    const element = document.createElement("div")
    element.id = "unit-" + unit.id
    element.style.position = 'absolute'
    element.style.width = this.width + 'px'
    element.style.height = this.height + 'px'
    element.classList.add('unit')

    const image = document.createElement("img")
    image.src = `../static/assets/${unit.name.toLowerCase()}.png`
    element.append(image)

    const hitPointsBar = document.createElement("div")
    hitPointsBar.classList.add('hitPointsBar')
    element.append(hitPointsBar)

    const gameBox = document.querySelector("#display-box")
    gameBox.append(element)
    var disposer = autorun(() => {
      render(element, hitPointsBar, image)
    })

    unit.startRender = () => console.log("can't call me again")
  }

  // @TODO For efficiency, this function can be broken down into
  // smaller pieces, each used as an autorun callback.
  function render(unitElement, hitPointsBar, image) {
    // const unitElement = document.querySelector("#unit-" + unit.id)
    if (unitElement === undefined) {
      return
    }

    if (unit.disabled) {
      unitElement.classList.add('disabled')
    } else {
      unitElement.classList.remove('disabled')
    }

    // tower-specific styles can go here (for now)
    // @TODO This belongs in a class/method specific to rendering towers
    if (unit.purchaseCost !== undefined) { // ie. is purchasable, so must be a tower. @FIXME hacky!

      // background highlight (affordability)
      if (!unit.placed && !unit.game.canAfford(unit)) {
        unitElement.style['background-color'] = 'red'
      } else if (!unit.placed && unit.game.canAfford(unit)) {
        unitElement.style['background-color'] = 'rgba(0, 0, 0, 0.5)'
      } else {
        unitElement.style['background-color'] = 'rgba(0, 0, 0, 0.15)'
      }

      // tower rotation toward target (ideally only gun rotation)
      if (unit.target) {
        const angle = unit.getAngleToPoint(unit.target.x, unit.target.y)
        image.style.transform = `rotate(${angle}rad)`
      }
    }

    hitPointsBar.innerHTML = unit.currentHitPoints

    unitElement.style['left'] = unit.x + 'px'
    unitElement.style['top'] = unit.y + 'px'
    unitElement.style.display = unit.display ? 'initial' : 'none'
  }
}

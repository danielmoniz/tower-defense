
/*
 * This file holds the tools for rendering a unit. There should be no usage @action in here because
 * render methods should not be modifying state (but can rely upon it).
 */

import { autorun } from 'mobx'

export default function getUnitRenderTools(unit) {
  let element
  return {
    startRender: function() {
      element = document.createElement("div")
      element.id = "unit-" + unit.id
      element.style.position = 'absolute'
      element.style.width = unit.width + 'px'
      element.style.height = unit.height + 'px'
      element.classList.add('unit')

      const image = document.createElement("img")
      image.src = `../images/${unit.name.toLowerCase()}.png`
      element.append(image)
      image.style

      const hitPointsBar = document.createElement("div")
      hitPointsBar.classList.add('hitPointsBar')
      element.append(hitPointsBar)

      const gameBox = document.querySelector("#display-box")
      gameBox.append(element)


      // let rectangle = new PIXI.Graphics()
      // rectangle.beginFill(0x66CCFF)
      // rectangle.lineStyle(4, 0xFF3300, 1);
      // rectangle.drawRect(0, 0, 20, 20);
      // rectangle.endFill();
      // app.stage.addChild(rectangle)


      autorun(() => {
        renderPosition(element)
      })

      autorun(() => {
        renderDisplay(element)
      })

      autorun(() => {
        renderDisable(element)
      })

      autorun(() => {
        renderHitPointsBar(element, hitPointsBar)
      })

      autorun(() => {
        renderTower(element, image)
      })

      unit.startRender = () => console.log("can't call me again")
    },

    destroy: function() {
      element.remove()
    },
  }

  function renderPosition(unitElement) {
    // window.requestAnimationFrame(() => { // not working, not sure why
      // console.log('animation happening');
      unitElement.style['left'] = unit.xFloor + 'px'
      unitElement.style['top'] = unit.yFloor + 'px'
    // })
  }

  function renderDisplay(unitElement) {
    unitElement.style.display = unit.display ? 'initial' : 'none'
  }

  function renderDisable(unitElement) {
    if (unit.disabled) {
      unitElement.classList.add('disabled')
    } else {
      unitElement.classList.remove('disabled')
    }
  }

  function renderHitPointsBar(unitElement, hitPointsBar) {
    hitPointsBar.innerHTML = unit.currentHitPoints
  }

  function renderTower(unitElement, image) {

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
        const angle = unit.getAngleToPoint(unit.target.xFloor, unit.target.yFloor)
        image.style.transform = `rotate(${angle}rad)`
      }
    }

  }

}

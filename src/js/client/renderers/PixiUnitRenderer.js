
import { autorun } from 'mobx'

import { GRID_SIZE } from '../../appConstants'

export default class PixiUnitRenderer {

  constructor(board, gameActions) {
    this.board = board
    this.actions = gameActions
  }

  render(unit) {
    this.startRender(unit, this.board)
  }

  startRender(unit, board) {

    let container = new PIXI.Container()
    container.pivot.x = unit.width / 2
    container.pivot.y = unit.height / 2

    container.interactive = true
    container.buttonMode = true

    board.app.stage.addChild(container)

    container.on('click', () => {
      this.actions.selectEntity(unit)
    })

    autorun(() => {
      destroy(unit, container)
    })

    autorun(() => {
      renderPosition(unit, container)
    })

    autorun(() => {
      renderDisplay(unit, container)
    })

    autorun(() => {
      renderDisable(unit, container)
    })

    return container
  }

}

function destroy(unit, unitElement) {
  if (unit.derender) {
    unitElement.destroy()
  }
}

function renderPosition(unit, unitElement) {
  // window.requestAnimationFrame(() => { // not working, not sure why
    // console.log('animation happening');
    unitElement.x = unit.xFloor + unit.width / 2
    unitElement.y = unit.yFloor + unit.height / 2
  // })
}

function renderDisplay(unit, unitElement) {
  unitElement.visible = unit.display
  // unitElement.style.display = unit.display ? 'initial' : 'none'
}

function renderDisable(unit, unitElement) {
  if (unit.disabled) {
    unitElement.alpha = 0.3
  } else {
    unitElement.alpha = 1
  }
}

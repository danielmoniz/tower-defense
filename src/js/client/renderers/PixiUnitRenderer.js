
import { autorun } from 'mobx'

import { GRID_SIZE } from '../../appConstants'

export default class UnitRenderer {

  constructor(board, app) {
    this.board = board
    this.app = app
  }

  render(unit) {
    this.startRender(unit, this.board)
  }

  startRender(unit, board) {

    let rectangle = new PIXI.Graphics()
    rectangle.beginFill(0x66CCFF)
    rectangle.lineStyle(4, 0xFF3300, 1);
    rectangle.drawRect(0, 0, 20, 20);
    rectangle.endFill();
    board.app.stage.addChild(rectangle)

    autorun(() => {
      destroy(unit, rectangle)
    })

    autorun(() => {
      renderPosition(unit, rectangle)
    })

    autorun(() => {
      renderDisplay(unit, rectangle)
    })

    autorun(() => {
      renderDisable(unit, rectangle)
    })

    return rectangle
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
    unitElement.x = unit.xFloor
    unitElement.y = unit.yFloor
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

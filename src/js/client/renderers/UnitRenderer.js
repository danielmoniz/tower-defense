
import { autorun } from 'mobx'

import { GRID_SIZE } from '../../appConstants'

export default class UnitRenderer {

  constructor(board) {
    this.board = board
  }

  render(unit) {
    this.startRender(unit, this.board)
  }

  startRender(unit, board) {
    const element = document.createElement("div")
    element.id = "unit-" + unit.id
    element.style.position = 'absolute'
    element.style.width = unit.width + 'px'
    element.style.height = unit.height + 'px'
    element.classList.add('unit')

    board.gameBox.append(element)


    // let rectangle = new PIXI.Graphics()
    // rectangle.beginFill(0x66CCFF)
    // rectangle.lineStyle(4, 0xFF3300, 1);
    // rectangle.drawRect(0, 0, 20, 20);
    // rectangle.endFill();
    // app.stage.addChild(rectangle)

    autorun(() => {
      destroy(unit, element)
    })

    autorun(() => {
      renderPosition(unit, element)
    })

    autorun(() => {
      renderDisplay(unit, element)
    })

    autorun(() => {
      renderDisable(unit, element)
    })

    return element
  }

}

function destroy(unit, element) {
  if (unit.derender) {
    element.remove()
  }
}

function renderPosition(unit, unitElement) {
  // window.requestAnimationFrame(() => { // not working, not sure why
    // console.log('animation happening');
    unitElement.style['left'] = unit.xFloor + 'px'
    unitElement.style['top'] = unit.yFloor + 'px'
  // })
}

function renderDisplay(unit, unitElement) {
  unitElement.style.display = unit.display ? 'initial' : 'none'
}

function renderDisable(unit, unitElement) {
  if (unit.disabled) {
    unitElement.classList.add('disabled')
  } else {
    unitElement.classList.remove('disabled')
  }
}

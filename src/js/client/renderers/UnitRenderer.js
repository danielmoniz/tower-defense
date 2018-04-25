
import { autorun } from 'mobx'

import { GRID_SIZE } from '../../appConstants'

export default class UnitRenderer {

  constructor(board, gameActions, registerEmitterCallback, registerOneTimeEmitterCallback) {
    this.board = board
    this.actions = gameActions
    this.registerEmitterCallback = registerEmitterCallback
    this.registerOneTimeEmitterCallback = registerOneTimeEmitterCallback
  }

  render(unit) {
    this.startRender(unit, this.board)
  }

  startRender(unit, board, registerEmitterCallback) {

    let container = new PIXI.Container()
    container.pivot.x = unit.width / 2
    container.pivot.y = unit.height / 2

    container.interactive = true
    container.buttonMode = true

    container.parentLayer = board.unitsLayer

    board.app.stage.addChild(container)

    container.on('click', () => {
      this.actions.selectEntity(unit)
    })

    unit.render = render.bind(null, unit, container)
    unit.derender = derender.bind(null, container)

    return container
  }

}

function render(unit, unitElement) {
  if (unit.removeMe) {
    return unitElement.destroy()
  }

  if (unit.display !== unitElement.visible) {
    unitElement.visible = unit.display // update unit visibility
  }
  if (!unit.display) { return } // do no rendering if unit is not visible

  renderPosition(unit, unitElement)
}

function derender(unitElement) {
  unitElement.destroy()
}

function renderPosition(unit, unitElement) {
  unitElement.x = unit.xFloor
  unitElement.y = unit.yFloor
  // unitElement.x = unit.xFloor + GRID_SIZE / 2
  // unitElement.y = unit.yFloor + GRID_SIZE / 2
}

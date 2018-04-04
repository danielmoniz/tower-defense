
import { observable, computed, action, autorun } from 'mobx'

export default class UnitManager {
  @observable all = []
  byId = {}

  add(unit) {
    this.all.push(unit)
    this.byId[unit.id] = unit
  }

  concat(units) {
    units.forEach((unit) => {
      this.add(unit)
    })
  }

  remove(index) {
    const unit = this.all[index]
    this.all.splice(index, 1)
    delete this.byId[unit.id]
  }

  removeByValue(unitToRemove) {
    for (let i = this.all.length - 1; i >= 0; i--) {
      const unit = this.all[i]
      if (unit.id === unitToRemove.id) {
        this.remove(i)
        break
      }
    }
  }

  clear() {
    this.all.forEach((unit) => {
      unit.destroy()
    })
    this.all = []
    this.byId = {}
  }
}

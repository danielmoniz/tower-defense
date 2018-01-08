
import { observable, computed, action, autorun } from 'mobx'

export default class UnitManager {
  @observable all = []
  byId = {}

  add(unit) {
    this.all.push(unit)
    this.byId[unit.id] = unit
  }

  concat(enemies) {
    enemies.forEach((unit) => {
      this.add(unit)
    })
  }

  remove(index) {
    const unit = this.all[index]
    this.all.splice(index, 1)
    delete this.byId[unit.id]
  }

  clear() {
    this.all.forEach((unit) => {
      unit.destroy()
    })
    this.all = []
    this.byId = {}
  }
}

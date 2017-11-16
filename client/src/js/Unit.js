import { observable, computed, action, autorun } from 'mobx'

let ID = 1

export default class Unit {
  @observable x = 0
  @observable y = 0
  @observable id
  @observable name
  
  constructor(name) {
    this.id = ID
    this.name = name
    ID += 1
    
    this.startRender()
  }

  startRender() {
    const element = document.createElement("div")
    element.innerHTML = this.name
    element.id = "unit-" + this.id
    const body = document.querySelector("body")
    body.append(element)
    var disposer = autorun(() => {
      this.render()
    })
  }
  
  render() {
    const unitElement = document.querySelector("#unit-" + this.id)
    if (unitElement === undefined) {
      return
    }
    unitElement.style['margin-left'] = this.x + 'px'
    unitElement.style['margin-top'] = this.y + 'px'
  }
  
  @action moveTo(newX, newY) {
    this.x = newX
    this.y = newY
  }
  
  talk() {
    const message = "Hello!"
    console.log(message)
    return message
  }
  
  
  
  
}
import { useStrict } from 'mobx'

import GameManager from './GameManager'

useStrict(true)

socket.emit('latency', Date.now())

import * as PIXI from 'pixi.js'

let app = new PIXI.Application({ width: 256, height: 256 })
document.body.appendChild(app.view)

const gameNumber = document.querySelector('input[name=gameNumber]').value
let gameType
if (gameNumber === 'solo') {
  gameType = 'solo'
}

let gameManager = new GameManager(gameNumber, false, gameType)

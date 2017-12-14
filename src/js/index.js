import { useStrict } from 'mobx'

import GameManager from './GameManager'

useStrict(true)

socket.emit('latency', Date.now())

const gameNumber = document.querySelector('input[name=gameNumber]').value
let gameType
if (gameNumber === 'solo') {
  gameType = 'solo'
}

let gameManager = new GameManager(gameNumber, false, gameType)

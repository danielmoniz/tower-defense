import { useStrict } from 'mobx'

import GameManager from './GameManager'

useStrict(true)

socket.emit('latency', Date.now())

let gameManager = new GameManager()

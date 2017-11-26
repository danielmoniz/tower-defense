import { useStrict } from 'mobx'

import Game from 'Game'

useStrict(true)

socket.emit('latency', Date.now())

let game = new Game(process.env.SERVER)
game.start()

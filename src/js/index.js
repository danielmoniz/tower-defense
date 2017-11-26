import { useStrict } from 'mobx'

import Game from 'Game'

useStrict(true)

let game = new Game(process.env.SERVER)
game.start()

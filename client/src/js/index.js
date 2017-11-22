import { useStrict } from 'mobx'

import Game from 'Game'

useStrict(true)

let game = new Game(process.env.TD_IGNORE_UI)
game.start()

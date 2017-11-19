import { useStrict } from 'mobx'

import Game from 'Game'

useStrict(true)

let game = new Game()
game.start()

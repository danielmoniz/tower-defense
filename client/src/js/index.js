import { useStrict } from 'mobx'

import Unit from 'Unit'
import Cannon from 'Cannon'
import Tank from 'Tank'
import { GRID_SIZE } from 'appConstants'
import Game from 'Game'

useStrict(true)

let game = new Game()
game.start()

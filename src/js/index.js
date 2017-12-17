import { useStrict } from 'mobx'
import * as PIXI from 'pixi.js'
import * as particles from 'pixi-particles'

window.particles = particles
// console.log(particles);
import GameManager from './GameManager'

useStrict(true)

socket.emit('latency', Date.now())

const gameNumber = document.querySelector('input[name=gameNumber]').value
let gameType
if (gameNumber === 'solo') {
  gameType = 'solo'
}

// let gameManager = new GameManager(gameNumber, false, gameType, undefined, PIXI)
let gameManager = new GameManager(gameNumber, false, gameType)

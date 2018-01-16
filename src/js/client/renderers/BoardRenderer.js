
import { autorun } from 'mobx'

import { GRID_SIZE } from '../../appConstants'

export default class BoardRenderer {

  constructor() {
    this.assetsReady = false
  }

  setupGameBox(game) {
    this.app = new PIXI.Application({
      width: game.width,
      height: game.height,
      antialias: true,
      transparent: false,
      resolution: 1,
    })
    this.app.view.id = "game-viewport"
    const displayBox = document.querySelector("#display-box")
    displayBox.appendChild(this.app.view)
    this.app.renderer.backgroundColor = 0xFFFFFF
    this.app.renderer.view.style.border = '2px solid black'

    this.loadUnitAssets(() => {
      this.renderMap(game)
    })
    this.setupGameStateDisplay(game)
  }

  loadUnitAssets(onCompletion) {
    // @TODO Move this into another file
    // load assets into PIXI
    this.loader = new PIXI.loaders.Loader()
    this.loader.add('healthBar', '/images/healthBar.png')
          .add('healthBarBackground', '/images/healthBarBackground.png')
          .add('tank', '/images/tank.png')
          .add('tank_normal', '/images/normal.png')
          .add('tank_fast', '/images/fast.png')
          .add('exit', '/images/exit.png')
    console.log("Loading images...");
    this.loader.on("progress", (loader, resource) => {
      const completion = `${Math.floor(loader.progress)}%`
      console.log(completion);
    })
    this.loader.load((loader, resources) => {
      console.log("All images loaded!");
      this.assetsReady = true
      onCompletion()
    })
  }

  setupGameStateDisplay(game) {
    this.setupCreditsDisplay(game)
    this.setupLivesDisplay(game)
    this.setupWaveDisplay(game)
  }

  setupCreditsDisplay(game) {
    const creditsDisplay = document.querySelector(".remainingCredits")
    autorun(() => {
      creditsDisplay.innerHTML = Math.floor(game.credits.current)
    })
  }

  setupLivesDisplay(game) {
    const livesDisplay = document.querySelector(".remainingLives")
    autorun(() => {
      livesDisplay.innerHTML = Math.floor(game.lives)
    })
  }

  setupWaveDisplay(game) {
    const waveDisplay = document.querySelector(".currentWave")
    autorun(() => {
      waveDisplay.innerHTML = game.wave.number
    })
  }

  addElement(element) {
    this.gameBox.appendChild(element)
  }

  renderMap(game) {
    let exitContainer = new PIXI.Container()
    exitContainer.position = game.getEndGoal()

    exitContainer.interactive = true
    exitContainer.buttonMode = true

    const background = new PIXI.Graphics()
    background.beginFill(0xCCCCCC)
    background.drawRect(0, 0, GRID_SIZE, GRID_SIZE);
    background.endFill();
    exitContainer.addChild(background)

    const exitImage = new PIXI.Sprite(PIXI.utils.TextureCache["exit"])
    exitImage.width = GRID_SIZE
    exitImage.height = GRID_SIZE
    exitContainer.addChild(exitImage)

    this.app.stage.addChild(exitContainer)
  }

}

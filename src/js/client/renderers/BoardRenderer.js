
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
    this.setupInfoPanel(game)
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

  setupInfoPanel(game) {
    const infoPanelName = document.getElementById("info-panel-name")
    const infoPanelData = document.getElementById("info-panel-data")

    autorun(() => {
      this.updateInfoPanel(game, infoPanelName, infoPanelData)
    })
  }

  updateInfoPanel(game, infoPanelName, infoPanelData) {
    if (game.selectedEntity === null) {
      infoPanelName.innerHTML = ""
      infoPanelData.innerHTML = ""
      return;
    }

    const entity = game.selectedEntity
    infoPanelName.innerHTML = entity.name

    if (entity.type == "Tower") {
      this.displayTower(infoPanelData, entity)
    } else if (entity.type == "Enemy") {
      this.displayEnemy(infoPanelData, entity)
    }
  }

  // @TODO Consider using Vue.js for templating here
  displayEnemy(infoPanelData, entity) {
    infoPanelData.innerHTML = "Speed: " + entity.speed + "<br />" +
        "Hit points: " + entity.currentHitPoints + "/" + entity.maxHitPoints + "<br />" +
        "Value: $" + entity.killValue + "<br />" +
        "Size: " + entity.width + "x" + entity.height
  }

  // @TODO Consider using Vue.js for templating here
  displayTower(infoPanelData, entity) {
    infoPanelData.innerHTML = "Price: $" + entity.purchaseCost + "<br />" +
        "Damage: " + entity.attackPower + "<br />" +
        "Range: " + entity.range + "<br />" +
        "Clip size: " + entity.clipSize + "<br />" +
        "Firing time: " + entity.firingTime + "ms" + "<br />" +
        "Reload time: " + entity.reloadTime + "ms" + "<br />" +
        "Profit multiplier: "  + entity.killProfitMultiplier
  }

  setupGameStateDisplay(game) {
    this.setupCreditsDisplay(game)
    this.setupLivesDisplay(game)
    this.setupWaveDisplay(game)
  }

  setupCreditsDisplay(game) {
    const creditsDisplay = document.querySelector(".remainingCredits")
    autorun(() => {
      creditsDisplay.innerHTML = "Credits: $" + Math.floor(game.credits.current)
    })
  }

  setupLivesDisplay(game) {
    const livesDisplay = document.querySelector(".remainingLives")
    autorun(() => {
      livesDisplay.innerHTML = "Lives: " + Math.floor(game.lives)
    })
  }

  setupWaveDisplay(game) {
    const waveDisplay = document.querySelector(".currentWave")
    autorun(() => {
      waveDisplay.innerHTML = "Wave: " + game.wave.number
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

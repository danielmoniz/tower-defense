
import { autorun } from 'mobx'

import { GRID_SIZE } from '../../appConstants'

export default class BoardRenderer {

  constructor() {
    this.assetsReady = false
  }

  setupGameBox(game) {
    this.app = new PIXI.Application({
      width: game.width + GRID_SIZE, // extra width for entrance - still needed?
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

    this.app.stage = new PIXI.display.Stage(); // necessary for layers to work

    this.mapLayer = new PIXI.display.Layer()
    this.backgroundLayer = new PIXI.display.Layer()
    this.unitsLayer = new PIXI.display.Layer()
    this.effectsLayer = new PIXI.display.Layer()
    this.menuLayer = new PIXI.display.Layer()

    this.app.stage.addChild(this.mapLayer)
    this.app.stage.addChild(this.backgroundLayer)
    this.app.stage.addChild(this.unitsLayer)
    this.app.stage.addChild(this.effectsLayer)
    this.app.stage.addChild(this.menuLayer)

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
          .add('invader', '/images/invader.png')
          .add('swarm', '/images/swarm.png')
          .add('scout', '/images/scout.png')
          .add('carrier', '/images/carrier.png')
          .add('exit', '/images/exit.png')
          .add('sell', '/images/sell.png')
          .add('muzzleFlash', '/images/muzzle_flash.png')
          .add('enemyExplosionBasic', '/images/enemy_explosion_basic.png')
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
    const towerActionsPanel = document.getElementById("tower-actions")

    autorun(() => {
      this.updateInfoPanel(game, infoPanelName, infoPanelData, towerActionsPanel)
    })
  }

  updateInfoPanel(game, infoPanelName, infoPanelData, towerActionsPanel) {
    if (!game.selectedEntity) {
      infoPanelName.innerHTML = ""
      infoPanelData.innerHTML = ""
      this.hideTowerActions(towerActionsPanel)
      return;
    }
    if (game.selectedEntity.type !== 'Tower') {
      this.hideTowerActions(towerActionsPanel)
    }

    const entity = game.selectedEntity
    infoPanelName.innerHTML = entity.name

    if (entity.type === "Tower") {
      this.displayTowerInfo(infoPanelData, entity)
      // @TODO Show upgrade options if not placed, but grey them out
      if (entity.placed) {
        this.showTowerActions(towerActionsPanel)
        const upgrades = towerActionsPanel.querySelectorAll('.option.upgrade')
        this.updateTowerUpgrades(upgrades, entity)
        const sellButton = towerActionsPanel.querySelector('.option.sell')
        this.updateSellButton(sellButton, entity)
      }
    } else if (entity.type === "Enemy") {
      this.displayEnemy(infoPanelData, entity)
    }
  }

  updateTowerUpgrades(upgrades, tower) {
    upgrades.forEach((upgrade) => {
      const costDisplay = upgrade.querySelector('.value')
      const upgradeName = upgrade.dataset.upgrade
      const upgradeCost = tower.getUpgradeCost(upgradeName)
      if (!costDisplay || !upgradeCost) { return }
      costDisplay.innerText = upgradeCost
    })
  }

  updateSellButton(sellButton, tower) {
    const profitDisplay = sellButton.querySelector('.profit')
    const profit = tower.getSellValue()
    profitDisplay.innerText = profit
  }

  // @TODO Consider using Vue.js for templating here
  displayEnemy(infoPanelData, enemy) {
    const attributesMessage = this.getEnemyAttributesMessage(enemy)

    infoPanelData.innerHTML = "Speed: " + Math.ceil(enemy.speed) + "<br>" +
        "Hit points: " + Math.ceil(enemy.currentHitPoints) + "/" + Math.ceil(enemy.maxHitPoints) + "<br>" +
        "Value: $" + enemy.killValue.credits + ", " + enemy.killValue.xp + "xp<br>" +
        attributesMessage + "<br>"
        // (we probably don't need size, as it has no in-game effect)
        // "Size: " + entity.width + "x" + entity.height
  }

  // @TODO Consider using Vue.js for templating here
  displayTowerInfo(infoPanelData, tower) {
    infoPanelData.innerHTML = "Price: $" + tower.purchaseCost + "<br>" +
        "Damage: " + tower.attackPower.current.toFixed(2) + "<br>" +
        "Range: " + tower.range.current.toFixed(0) + "<br>" +
        "Clip size: " + tower.clipSize + "<br>" +
        "Firing time: " + tower.firingTime + "ms" + "<br>" +
        "Reload time: " + tower.reloadTime + "ms" + "<br>" +
        "Profit multiplier: "  + tower.killProfitMultiplier + "<br>" +
        "Kills: " + tower.kills + "<br>" +
        "Experience: " + tower.xp + "<br>" +
        "Level: " + tower.level

    if (tower.attackPower.burning) {
      infoPanelData.innerHTML += "<br>"
      let burningLength = "unlimited"
      if (tower.burningLength.current && tower.burningLength.current > 0) {
        burningLength = (tower.burningLength.current / 1000).toFixed(2) + " seconds"
      }
      infoPanelData.innerHTML +=
        "Burning DPS: " + tower.attackPower.burning.current + "<br>" +
        "Burning length: " + burningLength
    }
  }

  hideTowerActions(towerActionsPanel) {
    towerActionsPanel.classList.remove('tower-selected')
  }

  showTowerActions(towerActionsPanel) {
    towerActionsPanel.classList.add('tower-selected')
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
    this.addExit(game)
    this.addEntrance(game)
  }

  addExit(game) {
    let exitContainer = new PIXI.Container()
    exitContainer.position = game.getEndGoal()

    exitContainer.interactive = true
    exitContainer.buttonMode = true

    const exitBackground = new PIXI.Graphics()
    exitBackground.beginFill(0xCCCCCC)
    exitBackground.drawRect(0, 0, GRID_SIZE, GRID_SIZE);
    exitBackground.endFill();
    exitContainer.addChild(exitBackground)

    const exitImage = new PIXI.Sprite(PIXI.utils.TextureCache["exit"])
    exitImage.width = GRID_SIZE
    exitImage.height = GRID_SIZE
    exitContainer.addChild(exitImage)

    exitContainer.parentLayer = this.mapLayer

    this.app.stage.addChild(exitContainer)
  }

  addEntrance(game) {
    const deadZone = game.getEntranceZone()
    const rightBackground = new PIXI.Graphics()
    rightBackground.beginFill(0xCCCCCC)
    rightBackground.drawRect(deadZone.x + GRID_SIZE, deadZone.y, deadZone.width, deadZone.height + GRID_SIZE);
    rightBackground.endFill();
    this.app.stage.addChild(rightBackground)
  }

  // helper methods ---------------

  getEnemyAttributesMessage(enemy) {
    let attributesMessage = "Attributes: "
    if (enemy.attributes.length === 0) {
      attributesMessage += "none"
    } else {
      attributesMessage += enemy.attributes.join(", ")
    }
    return attributesMessage
  }

}

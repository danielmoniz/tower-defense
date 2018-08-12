
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

    this.loadUnitAssets()

    this.app.view.id = "game-viewport"
    const displayBox = document.querySelector("#display-box")
    // Prevent context menu from displaying
    displayBox.addEventListener('contextmenu', (e) => {
      e.preventDefault()
    })

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

    this.setupGameStateDisplay(game)
    this.setupInfoPanel(game)
  }

  startGame(game) {
    this.renderMap(game)
  }

  loadUnitAssets() {
    // @TODO Move this into another file
    // load assets into PIXI
    this.loader = new PIXI.loaders.Loader()
    this.loader
          .add('healthBar', '/images/healthBar.png')
          .add('armourBar', '/images/armourBar.png')
          .add('healthBarBackground', '/images/healthBarBackground.png')
          .add('scout', '/images/scout.png')
          .add('insectoid', '/images/insectoid.png')
          .add('freighter', '/images/freighter.png')
          .add('swarm', '/images/swarm.png')
          .add('tank', '/images/tank.png')
          .add('hovercraft', '/images/hovercraft.png')
          .add('juggernaut', '/images/juggernaut.png')
          .add('chosen', '/images/chosen.png')
          .add('carrier', '/images/carrier.png')
          .add('exit', '/images/exit.png')
          .add('sell', '/images/sell.png')
          .add('muzzleFlash', '/images/muzzle_flash.png')
          .add('enemyExplosionBasic', '/images/enemy_explosion_basic.png')
          .add('regenerative', '/images/regenerative.png')
          .add('speedy', '/images/speedy.png')
          .add('tough', '/images/tough.png')
          .add('elite', '/images/elite.png')
    console.log("Loading images...");
    this.loader.on("progress", (loader, resource) => {
      const completion = `${Math.floor(loader.progress)}%`
      console.log(completion);
    })
    this.loader.load((loader, resources) => {
      console.log("All images loaded!");
      this.assetsReady = true
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
        towerActionsPanel.innerHTML = ''
        this.showTowerActions(towerActionsPanel)
        this.updateTowerUpgrades(game, entity, towerActionsPanel)
        this.updateSellButton(game, entity, towerActionsPanel)
      }
    } else if (entity.type === "Enemy") {
      this.displayEnemy(infoPanelData, entity)
    }
  }

  updateTowerUpgrades(game, tower, towerActionsPanel) {
    const upgradeKeys = Object.keys(tower.upgrades)
    upgradeKeys.forEach((upgradeKey) => {
      const upgrade = tower.upgrades[upgradeKey]
      const upgradeTile = document.createElement('div')
      upgradeTile.classList.add('option', 'upgrade')
      upgradeTile.dataset.upgrade = upgradeKey
      upgradeTile.addEventListener('click', () => {
        game.sendUpgradeSelectedTower(upgradeKey)
      })
      towerActionsPanel.appendChild(upgradeTile)

      const valueDisplay = document.createElement('span')
      valueDisplay.classList.add('upgrade-cost', 'value')
      valueDisplay.innerText = upgrade.cost
      upgradeTile.appendChild(valueDisplay)

      const descriptionDisplay = document.createElement('span')
      descriptionDisplay.classList.add('description')
      descriptionDisplay.innerText = upgrade.description
      upgradeTile.appendChild(descriptionDisplay)

      const icon = document.createElement('img')
      icon.setAttribute('src', `/images/${upgradeKey}UpgradeIcon.png`)
      upgradeTile.appendChild(icon)
    })
  }

  // @TODO Refactor to share code with updateTowerUpgrades()
  updateSellButton(game, tower, towerActionsPanel) {
    const sellTile = document.createElement('div')
    sellTile.classList.add('option', 'sell')
    sellTile.dataset.upgrade = 'sell'
    sellTile.addEventListener('click', () => {
      game.sendSellSelectedTower()
    })
    towerActionsPanel.appendChild(sellTile)

    const valueDisplay = document.createElement('span')
    valueDisplay.classList.add('profit', 'value')
    valueDisplay.innerText = tower.getSellValue()
    sellTile.appendChild(valueDisplay)

    const descriptionDisplay = document.createElement('span')
    descriptionDisplay.classList.add('description')
    descriptionDisplay.innerText = 'Sell'
    sellTile.appendChild(descriptionDisplay)

    const icon = document.createElement('img')
    icon.setAttribute('src', `/images/sell.png`)
    sellTile.appendChild(icon)
  }

  // @TODO Consider using Vue.js for templating here
  displayEnemy(infoPanelData, enemy) {
    const attributesMessage = this.getEnemyAttributesMessage(enemy)

    infoPanelData.innerHTML = "Speed: " + Math.ceil(enemy.speed) + "<br>" +
        "Hit points: " + Math.ceil(enemy.currentHitPoints) + "/" + Math.ceil(enemy.maxHitPoints) + "<br>" +
        "Armour: " + Math.ceil(enemy.currentArmour) + "/" + Math.ceil(enemy.maxArmour) + "<br>" +
        "Value: $" + enemy.killValue.credits + ", " + enemy.killValue.xp + "xp<br>" +
        attributesMessage + "<br>"
    if (enemy.maxShields) {
      infoPanelData.innerHTML += `Shields: ${parseInt(enemy.currentShields)}/${parseInt(enemy.maxShields)}<br>`
    }
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
        "Burning DPS: " + entity.burningDamage.current.toFixed(2) + "<br>" +
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
    this.setupRoundAttributesDisplay(game)
    this.setupRoundNumberDisplay(game)
    this.setupWaveCounterDisplay(game)
  }

  setupRoundAttributesDisplay(game) {
    const attributesDisplay = document.querySelector('.round-attributes .attributes')
    autorun(() => {
      const attributes = game.wave.currentAttributes
      const output = attributes.sort((attr1, attr2) => attr1.name > attr2.name)
                               .map((attrObject) => attrObject.name).join(', ')
      attributesDisplay.innerHTML = output
      if (attributes.length > 0) {
        this.triggerUpdateAnimation(attributesDisplay)
      }
    })
  }

  setupRoundNumberDisplay(game) {
    const roundNumberDisplay = document.querySelector('.round-attributes .round-number')
    autorun(() => {
      roundNumberDisplay.innerHTML = game.wave.round
    })
  }

  setupWaveCounterDisplay(game) {
    const nextWaveCounter = document.querySelector(".seconds-until-wave")
    autorun(() => {
      if (game.wave.cooldown) {
        nextWaveCounter.innerText = game.wave.timeUntilNextWave
      }
    })
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

  renderTerrain(game) {
    const terrain = game.pathHelper.weights.terrain,
          terrainColor = {
      crater: 0xCECECE,
      ridge: 0xE5E5E5,
      obstacle: 0x000000,
    }

    let terrainContainer, terrainBackground
    if (terrain.rendered === undefined) {
      terrainContainer = new PIXI.Container()
      terrainBackground = new PIXI.Graphics()
      terrain.rendered = {
        container: terrainContainer,
        background: terrainBackground,
      }
      terrainContainer.addChild(terrainBackground)
      terrainContainer.parentLayer = this.mapLayer
      this.app.stage.addChild(terrainContainer)
    } else {
      terrainContainer = terrain.rendered.container
      terrainBackground = terrain.rendered.background
    }

    terrainBackground.clear()
    for (let x = 0; x < game.width / GRID_SIZE; x++) {
      for (let y = 0; y < game.height / GRID_SIZE; y++) {
        let type = terrain.typeAt(x, y)
        if (type === "normal") continue

        let position = {
          x: GRID_SIZE * x,
          y: GRID_SIZE * y,
        }
        terrainBackground.beginFill(terrainColor[type])
        terrainBackground.drawRect(position.x, position.y, GRID_SIZE, GRID_SIZE)
        terrainBackground.endFill()
      }
    }
  }

  addExit(game) {
    let exitContainer = new PIXI.Container()
    exitContainer.position = game.getEndGoal()

    exitContainer.interactive = true
    exitContainer.buttonMode = true

    const exitBackground = new PIXI.Graphics()
    exitBackground.beginFill(0xCCCCCC)
    exitBackground.drawRect(0, 0, GRID_SIZE, GRID_SIZE);
    exitBackground.endFill()
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

  triggerUpdateAnimation(element) {
    element.classList.remove('updated')
    // trigger a 'reflow', otherwise it will be as if you never re-added the class
    void element.offsetWidth
    element.classList.add('updated')
  }

}

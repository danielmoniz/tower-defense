
import Unit from 'units/Unit'

describe('Unit.js', function() {

  describe('handleDeath', function() {
    it('should kill a unit if it has 0 hit points', () => {
      const unit = new Unit({})
      unit.currentHitPoints = 0
      expect(unit.removeMe).toBe(false)
      const unitIsDead = unit.handleDeath()
      expect(unitIsDead).toBeTruthy()
      expect(unit.removeMe).toBe(true)
    })

    it('should kill a unit if it has fewer than 0 hit points', () => {
      const unit = new Unit({})
      unit.currentHitPoints = -20
      expect(unit.removeMe).toBe(false)
      const unitIsDead = unit.handleDeath()
      expect(unitIsDead).toBeTruthy()
      expect(unit.removeMe).toBe(true)
    })

    it('should not kill a unit if it has greater than 0 hit points', () => {
      const unit = new Unit({})
      unit.currentHitPoints = 55
      expect(unit.removeMe).toBe(false)
      const unitIsDead = unit.handleDeath()
      expect(unitIsDead).toBeFalsy()
      expect(unit.removeMe).toBe(false)
    })
  })

  describe('getArmourDamageRatio', () => {
    it('should return a ratio of 1 if armour is full', () => {
      const unit = new Unit({})
      unit.maxArmour = 100
      unit.currentArmour = unit.maxArmour
      const armourRatio = unit.getArmourDamageRatio()
      expect(armourRatio).toBe(1)
    })

    it('should return a ratio of 0 if there is no armour', () => {
      const unit = new Unit({})
      unit.maxArmour = 100
      unit.currentArmour = 0
      const armourRatio = unit.getArmourDamageRatio()
      expect(armourRatio).toBe(0)
    })

    it('should return a number between 0 and 1 if there is less than full armour', () => {
      const unit = new Unit({})
      unit.maxArmour = 100
      unit.currentArmour = 45
      const armourRatio = unit.getArmourDamageRatio()
      expect(armourRatio < 1).toBe(true)
      expect(armourRatio > 0).toBe(true)
    })

    it('should return a smaller armour ratio if using armour piercing ammo', () => {
      const unit = new Unit({})
      unit.damageFactor.armourRatio.piercing = 0.5
      unit.maxArmour = 100
      unit.currentArmour = 75
      const armourRatio = unit.getArmourDamageRatio()
      const armourRatioArmourPiercing = unit.getArmourDamageRatio(true) // armour piercing
      expect(armourRatioArmourPiercing < armourRatio).toBe(true)
      expect(armourRatioArmourPiercing > 0).toBe(true)
    })
  })

  describe('damageArmour', () => {
    it('should deal all damage to the armour if possible', () => {
      const unit = new Unit({})
      unit.currentArmour = 75
      unit.damageFactor.armour.basic = 1
      const undealtDamage = unit.damageArmour(20)

      expect(undealtDamage).toBe(0)
      expect(unit.currentArmour).toBe(55)
    })

    it('should reduce the armour to zero and return the undealt damage', () => {
      const unit = new Unit({})
      unit.currentArmour = 75
      unit.damageFactor.armour.basic = 1
      const undealtDamage = unit.damageArmour(90, 'basic')

      expect(unit.currentArmour).toBe(0)
      expect(undealtDamage).toBe(15)
    })

    it('should reduce the armour based on the damage type', () => {
      const unit = new Unit({})
      unit.currentArmour = 75
      unit.damageFactor.armour.laser = 0.5
      const undealtDamage = unit.damageArmour(50, 'laser')

      expect(unit.currentArmour).toBe(50)
      expect(undealtDamage).toBe(0)
    })

    it('should return zero undealt damage if penalties reduce damage enough', () => {
      const unit = new Unit({})
      unit.currentArmour = 75
      unit.damageFactor.armour.laser = 0.5
      const undealtDamage = unit.damageArmour(90, 'laser')

      expect(unit.currentArmour).toBe(30)
      expect(undealtDamage).toBe(0)
    })

    it('should return some undealt damage if bonuses increase damage enough', () => {
      const unit = new Unit({})
      unit.currentArmour = 80
      unit.damageFactor.armour.laser = 2
      const undealtDamage = unit.damageArmour(60, 'laser')

      expect(unit.currentArmour).toBe(0)
      expect(undealtDamage).toBe(20)
    })
  })

  describe('damageHP', () => {
    it('should reduce the HP of the unit by the passed damage amount', () => {
      const unit = new Unit({})
      unit.currentHitPoints = 50
      const unitIsDead = unit.damageHP(20)
      expect(unitIsDead).toBeFalsy()

      expect(unit.currentHitPoints).toBe(30)
      expect(unit.removeMe).toBeFalsy()
    })

    it('should kill a unit if dealt exactly enough damage', () => {
      const unit = new Unit({})
      unit.currentHitPoints = 75
      expect(unit.removeMe).toBeFalsy()

      const unitIsDead = unit.damageHP(75)
      expect(unitIsDead).toBeTruthy()
      expect(unit.currentHitPoints).toBe(0)
      expect(unit.removeMe).toBeTruthy()
    })

    it('should reduce the HP to zero but not further', () => {
      const unit = new Unit({})
      unit.currentHitPoints = 75
      expect(unit.removeMe).toBeFalsy()

      const unitIsDead = unit.damageHP(90)
      expect(unitIsDead).toBeTruthy()
      expect(unit.currentHitPoints).toBe(0)
      expect(unit.removeMe).toBeTruthy()
    })
  })

  describe('damageShields', () => {
    it('should reduce the shields of the unit by the passed damage amount', () => {
      const unit = new Unit({})
      unit.damageFactor.shields.basic = 1
      unit.currentShields = 30

      const undealtDamage = unit.damageShields(20)
      expect(unit.currentShields).toBe(10)
      expect(undealtDamage).toBe(0)
    })

    it("should reduce a unit's shields to zero if dealt enough damage (but no further)", () => {
      const unit = new Unit({})
      unit.damageFactor.shields.basic = 1
      unit.currentShields = 30

      const undealtDamage = unit.damageShields(66)
      expect(unit.currentShields).toBe(0)
      expect(undealtDamage).toBe(36)
    })

    it("should damage a unit's shields depending on damage type", () => {
      const unit = new Unit({})
      unit.damageFactor.shields.laser = 2
      unit.currentShields = 40

      const undealtDamage = unit.damageShields(30, 'laser')
      expect(unit.currentShields).toBe(0)
      expect(undealtDamage).toBe(10)
    })
  })

  describe('takeDamage', () => {
    function makeUnit() {
      const unit = new Unit()
      unit.maxHitPoints = 100
      unit.currentHitPoints = 100
      unit.maxArmour = 100
      unit.currentArmour = 43

      unit.damageFactor.armour.basic = 1
      unit.damageFactor.hp.basic = 1
      return unit
    }

    it('should damage armour and hp according to correct ratio', () => {
      const unit = makeUnit()

      const armourDamageRatio = unit.getArmourDamageRatio()
      const damage = 70
      const expectedArmour = unit.currentArmour - armourDamageRatio * damage
      const expectedHP = unit.currentHitPoints - (1 - armourDamageRatio) * damage

      const unitIsDead = unit.takeDamage(damage)
      expect(unitIsDead).toBeFalsy()
      expect(unit.currentArmour).toBeCloseTo(expectedArmour, 5)
      expect(unit.currentHitPoints).toBeCloseTo(expectedHP, 5)
    })

    it('should damage armour and hp according to correct ratio with armour piercing', () => {
      const unit = makeUnit()

      const armourDamageRatio = unit.getArmourDamageRatio(true)
      const damage = 70
      const expectedArmour = unit.currentArmour - armourDamageRatio * damage
      const expectedHP = unit.currentHitPoints - (1 - armourDamageRatio) * damage

      const unitIsDead = unit.takeDamage(damage, 'bullet', true) // armour piercing
      expect(unitIsDead).toBeFalsy()
      expect(unit.currentArmour).toBeCloseTo(expectedArmour, 5)
      expect(unit.currentHitPoints).toBeCloseTo(expectedHP, 5)
    })

    it('should damage hp accordingly with excess armour damage', () => {
      const unit = makeUnit()

      const armourDamageRatio = unit.getArmourDamageRatio()
      const damage = 115
      const expectedHP = unit.currentHitPoints - (damage - 43)

      const unitIsDead = unit.takeDamage(damage, 'bullet')
      expect(unitIsDead).toBeFalsy()
      expect(unit.currentArmour).toBe(0)
      expect(unit.currentHitPoints).toBeCloseTo(expectedHP, 5)
    })

    it('should kill a unit if enough damage is passed', () => {
      const unit = makeUnit()

      const armourDamageRatio = unit.getArmourDamageRatio()
      const damage = 150
      const expectedHP = unit.currentHitPoints - (damage - 43)

      const unitIsDead = unit.takeDamage(damage, 'bullet')
      expect(unitIsDead).toBe(true)
      expect(unit.currentArmour).toBe(0)
      expect(unit.currentHitPoints).toBe(0)
      expect(unit.removeMe).toBe(true)
    })

    it('should damage shields first, then spill over and use the correct ratio', () => {
      const unit = makeUnit()
      unit.currentShields = 20
      unit.damageFactor.shields.basic = 1

      const armourDamageRatio = unit.getArmourDamageRatio()
      const damage = 70
      const damageAfterShields = damage - unit.currentShields
      const expectedArmour = unit.currentArmour - armourDamageRatio * damageAfterShields
      const expectedHP = unit.currentHitPoints - (1 - armourDamageRatio) * damageAfterShields

      const unitIsDead = unit.takeDamage(damage)
      expect(unitIsDead).toBeFalsy()
      expect(unit.currentShields).toBe(0)
      expect(unit.currentArmour).toBeCloseTo(expectedArmour, 5)
      expect(unit.currentHitPoints).toBeCloseTo(expectedHP, 5)
    })
  })

  describe('receiveAttack', () => {
    function makeUnit() {
      const unit = new Unit()
      unit.maxHitPoints = 100
      unit.currentHitPoints = 100
      unit.maxArmour = 100
      unit.currentArmour = 43

      unit.damageFactor.armour.basic = 1
      unit.damageFactor.hp.basic = 1
      return unit
    }

    it('should return false if the unit is already dead', () => {
      const unit = new Unit({})
      unit.currentHitPoints = 0
      expect(unit.receiveAttack()).toBeFalsy()
    })

    it('should throw an error if no damage is passed', () => {
      const unit = new Unit({})
      unit.currentHitPoints = 100

      expect(() => {
        unit.receiveAttack()
      }).toThrow()

      expect(() => {
        unit.receiveAttack({}, undefined)
      }).toThrow()
    })

    it('should set the unit to be hit by the given damage type', () => {
      const unit = makeUnit()

      unit.receiveAttack({
        damage: 50,
        type: 'steam',
      })
      expect(unit.hitBy).toBe('steam')
    })

    it('should damage the HP and armour of the unit', () => {
      const unit = new Unit({})
      unit.damageFactor.armour.basic = 1
      unit.damageFactor.hp.basic = 1

      unit.currentHitPoints = 100
      unit.maxArmour = 100
      unit.currentArmour = 50

      unit.receiveAttack({
        damage: 50,
        type: 'steam',
      })
      expect(unit.currentHitPoints).toBe(75)
      expect(unit.currentArmour).toBe(25)
    })

    it('should damage the HP and armour of the unit with armour piercing', () => {
      const unit = new Unit({})
      unit.currentHitPoints = 100
      unit.maxArmour = 100
      unit.currentArmour = 50

      unit.receiveAttack({
        damage: 50,
        type: 'steam',
        armourPiercing: true,
      })
      expect(unit.currentHitPoints < 75).toBe(true)
      expect(unit.currentArmour > 25).toBe(true)
    })

    it('should kill the unit if enough damage is passed', () => {
      const unit = makeUnit()
      unit.currentHitPoints = 100
      unit.maxArmour = 100
      unit.currentArmour = 50
      expect(unit.removeMe).toBe(false)

      const unitIsDead = unit.receiveAttack({
        damage: 170,
        type: 'steam',
      })
      expect(unitIsDead).toBe(true)
      expect(unit.currentHitPoints).toBe(0)
      expect(unit.removeMe).toBe(true)
    })

    it('should kill the unit if enough damage is passed', () => {
      const unit = makeUnit()
      unit.currentHitPoints = 100
      unit.maxArmour = 100
      unit.currentArmour = 50

      const unitIsDead = unit.receiveAttack({
        damage: 250, // would kill the unit
        type: 'steam',
      }, 100) // overriding ammo attack power
      expect(unitIsDead).toBeFalsy()
      expect(unit.currentHitPoints).toBe(50)
    })
  })

})

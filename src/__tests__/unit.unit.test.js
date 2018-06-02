
import Unit from 'units/Unit'
// @TODO Cannot use a stock unit - need to use a specific one
import Cannon from 'units/Cannon'

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
      const undealtDamage = unit.damageArmour(20)

      expect(unit.currentArmour).toBe(55)
      expect(undealtDamage).toBe(0)
    })

    it('should reduce the armour to zero and return the undealt damage', () => {
      const unit = new Unit({})
      unit.currentArmour = 75
      const undealtDamage = unit.damageArmour(90)

      expect(unit.currentArmour).toBe(0)
      expect(undealtDamage).toBe(15)
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

  describe('takeDamage', () => {
    function makeUnit() {
      const unit = new Unit()
      unit.maxHitPoints = 100
      unit.currentHitPoints = 100
      unit.maxArmour = 100
      unit.currentArmour = 43
      return unit
    }

    it('should damage armour and hp according to correct ratio', () => {
      const unit = makeUnit()

      const armourDamageRatio = unit.getArmourDamageRatio()
      const damage = 70
      const expectedArmour = unit.currentArmour - armourDamageRatio * damage
      const expectedHP = unit.currentHitPoints - (1 - armourDamageRatio) * damage

      const unitIsDead = unit.takeDamage(damage, 'bullet')
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
  })

  // describe('getEnemySubtypes', function() {
  //   it('should error if invalid type is provided', () => {
  //     expect(() => {
  //       Enemies.getEnemySubtypes('bad enemy type')
  //     }).toThrow()
  //   })
  //
  //   it('should return an object of enemy subtypes', () => {
  //     const data = Enemies.getEnemySubtypes(validEnemyType)
  //     expect(data).toMatchObject({
  //       [validEnemySubtype]: getEnemyMatcher()
  //     })
  //   })
  // })
  //
  // describe('getEnemyTypes', function() {
  //   it('should return an object of enemy types', () => {
  //     const data = Enemies.getEnemyTypes()
  //     expect(data).toMatchObject({
  //       [validEnemyType]: {
  //         [validEnemySubtype]: expect.any(Object)
  //       }
  //     })
  //   })
  // })
  //
  // describe('getPointsValue', function() {
  //   it('should return a valid points amount given enemy data', () => {
  //     const enemyData = Enemies.getEnemyData(validEnemyType, validEnemySubtype)
  //     const pointsValue = Enemies.getPointsValue(enemyData)
  //     expect(pointsValue).toEqual(expect.any(Number))
  //     expect(pointsValue).toBeGreaterThan(0)
  //   })
  // })
  //
  // describe('getCreditsValue', function() {
  //   it('should return a non-zero credits amount given a small points value', () => {
  //     const creditsValue = Enemies.getCreditsValue(0.4)
  //     expect(creditsValue).toEqual(expect.any(Number))
  //     expect(creditsValue).toBeGreaterThan(0)
  //   })
  // })
  //
  // describe('scaleEnemy', function() {
  //   // @NOTE These attributes will change depending on which enemy attributes are scaled
  //   const scaledAttributes = ['maxHitPoints']
  //
  //   it('should return data for a scaled enemy', () => {
  //     const enemyData = Enemies.getEnemyData(validEnemyType, validEnemySubtype)
  //     const scaledEnemyData = Enemies.scaleEnemy(enemyData, 4)
  //     scaledAttributes.forEach((attribute) => {
  //       expect(scaledEnemyData[attribute]).toBeGreaterThan(enemyData[attribute])
  //     })
  //   })
  //
  //   it('should not scale an enemy on the first level', () => {
  //     const enemyData = Enemies.getEnemyData(validEnemyType, validEnemySubtype)
  //     const scaledEnemyData = Enemies.scaleEnemy(enemyData, 1)
  //     scaledAttributes.forEach((attribute) => {
  //       expect(scaledEnemyData[attribute]).toEqual(enemyData[attribute])
  //     })
  //   })
  // })

})

/*
 * Return an object with Jest matching for testing if an enemy has valid attributes.
 */
// function getEnemyMatcher() {
//   return {
//     width: expect.any(Number),
//     height: expect.any(Number),
//     speed: expect.any(Number),
//     maxHitPoints: expect.any(Number),
//   }
// }

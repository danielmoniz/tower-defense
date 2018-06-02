
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

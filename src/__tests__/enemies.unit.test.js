
import * as Enemies from 'units/Enemies'

const validEnemyType = 'Invader'
const validEnemySubtype = 'normal'

describe('enemies.js', function() {

  describe('getEnemyData', function() {
    it('should provide enemy data with metadata', () => {
      const data = Enemies.getEnemyData(validEnemyType, validEnemySubtype)
      expect(data.enemyType).toBe(validEnemyType)
      expect(data.subtype).toBe(validEnemySubtype)
      expect(data.name).toBeDefined()
    })

    it('should provide enemy data with standard attributes', () => {
      const data = Enemies.getEnemyData(validEnemyType, validEnemySubtype)
      expect(data).toMatchObject(getEnemyMatcher())
    })

    it('should error if invalid enemy type or subtype is provided', () => {
      expect(() => {
        Enemies.getEnemyData('bad enemy type', validEnemySubtype)
      }).toThrow()

      expect(() => {
        Enemies.getEnemyData(validEnemyType, 'bad enemy subtype')
      }).toThrow()
    })
  })

  describe('getEnemySubtypes', function() {
    it('should error if invalid type is provided', () => {
      expect(() => {
        Enemies.getEnemySubtypes('bad enemy type')
      }).toThrow()
    })

    it('should return an object of enemy subtypes', () => {
      const data = Enemies.getEnemySubtypes(validEnemyType)
      expect(data).toMatchObject({
        [validEnemySubtype]: getEnemyMatcher()
      })
    })
  })

  describe('getEnemyTypes', function() {
    it('should return an object of enemy types', () => {
      const data = Enemies.getEnemyTypes()
      expect(data).toMatchObject({
        [validEnemyType]: {
          [validEnemySubtype]: expect.any(Object)
        }
      })
    })
  })

  describe('getPointsValue', function() {
    it('should return a valid points amount given enemy data', () => {
      const enemyData = Enemies.getEnemyData(validEnemyType, validEnemySubtype)
      const pointsValue = Enemies.getPointsValue(enemyData)
      expect(pointsValue).toEqual(expect.any(Number))
      expect(pointsValue).toBeGreaterThan(0)
    })
  })

  describe('getCreditsValue', function() {
    it('should return a non-zero credits amount given a small points value', () => {
      const creditsValue = Enemies.getCreditsValue(0.4)
      expect(creditsValue).toEqual(expect.any(Number))
      expect(creditsValue).toBeGreaterThan(0)
    })
  })

  describe('scaleEnemy', function() {
    // @NOTE These attributes will change depending on which enemy attributes are scaled
    const scaledAttributes = ['maxHitPoints']

    it('should return data for a scaled enemy', () => {
      const enemyData = Enemies.getEnemyData(validEnemyType, validEnemySubtype)
      const scaledEnemyData = Enemies.scaleEnemy(enemyData, 4)
      scaledAttributes.forEach((attribute) => {
        expect(scaledEnemyData[attribute]).toBeGreaterThan(enemyData[attribute])
      })
    })

    it('should not scale an enemy on the first level', () => {
      const enemyData = Enemies.getEnemyData(validEnemyType, validEnemySubtype)
      const scaledEnemyData = Enemies.scaleEnemy(enemyData, 1)
      scaledAttributes.forEach((attribute) => {
        expect(scaledEnemyData[attribute]).toEqual(enemyData[attribute])
      })
    })
  })

})

/*
 * Return an object with Jest matching for testing if an enemy has valid attributes.
 */
function getEnemyMatcher() {
  return {
    width: expect.any(Number),
    height: expect.any(Number),
    speed: expect.any(Number),
    maxHitPoints: expect.any(Number),
  }
}

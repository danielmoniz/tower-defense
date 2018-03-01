
import { attributes, multiplyMultiplier } from 'units/Attributes'

describe('Attributes.js', function() {

  describe('attributes', function() {
    it('should be an array with at least four items', () => {
      expect(attributes.length).toBeGreaterThan(3)
    })

    it('should with objects that contain name and other attributes', () => {
      attributes.forEach((attribute) => {
        expect(attribute.name).toEqual(expect.any(String))
        expect(Object.keys(attribute).length).toBeGreaterThan(1)
      })
    })
  })

  describe('multiplyMultiplier', function() {
    it('should always return 1 if given 1 as a number', () => {
      expect(multiplyMultiplier(1, 1)).toBe(1)
      expect(multiplyMultiplier(1, 2)).toBe(1)
      expect(multiplyMultiplier(1, 20)).toBe(1)
      expect(multiplyMultiplier(1, -5)).toBe(1)
    })

    it('should always return 0 if given 0 as a number', () => {
      expect(multiplyMultiplier(0, 0)).toBe(0)
      expect(multiplyMultiplier(0, 1)).toBe(0)
      expect(multiplyMultiplier(0, 20)).toBe(0)
      expect(multiplyMultiplier(0, -5)).toBe(0)
    })

    it('should always return the number if given 1 as a factor', () => {
      expect(multiplyMultiplier(1, 1)).toBe(1)
      expect(multiplyMultiplier(2, 1)).toBe(2)
      expect(multiplyMultiplier(20, 1)).toBe(20)
    })

    it('should throw an error if provided a multiplier less than 0', () => {
      expect(() => multiplyMultiplier(-5, 2)).toThrow()
    })

    it('should throw an error if provided a multiplier between 0 and 1', () => {
      expect(() => multiplyMultiplier(0.4, 2)).toThrow()
    })

    it('should multiply the effect the multiplier would have', () => {
      expect(multiplyMultiplier(1.2, 2)).toBe(1.4)
      expect(multiplyMultiplier(2, 3)).toBe(4)
      expect(multiplyMultiplier(1.5, 3)).toBe(2.5)
    })
  })

})

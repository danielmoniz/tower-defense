
const normalFactor = 1.2

export const attributes = [
  {
    name: 'Speedy',
    speed: normalFactor,
  },
  {
    name: 'Super speedy',
    speed: multiplyMultiplier(normalFactor, 2),
  },
  {
    name: 'Beefy',
    maxHitPoints: normalFactor,
  },
  {
    name: 'Elite',
    maxHitPoints: normalFactor,
    speed: normalFactor,
  }
]

/*
 * Takes a multiplier (such as 1.2) and multiplies it without its base of 1.
 * Eg. multiplyMultiplier(1.2, 4) returns 1.8, not 4.8
 */
export function multiplyMultiplier(number, factor) {
  if (number < 0) {
    throw 'Cannot handle multipliers less than zero.'
  }
  if (number === 0) { return 0 }

  if (number < 1) {
    return number * factor
  }
  return (number - 1) * factor + 1
}

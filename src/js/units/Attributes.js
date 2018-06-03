
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
    maxHitPoints: multiplyMultiplier(normalFactor, 0.5),
    speed: multiplyMultiplier(normalFactor, 0.5),
  },
  {
    name: 'Regenerative',
    regenerates: 0.2, // 20% of some amount of max HP per second (eg. sqrt)
  },
  {
    name: 'Shielded',
    maxShields: 0.2, // multiple of hit points
  },
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
    throw 'Cannot handle multipliers between 0 and 1.'
  }
  return (number - 1) * factor + 1
}


const normalFactor = 1.6

export const attributes = [
  {
    name: 'Speedy',
    speed: normalFactor,
  },
  {
    name: 'Tough',
    maxHitPoints: normalFactor,
  },
  {
    name: 'Elite',
    maxHitPoints: multiplyMultiplier(normalFactor, 0.5),
    speed: multiplyMultiplier(normalFactor, 0.5),
  },
  {
    name: 'Regenerative',
    regenerates: 0.3, // X% of some amount of max HP per second (eg. sqrt)
  },
  {
    name: 'Shielded',
    maxShields: normalFactor - 1, // multiple of hit points
  },
  // {
  //   name: 'Super speedy',
  //   speed: multiplyMultiplier(normalFactor, 2),
  //   maxHitPoints: 1 / normalFactor,
  // },
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

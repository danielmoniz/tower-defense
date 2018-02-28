
const normalFactor = 1.2

export const attributes = [
  {
    name: 'Speedy',
    speed: normalFactor,
  },
  {
    name: 'Super speedy',
    speed: multiply(normalFactor, 2),
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

export function getAttributeNames(attributes) {
  return attributes.map((attribute) => attribute.name)
}

/*
 * Takes a multiplier (such as 1.2) and multiplies it without its base of 1.
 * Eg. multiply(1.2, 4) returns 1.8, not 4.8
 */
function multiply(number, factor) {
  return (number - 1) * factor + 1
}

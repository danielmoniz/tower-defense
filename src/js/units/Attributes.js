//
// export const attributes = {
//   speedy: {
//     speed: 1.4,
//   },
//   'super speedy': {
//     speed: 1.8,
//   },
//   'mega speedy': {
//     speed: 3,
//   },
//   'turbo mega speedy': {
//     speed: 10,
//   }
// }


export const attributes = [
  {
    name: 'Speedy',
    speed: 1.4,
  },
  {
    name: 'super speedy',
    speed: 1.8,
  },
  {
    name: 'mega speedy',
    speed: 3,
  },
  {
    name: 'turbo mega speedy',
    speed: 10,
  },
]

export function getAttributeNames(attributes) {
  return attributes.map((attribute) => attribute.name)
}

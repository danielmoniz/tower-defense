
import Map from 'map/Map'
import { GRID_SIZE } from 'appConstants'

describe('Map', function() {
  it('should calculate whether a coordinate is valid', () => {
    const game = {
      width: 100,
      height: 100,
    }

    const tilesWide = Math.floor(game.width / GRID_SIZE)
    const tilesHigh = Math.floor(game.height / GRID_SIZE)
    const map = new Map(game)
    expect(map.coordinateIsValid(0, 0)).toBe(true)

    expect(map.coordinateIsValid(-1, 0)).toBe(false)
    expect(map.coordinateIsValid(0, -1)).toBe(false)

    expect(map.coordinateIsValid(tilesWide - 1, tilesHigh - 1)).toBe(true)

    expect(map.coordinateIsValid(tilesWide, 0)).toBe(false)
    expect(map.coordinateIsValid(0, tilesHigh)).toBe(false)

  })
})

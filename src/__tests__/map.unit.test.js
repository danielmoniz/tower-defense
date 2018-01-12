
import Map from 'map/Map'
import { GRID_SIZE } from 'appConstants'

describe('Map', function() {
  it('should calculate whether a coordinate is valid', () => {
    const boardSize = 10
    const game = {
      width: boardSize,
      height: boardSize,
    }

    const map = new Map(game, 1)
    expect(map.coordinateIsValid(0, 0)).toBe(true)

    expect(map.coordinateIsValid(-1, 0)).toBe(false)
    expect(map.coordinateIsValid(0, -1)).toBe(false)

    expect(map.coordinateIsValid(boardSize - 1, boardSize - 1)).toBe(true)

    expect(map.coordinateIsValid(boardSize, 0)).toBe(false)
    expect(map.coordinateIsValid(0, boardSize)).toBe(false)
  })
})

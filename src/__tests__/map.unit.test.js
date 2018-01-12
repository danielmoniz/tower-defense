
import Map from 'map/Map'
import { GRID_SIZE } from 'appConstants'

describe('Map', function() {
  this.createGame = function(width, height) {
    this.game = {
      width: width,
      height: height,
    }
  }

  it('should calculate whether a coordinate is valid', () => {
    this.createGame(5, 5)
    const map = new Map(this.game, 1)
    expect(map.coordinateIsValid(0, 0)).toBe(true)

    expect(map.coordinateIsValid(-1, 0)).toBe(false)
    expect(map.coordinateIsValid(0, -1)).toBe(false)

    expect(map.coordinateIsValid(4, 4)).toBe(true)

    expect(map.coordinateIsValid(5, 0)).toBe(false)
    expect(map.coordinateIsValid(0, 5)).toBe(false)
  })

  it('should generate correct path lengths for empty map', () => {
    this.createGame(5, 5)
    const map = new Map(this.game, 1)

    expect(map.pathLengths[4][4]).toBe(0) // end point

    expect(map.pathLengths[3][4]).toBe(1)
    expect(map.pathLengths[4][3]).toBe(1) // adjacent to end point

    expect(map.pathLengths[0][4]).toBe(4) // corners
    expect(map.pathLengths[4][0]).toBe(4)

    expect(map.pathLengths[0][0]).toBe(8) // start point

    expect(map.pathLengths[0][1]).toBe(7) // adjacent to start point
    expect(map.pathLengths[1][0]).toBe(7)
  })
})


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

  it('should produce an empty map (all ones) by default', () => {
    this.createGame(5, 5)
    const map = new Map(this.game, 1)

    map.weights.forEach((columnOfWeights) => {
      columnOfWeights.forEach((weight) => {
        expect(weight).toBe(1)
      })
    })
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

  it('should avoid impassable terrain', () => {
    this.createGame(2, 5)
    const map = new Map(this.game, 1)
    map.weights[0][1] = 0
    map.weights[1][3] = 0
    map.compute()

    expect(map.pathLengths[1][4]).toBe(0) // end point
    expect(map.pathLengths[0][4]).toBe(1)
    expect(map.pathLengths[0][3]).toBe(2)
    expect(map.pathLengths[0][2]).toBe(3)
    expect(map.pathLengths[1][2]).toBe(4)
    expect(map.pathLengths[1][1]).toBe(5)
    expect(map.pathLengths[1][0]).toBe(6)
    expect(map.pathLengths[0][0]).toBe(7) // start point

    // this.assertPath(map, [
    //   [1, 4],
    //   [0, 4],
    //   [0, 3],
    //   [0, 2],
    //   [1, 2],
    //   [1, 1],
    //   [1, 0],
    //   [0, 0],
    // ])
  })

  /*
   * Given a path of coordinate arrays, traverses it and asserts that the values increment.
   * Assumes path starts from the end.
   */
  this.assertPath = function(map, path) {
    path.forEach((coordinate, index) => {
      let [x, y] = coordinate
      expect(map.pathLengths[x][y]).toBe(index)
    })
  }
})

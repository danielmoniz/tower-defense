
import Pathing from 'map/Pathing'
import { GRID_SIZE } from 'appConstants'

describe('Pathing', function() {
  this.createGame = function(width, height) {
    this.game = {
      width: width,
      height: height,
    }
  }

  it('should calculate whether a coordinate is valid', () => {
    this.createGame(5, 5)
    const pathHelper = new Pathing(this.game, 1)
    expect(pathHelper.weights.coordinateIsValid(0, 0)).toBe(true)

    expect(pathHelper.weights.coordinateIsValid(-1, 0)).toBe(false)
    expect(pathHelper.weights.coordinateIsValid(0, -1)).toBe(false)

    expect(pathHelper.weights.coordinateIsValid(4, 4)).toBe(true)

    expect(pathHelper.weights.coordinateIsValid(5, 0)).toBe(false)
    expect(pathHelper.weights.coordinateIsValid(0, 5)).toBe(false)
  })

  it('should produce an empty weights grid (all ones) by default', () => {
    this.createGame(5, 5)
    const pathHelper = new Pathing(this.game, 1)

    pathHelper.weights.values.forEach((columnOfWeights) => {
      columnOfWeights.forEach((weight) => {
        expect(weight).toBe(1)
      })
    })
  })

  it('should generate correct path lengths for empty weights map', () => {
    this.createGame(5, 5)
    const pathHelper = new Pathing(this.game, 1)

    expect(pathHelper.pathLengths.at(4, 4)).toBe(0) // end point

    expect(pathHelper.pathLengths.at(3, 4)).toBe(1)
    expect(pathHelper.pathLengths.at(4, 3)).toBe(1) // adjacent to end point

    expect(pathHelper.pathLengths.at(0, 4)).toBe(4) // corners
    expect(pathHelper.pathLengths.at(4, 0)).toBe(4)

    expect(pathHelper.pathLengths.at(0, 0)).toBe(8) // start point

    expect(pathHelper.pathLengths.at(0, 1)).toBe(7) // adjacent to start point
    expect(pathHelper.pathLengths.at(1, 0)).toBe(7)
  })

  it('should avoid impassable terrain', () => {
    this.createGame(2, 5)
    const pathHelper = new Pathing(this.game, 1)
    pathHelper.weights.set(0, 1, 0)
    pathHelper.weights.set(1, 3, 0)
    pathHelper.compute()

    expect(pathHelper.pathLengths.at(1, 4)).toBe(0) // end point
    expect(pathHelper.pathLengths.at(0, 4)).toBe(1)
    expect(pathHelper.pathLengths.at(0, 3)).toBe(2)
    expect(pathHelper.pathLengths.at(0, 2)).toBe(3)
    expect(pathHelper.pathLengths.at(1, 2)).toBe(4)
    expect(pathHelper.pathLengths.at(1, 1)).toBe(5)
    expect(pathHelper.pathLengths.at(1, 0)).toBe(6)
    expect(pathHelper.pathLengths.at(0, 0)).toBe(7) // start point

    // this.assertPath(pathHelper, [
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
  this.assertPath = function(pathHelper, path) {
    path.forEach((coordinate, index) => {
      let [x, y] = coordinate
      expect(pathHelper.pathLengths.at(x, y)).toBe(index)
    })
  }
})


import Pathing from 'map/Pathing'
import { GRID_SIZE } from 'appConstants'

describe('Pathing', function() {

  it('should calculate whether a coordinate is valid', () => {
    const game = createGame(5, 5)
    const pathHelper = new Pathing(game, 1)
    expect(pathHelper.weights.coordinateIsValid(0, 0)).toBe(true)

    expect(pathHelper.weights.coordinateIsValid(-1, 0)).toBe(false)
    expect(pathHelper.weights.coordinateIsValid(0, -1)).toBe(false)

    expect(pathHelper.weights.coordinateIsValid(4, 4)).toBe(true)

    expect(pathHelper.weights.coordinateIsValid(5, 0)).toBe(false)
    expect(pathHelper.weights.coordinateIsValid(0, 5)).toBe(false)
  })

  it('should produce an empty weights grid (all ones) by default', () => {
    const game = createGame(5, 5)
    const pathHelper = new Pathing(game, 1)

    pathHelper.weights.values.forEach((columnOfWeights) => {
      columnOfWeights.forEach((weight) => {
        expect(weight).toBe(1)
      })
    })
  })

  it('should generate correct path lengths for empty weights map', () => {
    const game = createGame(5, 5)
    const pathHelper = new Pathing(game, 1)

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
    const game = createGame(2, 5)
    const pathHelper = new Pathing(game, 1)
    pathHelper.weights.set(0, 1, 0)
    pathHelper.weights.set(1, 3, 0)
    pathHelper.compute()

    assertPath(pathHelper, [
      [0, 0],
      [1, 0],
      [1, 1],
      [1, 2],
      [0, 2],
      [0, 3],
      [0, 4],
      [1, 4],
    ])
  })

  describe('getDirection', function() {
    it('should provide the next target node given a location with valid x and y', () => {
      const game = createGame(2, 5)
      const pathHelper = new Pathing(game, 1)
      pathHelper.weights.set(0, 1, 0)
      pathHelper.weights.set(1, 3, 0)
      pathHelper.compute()

      expect(pathHelper.getDirection(0, 0)).toMatchObject({
        x: 1,
        y: 0,
      })
      expect(pathHelper.getDirection(1, 0)).toMatchObject({
        x: 1,
        y: 1,
      })
      expect(pathHelper.getDirection(1, 1)).toMatchObject({
        x: 1,
        y: 2,
      })
      expect(pathHelper.getDirection(1, 2)).toMatchObject({
        x: 0,
        y: 2,
      })
      expect(pathHelper.getDirection(0, 2)).toMatchObject({
        x: 0,
        y: 3,
      })
      expect(pathHelper.getDirection(0, 3)).toMatchObject({
        x: 0,
        y: 4,
      })
      expect(pathHelper.getDirection(0, 4)).toMatchObject({
        x: 1,
        y: 4,
      })
    })

    it('should provide the next target node given a location with non-integer coordinates', () => {
      const game = createGame(2, 5)
      const pathHelper = new Pathing(game, 1)
      pathHelper.weights.set(0, 1, 0)
      pathHelper.weights.set(1, 3, 0)
      pathHelper.compute()

      expect(pathHelper.getDirection(0.4, 0)).toMatchObject({
        x: 1,
        y: 0,
      })
      expect(pathHelper.getDirection(1, 0.9)).toMatchObject({
        x: 1,
        y: 1,
      })
      expect(pathHelper.getDirection(1.7, 1.3)).toMatchObject({
        x: 1,
        y: 2,
      })
    })

    it('should provide the next target node given a location given a larger grid size', () => {
      const tileSize = 10
      const game = createGame(2 * tileSize, 5 * tileSize)
      const pathHelper = new Pathing(game, tileSize)
      pathHelper.weights.set(0, 1, 0)
      pathHelper.weights.set(1, 3, 0)
      pathHelper.compute()

      expect(pathHelper.getDirection(0, 0)).toMatchObject({
        x: 1 * tileSize,
        y: 0,
      })
      expect(pathHelper.getDirection(1 * tileSize, 0)).toMatchObject({
        x: 1 * tileSize,
        y: 1 * tileSize,
      })
      expect(pathHelper.getDirection(1 * tileSize, 1 * tileSize)).toMatchObject({
        x: 1 * tileSize,
        y: 2 * tileSize,
      })
      expect(pathHelper.getDirection(1 * tileSize, 2 * tileSize)).toMatchObject({
        x: 0,
        y: 2 * tileSize,
      })
      expect(pathHelper.getDirection(0, 2 * tileSize)).toMatchObject({
        x: 0,
        y: 3 * tileSize,
      })
      expect(pathHelper.getDirection(0, 3 * tileSize)).toMatchObject({
        x: 0,
        y: 4 * tileSize,
      })
      expect(pathHelper.getDirection(0, 4 * tileSize)).toMatchObject({
        x: 1 * tileSize,
        y: 4 * tileSize,
      })
    })

    it('should suggest current location when at target location', () => {
      const game = createGame(2, 2)
      const pathHelper = new Pathing(game, 1)
      pathHelper.compute()

      expect(pathHelper.getDirection(1, 1)).toMatchObject({
        x: 1,
        y: 1,
      })
    })

  })

  describe('addObstacle', function() {

    it('should return true if an obstacle can be added', () => {
      const game = createGame(10, 10)
      const pathHelper = new Pathing(game, 1)

      const success = pathHelper.addObstacle({ x: 1, y: 1}, 3, 2)

      expect(success).toBe(true)
    })

    it('should update weights grid with a newly added obstacle', () => {
      const game = createGame(5, 5)
      const pathHelper = new Pathing(game, 1)

      pathHelper.addObstacle({ x: 1, y: 1}, 3, 2)

      expect(pathHelper.weights.at(1, 1)).toBe(0)
      expect(pathHelper.weights.at(1, 2)).toBe(0)
      expect(pathHelper.weights.at(2, 1)).toBe(0)
      expect(pathHelper.weights.at(2, 2)).toBe(0)
      expect(pathHelper.weights.at(3, 1)).toBe(0)
      expect(pathHelper.weights.at(3, 2)).toBe(0)

      expect(pathHelper.weights.at(0, 0)).toBe(1)
      expect(pathHelper.weights.at(0, 3)).toBe(1)
      expect(pathHelper.weights.at(3, 0)).toBe(1)
      expect(pathHelper.weights.at(3, 3)).toBe(1)
    })

    it('should update pathLengths grid to account for a new obstacle', () => {
        const game = createGame(5, 5)
        const pathHelper = new Pathing(game, 1)

        pathHelper.addObstacle({ x: 1, y: 1}, 3, 2)

        expect(pathHelper.pathLengths.at(1, 1)).toBe(-1)
        expect(pathHelper.pathLengths.at(1, 2)).toBe(-1)
        expect(pathHelper.pathLengths.at(2, 1)).toBe(-1)
        expect(pathHelper.pathLengths.at(2, 2)).toBe(-1)
        expect(pathHelper.pathLengths.at(3, 1)).toBe(-1)
        expect(pathHelper.pathLengths.at(3, 2)).toBe(-1)

        expect(pathHelper.pathLengths.at(4, 4)).toBe(0)
        expect(pathHelper.pathLengths.at(4, 3)).toBe(1)
        expect(pathHelper.pathLengths.at(4, 2)).toBe(2)
        expect(pathHelper.pathLengths.at(4, 1)).toBe(3)
        expect(pathHelper.pathLengths.at(4, 0)).toBe(4)
        expect(pathHelper.pathLengths.at(3, 0)).toBe(5)
        expect(pathHelper.pathLengths.at(2, 0)).toBe(6)
        expect(pathHelper.pathLengths.at(1, 0)).toBe(7)
        expect(pathHelper.pathLengths.at(0, 0)).toBe(8)
    })

    it('should update pathLengths as a maze to account for multiple obstacles', () => {
      const game = createGame(2, 5)
      const pathHelper = new Pathing(game, 1)

      pathHelper.addObstacle({ x: 0, y: 1}, 1, 1)
      pathHelper.addObstacle({ x: 1, y: 3}, 1, 1)

      assertPath(pathHelper, [
        [0, 0],
        [1, 0],
        [1, 1],
        [1, 2],
        [0, 2],
        [0, 3],
        [0, 4],
        [1, 4],
      ])
    })

    it('should return false if a single obstacle blocks the goal', () => {
      const game = createGame(2, 2)
      const pathHelper = new Pathing(game, 1)

      const success = pathHelper.addObstacle({x: 1, y: 1}, 1, 1)
      expect(success).toBe(false)
    })

    it('should return false if a set of obstacles wall off a tile from the goal', () => {
      const game = createGame(3, 3)
      const pathHelper = new Pathing(game, 1)

      pathHelper.addObstacle({x: 0, y: 1}, 1, 1)
      pathHelper.addObstacle({x: 1, y: 1}, 1, 1)
      const success = pathHelper.addObstacle({x: 1, y: 0}, 1, 1)
      expect(success).toBe(false)
    })

    it('should not update map weights if an obstacle blocks the goal', () => {
      const game = createGame(2, 2)
      const pathHelper = new Pathing(game, 1)

      expect(pathHelper.weights.at(1, 1)).toBe(1)
      pathHelper.addObstacle({x: 1, y: 1}, 1, 1)
      expect(pathHelper.weights.at(1, 1)).toBe(1)
    })

    it('should not update map pathLengths if an obstacle blocks the goal', () => {
      const game = createGame(2, 2)
      const pathHelper = new Pathing(game, 1)
      pathHelper.compute()

      expect(pathHelper.pathLengths.at(0, 0)).toBe(2)

      pathHelper.addObstacle({x: 1, y: 1}, 1, 1)
      expect(pathHelper.pathLengths.at(0, 0)).toBe(2)
    })
  })

  // @TODO should not provide a default direction (west?) if at end
})

function createGame(width, height) {
  return {
    width: width,
    height: height,
  }
}

/*
 * Given a path of coordinate arrays, traverses it and asserts that
 * the values increase incrementally.
 */
function assertPath(pathHelper, path) {
  path.reverse().forEach((coordinate, index) => {
    let [x, y] = coordinate
    expect(pathHelper.pathLengths.at(x, y)).toBe(index)
  })
}

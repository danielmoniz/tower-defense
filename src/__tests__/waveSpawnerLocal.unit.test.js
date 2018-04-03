
import WaveSpawnerLocal from 'WaveSpawnerLocal'

describe('WaveSpawnerLocal.js', function() {

  describe('generateEnemies', function() {

    beforeEach(() => {
      const createEnemy = () => {}
      this.waveSpawner = new WaveSpawnerLocal(createEnemy)
    })

    it('should return an empty array on wave 0', () => {
      const enemyData = this.waveSpawner.generateEnemies(0)
      expect(enemyData.length).toBe(0)
    })

    it('should return a collection of at least one enemy each wave', () => {
      this.waveSpawner.setRoundAttributes()
      for (let i = 1; i < this.waveSpawner.bossSpawnOnWave * 3; i++) {
        const enemyData = this.waveSpawner.generateEnemies(i)
        expect(enemyData.length).toBeGreaterThanOrEqual(1)
      }
    })

    it('should return a boss on a boss wave', () => {
      this.waveSpawner.setRoundAttributes()
      const enemyData = this.waveSpawner.generateEnemies(this.waveSpawner.bossSpawnOnWave)
      expect(enemyData.length).toBe(1)
      expect(enemyData[0].attributes.length).toBe(this.waveSpawner.numBossAttributes)
    })

  })

})

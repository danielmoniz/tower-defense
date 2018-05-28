
export function getBurningEmitter(unit, container) {
  return new PIXI.particles.Emitter(
    container,
    [PIXI.Texture.fromImage('/images/particle.png')],
    {
      "alpha": {
        "start": 0.74,
        "end": 0.4
      },
      "scale": {
        "start": 0.3,
        "end": 0.4
      },
      "color": {
        "start": "ffdfa0",
        "end": "100f0c"
      },
      "speed": {
        "start": 110,
        "end": 55
      },
      "startRotation": {
        "min": 280,
        "max": 300
      },
      "rotationSpeed": {
        "min": 0,
        "max": 200
      },
      "lifetime": {
        "min": 0.3,
        "max": 0.9
      },
      "blendMode": "normal",
      "ease": [
        {
          "s": 0,
          "cp": 0.329,
          "e": 0.548
        },
        {
          "s": 0.548,
          "cp": 0.767,
          "e": 0.876
        },
        {
          "s": 0.876,
          "cp": 0.985,
          "e": 1
        }
      ],
      "frequency": 0.001,
      "emitterLifetime": 0,
      "maxParticles": 100,
      "pos": {
        "x": unit.width / 2,
        "y": unit.height / 4
      },
      "addAtBack": true,
      "spawnType": "point",
    }
  )
}

export function getShellExplosionEmitter(unit, container, position) {
  return new PIXI.particles.Emitter(
    container,
    [PIXI.Texture.fromImage('/images/particle.png')],
    {
      "alpha": {
        "start": 0.74,
        "end": 0.4
      },
      "scale": {
        "start": 3,
        "end": 1.2
      },
      "color": {
        "start": "ffdfa0",
        "end": "100f0c"
      },
      "speed": {
        "start": 200,
        "end": 0
      },
      "startRotation": {
        "min": 0,
        "max": 360
      },
      "rotationSpeed": {
        "min": 0,
        "max": 200
      },
      "lifetime": {
        "min": 0.3,
        "max": 0.9
      },
      "blendMode": "normal",
      "ease": [
        {
          "s": 0,
          "cp": 0.329,
          "e": 0.548
        },
        {
          "s": 0.548,
          "cp": 0.767,
          "e": 0.876
        },
        {
          "s": 0.876,
          "cp": 0.985,
          "e": 1
        }
      ],
      "frequency": 0.001,
      "emitterLifetime": 0.1,
      "maxParticles": 100,
      "pos": {
        "x": position.x,
        "y": position.y
      },
      "addAtBack": true,
      "spawnType": "point",
    }
  )
}

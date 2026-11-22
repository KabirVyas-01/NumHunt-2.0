import * as THREE from 'three';

/**
 * Lightweight, zero-external-dependency Particle System for Archery impacts.
 * Handles:
 * - Wood splinters and golden sparks on target / bullseye hit
 * - Soil and dust plumes on ground miss impact
 * - Turf debris on overshoot miss
 */
export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];

    // Shared reusable geometries
    this.sparkGeo = new THREE.SphereGeometry(0.02, 4, 4);
    this.splinterGeo = new THREE.BoxGeometry(0.015, 0.05, 0.015);
    this.dirtGeo = new THREE.DodecahedronGeometry(0.03, 0);

    // Shared reusable materials
    this.sparkMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    this.splinterMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 });
    this.dirtMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
    this.grassMat = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.9 });
  }

  /**
   * Spawns an impact burst at specified world position.
   * @param {THREE.Vector3} position 
   * @param {'bullseye' | 'ground' | 'overshoot'} type 
   */
  spawnBurst(position, type = 'bullseye') {
    if (type === 'bullseye') {
      // Golden sparks and wooden splinters
      const count = 18;
      for (let i = 0; i < count; i++) {
        const isSplinter = i % 2 === 0;
        const mesh = new THREE.Mesh(
          isSplinter ? this.splinterGeo : this.sparkGeo,
          isSplinter ? this.splinterMat : this.sparkMat
        );
        mesh.position.copy(position);

        const velocity = new THREE.Vector3(
          -(Math.random() * 1.8 + 0.4), // Ricochet backward off target
          (Math.random() - 0.4) * 2.2,
          (Math.random() - 0.5) * 2.0
        );

        mesh.userData = {
          velocity,
          rotSpeed: new THREE.Vector3(
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 15
          ),
          life: 0.4 + Math.random() * 0.35,
          age: 0
        };

        this.scene.add(mesh);
        this.particles.push(mesh);
      }
    } else {
      // Ground or overshoot impact (dirt & grass debris)
      const count = 14;
      const isOvershoot = type === 'overshoot';
      for (let i = 0; i < count; i++) {
        const isGrass = isOvershoot && i % 3 === 0;
        const mesh = new THREE.Mesh(
          this.dirtGeo,
          isGrass ? this.grassMat : this.dirtMat
        );
        mesh.position.copy(position);

        const velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 1.8,
          Math.random() * 2.2 + 0.8, // Upward plume
          (Math.random() - 0.5) * 1.8
        );

        mesh.userData = {
          velocity,
          rotSpeed: new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
          ),
          life: 0.45 + Math.random() * 0.35,
          age: 0
        };

        this.scene.add(mesh);
        this.particles.push(mesh);
      }
    }
  }

  update(deltaTime) {
    const dt = Math.min(deltaTime, 0.1);
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.userData.age += dt;

      if (p.userData.age >= p.userData.life) {
        this.scene.remove(p);
        this.particles.splice(i, 1);
      } else {
        // Gravity
        p.userData.velocity.y -= 9.8 * dt;
        p.position.addScaledVector(p.userData.velocity, dt);

        // Rotation
        p.rotation.x += p.userData.rotSpeed.x * dt;
        p.rotation.y += p.userData.rotSpeed.y * dt;
        p.rotation.z += p.userData.rotSpeed.z * dt;

        // Fade scale
        const remainingLifeRatio = 1 - (p.userData.age / p.userData.life);
        p.scale.setScalar(Math.max(0.01, remainingLifeRatio));
      }
    }
  }

  reset() {
    this.particles.forEach(p => {
      this.scene.remove(p);
    });
    this.particles = [];
  }

  dispose() {
    this.reset();
    this.sparkGeo.dispose();
    this.splinterGeo.dispose();
    this.dirtGeo.dispose();
    this.sparkMat.dispose();
    this.splinterMat.dispose();
    this.dirtMat.dispose();
    this.grassMat.dispose();
  }
}

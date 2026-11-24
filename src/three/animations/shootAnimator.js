import soundService from '../../services/soundService.js';
import * as THREE from 'three';
import { createArrowMesh } from '../characters/archer.js';

/**
 * Shot Sequence States:
 * 'IDLE' -> 'PREPARING' -> 'DRAWING' -> 'FLYING' -> 'IMPACT' -> 'COMPLETED'
 */
export class ArcheryShotAnimator {
  constructor(scene, archer, target, onImpact = null) {
    this.scene = scene;
    this.archer = archer;
    this.target = target;
    this.onImpact = onImpact;

    this.state = 'IDLE';
    this.elapsed = 0;
    this.activeArrow = null;

    // Shot flight parameters
    this.flightStart = new THREE.Vector3();
    this.flightEnd = new THREE.Vector3();
    this.flightDuration = 0.58;
    this.flightProgress = 0;
    this.arcApexHeight = 0.25;

    // Arrows stuck in scene
    this.stuckArrows = [];
    this.particles = [];
  }

  /**
   * Triggers an archery shot where ONLY the correct number hits the target.
   * If the guess is NOT the correct number:
   * - Lower: MUST MISS the target by dropping into the ground short of the target.
   * - Higher: MUST MISS the target by sailing high over the top into the distance.
   * - Correct: HITS the bullseye on the target face!
   */
  shoot({ outcome = 'correct', difference = 0, colorHex = 0xef4444 }) {
    if (this.state !== 'IDLE' && this.state !== 'COMPLETED') {
      console.warn('Shot currently in progress.');
      return;
    }

    this.state = 'PREPARING';
    this.elapsed = 0;
    this.shotData = { outcome, difference, colorHex };

    const targetX = this.target.position.x; // 4.5
    const targetZ = this.target.position.z; // 0.0
    const absDiff = Math.abs(difference) || 10;

    this.flightStart.set(
      this.archer.position.x + 0.48,
      this.archer.position.y + 1.47,
      this.archer.position.z + 0.02
    );

    if (outcome === 'correct') {
      // ONLY correct guess hits the target!
      const bullseyeY = 1.80 + (Math.random() - 0.5) * 0.03;
      const frontFaceX = targetX - 0.078;
      const jitterZ = targetZ + (Math.random() - 0.5) * 0.05;

      this.flightEnd.set(frontFaceX, bullseyeY, jitterZ);
      this.arcApexHeight = 0.22;
      this.flightDuration = 0.55;
    } else if (outcome === 'lower') {
      // MISS: Arrow drops down and hits the GROUND BEFORE reaching the target (x < 4.5, y ~ 0.02)
      // Clamped between x = 1.0 (very low) and x = 3.6 (near target base, but distinctly BEFORE it)
      const distFraction = Math.min(absDiff, 100) / 100;
      const groundX = THREE.MathUtils.clamp(
        targetX - 0.9 - distFraction * 2.2 + (Math.random() - 0.5) * 0.2,
        1.0,
        3.65
      );
      const groundY = 0.02; // Firmly on ground
      const jitterZ = targetZ + (Math.random() - 0.5) * 0.15;

      this.flightEnd.set(groundX, groundY, jitterZ);
      this.arcApexHeight = 0.10; // Low descending ballistic arc into dirt
      this.flightDuration = 0.48;
    } else {
      // MISS: Arrow sails HIGH OVER THE TOP of the target (target top is at y = 2.65m) into background
      const distFraction = Math.min(absDiff, 100) / 100;
      const overshotX = THREE.MathUtils.clamp(
        targetX + 4.0 + distFraction * 3.0 + (Math.random() - 0.5) * 0.4,
        targetX + 3.0,
        targetX + 7.5
      );
      const overshotY = 0.50 + distFraction * 0.3; // Lands beyond target in background
      const jitterZ = targetZ - 1.0 + (Math.random() - 0.5) * 0.4;

      this.flightEnd.set(overshotX, overshotY, jitterZ);
      // High arching trajectory: guarantees arrow altitude at target plane (x = 4.5m)
      // is always between y = 3.25m and y = 4.45m, safely above target top (y = 2.65m)
      this.arcApexHeight = 2.80 + distFraction * 0.70;
      this.flightDuration = 0.68;
    }

    if (this.archer.userData.nockedArrow) {
      this.archer.userData.nockedArrow.visible = true;
    }
  }

  update(deltaTime) {
    this.updateParticles(deltaTime);

    if (this.state === 'IDLE' || this.state === 'COMPLETED') {
      return;
    }

    this.elapsed += deltaTime;

    // PHASE 1: PREPARING (0.0 to 0.18s)
    if (this.state === 'PREPARING') {
      this.archer.userData.setDrawProgress(0);
      if (this.elapsed >= 0.18) {
        this.state = 'DRAWING';
        soundService.playBowDraw();
        this.elapsed = 0;
      }
    }

    // PHASE 2: DRAWING (0.0 to 0.60s)
    else if (this.state === 'DRAWING') {
      const drawProgress = Math.min(this.elapsed / 0.60, 1.0);
      const eased = Math.sin((drawProgress * Math.PI) / 2);
      this.archer.userData.setDrawProgress(eased);

      if (this.elapsed >= 0.60) {
        this.state = 'FLYING';
        soundService.playArrowRelease();
        this.elapsed = 0;
        this.flightProgress = 0;

        if (this.archer.userData.nockedArrow) {
          this.archer.userData.nockedArrow.visible = false;
        }

        this.archer.userData.setDrawProgress(0);
        this.archer.userData.triggerRecoil?.();

        this.activeArrow = createArrowMesh(this.shotData.colorHex);
        this.activeArrow.position.copy(this.flightStart);
        this.scene.add(this.activeArrow);
      }
    }

    // PHASE 3: ARROW FLIGHT
    else if (this.state === 'FLYING') {
      this.flightProgress = Math.min(this.elapsed / this.flightDuration, 1.0);
      const t = this.flightProgress;

      const currentPos = new THREE.Vector3().lerpVectors(this.flightStart, this.flightEnd, t);
      const arcHeight = Math.sin(t * Math.PI) * this.arcApexHeight;
      currentPos.y += arcHeight;

      if (this.activeArrow) {
        const nextT = Math.min(t + 0.04, 1.0);
        const nextPos = new THREE.Vector3().lerpVectors(this.flightStart, this.flightEnd, nextT);
        nextPos.y += Math.sin(nextT * Math.PI) * this.arcApexHeight;

        this.activeArrow.position.copy(currentPos);
        const dir = new THREE.Vector3().subVectors(nextPos, currentPos).normalize();
        if (dir.lengthSq() > 0.0001) {
          const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
          this.activeArrow.quaternion.copy(quat);
        }
      }

      if (t >= 1.0) {
        // IMPACT!
        this.state = 'IMPACT';
        this.elapsed = 0;

        if (this.activeArrow) {
          this.activeArrow.position.copy(this.flightEnd);
          this.stuckArrows.push(this.activeArrow);
          this.activeArrow = null;
        }

        // Particle FX and target interaction
        if (this.shotData.outcome === 'correct') {
          soundService.playBullseyeImpact();
          this.triggerTargetVibration();
          this.spawnImpactParticles(this.flightEnd, 0xfacc15, 14); // Target gold/wood splinters
        } else if (this.shotData.outcome === 'lower') {
          soundService.playGroundImpact();
          this.spawnImpactParticles(this.flightEnd, 0x4a3525, 12); // Ground dirt burst
        } else {
          this.spawnImpactParticles(this.flightEnd, 0x2e4624, 10);
          soundService.playGroundImpact(); // Distant ground turf
        }

        if (this.onImpact) {
          this.onImpact(this.shotData);
        }
      }
    }

    // PHASE 4: IMPACT SETTLE
    else if (this.state === 'IMPACT') {
      if (this.elapsed >= 0.4) {
        this.state = 'COMPLETED';
        if (this.archer.userData.nockedArrow) {
          this.archer.userData.nockedArrow.visible = true;
        }
      }
    }
  }

  spawnImpactParticles(pos, colorHex, count = 10) {
    const geo = new THREE.SphereGeometry(0.02, 4, 4);
    const mat = new THREE.MeshBasicMaterial({ color: colorHex });

    for (let i = 0; i < count; i++) {
      const p = new THREE.Mesh(geo, mat);
      p.position.copy(pos);
      p.userData = {
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 2.2,
          Math.random() * 2.5 + 0.5,
          (Math.random() - 0.5) * 2.2
        ),
        life: 0.4 + Math.random() * 0.3,
        age: 0
      };
      this.scene.add(p);
      this.particles.push(p);
    }
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.userData.age += dt;
      if (p.userData.age >= p.userData.life) {
        this.scene.remove(p);
        p.geometry?.dispose();
        p.material?.dispose();
        this.particles.splice(i, 1);
      } else {
        p.userData.vel.y -= 9.8 * dt;
        p.position.addScaledVector(p.userData.vel, dt);
        const scale = 1 - (p.userData.age / p.userData.life);
        p.scale.setScalar(scale);
      }
    }
  }

  triggerTargetVibration() {
    const origX = this.target.position.x;
    let t = 0;
    const interval = setInterval(() => {
      t += 0.016;
      if (t >= 0.22) {
        this.target.position.x = origX;
        clearInterval(interval);
      } else {
        const offset = Math.sin(t * 65) * 0.025 * (1 - t / 0.22);
        this.target.position.x = origX + offset;
      }
    }, 16);
  }

  reset() {
    this.stuckArrows.forEach(arrow => {
      this.scene.remove(arrow);
      arrow.traverse(child => {
        if (child.isMesh) {
          child.geometry?.dispose();
          child.material?.dispose();
        }
      });
    });
    this.stuckArrows = [];

    if (this.activeArrow) {
      this.scene.remove(this.activeArrow);
      this.activeArrow.traverse(child => {
        if (child.isMesh) {
          child.geometry?.dispose();
          child.material?.dispose();
        }
      });
      this.activeArrow = null;
    }

    this.particles.forEach(p => {
      this.scene.remove(p);
      p.geometry?.dispose();
      p.material?.dispose();
    });
    this.particles = [];

    this.archer.userData.setDrawProgress(0);
    if (this.archer.userData.nockedArrow) {
      this.archer.userData.nockedArrow.visible = true;
    }

    this.state = 'IDLE';
    this.elapsed = 0;
    this.flightProgress = 0;
  }

  dispose() {
    this.reset();
  }
}

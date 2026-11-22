import * as THREE from 'three';
import { createArrowMesh } from '../characters/archer.js';

/**
 * Shot Sequence States:
 * 'IDLE' -> 'PREPARING' -> 'DRAWING' -> 'FLYING' -> 'IMPACT' -> 'COMPLETED'
 */
export class ArcheryShotAnimator {
  constructor(scene, archer, target, onFeedbackReady = null) {
    this.scene = scene;
    this.archer = archer;
    this.target = target;
    this.onFeedbackReady = onFeedbackReady;

    this.state = 'IDLE'; // 'IDLE' | 'PREPARING' | 'DRAWING' | 'FLYING' | 'IMPACT'
    this.elapsed = 0;
    this.activeArrow = null;

    // Shot flight parameters
    this.flightStart = new THREE.Vector3();
    this.flightEnd = new THREE.Vector3();
    this.flightDuration = 0.55; // Seconds for arrow to cross range
    this.flightProgress = 0;

    // Arrows stuck in target or scene
    this.stuckArrows = [];
  }

  /**
   * Triggers a cinematic archery shot.
   * 
   * @param {{
   *   outcome: 'higher' | 'lower' | 'correct',
   *   difference: number, // numeric difference (e.g., +25, -40, 0)
   *   colorHex: number
   * }} shotData 
   */
  shoot({ outcome = 'correct', difference = 0, colorHex = 0xef4444 }) {
    if (this.state !== 'IDLE' && this.state !== 'COMPLETED') {
      console.warn('Shot currently in progress.');
      return;
    }

    this.state = 'PREPARING';
    this.elapsed = 0;
    this.shotData = { outcome, difference, colorHex };

    // Calculate landing coordinates on target
    // Bullseye center: x: target.x - 0.08 (front of boss), y: 1.8, z: 0
    const bullseyeY = 1.8;
    const targetX = this.target.position.x - 0.078; // Front face of boss
    const targetZ = this.target.position.z;

    let impactY = bullseyeY;

    if (outcome === 'correct') {
      impactY = bullseyeY + (Math.random() - 0.5) * 0.05; // Tight center grouping
    } else {
      // Calculate vertical deviation based on difference magnitude
      // Max disc radius is ~0.75m. Differences range from 1 to 500+
      // Scale logarithmic or linear clamped factor:
      const absDiff = Math.abs(difference) || 10;
      // 0.1m to 0.70m offset
      const offset = THREE.MathUtils.clamp(0.12 + Math.log10(absDiff) * 0.22, 0.15, 0.72);

      if (outcome === 'higher') {
        impactY = bullseyeY + offset;
      } else {
        impactY = bullseyeY - offset;
      }
    }

    // Add slight random horizontal jitter for realism (+/- 0.06m)
    const impactZ = targetZ + (Math.random() - 0.5) * 0.12;

    this.flightStart.set(
      this.archer.position.x + 0.48,
      this.archer.position.y + 1.47,
      this.archer.position.z + 0.02
    );

    this.flightEnd.set(targetX, impactY, impactZ);

    // Make nocked arrow on character visible
    if (this.archer.userData.nockedArrow) {
      this.archer.userData.nockedArrow.visible = true;
    }
  }

  update(deltaTime) {
    if (this.state === 'IDLE' || this.state === 'COMPLETED') {
      return;
    }

    this.elapsed += deltaTime;

    // PHASE 1: PREPARING (0.0 to 0.2s) - Archer sets stance
    if (this.state === 'PREPARING') {
      this.archer.userData.setDrawProgress(0);
      if (this.elapsed >= 0.2) {
        this.state = 'DRAWING';
        this.elapsed = 0;
      }
    }

    // PHASE 2: DRAWING (0.0 to 0.65s) - String and arrow pulled back
    else if (this.state === 'DRAWING') {
      const drawProgress = Math.min(this.elapsed / 0.65, 1.0);
      // Smooth ease-out draw curve
      const eased = Math.sin((drawProgress * Math.PI) / 2);
      this.archer.userData.setDrawProgress(eased);

      if (this.elapsed >= 0.65) {
        // Trigger release & flight!
        this.state = 'FLYING';
        this.elapsed = 0;
        this.flightProgress = 0;

        // Hide nocked arrow on archer
        if (this.archer.userData.nockedArrow) {
          this.archer.userData.nockedArrow.visible = false;
        }
        // Release bowstring back to rest instantly
        this.archer.userData.setDrawProgress(0);

        // Spawn flying arrow in scene
        this.activeArrow = createArrowMesh(this.shotData.colorHex);
        this.activeArrow.position.copy(this.flightStart);
        this.scene.add(this.activeArrow);
      }
    }

    // PHASE 3: ARROW FLIGHT (0.0 to flightDuration)
    else if (this.state === 'FLYING') {
      this.flightProgress = Math.min(this.elapsed / this.flightDuration, 1.0);
      const t = this.flightProgress;

      // Realistic ballistic arc: linear X & Z, parabolic arc on Y with slight rise & drop
      const currentPos = new THREE.Vector3().lerpVectors(this.flightStart, this.flightEnd, t);
      // Slight arc peaking at 0.2m above straight trajectory line
      const arcHeight = Math.sin(t * Math.PI) * 0.25;
      currentPos.y += arcHeight;

      if (this.activeArrow) {
        // Look ahead vector to align arrow tip along trajectory
        const nextT = Math.min(t + 0.05, 1.0);
        const nextPos = new THREE.Vector3().lerpVectors(this.flightStart, this.flightEnd, nextT);
        nextPos.y += Math.sin(nextT * Math.PI) * 0.25;

        this.activeArrow.position.copy(currentPos);
        // Align arrow pointing towards travel direction (Arrow model tip is +Y in local space)
        const dir = new THREE.Vector3().subVectors(nextPos, currentPos).normalize();
        const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        this.activeArrow.quaternion.copy(quat);
      }

      if (t >= 1.0) {
        // Impact!
        this.state = 'IMPACT';
        this.elapsed = 0;

        // Embed arrow slightly into the target boss
        if (this.activeArrow) {
          this.activeArrow.position.copy(this.flightEnd);
          // Angle stuck into target facing towards +X
          this.stuckArrows.push(this.activeArrow);
          this.activeArrow = null;
        }

        // Slight target vibration/wobble on impact
        this.triggerTargetVibration();

        if (this.onFeedbackReady) {
          this.onFeedbackReady(this.shotData);
        }
      }
    }

    // PHASE 4: IMPACT SETTLE (0.0 to 0.4s)
    else if (this.state === 'IMPACT') {
      if (this.elapsed >= 0.4) {
        this.state = 'COMPLETED';
        // Re-ready nocked arrow on archer
        if (this.archer.userData.nockedArrow) {
          this.archer.userData.nockedArrow.visible = true;
        }
      }
    }
  }

  triggerTargetVibration() {
    const origX = this.target.position.x;
    let t = 0;
    const interval = setInterval(() => {
      t += 0.016;
      if (t >= 0.2) {
        this.target.position.x = origX;
        clearInterval(interval);
      } else {
        // Decaying sinusoidal vibration
        const offset = Math.sin(t * 60) * 0.02 * (1 - t / 0.2);
        this.target.position.x = origX + offset;
      }
    }, 16);
  }

  /**
   * Resets all stuck arrows and returns archer and bow to clean idle state.
   */
  reset() {
    // Remove stuck arrows
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

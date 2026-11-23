import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { ArcheryShotAnimator } from '../three/animations/shootAnimator.js';

describe('ArcheryShotAnimator - Miss and Hit Dynamics', () => {
  const dummyScene = { add: () => {}, remove: () => {} };
  const dummyArcher = {
    position: new THREE.Vector3(-4.5, 0, 0),
    userData: {
      setDrawProgress: () => {},
      triggerRecoil: () => {},
      nockedArrow: { visible: true }
    }
  };
  const dummyTarget = {
    position: new THREE.Vector3(4.5, 0, 0)
  };

  const targetBossRadius = 0.85;
  const targetBossY = 1.80;
  const targetTopY = targetBossY + targetBossRadius; // 2.65m
  const targetBottomY = targetBossY - targetBossRadius; // 0.95m
  const targetX = 4.5;

  it('LOWER guess must miss target completely by dropping to the ground short of target', () => {
    const animator = new ArcheryShotAnimator(dummyScene, dummyArcher, dummyTarget);

    const testDiffs = [1, 2, 5, 10, 25, 50, 100, 500];
    for (const diff of testDiffs) {
      animator.shoot({ outcome: 'lower', difference: -diff });
      expect(animator.flightEnd.x).toBeLessThan(targetX); // Never reaches or exceeds target X
      expect(animator.flightEnd.x).toBeLessThanOrEqual(3.75); // Comfortably in front of target boss
      expect(animator.flightEnd.y).toBeCloseTo(0.02, 1); // Ground level
      expect(animator.arcApexHeight).toBeLessThan(0.2); // Low descending trajectory
      animator.state = 'IDLE';
    }
  });

  it('HIGHER guess must miss target completely by flying over top (y > 2.65m) at target plane', () => {
    const animator = new ArcheryShotAnimator(dummyScene, dummyArcher, dummyTarget);

    const testDiffs = [1, 2, 5, 10, 25, 50, 100, 500];
    for (const diff of testDiffs) {
      animator.shoot({ outcome: 'higher', difference: diff });
      
      // End point is far behind target in background
      expect(animator.flightEnd.x).toBeGreaterThan(targetX + 2.5);

      // Trajectory height at target plane (x = 4.5)
      const startX = animator.flightStart.x;
      const startY = animator.flightStart.y;
      const endX = animator.flightEnd.x;
      const endY = animator.flightEnd.y;
      const apex = animator.arcApexHeight;

      const tAtTarget = (targetX - startX) / (endX - startX);
      const yAtTarget = (1 - tAtTarget) * startY + tAtTarget * endY + Math.sin(tAtTarget * Math.PI) * apex;

      // Must be safely above top of target boss (2.65m)
      expect(yAtTarget).toBeGreaterThan(targetTopY); // > 2.65m
      expect(yAtTarget).toBeGreaterThanOrEqual(3.0); // At least 35cm clearance above target top

      animator.state = 'IDLE';
    }
  });

  it('CORRECT guess hits target face / bullseye', () => {
    const animator = new ArcheryShotAnimator(dummyScene, dummyArcher, dummyTarget);
    animator.shoot({ outcome: 'correct', difference: 0 });

    // Front face of target boss
    expect(animator.flightEnd.x).toBeCloseTo(targetX - 0.078, 2);
    // Bullseye center (1.80m)
    expect(animator.flightEnd.y).toBeGreaterThan(1.70);
    expect(animator.flightEnd.y).toBeLessThan(1.90);
  });
});

import * as THREE from 'three';

/**
 * Creates an archery target with concentric score rings, wooden stand, and legs.
 * Center of the bullseye is positioned at target position (default y: 1.8m, z: 0).
 */
export function createArcheryTarget() {
  const targetGroup = new THREE.Group();
  targetGroup.name = 'archery_target';

  // Stand legs (A-frame wooden easel)
  const woodMaterial = new THREE.MeshStandardMaterial({
    color: 0x5c4033,
    roughness: 0.85,
    metalness: 0.1
  });

  const legGeo = new THREE.CylinderGeometry(0.04, 0.05, 2.6, 8);

  const leftLeg = new THREE.Mesh(legGeo, woodMaterial);
  leftLeg.position.set(0, 1.25, 0.45);
  leftLeg.rotation.x = 0.18;
  leftLeg.rotation.z = 0.12;
  leftLeg.castShadow = true;
  leftLeg.receiveShadow = true;
  targetGroup.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, woodMaterial);
  rightLeg.position.set(0, 1.25, -0.45);
  rightLeg.rotation.x = -0.18;
  rightLeg.rotation.z = 0.12;
  rightLeg.castShadow = true;
  rightLeg.receiveShadow = true;
  targetGroup.add(rightLeg);

  const backLeg = new THREE.Mesh(legGeo, woodMaterial);
  backLeg.position.set(0.65, 1.2, 0);
  backLeg.rotation.z = -0.42;
  backLeg.castShadow = true;
  backLeg.receiveShadow = true;
  targetGroup.add(backLeg);

  // Target Boss / Backing Straw Disc (Cylinder facing -X towards archer)
  const bossGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.15, 32);
  const bossMat = new THREE.MeshStandardMaterial({
    color: 0x3d2817,
    roughness: 0.9,
    metalness: 0.05
  });
  const bossMesh = new THREE.Mesh(bossGeo, bossMat);
  bossMesh.rotation.z = Math.PI / 2; // Face towards -X
  bossMesh.position.set(0, 1.8, 0);
  bossMesh.castShadow = true;
  bossMesh.receiveShadow = true;
  targetGroup.add(bossMesh);

  // Concentric Rings on the front face (x = -0.076 relative to boss center)
  // Standard World Archery colours: White, Black, Blue, Red, Gold (Bullseye)
  const rings = [
    { inner: 0.64, outer: 0.80, color: 0xf3f4f6 }, // White ring
    { inner: 0.48, outer: 0.64, color: 0x1f2937 }, // Black ring
    { inner: 0.32, outer: 0.48, color: 0x2563eb }, // Blue ring
    { inner: 0.16, outer: 0.32, color: 0xdc2626 }, // Red ring
    { inner: 0.00, outer: 0.16, color: 0xfacc15 }  // Gold / Bullseye
  ];

  rings.forEach((ring, idx) => {
    let geo;
    if (ring.inner === 0) {
      geo = new THREE.CircleGeometry(ring.outer, 32);
    } else {
      geo = new THREE.RingGeometry(ring.inner, ring.outer, 32);
    }
    const mat = new THREE.MeshStandardMaterial({
      color: ring.color,
      roughness: 0.6,
      metalness: 0.05,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geo, mat);
    // Face towards negative X (towards archer)
    mesh.rotation.y = -Math.PI / 2;
    mesh.position.set(-0.077 - (idx * 0.001), 1.8, 0);
    mesh.receiveShadow = true;
    targetGroup.add(mesh);
  });

  // Reference height coordinate for bullseye
  targetGroup.userData.bullseyePosition = new THREE.Vector3(0, 1.8, 0);

  return targetGroup;
}

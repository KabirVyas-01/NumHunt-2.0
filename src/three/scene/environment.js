import * as THREE from 'three';

/**
 * Creates cinematic outdoor forest training ground environment:
 * - Rich grass terrain with slight undulation
 * - Shooting lane path / marker line
 * - Background tree trunks and foliage canopies
 * - Distant perimeter fencing / wooden barriers
 * - Atmospheric depth
 */
export function createOutdoorEnvironment() {
  const envGroup = new THREE.Group();
  envGroup.name = 'forest_environment';

  // Ground plane (Lush forest clearing turf)
  const groundGeo = new THREE.PlaneGeometry(36, 24, 32, 32);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x2e4624, // Deep forest grass green
    roughness: 0.9,
    metalness: 0.05
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.receiveShadow = true;
  envGroup.add(ground);

  // Dirt / packed earth shooting line path under archer and target
  const pathGeo = new THREE.PlaneGeometry(16, 2.5);
  const pathMat = new THREE.MeshStandardMaterial({
    color: 0x423522, // Earthy dirt lane
    roughness: 0.95,
    metalness: 0.02
  });
  const path = new THREE.Mesh(pathGeo, pathMat);
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, 0.005, 0);
  path.receiveShadow = true;
  envGroup.add(path);

  // Archer shooting line marker (white painted timber)
  const lineGeo = new THREE.BoxGeometry(0.1, 0.04, 2.6);
  const lineMat = new THREE.MeshStandardMaterial({
    color: 0xd1d5db,
    roughness: 0.8
  });
  const line = new THREE.Mesh(lineGeo, lineMat);
  line.position.set(-4.5, 0.02, 0);
  line.receiveShadow = true;
  envGroup.add(line);

  // Background Trees (Stylized cinematic trunks and pine / leafy canopies)
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x3b2a1a, roughness: 0.9 });
  const foliageMat1 = new THREE.MeshStandardMaterial({ color: 0x1e3a1e, roughness: 0.85 });
  const foliageMat2 = new THREE.MeshStandardMaterial({ color: 0x274e27, roughness: 0.8 });

  const treePositions = [
    { x: -7, z: -5, scale: 1.1, mat: foliageMat1 },
    { x: -3, z: -6.5, scale: 1.3, mat: foliageMat2 },
    { x: 1, z: -5.5, scale: 1.0, mat: foliageMat1 },
    { x: 5, z: -6, scale: 1.25, mat: foliageMat2 },
    { x: 8, z: -4.5, scale: 1.1, mat: foliageMat1 },
    { x: 9.5, z: -7, scale: 1.4, mat: foliageMat2 },
    // Distant side trees behind archer
    { x: -8.5, z: -2, scale: 1.0, mat: foliageMat1 },
    { x: -8, z: 3, scale: 1.2, mat: foliageMat2 },
    // Distant background behind target
    { x: 9, z: 2.5, scale: 1.15, mat: foliageMat1 }
  ];

  treePositions.forEach(pos => {
    const tree = new THREE.Group();
    tree.position.set(pos.x, 0, pos.z);

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.2 * pos.scale, 0.3 * pos.scale, 3.5 * pos.scale, 8);
    const trunk = new THREE.Mesh(trunkGeo, woodMat);
    trunk.position.y = (3.5 * pos.scale) / 2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);

    // Foliage tiers (Conical pine layers)
    for (let t = 0; t < 3; t++) {
      const coneRadius = (1.5 - t * 0.35) * pos.scale;
      const coneHeight = 1.8 * pos.scale;
      const coneGeo = new THREE.ConeGeometry(coneRadius, coneHeight, 8);
      const cone = new THREE.Mesh(coneGeo, pos.mat);
      cone.position.y = (2.4 + t * 1.1) * pos.scale;
      cone.castShadow = true;
      cone.receiveShadow = true;
      tree.add(cone);
    }

    envGroup.add(tree);
  });

  // Distant wooden rustic perimeter fence along backdrop
  const fenceMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9 });
  for (let fx = -8; fx <= 8; fx += 2) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 1.4, 6), fenceMat);
    post.position.set(fx, 0.7, -3.8);
    post.castShadow = true;
    envGroup.add(post);
  }
  const railGeo = new THREE.BoxGeometry(17, 0.08, 0.05);
  const rail1 = new THREE.Mesh(railGeo, fenceMat);
  rail1.position.set(0, 1.1, -3.8);
  envGroup.add(rail1);
  const rail2 = new THREE.Mesh(railGeo, fenceMat);
  rail2.position.set(0, 0.6, -3.8);
  envGroup.add(rail2);

  return envGroup;
}

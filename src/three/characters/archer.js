import * as THREE from 'three';

/**
 * Palette mapping for player colour variations:
 * Red (P1), Green (P2), Blue (P3), Yellow (P4)
 */
export const ARCHER_PALETTES = {
  Red: {
    accent: 0xdc2626,
    fletching: 0xef4444,
    tunic: 0x1f2937,
    tunicTrim: 0xb91c1c
  },
  Green: {
    accent: 0x10b981,
    fletching: 0x059669,
    tunic: 0x1f2937,
    tunicTrim: 0x047857
  },
  Blue: {
    accent: 0x3b82f6,
    fletching: 0x2563eb,
    tunic: 0x1f2937,
    tunicTrim: 0x1d4ed8
  },
  Yellow: {
    accent: 0xf59e0b,
    fletching: 0xd97706,
    tunic: 0x1f2937,
    tunicTrim: 0xb45309
  }
};

/**
 * Creates a procedural realistic humanoid archer rig.
 * Cleanly separated into joints (head, torso, leftArm, rightArm, bow, bowstring, arrow)
 * so it can be animated and smoothly replaced by GLTF/Mixamo later.
 * 
 * @param {string} colorName - 'Red' | 'Green' | 'Blue' | 'Yellow'
 */
export function createArcherCharacter(colorName = 'Red') {
  const palette = ARCHER_PALETTES[colorName] || ARCHER_PALETTES.Red;

  const archerRoot = new THREE.Group();
  archerRoot.name = 'archer_character';

  // Shared materials
  const skinMaterial = new THREE.MeshStandardMaterial({
    color: 0xd2a679,
    roughness: 0.6,
    metalness: 0.1
  });

  const leatherMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a3525,
    roughness: 0.8,
    metalness: 0.1
  });

  const tunicMaterial = new THREE.MeshStandardMaterial({
    color: palette.tunic,
    roughness: 0.7,
    metalness: 0.05
  });

  const accentMaterial = new THREE.MeshStandardMaterial({
    color: palette.accent,
    roughness: 0.5,
    metalness: 0.1
  });

  const pantsMaterial = new THREE.MeshStandardMaterial({
    color: 0x2c2c2c,
    roughness: 0.85,
    metalness: 0.05
  });

  const woodBowMaterial = new THREE.MeshStandardMaterial({
    color: 0x5a3818,
    roughness: 0.5,
    metalness: 0.15
  });

  // Base / Feet at Y = 0
  // Legs
  const legGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.9, 12);
  const leftLeg = new THREE.Mesh(legGeo, pantsMaterial);
  leftLeg.position.set(0, 0.45, 0.18);
  leftLeg.castShadow = true;
  archerRoot.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, pantsMaterial);
  rightLeg.position.set(0, 0.45, -0.18);
  rightLeg.castShadow = true;
  archerRoot.add(rightLeg);

  // Boots
  const bootGeo = new THREE.BoxGeometry(0.24, 0.15, 0.12);
  const leftBoot = new THREE.Mesh(bootGeo, leatherMaterial);
  leftBoot.position.set(0.04, 0.075, 0.18);
  leftBoot.castShadow = true;
  archerRoot.add(leftBoot);

  const rightBoot = new THREE.Mesh(bootGeo, leatherMaterial);
  rightBoot.position.set(0.04, 0.075, -0.18);
  rightBoot.castShadow = true;
  archerRoot.add(rightBoot);

  // Pelvis / Belt
  const beltGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16);
  const belt = new THREE.Mesh(beltGeo, leatherMaterial);
  belt.position.set(0, 0.92, 0);
  belt.castShadow = true;
  archerRoot.add(belt);

  // Torso / Tunic
  const torsoGeo = new THREE.CylinderGeometry(0.22, 0.18, 0.65, 16);
  const torso = new THREE.Mesh(torsoGeo, tunicMaterial);
  torso.position.set(0, 1.25, 0);
  torso.castShadow = true;
  archerRoot.add(torso);

  // Chest / Shoulder Sash with Player Color
  const sashGeo = new THREE.TorusGeometry(0.22, 0.03, 8, 24);
  const sash = new THREE.Mesh(sashGeo, accentMaterial);
  sash.position.set(0, 1.35, 0);
  sash.rotation.x = Math.PI / 4;
  archerRoot.add(sash);

  // Quiver on Back
  const quiverGroup = new THREE.Group();
  quiverGroup.position.set(-0.18, 1.3, -0.05);
  quiverGroup.rotation.z = -0.3;
  const quiverBody = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.65, 12), leatherMaterial);
  quiverBody.castShadow = true;
  quiverGroup.add(quiverBody);

  // Fletchings sticking out of quiver
  for (let i = 0; i < 4; i++) {
    const arrowStub = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.35, 6), woodBowMaterial);
    arrowStub.position.set((Math.random() - 0.5) * 0.04, 0.38, (Math.random() - 0.5) * 0.04);
    const fletch = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.08, 0.04), accentMaterial);
    fletch.position.y = 0.12;
    arrowStub.add(fletch);
    quiverGroup.add(arrowStub);
  }
  archerRoot.add(quiverGroup);

  // Neck & Head
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.65, 0);

  const headGeo = new THREE.SphereGeometry(0.14, 16, 16);
  const head = new THREE.Mesh(headGeo, skinMaterial);
  head.castShadow = true;
  headGroup.add(head);

  // Headband with Player Color Accent
  const headbandGeo = new THREE.CylinderGeometry(0.145, 0.145, 0.04, 16);
  const headband = new THREE.Mesh(headbandGeo, accentMaterial);
  headband.position.set(0, 0.04, 0);
  headGroup.add(headband);

  archerRoot.add(headGroup);

  // ARMS & BOW RIG
  // Left Arm (Bow holding arm extended forward towards target in +X direction)
  const leftShoulder = new THREE.Group();
  leftShoulder.name = 'leftShoulder';
  leftShoulder.position.set(0.12, 1.45, 0.24);

  const leftUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.35, 12), tunicMaterial);
  leftUpperArm.rotation.z = -Math.PI / 2.3;
  leftUpperArm.position.set(0.16, 0, 0);
  leftShoulder.add(leftUpperArm);

  const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), skinMaterial);
  leftHand.position.set(0.35, 0.02, 0);
  leftShoulder.add(leftHand);

  // BOW attached to left hand
  const bowGroup = new THREE.Group();
  bowGroup.name = 'bowGroup';
  bowGroup.position.set(0.36, 0.02, 0);

  // Curved Recurve Bow via Torus segment
  const bowGeo = new THREE.TorusGeometry(0.65, 0.02, 8, 24, Math.PI * 0.7);
  const bowMesh = new THREE.Mesh(bowGeo, woodBowMaterial);
  bowMesh.rotation.y = Math.PI / 2;
  bowMesh.rotation.z = -Math.PI * 0.85;
  bowMesh.castShadow = true;
  bowGroup.add(bowMesh);

  // Bowstring (Line or thin cylinder)
  // Top tip of bow is around (0, 0.55, 0), bottom tip around (0, -0.55, 0)
  const bowstringPoints = [
    new THREE.Vector3(0, 0.55, 0),
    new THREE.Vector3(0, 0, 0), // String nock center (drawn back by right hand)
    new THREE.Vector3(0, -0.55, 0)
  ];
  const stringGeo = new THREE.BufferGeometry().setFromPoints(bowstringPoints);
  const stringMat = new THREE.LineBasicMaterial({ color: 0xeeeeee, linewidth: 2 });
  const bowstringLine = new THREE.Line(stringGeo, stringMat);
  bowstringLine.name = 'bowstringLine';
  bowGroup.add(bowstringLine);

  leftShoulder.add(bowGroup);
  archerRoot.add(leftShoulder);

  // Right Arm (Drawing arm)
  const rightShoulder = new THREE.Group();
  rightShoulder.name = 'rightShoulder';
  rightShoulder.position.set(-0.05, 1.45, -0.2);

  const rightUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.35, 12), tunicMaterial);
  rightUpperArm.rotation.z = -Math.PI / 4;
  rightUpperArm.rotation.y = -Math.PI / 6;
  rightUpperArm.position.set(0.12, 0.05, 0.05);
  rightShoulder.add(rightUpperArm);

  const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), skinMaterial);
  rightHand.name = 'rightHand';
  rightHand.position.set(0.25, 0.04, 0.15); // Starts near resting position
  rightShoulder.add(rightHand);

  archerRoot.add(rightShoulder);

  // NOCKED ARROW (Held between right hand & bow until fired)
  const nockedArrow = createArrowMesh(palette.fletching);
  nockedArrow.name = 'nockedArrow';
  nockedArrow.position.set(0.48, 1.47, 0.02);
  nockedArrow.rotation.y = -Math.PI / 2; // Pointing towards +X
  archerRoot.add(nockedArrow);

  // Expose key articulable parts for animator
  archerRoot.userData = {
    colorName,
    bowGroup,
    bowstringLine,
    nockedArrow,
    rightHand,
    rightShoulder,
    setDrawProgress: (t) => {
      // t: 0.0 (idle rest) to 1.0 (full draw back)
      // When drawn, string center moves backwards in -X direction
      const stringPositions = bowstringLine.geometry.attributes.position.array;
      stringPositions[3] = -0.32 * t; // String nock point drawn back
      bowstringLine.geometry.attributes.position.needsUpdate = true;

      // Nocked arrow moves back with the string
      nockedArrow.position.x = 0.48 - (0.32 * t);

      // Right drawing hand moves back towards archer's cheek
      rightHand.position.x = 0.25 - (0.30 * t);
      rightHand.position.z = 0.15 - (0.05 * t);
    },
    updatePalette: (newColorName) => {
      const p = ARCHER_PALETTES[newColorName] || ARCHER_PALETTES.Red;
      accentMaterial.color.setHex(p.accent);
      // Update arrow fletching
      nockedArrow.traverse(child => {
        if (child.name === 'fletching') {
          child.material.color.setHex(p.fletching);
        }
      });
    }
  };

  return archerRoot;
}

/**
 * Creates an individual modular arrow mesh with wooden shaft, metal broadhead point, and fletchings.
 * @param {number} fletchColorHex 
 */
export function createArrowMesh(fletchColorHex = 0xef4444) {
  const arrowGroup = new THREE.Group();
  arrowGroup.name = 'arrow';

  const shaftGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.82, 8);
  const shaftMat = new THREE.MeshStandardMaterial({
    color: 0x8b5a2b,
    roughness: 0.7,
    metalness: 0.1
  });
  const shaft = new THREE.Mesh(shaftGeo, shaftMat);
  shaft.castShadow = true;
  arrowGroup.add(shaft);

  // Arrowhead at top (+Y local, which will be rotated along flight path)
  const tipGeo = new THREE.ConeGeometry(0.022, 0.08, 8);
  const tipMat = new THREE.MeshStandardMaterial({
    color: 0x9ca3af,
    roughness: 0.3,
    metalness: 0.8
  });
  const tip = new THREE.Mesh(tipGeo, tipMat);
  tip.position.y = 0.43;
  tip.castShadow = true;
  arrowGroup.add(tip);

  // Fletchings at base (-Y local)
  const fletchMat = new THREE.MeshStandardMaterial({
    color: fletchColorHex,
    roughness: 0.6,
    metalness: 0.1,
    side: THREE.DoubleSide
  });

  for (let i = 0; i < 3; i++) {
    const fletchGeo = new THREE.BoxGeometry(0.005, 0.12, 0.035);
    const fletch = new THREE.Mesh(fletchGeo, fletchMat);
    fletch.name = 'fletching';
    fletch.position.y = -0.34;
    fletch.rotation.y = (i * Math.PI * 2) / 3;
    fletch.position.x = Math.sin((i * Math.PI * 2) / 3) * 0.015;
    fletch.position.z = Math.cos((i * Math.PI * 2) / 3) * 0.015;
    fletch.castShadow = true;
    arrowGroup.add(fletch);
  }

  return arrowGroup;
}

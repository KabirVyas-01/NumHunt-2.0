import * as THREE from 'three';
import { createArcheryTarget } from './target.js';
import { createOutdoorEnvironment } from './environment.js';
import { createArcherCharacter, ARCHER_PALETTES } from '../characters/archer.js';
import { ArcheryShotAnimator } from '../animations/shootAnimator.js';

/**
 * Encapsulated Three.js Scene Manager for NumHunt 2.0.
 * Decoupled from React lifecycle; handles clean init, resize, tick loop, and disposal.
 */
export class ArcherySceneManager {
  constructor(canvasContainer, options = {}) {
    this.container = canvasContainer;
    this.options = options;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.animator = null;
    this.archer = null;
    this.target = null;
    this.environment = null;

    this.animationFrameId = null;
    this.clock = new THREE.Clock();
    this.isDisposed = false;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 500;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb); // Daytime sky blue
    // Atmospheric fog for depth in outdoor clearing
    this.scene.fog = new THREE.FogExp2(0xa3c2c8, 0.035);

    // 2. Camera (Side-view perspective)
    // Archer is on LEFT (-4.5m), Target is on RIGHT (+4.5m)
    // Camera is positioned at (0, 2.0, 7.5) looking towards center of range (0, 1.6, 0)
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    this.camera.position.set(0, 2.1, 7.2);
    this.camera.lookAt(0, 1.6, 0);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.container.appendChild(this.renderer.domElement);

    // 4. Cinematic Lighting
    this.setupLighting();

    // 5. Environment
    this.environment = createOutdoorEnvironment();
    this.scene.add(this.environment);

    // 6. Target (Right side at x = +4.5m)
    this.target = createArcheryTarget();
    this.target.position.set(4.5, 0, 0);
    this.scene.add(this.target);

    // 7. Archer (Left side at x = -4.5m facing target towards +X)
    this.archer = createArcherCharacter(this.options.playerColor || 'Red');
    this.archer.position.set(-4.5, 0, 0);
    // Archer stands sideways in classic stance facing +X towards target
    this.archer.rotation.y = 0;
    this.scene.add(this.archer);

    // 8. Shot Animator
    this.animator = new ArcheryShotAnimator(
      this.scene,
      this.archer,
      this.target,
      this.options.onFeedbackReady
    );

    // 9. Resize listener
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);

    // 10. Start render loop
    this.clock.start();
    this.tick = this.tick.bind(this);
    this.tick();
  }

  setupLighting() {
    // Soft ambient skylight
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.65);
    hemiLight.position.set(0, 20, 0);
    this.scene.add(hemiLight);

    // Sunlight (Key directional light casting soft realistic shadows)
    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.4);
    sunLight.position.set(-6, 12, 6);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 30;
    sunLight.shadow.camera.left = -9;
    sunLight.shadow.camera.right = 9;
    sunLight.shadow.camera.top = 7;
    sunLight.shadow.camera.bottom = -3;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    // Gentle fill light from target side to illuminate arrow impact face
    const fillLight = new THREE.DirectionalLight(0xbad2e8, 0.45);
    fillLight.position.set(8, 4, 3);
    this.scene.add(fillLight);
  }

  handleResize() {
    if (this.isDisposed || !this.container || !this.renderer || !this.camera) return;

    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 500;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  tick() {
    if (this.isDisposed) return;

    this.animationFrameId = requestAnimationFrame(this.tick);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    this.animator.update(delta);
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Triggers a shot animation visualization.
   * @param {'higher'|'lower'|'correct'} outcome 
   * @param {number} difference 
   */
  triggerShot(outcome, difference = 0, colorName = 'Red') {
    const palette = ARCHER_PALETTES[colorName] || ARCHER_PALETTES.Red;
    this.animator.shoot({
      outcome,
      difference,
      colorHex: palette.fletching
    });
  }

  /**
   * Updates archer color accent (Red, Green, Blue, Yellow).
   * @param {string} colorName 
   */
  setPlayerColor(colorName) {
    if (this.archer && this.archer.userData.updatePalette) {
      this.archer.userData.updatePalette(colorName);
    }
  }

  resetScene() {
    if (this.animator) {
      this.animator.reset();
    }
  }

  dispose() {
    this.isDisposed = true;
    window.removeEventListener('resize', this.handleResize);

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    if (this.animator) {
      this.animator.dispose();
    }

    // Traverse and dispose all materials, textures, geometries
    if (this.scene) {
      this.scene.traverse(object => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(m => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }

    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
  }
}

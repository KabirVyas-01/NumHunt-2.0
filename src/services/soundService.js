/**
 * Sound Service for NumHunt 2.0 using the Web Audio API.
 * Synthesizes procedural, realistic archery sound effects without external audio file dependencies.
 * Respects browser autoplay restrictions and the global audio toggle state.
 */

class SoundService {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.initialized = false;

    // Load initial preference from localStorage if available
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem('numhunt_audio_muted');
      if (saved !== null) {
        this.muted = saved === 'true';
      }
    }
  }

  init() {
    if (this.initialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      if (typeof window !== 'undefined') {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
          this.initialized = true;
        }
      }
    } catch (e) {
      console.warn('Web Audio API not supported in this browser.', e);
    }
  }

  setMuted(muted) {
    this.muted = muted;
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('numhunt_audio_muted', muted ? 'true' : 'false');
    }
  }

  isMuted() {
    return this.muted;
  }

  /**
   * 1. Bow Draw Sound: Simulates tension and creak of wood/string being pulled back.
   */
  playBowDraw() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    // Frequency ramps up subtly mimicking tightening string tension
    osc.frequency.setValueAtTime(65, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.55);

    // Subtle gain envelope
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.06, t + 0.1);
    gain.gain.linearRampToValueAtTime(0.04, t + 0.45);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    // Filter to soften harsh sawtooth harmonics into wooden creak
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, t);
    filter.frequency.linearRampToValueAtTime(550, t + 0.55);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.62);
  }

  /**
   * 2. Arrow Release / Whoosh: Aerodynamic filtered noise burst whistling through the air.
   */
  playArrowRelease() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // White noise buffer for whoosh
    const bufferSize = this.ctx.sampleRate * 0.45;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    // Bandpass sweep mimicking Doppler whistling release
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(2200, t + 0.12);
    filter.frequency.exponentialRampToValueAtTime(600, t + 0.45);
    filter.Q.value = 3.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start(t);
    whiteNoise.stop(t + 0.46);
  }

  /**
   * 3. Bullseye Impact: Solid resonant thud into straw boss & wood stand.
   */
  playBullseyeImpact() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Low pitch thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.25);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);

    // High frequency wood flex click
    const click = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    click.type = 'sine';
    click.frequency.setValueAtTime(950, t);
    click.frequency.exponentialRampToValueAtTime(300, t + 0.06);

    clickGain.gain.setValueAtTime(0.2, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    click.connect(clickGain);
    clickGain.connect(this.ctx.destination);
    click.start(t);
    click.stop(t + 0.08);
  }

  /**
   * 4. Ground Impact: Deep dirt thud with gravel dispersion noise.
   */
  playGroundImpact() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(85, t);
    osc.frequency.exponentialRampToValueAtTime(32, t + 0.22);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  /**
   * 5. UI Button Interaction Click: Subtle tactical optic chirp.
   */
  playButtonClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(680, t);
    osc.frequency.exponentialRampToValueAtTime(1100, t + 0.04);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.055);
  }

  /**
   * 6. Victory Fanfare: Celebratory tactical harmony.
   */
  playVictory() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880]; // A major chord arpeggio
    notes.forEach((freq, idx) => {
      const t = this.ctx.currentTime + (idx * 0.1);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  }
}

export const soundService = new SoundService();
export default soundService;

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { soundService } from '../services/soundService.js';

describe('SoundService (Web Audio API Synthesizer)', () => {
  beforeEach(() => {
    soundService.setMuted(false);
  });

  it('initializes in unmuted state by default', () => {
    expect(soundService.isMuted()).toBe(false);
  });

  it('toggles muted state and respects muting', () => {
    soundService.setMuted(true);
    expect(soundService.isMuted()).toBe(true);

    soundService.setMuted(false);
    expect(soundService.isMuted()).toBe(false);
  });

  it('safely handles audio triggers without throwing when AudioContext is mocked or unavailable', () => {
    expect(() => soundService.playBowDraw()).not.toThrow();
    expect(() => soundService.playArrowRelease()).not.toThrow();
    expect(() => soundService.playBullseyeImpact()).not.toThrow();
    expect(() => soundService.playGroundImpact()).not.toThrow();
    expect(() => soundService.playButtonClick()).not.toThrow();
    expect(() => soundService.playVictory()).not.toThrow();
  });

  it('does not invoke audio synthesis when muted', () => {
    soundService.setMuted(true);
    const initSpy = vi.spyOn(soundService, 'init');
    soundService.playBowDraw();
    expect(initSpy).not.toHaveBeenCalled();
    initSpy.mockRestore();
  });
});

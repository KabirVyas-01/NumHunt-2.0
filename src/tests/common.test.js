import { describe, it, expect } from 'vitest';
import { generateRandomNumber, validateGuessInput, evaluateGuess } from '../game/logic/common.js';

describe('Common Game Logic & Validation', () => {
  describe('generateRandomNumber', () => {
    it('generates random numbers strictly within inclusive bounds', () => {
      for (let i = 0; i < 100; i++) {
        const val1 = generateRandomNumber(1, 100);
        expect(val1).toBeGreaterThanOrEqual(1);
        expect(val1).toBeLessThanOrEqual(100);

        const val2 = generateRandomNumber(1, 1000);
        expect(val2).toBeGreaterThanOrEqual(1);
        expect(val2).toBeLessThanOrEqual(1000);
      }
    });

    it('handles identical min and max correctly', () => {
      expect(generateRandomNumber(42, 42)).toBe(42);
    });
  });

  describe('validateGuessInput', () => {
    it('accepts valid integer numbers within range', () => {
      expect(validateGuessInput(1, 1, 100)).toEqual({ valid: true, value: 1 });
      expect(validateGuessInput(100, 1, 100)).toEqual({ valid: true, value: 100 });
      expect(validateGuessInput(50, 1, 100)).toEqual({ valid: true, value: 50 });
    });

    it('accepts valid string numbers and converts to integer', () => {
      expect(validateGuessInput('42', 1, 100)).toEqual({ valid: true, value: 42 });
      expect(validateGuessInput('  75  ', 1, 100)).toEqual({ valid: true, value: 75 });
    });

    it('rejects empty, null, and undefined inputs', () => {
      expect(validateGuessInput('', 1, 100).valid).toBe(false);
      expect(validateGuessInput('   ', 1, 100).valid).toBe(false);
      expect(validateGuessInput(null, 1, 100).valid).toBe(false);
      expect(validateGuessInput(undefined, 1, 100).valid).toBe(false);
    });

    it('rejects non-numeric strings', () => {
      expect(validateGuessInput('abc', 1, 100).valid).toBe(false);
      expect(validateGuessInput('12a', 1, 100).valid).toBe(false);
    });

    it('rejects floating point decimal numbers', () => {
      expect(validateGuessInput(42.5, 1, 100).valid).toBe(false);
      expect(validateGuessInput('50.1', 1, 100).valid).toBe(false);
    });

    it('rejects numbers strictly outside the bounds', () => {
      expect(validateGuessInput(0, 1, 100).valid).toBe(false);
      expect(validateGuessInput(-5, 1, 100).valid).toBe(false);
      expect(validateGuessInput(101, 1, 100).valid).toBe(false);
      expect(validateGuessInput(1001, 1, 1000).valid).toBe(false);
    });
  });

  describe('evaluateGuess', () => {
    it('evaluates higher guesses correctly', () => {
      const res = evaluateGuess(75, 50);
      expect(res.isCorrect).toBe(false);
      expect(res.direction).toBe('higher');
      expect(res.difference).toBe(25);
      expect(res.feedbackText).toBe('You guessed it higher');
    });

    it('evaluates lower guesses correctly', () => {
      const res = evaluateGuess(25, 50);
      expect(res.isCorrect).toBe(false);
      expect(res.direction).toBe('lower');
      expect(res.difference).toBe(-25);
      expect(res.feedbackText).toBe('You guessed it lower');
    });

    it('evaluates correct guesses accurately', () => {
      const res = evaluateGuess(50, 50);
      expect(res.isCorrect).toBe(true);
      expect(res.direction).toBe('correct');
      expect(res.difference).toBe(0);
      expect(res.feedbackText).toBe('Correct!');
    });
  });
});

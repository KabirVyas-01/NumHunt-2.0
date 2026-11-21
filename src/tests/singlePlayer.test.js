import { describe, it, expect } from 'vitest';
import {
  createSinglePlayerGame,
  makeSinglePlayerGuess,
  getSinglePlayerView,
  SINGLE_PLAYER_LEVELS
} from '../game/singlePlayer/singlePlayerEngine.js';

describe('Single Player Engine', () => {
  describe('Level 1: 1-100, max 10 attempts', () => {
    it('initializes Level 1 with 10 attempts and range 1-100', () => {
      const game = createSinglePlayerGame(1, 42);
      expect(game.level).toBe(1);
      expect(game.min).toBe(1);
      expect(game.max).toBe(100);
      expect(game.maxAttempts).toBe(10);
      expect(game.attemptsRemaining).toBe(10);
      expect(game.attemptsUsed).toBe(0);
      expect(game.status).toBe('playing');
    });

    it('handles incorrect guesses and updates attempts correctly', () => {
      let { state } = makeSinglePlayerGuess(createSinglePlayerGame(1, 50), 70);
      expect(state.attemptsUsed).toBe(1);
      expect(state.attemptsRemaining).toBe(9);
      expect(state.status).toBe('playing');
      expect(state.lastResult.direction).toBe('higher');
      expect(state.lastResult.feedbackText).toBe('You guessed it higher');

      const next = makeSinglePlayerGuess(state, 30);
      state = next.state;
      expect(state.attemptsUsed).toBe(2);
      expect(state.attemptsRemaining).toBe(8);
      expect(state.lastResult.direction).toBe('lower');
      expect(state.lastResult.feedbackText).toBe('You guessed it lower');
    });

    it('correct guess ends the game in victory', () => {
      const initial = createSinglePlayerGame(1, 50);
      const { state } = makeSinglePlayerGuess(initial, 50);
      expect(state.status).toBe('won');
      expect(state.attemptsUsed).toBe(1);
      expect(state.lastResult.isCorrect).toBeUndefined(); // direction: 'correct'
      expect(state.lastResult.direction).toBe('correct');
      expect(state.lastResult.feedbackText).toBe('Correct!');
    });

    it('exhausting all 10 attempts ends the game in loss', () => {
      let state = createSinglePlayerGame(1, 50);
      for (let i = 1; i <= 9; i++) {
        state = makeSinglePlayerGuess(state, 20).state;
        expect(state.status).toBe('playing');
      }

      // 10th attempt (incorrect)
      state = makeSinglePlayerGuess(state, 20).state;
      expect(state.attemptsUsed).toBe(10);
      expect(state.attemptsRemaining).toBe(0);
      expect(state.status).toBe('lost');

      // Further guesses are rejected
      const over = makeSinglePlayerGuess(state, 50);
      expect(over.error).toBe('Game is already completed.');
    });

    it('invalid guesses do not consume attempts', () => {
      let state = createSinglePlayerGame(1, 50);
      const invalidGuesses = ['abc', -10, 105, 50.5, '', null];

      invalidGuesses.forEach(invalid => {
        const result = makeSinglePlayerGuess(state, invalid);
        expect(result.error).toBeDefined();
        expect(result.state.attemptsUsed).toBe(0);
        expect(result.state.attemptsRemaining).toBe(10);
        state = result.state;
      });
    });
  });

  describe('Level 2: 1-1000, max 15 attempts & Extreme Hint', () => {
    it('initializes Level 2 with 15 attempts and range 1-1000', () => {
      const game = createSinglePlayerGame(2, 500);
      expect(game.level).toBe(2);
      expect(game.min).toBe(1);
      expect(game.max).toBe(1000);
      expect(game.maxAttempts).toBe(15);
      expect(game.attemptsRemaining).toBe(15);
    });

    it('triggers one-time extreme hint when difference > 500 (Too low!)', () => {
      // Secret is 900, guess is 200 => difference is -700 (|diff| = 700 > 500)
      const game = createSinglePlayerGame(2, 900);
      const { state } = makeSinglePlayerGuess(game, 200);

      expect(state.extremeHintUsed).toBe(true);
      expect(state.extremeHintTriggered).toBe(true);
      expect(state.lastResult.extremeHint).toBe('Too low!');
      expect(state.lastResult.direction).toBe('lower');
    });

    it('triggers one-time extreme hint when difference > 500 (Too high!)', () => {
      // Secret is 100, guess is 700 => difference is +600 (|diff| = 600 > 500)
      const game = createSinglePlayerGame(2, 100);
      const { state } = makeSinglePlayerGuess(game, 700);

      expect(state.extremeHintUsed).toBe(true);
      expect(state.extremeHintTriggered).toBe(true);
      expect(state.lastResult.extremeHint).toBe('Too high!');
      expect(state.lastResult.direction).toBe('higher');
    });

    it('triggers Extreme Hint ONLY ONCE per round even on subsequent > 500 differences', () => {
      const game = createSinglePlayerGame(2, 100);
      // Turn 1: diff = 700 (triggers hint)
      let state = makeSinglePlayerGuess(game, 800).state;
      expect(state.extremeHintUsed).toBe(true);
      expect(state.extremeHintTriggered).toBe(true);
      expect(state.lastResult.extremeHint).toBe('Too high!');

      // Turn 2: diff = 800 (still > 500, but should NOT trigger again)
      state = makeSinglePlayerGuess(state, 900).state;
      expect(state.extremeHintUsed).toBe(true);
      expect(state.extremeHintTriggered).toBe(false);
      expect(state.lastResult.extremeHint).toBeNull();
    });

    it('does NOT trigger Extreme Hint when difference is exactly 500 or less', () => {
      const game = createSinglePlayerGame(2, 500);
      // Difference exactly 500
      const { state } = makeSinglePlayerGuess(game, 1000);
      expect(state.extremeHintUsed).toBe(false);
      expect(state.extremeHintTriggered).toBe(false);
      expect(state.lastResult.extremeHint).toBeNull();
    });

    it('Level 1 NEVER triggers Extreme Hint even with large numbers or invalid attempts', () => {
      const game = createSinglePlayerGame(1, 10);
      const { state } = makeSinglePlayerGuess(game, 90); // diff = 80
      expect(state.extremeHintUsed).toBe(false);
      expect(state.lastResult.extremeHint).toBeNull();
    });
  });

  describe('Single Player Sanitized View', () => {
    it('hides secret number while playing and reveals upon completion', () => {
      const game = createSinglePlayerGame(1, 42);
      const activeView = getSinglePlayerView(game);
      expect(activeView.secretNumber).toBeNull();

      const wonGame = makeSinglePlayerGuess(game, 42).state;
      const wonView = getSinglePlayerView(wonGame);
      expect(wonView.secretNumber).toBe(42);
      expect(wonView.status).toBe('won');
    });
  });
});

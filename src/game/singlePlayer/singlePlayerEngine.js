/**
 * Single Player Game Engine for NumHunt 2.0.
 * 
 * Modes / Levels:
 * - Level 1: Range 1-100, max 10 attempts.
 * - Level 2: Range 1-1000, max 15 attempts. Extreme Hint when |diff| > 500 (one-time only).
 */

import { generateRandomNumber, validateGuessInput, evaluateGuess } from '../logic/common.js';

export const SINGLE_PLAYER_LEVELS = {
  LEVEL_1: {
    id: 1,
    name: 'Level 1',
    min: 1,
    max: 100,
    maxAttempts: 10,
    hasExtremeHint: false
  },
  LEVEL_2: {
    id: 2,
    name: 'Level 2',
    min: 1,
    max: 1000,
    maxAttempts: 15,
    hasExtremeHint: true,
    extremeHintThreshold: 500
  }
};

/**
 * Creates an initial immutable-friendly state for Single Player.
 * @param {number} level - 1 or 2 (defaults to 1)
 * @param {number} [customSecret] - Optional secret for testing/mocking
 */
export function createSinglePlayerGame(level = 1, customSecret = null) {
  const config = level === 2 ? SINGLE_PLAYER_LEVELS.LEVEL_2 : SINGLE_PLAYER_LEVELS.LEVEL_1;
  const secret = customSecret !== null ? customSecret : generateRandomNumber(config.min, config.max);

  return {
    level: config.id,
    min: config.min,
    max: config.max,
    maxAttempts: config.maxAttempts,
    attemptsRemaining: config.maxAttempts,
    attemptsUsed: 0,
    secretNumber: secret, // Kept internal in engine
    extremeHintUsed: false,
    extremeHintTriggered: false, // Indicates if the latest turn triggered the hint
    status: 'playing', // 'playing' | 'won' | 'lost'
    guesses: [], // Array of { guess, direction, difference, feedbackText, extremeHint, attemptNumber }
    lastResult: null
  };
}

/**
 * Processes a guess in Single Player mode.
 * Does not mutate original state; returns a new state object.
 * 
 * @param {object} state 
 * @param {number|string} input 
 * @returns {{ state: object, error?: string }}
 */
export function makeSinglePlayerGuess(state, input) {
  if (state.status !== 'playing') {
    return {
      state,
      error: 'Game is already completed.'
    };
  }

  const validation = validateGuessInput(input, state.min, state.max);
  if (!validation.valid) {
    return {
      state,
      error: validation.error
    };
  }

  const guess = validation.value;
  const evaluation = evaluateGuess(guess, state.secretNumber);
  const attemptsUsed = state.attemptsUsed + 1;
  const attemptsRemaining = state.maxAttempts - attemptsUsed;

  let extremeHint = null;
  let extremeHintUsed = state.extremeHintUsed;
  let extremeHintTriggered = false;

  // Level 2 Extreme Hint condition: absolute difference > 500, triggered only once per round
  if (
    state.level === 2 &&
    !extremeHintUsed &&
    !evaluation.isCorrect &&
    Math.abs(evaluation.difference) > SINGLE_PLAYER_LEVELS.LEVEL_2.extremeHintThreshold
  ) {
    extremeHintUsed = true;
    extremeHintTriggered = true;
    extremeHint = evaluation.direction === 'higher' ? 'Too high!' : 'Too low!';
  }

  let status = 'playing';
  if (evaluation.isCorrect) {
    status = 'won';
  } else if (attemptsRemaining <= 0) {
    status = 'lost';
  }

  const guessRecord = {
    guess,
    direction: evaluation.direction,
    difference: evaluation.difference,
    feedbackText: evaluation.feedbackText,
    extremeHint,
    attemptNumber: attemptsUsed
  };

  const nextState = {
    ...state,
    attemptsUsed,
    attemptsRemaining,
    extremeHintUsed,
    extremeHintTriggered,
    status,
    guesses: [...state.guesses, guessRecord],
    lastResult: guessRecord
  };

  return { state: nextState };
}

/**
 * Returns a sanitized view of the state safe for UI rendering (hiding secret until game over).
 * @param {object} state 
 * @returns {object}
 */
export function getSinglePlayerView(state) {
  const isGameOver = state.status === 'won' || state.status === 'lost';
  return {
    level: state.level,
    min: state.min,
    max: state.max,
    maxAttempts: state.maxAttempts,
    attemptsUsed: state.attemptsUsed,
    attemptsRemaining: state.attemptsRemaining,
    status: state.status,
    guesses: [...state.guesses],
    lastResult: state.lastResult,
    secretNumber: isGameOver ? state.secretNumber : null
  };
}

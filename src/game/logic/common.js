/**
 * Core validation and random number helpers for NumHunt 2.0.
 * Pure functions with zero UI or rendering dependencies.
 */

/**
 * Generates a cryptographically-seeded or pseudo-random integer between min and max (inclusive).
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
export function generateRandomNumber(min, max) {
  const low = Math.ceil(min);
  const high = Math.floor(max);
  return Math.floor(Math.random() * (high - low + 1)) + low;
}

/**
 * Validates whether an input represents a valid integer within the designated range [min, max].
 * Accepts both numbers and numeric strings.
 * 
 * @param {number|string} input 
 * @param {number} min 
 * @param {number} max 
 * @returns {{ valid: boolean, value?: number, error?: string }}
 */
export function validateGuessInput(input, min, max) {
  if (input === null || input === undefined || (typeof input === 'string' && input.trim() === '')) {
    return { valid: false, error: 'Please enter a number.' };
  }

  const num = Number(input);

  if (!Number.isInteger(num)) {
    return { valid: false, error: 'Please enter a valid whole number (integer).' };
  }

  if (num < min || num > max) {
    return { valid: false, error: `Number must be between ${min} and ${max}.` };
  }

  return { valid: true, value: num };
}

/**
 * Compares a guess against the target secret number and computes feedback.
 * Standard feedbacks:
 * - "Correct!"
 * - "You guessed it higher" (guess > secret)
 * - "You guessed it lower" (guess < secret)
 * 
 * @param {number} guess 
 * @param {number} secret 
 * @returns {{
 *   isCorrect: boolean,
 *   direction: 'correct' | 'higher' | 'lower',
 *   difference: number,
 *   feedbackText: string
 * }}
 */
export function evaluateGuess(guess, secret) {
  const difference = guess - secret;

  if (difference === 0) {
    return {
      isCorrect: true,
      direction: 'correct',
      difference: 0,
      feedbackText: 'Correct!'
    };
  }

  if (difference > 0) {
    return {
      isCorrect: false,
      direction: 'higher',
      difference,
      feedbackText: 'You guessed it higher'
    };
  }

  return {
    isCorrect: false,
    direction: 'lower',
    difference,
    feedbackText: 'You guessed it lower'
  };
}

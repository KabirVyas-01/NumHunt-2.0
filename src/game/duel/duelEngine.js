/**
 * Head-to-Head Duel Mode Engine for NumHunt 2.0.
 * 
 * Rules:
 * - Exactly two players:
 *   - Player 1: Red
 *   - Player 2: Blue
 * - Range: 1-100.
 * - Both manually choose a secret number for the opponent.
 *   - P1 sets target for P2 to guess.
 *   - P2 sets target for P1 to guess.
 * - Players alternate turns, beginning with Player 1.
 * - Each player guesses their designated target.
 * - Feedback is relative to the opponent's secret number being guessed.
 * - First player to guess correctly wins immediately.
 * - No fixed attempt limit.
 * - Invalid guesses do not consume a turn.
 * - Game state display/view NEVER leaks the secret numbers to the guessing opponent.
 */

import { validateGuessInput, evaluateGuess } from '../logic/common.js';

export const DUEL_PLAYERS = {
  P1: { id: 1, name: 'Player 1', color: 'Red', hex: '#EF4444' },
  P2: { id: 2, name: 'Player 2', color: 'Blue', hex: '#3B82F6' }
};

export const DUEL_CONFIG = {
  min: 1,
  max: 100
};

/**
 * Initializes a new Duel game.
 * Phases:
 * - 'setting_p1_secret' (Player 1 secretly inputs secret number for Player 2)
 * - 'handover_p2_secret' (Pass device to Player 2)
 * - 'setting_p2_secret' (Player 2 secretly inputs secret number for Player 1)
 * - 'handover_duel_start' (Pass device back to Player 1 to start battle)
 * - 'handover_turn' (Pass device before active player takes their turn)
 * - 'playing' (Active player guessing)
 * - 'game_over' (One player has guessed correctly)
 * 
 * @param {string} [p1Name] 
 * @param {string} [p2Name] 
 */
export function createDuelGame(p1Name = 'Player 1', p2Name = 'Player 2') {
  return {
    min: DUEL_CONFIG.min,
    max: DUEL_CONFIG.max,
    p1: {
      id: 1,
      name: p1Name.trim() || 'Player 1',
      color: DUEL_PLAYERS.P1.color,
      colorHex: DUEL_PLAYERS.P1.hex,
      secretSetForOpponent: null, // P1 sets this for P2 to guess
      targetToGuess: null, // Will hold P2's secret
      guesses: [],
      turnsTaken: 0,
      lastResult: null
    },
    p2: {
      id: 2,
      name: p2Name.trim() || 'Player 2',
      color: DUEL_PLAYERS.P2.color,
      colorHex: DUEL_PLAYERS.P2.hex,
      secretSetForOpponent: null, // P2 sets this for P1 to guess
      targetToGuess: null, // Will hold P1's secret
      guesses: [],
      turnsTaken: 0,
      lastResult: null
    },
    currentTurnPlayerId: 1, // P1 starts
    phase: 'setting_p1_secret',
    totalTurns: 0,
    winner: null,
    status: 'setup' // 'setup' | 'playing' | 'completed'
  };
}

/**
 * Step 1: Player 1 sets the secret number for Player 2 to guess.
 * @param {object} state 
 * @param {number|string} secretInput 
 * @returns {{ state: object, error?: string }}
 */
export function setPlayer1Secret(state, secretInput) {
  if (state.phase !== 'setting_p1_secret') {
    return { state, error: 'Not currently setting Player 1 secret.' };
  }

  const validation = validateGuessInput(secretInput, state.min, state.max);
  if (!validation.valid) {
    return { state, error: validation.error };
  }

  const secret = validation.value;

  const nextState = {
    ...state,
    p1: {
      ...state.p1,
      secretSetForOpponent: secret
    },
    p2: {
      ...state.p2,
      targetToGuess: secret // P2 must guess P1's secret
    },
    phase: 'handover_p2_secret'
  };

  return { state: nextState };
}

/**
 * Handover acknowledgement between secret setups.
 * @param {object} state 
 * @returns {object}
 */
export function acknowledgeHandoverToPlayer2Secret(state) {
  if (state.phase !== 'handover_p2_secret') {
    return state;
  }
  return {
    ...state,
    phase: 'setting_p2_secret'
  };
}

/**
 * Step 2: Player 2 sets the secret number for Player 1 to guess.
 * @param {object} state 
 * @param {number|string} secretInput 
 * @returns {{ state: object, error?: string }}
 */
export function setPlayer2Secret(state, secretInput) {
  if (state.phase !== 'setting_p2_secret') {
    return { state, error: 'Not currently setting Player 2 secret.' };
  }

  const validation = validateGuessInput(secretInput, state.min, state.max);
  if (!validation.valid) {
    return { state, error: validation.error };
  }

  const secret = validation.value;

  const nextState = {
    ...state,
    p2: {
      ...state.p2,
      secretSetForOpponent: secret
    },
    p1: {
      ...state.p1,
      targetToGuess: secret // P1 must guess P2's secret
    },
    phase: 'handover_duel_start',
    status: 'playing',
    currentTurnPlayerId: 1
  };

  return { state: nextState };
}

/**
 * Handover acknowledgement before starting the battle or passing between turns.
 * @param {object} state 
 * @returns {object}
 */
export function acknowledgeTurnHandover(state) {
  if (state.phase === 'handover_duel_start' || state.phase === 'handover_turn') {
    return {
      ...state,
      phase: 'playing'
    };
  }
  return state;
}

/**
 * Makes a guess in Duel mode during active player turn.
 * @param {object} state 
 * @param {number|string} guessInput 
 * @returns {{ state: object, error?: string }}
 */
export function makeDuelGuess(state, guessInput) {
  if (state.status !== 'playing' || state.phase !== 'playing') {
    return { state, error: 'Duel is not currently in an active guessing phase.' };
  }

  const isP1 = state.currentTurnPlayerId === 1;
  const activePlayerData = isP1 ? state.p1 : state.p2;
  const target = activePlayerData.targetToGuess;

  const validation = validateGuessInput(guessInput, state.min, state.max);
  if (!validation.valid) {
    return { state, error: validation.error };
  }

  const guess = validation.value;
  const evaluation = evaluateGuess(guess, target);
  const turnsTaken = activePlayerData.turnsTaken + 1;
  const totalTurns = state.totalTurns + 1;

  const guessRecord = {
    turnNumber: totalTurns,
    playerTurnNumber: turnsTaken,
    guess,
    direction: evaluation.direction,
    difference: evaluation.difference,
    feedbackText: evaluation.feedbackText,
    isCorrect: evaluation.isCorrect
  };

  const updatedActivePlayer = {
    ...activePlayerData,
    turnsTaken,
    guesses: [...activePlayerData.guesses, guessRecord],
    lastResult: guessRecord
  };

  // Check victory condition
  if (evaluation.isCorrect) {
    const winnerData = {
      id: activePlayerData.id,
      name: activePlayerData.name,
      color: activePlayerData.color,
      totalGuesses: turnsTaken
    };

    return {
      state: {
        ...state,
        p1: isP1 ? updatedActivePlayer : state.p1,
        p2: !isP1 ? updatedActivePlayer : state.p2,
        totalTurns,
        phase: 'game_over',
        status: 'completed',
        winner: winnerData
      }
    };
  }

  // Not correct: alternate turns and initiate handover to opponent
  const nextPlayerId = isP1 ? 2 : 1;

  return {
    state: {
      ...state,
      p1: isP1 ? updatedActivePlayer : state.p1,
      p2: !isP1 ? updatedActivePlayer : state.p2,
      totalTurns,
      currentTurnPlayerId: nextPlayerId,
      phase: 'handover_turn'
    }
  };
}

/**
 * Sanitized view for Duel screen rendering.
 * CRITICAL REQUIREMENT: Never leak a player's secret number to the active opponent.
 * 
 * @param {object} state 
 * @returns {object}
 */
export function getDuelView(state) {
  const isGameOver = state.status === 'completed';
  const isP1 = state.currentTurnPlayerId === 1;

  return {
    status: state.status,
    phase: state.phase,
    totalTurns: state.totalTurns,
    currentTurnPlayerId: state.currentTurnPlayerId,
    activePlayer: {
      id: isP1 ? state.p1.id : state.p2.id,
      name: isP1 ? state.p1.name : state.p2.name,
      color: isP1 ? state.p1.color : state.p2.color,
      colorHex: isP1 ? state.p1.colorHex : state.p2.colorHex,
      turnsTaken: isP1 ? state.p1.turnsTaken : state.p2.turnsTaken,
      guesses: isP1 ? [...state.p1.guesses] : [...state.p2.guesses],
      lastResult: isP1 ? state.p1.lastResult : state.p2.lastResult
    },
    p1: {
      id: state.p1.id,
      name: state.p1.name,
      color: state.p1.color,
      colorHex: state.p1.colorHex,
      turnsTaken: state.p1.turnsTaken,
      lastResult: state.p1.lastResult,
      // Target is hidden from opponent during gameplay
      secretNumber: isGameOver ? state.p1.secretSetForOpponent : null
    },
    p2: {
      id: state.p2.id,
      name: state.p2.name,
      color: state.p2.color,
      colorHex: state.p2.colorHex,
      turnsTaken: state.p2.turnsTaken,
      lastResult: state.p2.lastResult,
      // Target is hidden from opponent during gameplay
      secretNumber: isGameOver ? state.p2.secretSetForOpponent : null
    },
    winner: state.winner
  };
}

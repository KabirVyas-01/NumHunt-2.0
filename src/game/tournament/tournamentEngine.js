/**
 * Tournament Mode Engine for NumHunt 2.0.
 * 
 * Rules:
 * - 2-4 Players.
 * - Colors: P1 Red, P2 Green, P3 Blue, P4 Yellow.
 * - Each player gets a separate secret number between 1-100 and maximum 10 attempts.
 * - Players complete rounds sequentially (full round per player).
 * - Player with lowest attempts used wins. Ties are joint winners.
 * - Maintains state ready for pass-and-play handover screens.
 */

import { generateRandomNumber, validateGuessInput, evaluateGuess } from '../logic/common.js';

export const TOURNAMENT_COLORS = [
  { id: 1, name: 'Red', hex: '#EF4444', label: 'Player 1' },
  { id: 2, name: 'Green', hex: '#10B981', label: 'Player 2' },
  { id: 3, name: 'Blue', hex: '#3B82F6', label: 'Player 3' },
  { id: 4, name: 'Yellow', hex: '#F59E0B', label: 'Player 4' }
];

export const TOURNAMENT_CONFIG = {
  min: 1,
  max: 100,
  maxAttempts: 10
};

/**
 * Validates player count for tournament.
 * @param {number} count 
 * @returns {boolean}
 */
export function isValidPlayerCount(count) {
  return Number.isInteger(count) && count >= 2 && count <= 4;
}

/**
 * Initializes tournament game state.
 * @param {number} playerCount - 2 to 4
 * @param {string[]} [playerNames] - Optional array of player names
 * @param {number[]} [customSecrets] - Optional custom secret numbers for testing
 */
export function createTournamentGame(playerCount = 2, playerNames = [], customSecrets = []) {
  if (!isValidPlayerCount(playerCount)) {
    throw new Error('Tournament requires 2 to 4 players.');
  }

  const players = [];
  for (let i = 0; i < playerCount; i++) {
    const colorInfo = TOURNAMENT_COLORS[i];
    const name = playerNames[i]?.trim() || `Player ${i + 1}`;
    const secret = customSecrets[i] !== undefined
      ? customSecrets[i]
      : generateRandomNumber(TOURNAMENT_CONFIG.min, TOURNAMENT_CONFIG.max);

    players.push({
      id: i + 1,
      name,
      color: colorInfo.name,
      colorHex: colorInfo.hex,
      secretNumber: secret,
      attemptsUsed: 0,
      attemptsRemaining: TOURNAMENT_CONFIG.maxAttempts,
      status: 'pending', // 'pending' | 'playing' | 'completed'
      solved: false,
      guesses: []
    });
  }

  // First player starts in 'handover' state ready for Pass & Play handover
  players[0].status = 'playing';

  return {
    playerCount,
    min: TOURNAMENT_CONFIG.min,
    max: TOURNAMENT_CONFIG.max,
    maxAttempts: TOURNAMENT_CONFIG.maxAttempts,
    players,
    currentPlayerIndex: 0,
    // Stage controls UI flow: 'handover' (pass device to next player), 'turn' (active round), 'finished'
    stage: 'handover',
    status: 'in_progress', // 'in_progress' | 'completed'
    winners: []
  };
}

/**
 * Acknowledges the pass-and-play handover screen and starts the active player's guessing turn.
 * @param {object} state 
 * @returns {object} nextState
 */
export function acknowledgeHandover(state) {
  if (state.stage !== 'handover') {
    return state;
  }
  return {
    ...state,
    stage: 'turn'
  };
}

/**
 * Calculates winners at the conclusion of all player rounds.
 * Lowest attempts among players who solved the secret wins.
 * If no one solved, lowest attempts among all or joint non-solvers.
 * 
 * Rules:
 * - A player who solved in fewer attempts beats a player who solved in more attempts.
 * - A player who solved beats a player who failed to solve (exhausted 10 attempts without solving).
 * - If multiple players tie on the lowest solving attempts, they are joint winners.
 * - If nobody solved, all players who exhausted attempts are joint winners.
 * 
 * @param {Array} players 
 * @returns {Array} winners array of player objects
 */
export function calculateTournamentWinners(players) {
  const solvedPlayers = players.filter(p => p.solved);

  if (solvedPlayers.length > 0) {
    const minAttempts = Math.min(...solvedPlayers.map(p => p.attemptsUsed));
    return solvedPlayers.filter(p => p.attemptsUsed === minAttempts);
  }

  // Nobody solved
  return [...players];
}

/**
 * Makes a guess for the current active player.
 * @param {object} state 
 * @param {number|string} input 
 * @returns {{ state: object, error?: string }}
 */
export function makeTournamentGuess(state, input) {
  if (state.status === 'completed') {
    return { state, error: 'Tournament has finished.' };
  }

  if (state.stage === 'handover') {
    return { state, error: 'Awaiting pass-and-play handover acknowledgement.' };
  }

  const currentPlayer = state.players[state.currentPlayerIndex];

  const validation = validateGuessInput(input, state.min, state.max);
  if (!validation.valid) {
    return { state, error: validation.error };
  }

  const guess = validation.value;
  const evaluation = evaluateGuess(guess, currentPlayer.secretNumber);
  const attemptsUsed = currentPlayer.attemptsUsed + 1;
  const attemptsRemaining = state.maxAttempts - attemptsUsed;

  const guessRecord = {
    guess,
    direction: evaluation.direction,
    difference: evaluation.difference,
    feedbackText: evaluation.feedbackText,
    attemptNumber: attemptsUsed
  };

  const isSolved = evaluation.isCorrect;
  const isExhausted = !isSolved && attemptsRemaining <= 0;
  const roundEnded = isSolved || isExhausted;

  const updatedCurrentPlayer = {
    ...currentPlayer,
    attemptsUsed,
    attemptsRemaining,
    solved: isSolved,
    status: roundEnded ? 'completed' : 'playing',
    guesses: [...currentPlayer.guesses, guessRecord],
    lastResult: guessRecord
  };

  const updatedPlayers = state.players.map((p, idx) =>
    idx === state.currentPlayerIndex ? updatedCurrentPlayer : p
  );

  // If current player's round is not finished, stay on current player turn
  if (!roundEnded) {
    return {
      state: {
        ...state,
        players: updatedPlayers
      }
    };
  }

  // Round ended: check if tournament is over or move to next player
  const nextPlayerIndex = state.currentPlayerIndex + 1;
  const isTournamentFinished = nextPlayerIndex >= state.playerCount;

  if (isTournamentFinished) {
    const winners = calculateTournamentWinners(updatedPlayers);
    return {
      state: {
        ...state,
        players: updatedPlayers,
        status: 'completed',
        stage: 'finished',
        winners
      }
    };
  }

  // Advance to next player with handover stage
  updatedPlayers[nextPlayerIndex].status = 'playing';

  return {
    state: {
      ...state,
      players: updatedPlayers,
      currentPlayerIndex: nextPlayerIndex,
      stage: 'handover'
    }
  };
}

/**
 * Sanitized view for Tournament mode, concealing secret numbers of pending/active players.
 * @param {object} state 
 * @returns {object}
 */
export function getTournamentView(state) {
  const isFinished = state.status === 'completed';
  return {
    playerCount: state.playerCount,
    currentPlayerIndex: state.currentPlayerIndex,
    activePlayer: {
      id: state.players[state.currentPlayerIndex].id,
      name: state.players[state.currentPlayerIndex].name,
      color: state.players[state.currentPlayerIndex].color,
      colorHex: state.players[state.currentPlayerIndex].colorHex,
      attemptsUsed: state.players[state.currentPlayerIndex].attemptsUsed,
      attemptsRemaining: state.players[state.currentPlayerIndex].attemptsRemaining,
      guesses: [...state.players[state.currentPlayerIndex].guesses],
      lastResult: state.players[state.currentPlayerIndex].lastResult
    },
    stage: state.stage,
    status: state.status,
    leaderboard: state.players.map(p => ({
      id: p.id,
      name: p.name,
      color: p.color,
      colorHex: p.colorHex,
      attemptsUsed: p.attemptsUsed,
      solved: p.solved,
      status: p.status,
      secretNumber: (isFinished || p.status === 'completed') ? p.secretNumber : null
    })),
    winners: isFinished ? state.winners.map(w => ({ id: w.id, name: w.name, color: w.color, attemptsUsed: w.attemptsUsed })) : []
  };
}

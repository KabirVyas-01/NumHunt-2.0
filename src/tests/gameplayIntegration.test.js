import { describe, it, expect } from 'vitest';
import {
  createSinglePlayerGame,
  makeSinglePlayerGuess,
  getSinglePlayerView
} from '../game/singlePlayer/singlePlayerEngine.js';
import {
  createTournamentGame,
  makeTournamentGuess,
  acknowledgeHandover
} from '../game/tournament/tournamentEngine.js';
import {
  createDuelGame,
  setPlayer1Secret,
  acknowledgeHandoverToPlayer2Secret,
  setPlayer2Secret,
  acknowledgeTurnHandover,
  makeDuelGuess,
  getDuelView
} from '../game/duel/duelEngine.js';

describe('Stage 4: End-to-End Gameplay Integration Tests', () => {
  describe('Single Player Mode', () => {
    it('manages Level 1 complete cycle to victory', () => {
      let state = createSinglePlayerGame(1, 42);
      expect(state.status).toBe('playing');
      expect(state.attemptsRemaining).toBe(10);

      // Guess lower
      state = makeSinglePlayerGuess(state, 20).state;
      expect(state.lastResult.direction).toBe('lower');
      expect(state.attemptsRemaining).toBe(9);

      // Guess higher
      state = makeSinglePlayerGuess(state, 80).state;
      expect(state.lastResult.direction).toBe('higher');
      expect(state.attemptsRemaining).toBe(8);

      // Guess correct
      state = makeSinglePlayerGuess(state, 42).state;
      expect(state.status).toBe('won');
      expect(state.lastResult.direction).toBe('correct');

      const view = getSinglePlayerView(state);
      expect(view.secretNumber).toBe(42);
    });

    it('manages Level 2 with one-time extreme hint (>500 difference)', () => {
      let state = createSinglePlayerGame(2, 950);
      expect(state.maxAttempts).toBe(15);

      // Difference = 950 - 100 = 850 (>500, triggers extreme hint)
      state = makeSinglePlayerGuess(state, 100).state;
      expect(state.lastResult.extremeHint).toBe('Too low!');
      expect(state.extremeHintUsed).toBe(true);

      // Next shot with difference > 500 should NOT trigger extreme hint again
      state = makeSinglePlayerGuess(state, 150).state;
      expect(state.lastResult.extremeHint).toBeNull();
      expect(state.extremeHintUsed).toBe(true);
    });
  });

  describe('Multiplayer Tournament Mode', () => {
    it('executes full sequential rounds across 3 players and crowns winner', () => {
      // 3 players with secrets: P1: 50, P2: 25, P3: 75
      let state = acknowledgeHandover(createTournamentGame(3, ['Alice', 'Bob', 'Charlie'], [50, 25, 75]));
      expect(state.currentPlayerIndex).toBe(0);

      // P1 takes 3 attempts
      state = makeTournamentGuess(state, 10).state;
      state = makeTournamentGuess(state, 40).state;
      state = makeTournamentGuess(state, 50).state;
      expect(state.players[0].solved).toBe(true);
      expect(state.players[0].attemptsUsed).toBe(3);
      expect(state.stage).toBe('handover');
      expect(state.currentPlayerIndex).toBe(1);

      // P2 takes 1 attempt
      state = acknowledgeHandover(state);
      state = makeTournamentGuess(state, 25).state;
      expect(state.players[1].solved).toBe(true);
      expect(state.players[1].attemptsUsed).toBe(1);
      expect(state.stage).toBe('handover');
      expect(state.currentPlayerIndex).toBe(2);

      // P3 takes 2 attempts
      state = acknowledgeHandover(state);
      state = makeTournamentGuess(state, 20).state;
      state = makeTournamentGuess(state, 75).state;
      expect(state.players[2].solved).toBe(true);
      expect(state.players[2].attemptsUsed).toBe(2);

      // Tournament complete
      expect(state.status).toBe('completed');
      expect(state.winners).toHaveLength(1);
      expect(state.winners[0].name).toBe('Bob');
      expect(state.winners[0].attemptsUsed).toBe(1);
    });

    it('correctly handles joint winners on equal fewest attempts', () => {
      let state = acknowledgeHandover(createTournamentGame(2, ['Red', 'Green'], [30, 60]));
      // Red: 2 attempts
      state = makeTournamentGuess(state, 10).state;
      state = makeTournamentGuess(state, 30).state;

      // Green: 2 attempts
      state = acknowledgeHandover(state);
      state = makeTournamentGuess(state, 10).state;
      state = makeTournamentGuess(state, 60).state;

      expect(state.status).toBe('completed');
      expect(state.winners).toHaveLength(2);
      expect(state.winners.map(w => w.name)).toEqual(['Red', 'Green']);
    });
  });

  describe('Head-to-Head Duel Mode', () => {
    it('executes secret setup, turn alternation, and instant victory', () => {
      let state = createDuelGame('Red Archer', 'Blue Archer');
      // P1 sets target for P2
      state = setPlayer1Secret(state, 40).state;
      state = acknowledgeHandoverToPlayer2Secret(state);
      // P2 sets target for P1
      state = setPlayer2Secret(state, 85).state;
      state = acknowledgeTurnHandover(state);

      expect(state.phase).toBe('playing');
      expect(state.currentTurnPlayerId).toBe(1);

      // Turn 1: P1 guesses 50 against target 85 (lower)
      state = makeDuelGuess(state, 50).state;
      expect(state.p1.lastResult.direction).toBe('lower');
      expect(state.currentTurnPlayerId).toBe(2);
      expect(state.phase).toBe('handover_turn');

      // Handover to P2
      state = acknowledgeTurnHandover(state);
      // Turn 2: P2 guesses 60 against target 40 (higher)
      state = makeDuelGuess(state, 60).state;
      expect(state.p2.lastResult.direction).toBe('higher');
      expect(state.currentTurnPlayerId).toBe(1);

      // Handover to P1
      state = acknowledgeTurnHandover(state);
      // Turn 3: P1 guesses 85 (direct hit!)
      state = makeDuelGuess(state, 85).state;
      expect(state.status).toBe('completed');
      expect(state.phase).toBe('game_over');
      expect(state.winner.name).toBe('Red Archer');
      expect(state.winner.totalGuesses).toBe(2);

      // Verify privacy during and after
      const view = getDuelView(state);
      expect(view.p1.secretNumber).toBe(40);
      expect(view.p2.secretNumber).toBe(85);
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  createTournamentGame,
  makeTournamentGuess,
  acknowledgeHandover,
  calculateTournamentWinners,
  getTournamentView,
  TOURNAMENT_COLORS
} from '../game/tournament/tournamentEngine.js';

describe('Tournament Mode Engine', () => {
  it('validates player count must be between 2 and 4', () => {
    expect(() => createTournamentGame(1)).toThrow();
    expect(() => createTournamentGame(5)).toThrow();
    expect(() => createTournamentGame(3)).not.toThrow();
  });

  it('assigns correct player colours: P1 Red, P2 Green, P3 Blue, P4 Yellow', () => {
    const game = createTournamentGame(4, ['Alice', 'Bob', 'Charlie', 'Dana']);
    expect(game.players[0].color).toBe('Red');
    expect(game.players[1].color).toBe('Green');
    expect(game.players[2].color).toBe('Blue');
    expect(game.players[3].color).toBe('Yellow');
  });

  it('each player receives separate secret number and 10 attempts', () => {
    const secrets = [10, 20, 30];
    const game = createTournamentGame(3, [], secrets);
    expect(game.players[0].secretNumber).toBe(10);
    expect(game.players[1].secretNumber).toBe(20);
    expect(game.players[2].secretNumber).toBe(30);
    game.players.forEach(p => {
      expect(p.attemptsRemaining).toBe(10);
      expect(p.attemptsUsed).toBe(0);
    });
  });

  it('requires handover acknowledgement before guessing starts', () => {
    let state = createTournamentGame(2, [], [25, 50]);
    expect(state.stage).toBe('handover');

    const blocked = makeTournamentGuess(state, 25);
    expect(blocked.error).toContain('handover');

    state = acknowledgeHandover(state);
    expect(state.stage).toBe('turn');
  });

  it('invalid inputs do not consume attempts in tournament', () => {
    let state = acknowledgeHandover(createTournamentGame(2, [], [25, 50]));
    const res = makeTournamentGuess(state, 150); // out of range
    expect(res.error).toBeDefined();
    expect(res.state.players[0].attemptsUsed).toBe(0);
    expect(res.state.players[0].attemptsRemaining).toBe(10);
  });

  it('runs sequential full rounds and transitions between players via handover', () => {
    // 2 players: P1 secret is 25, P2 secret is 50
    let state = acknowledgeHandover(createTournamentGame(2, ['P1', 'P2'], [25, 50]));

    // P1 Turn 1: guess 10 (lower)
    state = makeTournamentGuess(state, 10).state;
    expect(state.currentPlayerIndex).toBe(0);
    expect(state.players[0].attemptsUsed).toBe(1);
    expect(state.players[0].solved).toBe(false);

    // P1 Turn 2: guess 25 (correct! Ends P1 round)
    state = makeTournamentGuess(state, 25).state;
    expect(state.players[0].solved).toBe(true);
    expect(state.players[0].attemptsUsed).toBe(2);
    expect(state.players[0].status).toBe('completed');

    // Automatically transitions to handover for Player 2
    expect(state.currentPlayerIndex).toBe(1);
    expect(state.stage).toBe('handover');
    expect(state.status).toBe('in_progress');

    // Acknowledge handover for P2
    state = acknowledgeHandover(state);
    expect(state.stage).toBe('turn');

    // P2 Turn 1: guess 50 (correct! Solves in 1 attempt)
    state = makeTournamentGuess(state, 50).state;
    expect(state.status).toBe('completed');
    expect(state.stage).toBe('finished');
    expect(state.winners).toHaveLength(1);
    expect(state.winners[0].id).toBe(2); // P2 won with 1 attempt vs P1's 2
  });

  it('awards joint winners when players tie with lowest attempts', () => {
    // P1 secret 20, P2 secret 40, P3 secret 60
    let state = acknowledgeHandover(createTournamentGame(3, ['P1', 'P2', 'P3'], [20, 40, 60]));

    // P1 guesses in 2 attempts
    state = makeTournamentGuess(state, 10).state;
    state = makeTournamentGuess(state, 20).state;

    // P2 handover & guesses in 2 attempts
    state = acknowledgeHandover(state);
    state = makeTournamentGuess(state, 30).state;
    state = makeTournamentGuess(state, 40).state;

    // P3 handover & guesses in 3 attempts
    state = acknowledgeHandover(state);
    state = makeTournamentGuess(state, 10).state;
    state = makeTournamentGuess(state, 20).state;
    state = makeTournamentGuess(state, 60).state;

    expect(state.status).toBe('completed');
    expect(state.winners).toHaveLength(2);
    expect(state.winners.map(w => w.name)).toEqual(['P1', 'P2']);
  });

  it('handles player exhausting 10 attempts without solving', () => {
    let state = acknowledgeHandover(createTournamentGame(2, ['P1', 'P2'], [20, 40]));

    // P1 exhausts 10 attempts
    for (let i = 0; i < 10; i++) {
      state = makeTournamentGuess(state, 1).state;
    }

    expect(state.players[0].solved).toBe(false);
    expect(state.players[0].status).toBe('completed');
    expect(state.currentPlayerIndex).toBe(1);
    expect(state.stage).toBe('handover');

    // P2 solves in 5 attempts
    state = acknowledgeHandover(state);
    for (let i = 0; i < 4; i++) {
      state = makeTournamentGuess(state, 1).state;
    }
    state = makeTournamentGuess(state, 40).state;

    expect(state.status).toBe('completed');
    expect(state.winners).toHaveLength(1);
    expect(state.winners[0].id).toBe(2);
  });

  it('tournament view masks unrevealed secret numbers', () => {
    const game = createTournamentGame(2, ['Alice', 'Bob'], [33, 77]);
    const view = getTournamentView(game);
    expect(view.leaderboard[0].secretNumber).toBeNull();
    expect(view.leaderboard[1].secretNumber).toBeNull();
  });
});

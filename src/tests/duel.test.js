import { describe, it, expect } from 'vitest';
import {
  createDuelGame,
  setPlayer1Secret,
  acknowledgeHandoverToPlayer2Secret,
  setPlayer2Secret,
  acknowledgeTurnHandover,
  makeDuelGuess,
  getDuelView
} from '../game/duel/duelEngine.js';

describe('Head-to-Head Duel Mode Engine', () => {
  it('initializes duel with Player 1 (Red) and Player 2 (Blue)', () => {
    const duel = createDuelGame('Red Archer', 'Blue Archer');
    expect(duel.p1.name).toBe('Red Archer');
    expect(duel.p1.color).toBe('Red');
    expect(duel.p2.name).toBe('Blue Archer');
    expect(duel.p2.color).toBe('Blue');
    expect(duel.phase).toBe('setting_p1_secret');
    expect(duel.status).toBe('setup');
  });

  it('validates and handles secret setup sequence between players', () => {
    let state = createDuelGame();

    // P1 sets secret for P2
    const badP1 = setPlayer1Secret(state, 150);
    expect(badP1.error).toBeDefined();

    state = setPlayer1Secret(state, 45).state;
    expect(state.p1.secretSetForOpponent).toBe(45);
    expect(state.p2.targetToGuess).toBe(45);
    expect(state.phase).toBe('handover_p2_secret');

    // Handover to P2
    state = acknowledgeHandoverToPlayer2Secret(state);
    expect(state.phase).toBe('setting_p2_secret');

    // P2 sets secret for P1
    state = setPlayer2Secret(state, 80).state;
    expect(state.p2.secretSetForOpponent).toBe(80);
    expect(state.p1.targetToGuess).toBe(80);
    expect(state.phase).toBe('handover_duel_start');
    expect(state.status).toBe('playing');
    expect(state.currentTurnPlayerId).toBe(1);
  });

  it('alternates turns between P1 and P2 with handover phase', () => {
    let state = createDuelGame('P1', 'P2');
    state = setPlayer1Secret(state, 40).state; // Target for P2 is 40
    state = acknowledgeHandoverToPlayer2Secret(state);
    state = setPlayer2Secret(state, 75).state; // Target for P1 is 75

    // Start duel
    state = acknowledgeTurnHandover(state);
    expect(state.phase).toBe('playing');
    expect(state.currentTurnPlayerId).toBe(1);

    // Turn 1: P1 guesses 50 against target 75 (lower)
    state = makeDuelGuess(state, 50).state;
    expect(state.p1.turnsTaken).toBe(1);
    expect(state.totalTurns).toBe(1);
    expect(state.p1.lastResult.direction).toBe('lower');
    expect(state.p1.lastResult.feedbackText).toBe('You guessed it lower');
    expect(state.currentTurnPlayerId).toBe(2);
    expect(state.phase).toBe('handover_turn');

    // Handover to P2
    state = acknowledgeTurnHandover(state);
    expect(state.currentTurnPlayerId).toBe(2);

    // Turn 2: P2 guesses 60 against target 40 (higher)
    state = makeDuelGuess(state, 60).state;
    expect(state.p2.turnsTaken).toBe(1);
    expect(state.totalTurns).toBe(2);
    expect(state.p2.lastResult.direction).toBe('higher');
    expect(state.p2.lastResult.feedbackText).toBe('You guessed it higher');
    expect(state.currentTurnPlayerId).toBe(1);
  });

  it('invalid guesses do not consume turns in Duel mode', () => {
    let state = createDuelGame();
    state = setPlayer1Secret(state, 40).state;
    state = acknowledgeHandoverToPlayer2Secret(state);
    state = setPlayer2Secret(state, 75).state;
    state = acknowledgeTurnHandover(state);

    const badGuess = makeDuelGuess(state, 'invalid');
    expect(badGuess.error).toBeDefined();
    expect(badGuess.state.p1.turnsTaken).toBe(0);
    expect(badGuess.state.totalTurns).toBe(0);
    expect(badGuess.state.currentTurnPlayerId).toBe(1);
  });

  it('first correct guess wins instantly with accurate winner statistics', () => {
    let state = createDuelGame('Alice', 'Bob');
    state = setPlayer1Secret(state, 30).state; // Bob must guess 30
    state = acknowledgeHandoverToPlayer2Secret(state);
    state = setPlayer2Secret(state, 90).state; // Alice must guess 90
    state = acknowledgeTurnHandover(state);

    // Alice guess 50 (lower)
    state = makeDuelGuess(state, 50).state;
    state = acknowledgeTurnHandover(state);

    // Bob guess 30 (correct!)
    state = makeDuelGuess(state, 30).state;
    expect(state.status).toBe('completed');
    expect(state.phase).toBe('game_over');
    expect(state.winner).toEqual({
      id: 2,
      name: 'Bob',
      color: 'Blue',
      totalGuesses: 1
    });
  });

  it('CRITICAL PRIVACY: getDuelView never leaks secret numbers during active gameplay', () => {
    let state = createDuelGame();
    state = setPlayer1Secret(state, 22).state;
    state = acknowledgeHandoverToPlayer2Secret(state);
    state = setPlayer2Secret(state, 88).state;
    state = acknowledgeTurnHandover(state);

    const activeView = getDuelView(state);
    expect(activeView.p1.secretNumber).toBeNull();
    expect(activeView.p2.secretNumber).toBeNull();
    expect(activeView.activePlayer.targetToGuess).toBeUndefined();

    // After game over, secrets are revealed
    state = makeDuelGuess(state, 88).state;
    const finalView = getDuelView(state);
    expect(finalView.p1.secretNumber).toBe(22);
    expect(finalView.p2.secretNumber).toBe(88);
    expect(finalView.winner.name).toBe('Player 1');
  });
});

import React, { useState, useRef } from 'react';
import ArcheryArena from '../components/ArcheryArena';
import {
  createDuelGame,
  setPlayer1Secret,
  acknowledgeHandoverToPlayer2Secret,
  setPlayer2Secret,
  acknowledgeTurnHandover,
  makeDuelGuess,
  getDuelView
} from '../game/duel/duelEngine';

/**
 * Head-to-Head Duel Mode Screens matching Stitch exports:
 * - duel_setup.html
 * - secret_target_entry.html
 * - player_handover.html
 * - duel_combat.html
 * - duel_results.html
 */
export default function DuelScreen({ onBackToMenu }) {
  // Setup state
  const [phase, setPhase] = useState('setup'); // 'setup' | 'game'
  const [p1Name, setP1Name] = useState('Archer Red');
  const [p2Name, setP2Name] = useState('Archer Blue');

  // Active game engine state
  const [gameState, setGameState] = useState(null);
  const [displayedState, setDisplayedState] = useState(null);
  const [secretInput, setSecretInput] = useState('');
  const [guessInput, setGuessInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isShooting, setIsShooting] = useState(false);
  const [flightStatus, setFlightStatus] = useState(null);
  const arenaRef = useRef(null);
  const pendingStateRef = useRef(null);

  const view = (displayedState || gameState) ? getDuelView(displayedState || gameState) : null;

  const handleStartDuelSetup = () => {
    const duel = createDuelGame(p1Name, p2Name);
    setGameState(duel);
    setDisplayedState(duel);
    pendingStateRef.current = null;
    setFlightStatus(null);
    setIsShooting(false);
    setPhase('game');
    setSecretInput('');
    setErrorMessage('');
  };

  // Step 1: P1 sets secret
  const handleP1SecretSubmit = (e) => {
    e?.preventDefault();
    setErrorMessage('');
    const res = setPlayer1Secret(gameState, secretInput);
    if (res.error) {
      setErrorMessage(res.error);
      return;
    }
    setGameState(res.state);
    setDisplayedState(res.state);
    setSecretInput('');
  };

  // Handover to P2 for secret setting
  const handleHandoverToP2Secret = () => {
    const next = acknowledgeHandoverToPlayer2Secret(gameState);
    setGameState(next);
    setDisplayedState(next);
    setSecretInput('');
    setErrorMessage('');
  };

  // Step 2: P2 sets secret
  const handleP2SecretSubmit = (e) => {
    e?.preventDefault();
    setErrorMessage('');
    const res = setPlayer2Secret(gameState, secretInput);
    if (res.error) {
      setErrorMessage(res.error);
      return;
    }
    setGameState(res.state);
    setDisplayedState(res.state);
    setSecretInput('');
  };

  // Handover acknowledge for battle turns
  const handleAcknowledgeTurnHandover = () => {
    const next = acknowledgeTurnHandover(gameState);
    setGameState(next);
    setDisplayedState(next);
    pendingStateRef.current = null;
    setFlightStatus(null);
    setIsShooting(false);
    setGuessInput('');
    setErrorMessage('');
    if (arenaRef.current) {
      arenaRef.current.reset();
    }
  };

  // Live Turn Guess
  const handleDuelGuessSubmit = (e) => {
    e?.preventDefault();
    if (isShooting || flightStatus || !gameState || gameState.phase !== 'playing') return;
    setErrorMessage('');

    const res = makeDuelGuess(gameState, guessInput);
    if (res.error) {
      setErrorMessage(res.error);
      return;
    }

    const nextState = res.state;
    const isP1 = gameState.currentTurnPlayerId === 1;
    const activePlayerColor = isP1 ? 'Red' : 'Blue';
    const lastResult = isP1 ? nextState.p1.lastResult : nextState.p2.lastResult;

    setIsShooting(true);
    setFlightStatus('tracking');
    pendingStateRef.current = nextState;
    setGuessInput('');

    // Trigger visual shot in arena with player's color
    if (arenaRef.current && lastResult) {
      arenaRef.current.shoot(lastResult.direction, lastResult.difference, activePlayerColor);
    }
  };

  const handleImpact = () => {
    if (pendingStateRef.current) {
      setGameState(pendingStateRef.current);
      setDisplayedState(pendingStateRef.current);
      pendingStateRef.current = null;
    }
    setFlightStatus(null);
    setIsShooting(false);
  };

  // --- VIEW 1: DUEL NAMES SETUP ---
  if (phase === 'setup') {
    return (
      <div className="w-full min-h-screen pt-16 flex flex-col bg-[#111414] select-none text-[#e1e3e2]">
        <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
          <button
            onClick={onBackToMenu}
            className="flex items-center gap-1.5 text-xs font-['JetBrains_Mono'] text-[#9b8f7d] hover:text-[#f0bf5c] transition-colors mb-6 bg-[#191c1c] px-3 py-1.5 rounded border border-[#323535]"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>BACK TO MENU</span>
          </button>

          <div className="bg-[#191c1c] border border-[#323535] rounded-xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#3b82f6]/20 flex items-center justify-center text-[#3b82f6]">
                <span className="material-symbols-outlined text-2xl">swords</span>
              </div>
              <div>
                <h1 className="font-['Space_Grotesk'] text-2xl font-bold uppercase tracking-wider text-[#e1e3e2]">
                  1v1 Duel Setup
                </h1>
                <p className="font-['Space_Grotesk'] text-xs text-[#9b8f7d]">
                  Two combatants designate secret targets for each other (Range: 1–100)
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="p-4 rounded-lg bg-[#0c0f0f] border border-[#ef4444]/40">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full bg-[#ef4444]" />
                  <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#ef4444]">
                    PLAYER 1 (RED ARCHER):
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={18}
                  value={p1Name}
                  onChange={(e) => setP1Name(e.target.value)}
                  className="w-full bg-[#191c1c] border border-[#323535] rounded-lg px-3 py-2 text-sm font-['Space_Grotesk'] text-[#e1e3e2] focus:outline-none focus:border-[#ef4444]"
                />
              </div>

              <div className="p-4 rounded-lg bg-[#0c0f0f] border border-[#3b82f6]/40">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full bg-[#3b82f6]" />
                  <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#3b82f6]">
                    PLAYER 2 (BLUE ARCHER):
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={18}
                  value={p2Name}
                  onChange={(e) => setP2Name(e.target.value)}
                  className="w-full bg-[#191c1c] border border-[#323535] rounded-lg px-3 py-2 text-sm font-['Space_Grotesk'] text-[#e1e3e2] focus:outline-none focus:border-[#3b82f6]"
                />
              </div>
            </div>

            <button
              onClick={handleStartDuelSetup}
              className="w-full py-4 bg-[#3b82f6] text-[#ffffff] font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-[#60a5fa] transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer"
            >
              <span>PROCEED TO TARGET ENTRY</span>
              <span className="material-symbols-outlined text-lg">lock</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: P1 SECRET SETTING ---
  if (gameState.phase === 'setting_p1_secret') {
    return (
      <div className="w-full min-h-screen pt-16 flex flex-col bg-[#111414] select-none text-[#e1e3e2] items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#191c1c] border border-[#ef4444]/40 rounded-xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 text-xs font-['JetBrains_Mono'] text-[#ef4444] mb-2 uppercase tracking-wider">
            <span className="material-symbols-outlined text-sm">visibility_off</span>
            CONFIDENTIAL TARGET ENTRY
          </div>
          <h2 className="font-['Space_Grotesk'] text-2xl font-bold uppercase text-[#e1e3e2] mb-1">
            {gameState.p1.name} (RED)
          </h2>
          <p className="font-['Space_Grotesk'] text-xs text-[#9b8f7d] mb-6">
            Enter a secret number (1–100) that <strong>{gameState.p2.name}</strong> will attempt to hit.
          </p>

          <form onSubmit={handleP1SecretSubmit}>
            <input
              type="password"
              inputMode="numeric"
              maxLength={3}
              value={secretInput}
              onChange={(e) => setSecretInput(e.target.value)}
              placeholder="Enter secret (1–100)..."
              className="w-full px-4 py-3 bg-[#0c0f0f] border border-[#323535] rounded-xl text-center text-2xl font-['JetBrains_Mono'] tracking-widest text-[#f0bf5c] focus:outline-none focus:border-[#ef4444] mb-3"
            />

            {errorMessage && (
              <div className="mb-4 text-xs font-['JetBrains_Mono'] text-[#ffb4ab] text-center">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={!secretInput}
              className="w-full py-3.5 bg-[#ef4444] text-white font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-[#f87171] transition-all cursor-pointer disabled:opacity-40"
            >
              LOCK TARGET & PASS DEVICE
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- VIEW 3: HANDOVER TO P2 ---
  if (gameState.phase === 'handover_p2_secret') {
    return (
      <div className="w-full min-h-screen pt-16 flex flex-col bg-[#111414] select-none text-[#e1e3e2] items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#191c1c] border border-[#323535] rounded-xl p-8 text-center shadow-2xl">
          <span className="material-symbols-outlined text-5xl text-[#3b82f6] mb-3">screen_rotation</span>
          <div className="text-xs font-['JetBrains_Mono'] uppercase tracking-wider text-[#9b8f7d] mb-1">
            PASS DEVICE TO
          </div>
          <h2 className="font-['Space_Grotesk'] text-2xl font-bold uppercase text-[#3b82f6]">
            {gameState.p2.name} (BLUE)
          </h2>
          <p className="font-['Space_Grotesk'] text-xs text-[#9b8f7d] my-6">
            Ensure Player 1 cannot see the screen before continuing.
          </p>
          <button
            onClick={handleHandoverToP2Secret}
            className="w-full py-3.5 bg-[#3b82f6] text-white font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-[#60a5fa] transition-all cursor-pointer"
          >
            I AM READY — SET MY TARGET
          </button>
        </div>
      </div>
    );
  }

  // --- VIEW 4: P2 SECRET SETTING ---
  if (gameState.phase === 'setting_p2_secret') {
    return (
      <div className="w-full min-h-screen pt-16 flex flex-col bg-[#111414] select-none text-[#e1e3e2] items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#191c1c] border border-[#3b82f6]/40 rounded-xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 text-xs font-['JetBrains_Mono'] text-[#3b82f6] mb-2 uppercase tracking-wider">
            <span className="material-symbols-outlined text-sm">visibility_off</span>
            CONFIDENTIAL TARGET ENTRY
          </div>
          <h2 className="font-['Space_Grotesk'] text-2xl font-bold uppercase text-[#e1e3e2] mb-1">
            {gameState.p2.name} (BLUE)
          </h2>
          <p className="font-['Space_Grotesk'] text-xs text-[#9b8f7d] mb-6">
            Enter a secret number (1–100) that <strong>{gameState.p1.name}</strong> will attempt to hit.
          </p>

          <form onSubmit={handleP2SecretSubmit}>
            <input
              type="password"
              inputMode="numeric"
              maxLength={3}
              value={secretInput}
              onChange={(e) => setSecretInput(e.target.value)}
              placeholder="Enter secret (1–100)..."
              className="w-full px-4 py-3 bg-[#0c0f0f] border border-[#323535] rounded-xl text-center text-2xl font-['JetBrains_Mono'] tracking-widest text-[#f0bf5c] focus:outline-none focus:border-[#3b82f6] mb-3"
            />

            {errorMessage && (
              <div className="mb-4 text-xs font-['JetBrains_Mono'] text-[#ffb4ab] text-center">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={!secretInput}
              className="w-full py-3.5 bg-[#3b82f6] text-white font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-[#60a5fa] transition-all cursor-pointer disabled:opacity-40"
            >
              LOCK TARGET & START DUEL
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- VIEW 5: HANDOVER BETWEEN TURNS OR START ---
  if (gameState.phase === 'handover_duel_start' || gameState.phase === 'handover_turn') {
    const isP1 = gameState.currentTurnPlayerId === 1;
    const activePlayer = isP1 ? gameState.p1 : gameState.p2;
    return (
      <div className="w-full min-h-screen pt-16 flex flex-col bg-[#111414] select-none text-[#e1e3e2] items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#191c1c] border border-[#323535] rounded-xl p-8 text-center shadow-2xl">
          <span className="material-symbols-outlined text-5xl text-[#f0bf5c] mb-3">screen_rotation</span>
          <div className="text-xs font-['JetBrains_Mono'] uppercase tracking-wider text-[#9b8f7d] mb-1">
            PASS DEVICE FOR NEXT TURN
          </div>
          <h2 className="font-['Space_Grotesk'] text-2xl font-bold uppercase text-[#e1e3e2]">
            TURN PASS TO:
          </h2>
          <div className="my-6 p-4 rounded-xl bg-[#0c0f0f] border border-[#323535] flex items-center justify-center gap-3">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: activePlayer.colorHex }} />
            <span className="font-['Space_Grotesk'] text-xl font-bold text-[#e1e3e2]">
              {activePlayer.name} ({activePlayer.color})
            </span>
          </div>
          <button
            onClick={handleAcknowledgeTurnHandover}
            className="w-full py-3.5 bg-[#f0bf5c] text-[#412d00] font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-[#ffdea4] transition-all cursor-pointer shadow-lg"
          >
            I AM READY — TAKE SHOT
          </button>
        </div>
      </div>
    );
  }

  // --- VIEW 6: DUEL GAME OVER RESULTS ---
  if (gameState.phase === 'game_over') {
    return (
      <div className="w-full min-h-screen pt-16 flex flex-col bg-[#111414] select-none text-[#e1e3e2] p-4 sm:p-8">
        <div className="max-w-2xl mx-auto w-full bg-[#191c1c] border border-[#323535] rounded-xl p-6 sm:p-8 shadow-2xl text-center">
          <span className="material-symbols-outlined text-6xl text-[#f0bf5c] mb-2 animate-bounce">
            emoji_events
          </span>
          <h1 className="font-['Space_Grotesk'] text-3xl font-extrabold uppercase text-[#e1e3e2]">
            VICTORY IN DUEL
          </h1>
          <p className="font-['Space_Grotesk'] text-sm text-[#9b8f7d] mt-1">
            Direct Bullseye Elimination
          </p>

          <div className="my-6 p-4 rounded-xl bg-[#0c0f0f] border border-[#f0bf5c]/40 text-[#f0bf5c]">
            <div className="text-xs font-['JetBrains_Mono'] uppercase tracking-widest text-[#9b8f7d]">
              VICTOR
            </div>
            <div className="font-['Space_Grotesk'] text-2xl font-bold mt-1">
              {view.winner?.name} ({view.winner?.color})
            </div>
            <div className="text-xs font-['JetBrains_Mono'] text-[#d2c5b1] mt-1">
              SOLVED TARGET IN {view.winner?.totalGuesses} TURNS
            </div>
          </div>

          {/* Targets Reveal */}
          <div className="grid grid-cols-2 gap-4 mb-8 text-left">
            <div className="p-3 bg-[#0c0f0f] rounded-lg border border-[#ef4444]/40">
              <div className="text-[11px] font-['JetBrains_Mono'] text-[#ef4444] font-bold">
                {view.p1.name}'s SECRET TARGET:
              </div>
              <div className="font-['Space_Grotesk'] text-xl font-extrabold text-[#e1e3e2] mt-1">
                {view.p1.secretNumber}
              </div>
            </div>
            <div className="p-3 bg-[#0c0f0f] rounded-lg border border-[#3b82f6]/40">
              <div className="text-[11px] font-['JetBrains_Mono'] text-[#3b82f6] font-bold">
                {view.p2.name}'s SECRET TARGET:
              </div>
              <div className="font-['Space_Grotesk'] text-xl font-extrabold text-[#e1e3e2] mt-1">
                {view.p2.secretNumber}
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setPhase('setup')}
              className="px-6 py-3 bg-[#3b82f6] text-white font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#60a5fa] transition-colors"
            >
              REMATCH DUEL
            </button>
            <button
              onClick={onBackToMenu}
              className="px-6 py-3 bg-[#282a2a] text-[#e1e3e2] font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#323535] transition-colors"
            >
              MAIN MENU
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 7: ACTIVE COMBAT GUESSING ---
  const active = view?.activePlayer;

  return (
    <div className="w-full min-h-screen pt-16 flex flex-col bg-[#111414] select-none text-[#e1e3e2]">
      {/* Active Duel Status Bar */}
      <div className="w-full bg-[#191c1c] border-b border-[#323535] px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: active?.colorHex }} />
          <span className="font-['Space_Grotesk'] font-bold text-sm text-[#e1e3e2]">
            {active?.name} ({active?.color})
          </span>
          <span className="text-xs font-['JetBrains_Mono'] text-[#9b8f7d] px-2 py-0.5 rounded bg-[#282a2a]">
            TURN #{view.totalTurns + 1}
          </span>
        </div>

        <div className="text-xs font-['JetBrains_Mono'] text-[#d2c5b1]">
          <span className="text-[#9b8f7d]">OBJECTIVE: </span>
          <span className="text-[#f0bf5c] font-bold">GUESS OPPONENT'S TARGET</span>
        </div>
      </div>

      {/* 3D Viewport */}
      <div className="relative w-full h-[50vh] sm:h-[55vh] min-h-[380px] bg-[#0c0f0f] overflow-hidden border-b border-[#323535]">
        <ArcheryArena
          ref={arenaRef}
          playerColor={active?.color}
          onImpact={handleImpact}
        />

        {/* Suspense Indicator while Arrow is in Flight */}
        {flightStatus === 'tracking' && (
          <div className="absolute top-4 right-4 z-10 max-w-sm animate-pulse pointer-events-none">
            <div className="px-4 py-2.5 rounded-lg border border-[#f0bf5c]/60 bg-[#191c1c]/90 backdrop-blur-md shadow-2xl flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl text-[#f0bf5c] animate-spin">
                radar
              </span>
              <div>
                <div className="text-xs font-['JetBrains_Mono'] text-[#f0bf5c] font-bold tracking-widest uppercase">
                  ARROW IN FLIGHT...
                </div>
                <div className="font-['Space_Grotesk'] text-xs text-[#d2c5b1]">
                  Tracking trajectory for {active?.name}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live Feedback Banner (Revealed only after impact) */}
        {!flightStatus && active?.lastResult && (
          <div className="absolute top-4 right-4 z-10 max-w-sm animate-fade-in">
            <div className={`px-4 py-2.5 rounded-lg border backdrop-blur-md shadow-xl flex items-center gap-3 ${
              active.lastResult.direction === 'correct'
                ? 'bg-[#059669]/20 border-[#10b981] text-[#10b981]'
                : active.lastResult.direction === 'higher'
                ? 'bg-[#dc2626]/20 border-[#ef4444] text-[#ef4444]'
                : 'bg-[#2563eb]/20 border-[#3b82f6] text-[#3b82f6]'
            }`}>
              <span className="material-symbols-outlined text-2xl">
                {active.lastResult.direction === 'correct' ? 'verified' : active.lastResult.direction === 'higher' ? 'arrow_upward' : 'arrow_downward'}
              </span>
              <div>
                <div className="text-xs font-['JetBrains_Mono'] uppercase tracking-wider opacity-80">
                  Turn #{active.lastResult.turnNumber}: {active.lastResult.guess}
                </div>
                <div className="font-['Space_Grotesk'] text-sm font-bold">
                  {active.lastResult.feedbackText}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Guess Input Bar */}
      <div className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 flex flex-col justify-between">
        <form onSubmit={handleDuelGuessSubmit} className="w-full">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#9b8f7d]">
                crisis_alert
              </span>
              <input
                type="number"
                disabled={isShooting || flightStatus}
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value)}
                placeholder="Enter guess against opponent's target (1–100)..."
                className="w-full pl-12 pr-4 py-3.5 bg-[#191c1c] border border-[#323535] rounded-xl text-[#e1e3e2] placeholder-[#64748b] font-['JetBrains_Mono'] text-base focus:outline-none focus:border-[#f0bf5c] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isShooting || flightStatus || !guessInput}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#3b82f6] text-white font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-[#60a5fa] active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>{flightStatus || isShooting ? 'FIRING...' : 'RELEASE ARROW'}</span>
              <span className="material-symbols-outlined text-lg">play_arrow</span>
            </button>
          </div>

          {errorMessage && (
            <div className="mt-2 text-xs font-['JetBrains_Mono'] text-[#ffb4ab] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">warning</span>
              <span>{errorMessage}</span>
            </div>
          )}
        </form>

        {/* History of Shots for Active Player */}
        <div className="mt-6 border-t border-[#323535] pt-4">
          <div className="text-xs font-['JetBrains_Mono'] text-[#9b8f7d] uppercase tracking-wider mb-2">
            YOUR DUEL SHOTS ({active?.guesses.length || 0})
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {(!active?.guesses || active.guesses.length === 0) ? (
              <span className="text-xs font-['JetBrains_Mono'] text-[#64748b]">No shots fired yet in this duel.</span>
            ) : (
              active.guesses.map((g, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-['JetBrains_Mono'] flex items-center gap-2 shrink-0 ${
                    g.direction === 'correct'
                      ? 'bg-[#059669]/10 border-[#10b981] text-[#10b981]'
                      : g.direction === 'higher'
                      ? 'bg-[#dc2626]/10 border-[#ef4444] text-[#ef4444]'
                      : 'bg-[#2563eb]/10 border-[#3b82f6] text-[#3b82f6]'
                  }`}
                >
                  <span className="opacity-60">Turn {g.turnNumber}:</span>
                  <strong className="text-sm">{g.guess}</strong>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import ArcheryArena from '../components/ArcheryArena';
import {
  createSinglePlayerGame,
  makeSinglePlayerGuess,
  getSinglePlayerView
} from '../game/singlePlayer/singlePlayerEngine';

/**
 * Single Player Screen matching the Stitch single_player_arena.html export.
 * Features:
 * - Level 1 / Level 2 selector tabs
 * - Full 3D Archery Arena viewport with side-view archer & target
 * - Tactical HUD: Attempt counter, range bounds, feedback ticker, Extreme Hint badge
 * - Guess Input bar with instant feedback & history log
 * - Game over / victory overlays with Reset / New Round actions
 */
export default function SinglePlayerScreen({ onBackToMenu }) {
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState(() => createSinglePlayerGame(1));
  const [inputVal, setInputVal] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isShooting, setIsShooting] = useState(false);
  const arenaRef = useRef(null);

  const view = getSinglePlayerView(gameState);

  const startNewGame = (lvl = level) => {
    setLevel(lvl);
    setGameState(createSinglePlayerGame(lvl));
    setInputVal('');
    setErrorMessage('');
    setIsShooting(false);
    if (arenaRef.current) {
      arenaRef.current.reset();
    }
  };

  const handleLevelChange = (newLvl) => {
    if (newLvl !== level) {
      startNewGame(newLvl);
    }
  };

  const handleGuessSubmit = (e) => {
    e?.preventDefault();
    if (isShooting || view.status !== 'playing') return;
    setErrorMessage('');

    const res = makeSinglePlayerGuess(gameState, inputVal);
    if (res.error) {
      setErrorMessage(res.error);
      return;
    }

    const nextState = res.state;
    const lastResult = nextState.lastResult;
    setIsShooting(true);

    // Trigger visual shot in Three.js arena
    if (arenaRef.current) {
      arenaRef.current.shoot(lastResult.direction, lastResult.difference, 'Red');
    }

    // Update state after slight delay or immediately
    setGameState(nextState);
    setInputVal('');

    setTimeout(() => {
      setIsShooting(false);
    }, 1200);
  };

  return (
    <div className="w-full min-h-screen pt-16 flex flex-col bg-[#111414] select-none text-[#e1e3e2]">
      {/* Top Level Selector & Control Header */}
      <div className="w-full bg-[#191c1c] border-b border-[#323535] px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToMenu}
            className="flex items-center gap-1.5 text-xs font-['JetBrains_Mono'] text-[#9b8f7d] hover:text-[#f0bf5c] transition-colors bg-[#282a2a] px-3 py-1.5 rounded"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>BACK</span>
          </button>

          {/* Level Tabs */}
          <div className="flex items-center gap-1 bg-[#0c0f0f] p-1 rounded-lg border border-[#323535]">
            <button
              onClick={() => handleLevelChange(1)}
              className={`px-3 py-1 text-xs font-['Space_Grotesk'] font-bold rounded-md transition-all ${
                level === 1
                  ? 'bg-[#f0bf5c] text-[#412d00] shadow'
                  : 'text-[#9b8f7d] hover:text-[#e1e3e2]'
              }`}
            >
              LEVEL 1 (1–100)
            </button>
            <button
              onClick={() => handleLevelChange(2)}
              className={`px-3 py-1 text-xs font-['Space_Grotesk'] font-bold rounded-md transition-all ${
                level === 2
                  ? 'bg-[#f0bf5c] text-[#412d00] shadow'
                  : 'text-[#9b8f7d] hover:text-[#e1e3e2]'
              }`}
            >
              LEVEL 2 (1–1000)
            </button>
          </div>
        </div>

        {/* Telemetry / Target Range Specs */}
        <div className="flex items-center gap-4 text-xs font-['JetBrains_Mono']">
          <div className="flex items-center gap-1.5 text-[#d2c5b1]">
            <span className="text-[#9b8f7d]">RANGE:</span>
            <span className="text-[#f0bf5c] font-bold">[{view.min} — {view.max}]</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#d2c5b1]">
            <span className="text-[#9b8f7d]">ATTEMPTS:</span>
            <span className={`font-bold ${view.attemptsRemaining <= 3 ? 'text-[#ffb4ab]' : 'text-[#10b981]'}`}>
              {view.attemptsRemaining} / {view.maxAttempts}
            </span>
          </div>
        </div>
      </div>

      {/* Main 3D Viewport with Tactical HUD Overlays */}
      <div className="relative w-full h-[50vh] sm:h-[55vh] min-h-[380px] bg-[#0c0f0f] overflow-hidden border-b border-[#323535]">
        {/* Three.js Archery Arena */}
        <ArcheryArena
          ref={arenaRef}
          playerColor="Red"
        />

        {/* Tactical Crosshair / Range Overlay Details */}
        <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-1.5 z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0c0f0f]/80 backdrop-blur border border-[#323535] text-[11px] font-['JetBrains_Mono'] text-[#9b8f7d]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            SOLO OPTICS: RED ARCHER
          </div>

          {/* Extreme Hint Indicator */}
          {level === 2 && (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded backdrop-blur border text-[11px] font-['JetBrains_Mono'] ${
              gameState.extremeHintUsed
                ? 'bg-[#282a2a]/80 border-[#4e4637] text-[#9b8f7d]'
                : 'bg-[#f0bf5c]/10 border-[#f0bf5c]/40 text-[#f0bf5c]'
            }`}>
              <span className="material-symbols-outlined text-[14px]">bolt</span>
              {gameState.extremeHintUsed ? 'EXTREME HINT: SPENT' : 'EXTREME HINT: ARMED (>500)'}
            </div>
          )}
        </div>

        {/* Live Feedback Banner */}
        {view.lastResult && (
          <div className="absolute top-4 right-4 z-10 max-w-sm animate-fade-in">
            <div className={`px-4 py-2.5 rounded-lg border backdrop-blur-md shadow-xl flex items-center gap-3 ${
              view.lastResult.direction === 'correct'
                ? 'bg-[#059669]/20 border-[#10b981] text-[#10b981]'
                : view.lastResult.direction === 'higher'
                ? 'bg-[#dc2626]/20 border-[#ef4444] text-[#ef4444]'
                : 'bg-[#2563eb]/20 border-[#3b82f6] text-[#3b82f6]'
            }`}>
              <span className="material-symbols-outlined text-2xl">
                {view.lastResult.direction === 'correct' ? 'verified' : view.lastResult.direction === 'higher' ? 'arrow_upward' : 'arrow_downward'}
              </span>
              <div>
                <div className="text-xs font-['JetBrains_Mono'] uppercase tracking-wider opacity-80">
                  Shot #{view.lastResult.attemptNumber}: {view.lastResult.guess}
                </div>
                <div className="font-['Space_Grotesk'] text-sm font-bold">
                  {view.lastResult.feedbackText}
                </div>
                {view.lastResult.extremeHint && (
                  <div className="font-['JetBrains_Mono'] text-xs font-extrabold text-[#f0bf5c] mt-0.5 animate-pulse">
                    ⚠️ EXTREME HINT: {view.lastResult.extremeHint}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Victory / Game Over Overlay */}
        {(view.status === 'won' || view.status === 'lost') && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-20 flex items-center justify-center p-6 animate-fade-in">
            <div className="max-w-md w-full bg-[#191c1c] border border-[#323535] rounded-xl p-6 text-center shadow-2xl">
              <span className={`material-symbols-outlined text-5xl mb-2 ${
                view.status === 'won' ? 'text-[#10b981]' : 'text-[#ffb4ab]'
              }`}>
                {view.status === 'won' ? 'emoji_events' : 'sentiment_dissatisfied'}
              </span>

              <h2 className="font-['Space_Grotesk'] text-2xl font-bold uppercase text-[#e1e3e2]">
                {view.status === 'won' ? 'BULLSEYE! TARGET SOLVED' : 'QUIVER DEPLETED'}
              </h2>

              <p className="font-['Space_Grotesk'] text-sm text-[#9b8f7d] mt-2">
                {view.status === 'won'
                  ? `Outstanding marksmanship! You solved the secret in ${view.attemptsUsed} attempts.`
                  : 'You have exhausted all available arrows.'}
              </p>

              <div className="my-4 py-3 bg-[#0c0f0f] rounded-lg border border-[#323535] font-['JetBrains_Mono'] text-sm">
                <span className="text-[#9b8f7d]">SECRET NUMBER: </span>
                <span className="text-[#f0bf5c] font-extrabold text-lg">{view.secretNumber}</span>
              </div>

              <div className="flex gap-3 justify-center mt-6">
                <button
                  onClick={() => startNewGame(level)}
                  className="px-5 py-2.5 bg-[#f0bf5c] text-[#412d00] font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#ffdea4] transition-colors"
                >
                  PLAY AGAIN
                </button>
                <button
                  onClick={onBackToMenu}
                  className="px-5 py-2.5 bg-[#282a2a] text-[#e1e3e2] font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#323535] transition-colors"
                >
                  MAIN MENU
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Tactical Controls & Guess Input Bar */}
      <div className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 flex flex-col justify-between">
        {/* Guess Form */}
        <form onSubmit={handleGuessSubmit} className="w-full">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#9b8f7d]">
                crisis_alert
              </span>
              <input
                type="number"
                disabled={view.status !== 'playing' || isShooting}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={`Enter your guess (${view.min}–${view.max})...`}
                className="w-full pl-12 pr-4 py-3.5 bg-[#191c1c] border border-[#323535] rounded-xl text-[#e1e3e2] placeholder-[#64748b] font-['JetBrains_Mono'] text-base focus:outline-none focus:border-[#f0bf5c] transition-colors disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={view.status !== 'playing' || isShooting || !inputVal}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#f0bf5c] text-[#412d00] font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-[#ffdea4] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>{isShooting ? 'FIRING...' : 'RELEASE SHOT'}</span>
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

        {/* Guess History Ticker */}
        <div className="mt-6 border-t border-[#323535] pt-4">
          <div className="text-xs font-['JetBrains_Mono'] text-[#9b8f7d] uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>TRAJECTORY TELEMETRY LOG</span>
            <span>{view.guesses.length} SHOTS FIRED</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {view.guesses.length === 0 ? (
              <span className="text-xs font-['JetBrains_Mono'] text-[#64748b]">No shots recorded yet. Enter a number to aim your bow.</span>
            ) : (
              view.guesses.map((g, idx) => (
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
                  <span className="opacity-60">#{g.attemptNumber}:</span>
                  <strong className="text-sm">{g.guess}</strong>
                  <span className="material-symbols-outlined text-sm">
                    {g.direction === 'correct' ? 'check' : g.direction === 'higher' ? 'north' : 'south'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

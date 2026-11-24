import React, { useState, useRef } from 'react';
import ArcheryArena from '../components/ArcheryArena';
import {
  createTournamentGame,
  makeTournamentGuess,
  acknowledgeHandover,
  getTournamentView,
  TOURNAMENT_COLORS
} from '../game/tournament/tournamentEngine';

/**
 * Tournament Mode Screens matching Stitch exports:
 * - tournament_setup.html
 * - player_handover.html
 * - tournament_live_round.html
 * - tournament_results.html
 */
export default function TournamentScreen({ onBackToMenu }) {
  // Phase: 'setup' | 'game'
  const [phase, setPhase] = useState('setup');
  const [playerCount, setPlayerCount] = useState(2);
  const [playerNames, setPlayerNames] = useState(['Archer Red', 'Archer Green', 'Archer Blue', 'Archer Yellow']);
  const [gameState, setGameState] = useState(null);
  const [displayedState, setDisplayedState] = useState(null);
  const [inputVal, setInputVal] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isShooting, setIsShooting] = useState(false);
  const [flightStatus, setFlightStatus] = useState(null);
  const arenaRef = useRef(null);
  const pendingStateRef = useRef(null);

  const view = (displayedState || gameState) ? getTournamentView(displayedState || gameState) : null;

  const handleStartTournament = () => {
    const names = playerNames.slice(0, playerCount);
    const initial = createTournamentGame(playerCount, names);
    setGameState(initial);
    setDisplayedState(initial);
    pendingStateRef.current = null;
    setFlightStatus(null);
    setIsShooting(false);
    setPhase('game');
  };

  const handleNameChange = (index, value) => {
    const updated = [...playerNames];
    updated[index] = value;
    setPlayerNames(updated);
  };

  const handleAcknowledgeHandover = () => {
    if (!gameState) return;
    const next = acknowledgeHandover(gameState);
    setGameState(next);
    setDisplayedState(next);
    pendingStateRef.current = null;
    setFlightStatus(null);
    setIsShooting(false);
    setInputVal('');
    setErrorMessage('');
    if (arenaRef.current) {
      arenaRef.current.reset();
    }
  };

  const handleTournamentGuess = (e) => {
    e?.preventDefault();
    if (isShooting || flightStatus || !view || view.stage !== 'turn') return;
    setErrorMessage('');

    const res = makeTournamentGuess(gameState, inputVal);
    if (res.error) {
      setErrorMessage(res.error);
      return;
    }

    const nextState = res.state;
    const activePlayer = view.activePlayer;
    setIsShooting(true);
    setFlightStatus('tracking');
    pendingStateRef.current = nextState;
    setInputVal('');

    // Trigger visual shot in arena
    const lastResult = nextState.players[gameState.currentPlayerIndex].lastResult;
    if (arenaRef.current && lastResult) {
      arenaRef.current.shoot(lastResult.direction, lastResult.difference, activePlayer.color);
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

  // --- SUBVIEW 1: SETUP SCREEN ---
  if (phase === 'setup') {
    return (
      <div className="w-full min-h-screen pt-16 flex flex-col bg-[#111414] select-none text-[#e1e3e2]">
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
          <button
            onClick={onBackToMenu}
            className="flex items-center gap-1.5 text-xs font-['JetBrains_Mono'] text-[#9b8f7d] hover:text-[#f0bf5c] transition-colors mb-6 bg-[#191c1c] px-3 py-1.5 rounded border border-[#323535]"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>BACK TO MENU</span>
          </button>

          <div className="bg-[#191c1c] border border-[#323535] rounded-xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#10b981]/20 flex items-center justify-center text-[#10b981]">
                <span className="material-symbols-outlined text-2xl">groups</span>
              </div>
              <div>
                <h1 className="font-['Space_Grotesk'] text-2xl font-bold uppercase tracking-wider text-[#e1e3e2]">
                  Tournament Setup
                </h1>
                <p className="font-['Space_Grotesk'] text-xs text-[#9b8f7d]">
                  Configure combatants for local pass-and-play bracket (1–100 range, 10 attempts each)
                </p>
              </div>
            </div>

            {/* Player Count Select */}
            <div className="mb-8">
              <label className="block text-xs font-['JetBrains_Mono'] text-[#9b8f7d] uppercase tracking-wider mb-2">
                Number of Players:
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[2, 3, 4].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setPlayerCount(cnt)}
                    className={`py-3 rounded-lg border font-['Space_Grotesk'] font-bold text-sm tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      playerCount === cnt
                        ? 'bg-[#10b981] border-[#10b981] text-[#0c0f0f] shadow-lg'
                        : 'bg-[#0c0f0f] border-[#323535] text-[#9b8f7d] hover:text-[#e1e3e2]'
                    }`}
                  >
                    <span>{cnt} PLAYERS</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Player Names Configuration */}
            <div className="space-y-4 mb-8">
              <label className="block text-xs font-['JetBrains_Mono'] text-[#9b8f7d] uppercase tracking-wider">
                Roster Assignment:
              </label>
              {Array.from({ length: playerCount }).map((_, idx) => {
                const colorInfo = TOURNAMENT_COLORS[idx];
                return (
                  <div key={idx} className="flex items-center gap-3 bg-[#0c0f0f] p-3 rounded-lg border border-[#323535]">
                    <div
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: colorInfo.hex }}
                    />
                    <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#d2c5b1] w-20">
                      P{idx + 1} ({colorInfo.name}):
                    </span>
                    <input
                      type="text"
                      maxLength={18}
                      value={playerNames[idx]}
                      onChange={(e) => handleNameChange(idx, e.target.value)}
                      className="flex-1 bg-transparent border-none text-sm font-['Space_Grotesk'] text-[#e1e3e2] focus:outline-none"
                    />
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleStartTournament}
              className="w-full py-4 bg-[#10b981] text-[#0c0f0f] font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-[#34d399] transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer"
            >
              <span>COMMENCE TOURNAMENT</span>
              <span className="material-symbols-outlined text-lg">play_arrow</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- SUBVIEW 2: RESULTS SCREEN ---
  if (view && view.status === 'completed') {
    return (
      <div className="w-full min-h-screen pt-16 flex flex-col bg-[#111414] select-none text-[#e1e3e2] p-4 sm:p-8">
        <div className="max-w-3xl mx-auto w-full bg-[#191c1c] border border-[#323535] rounded-xl p-6 sm:p-8 shadow-2xl text-center">
          <span className="material-symbols-outlined text-6xl text-[#f0bf5c] mb-2 animate-bounce">
            military_tech
          </span>
          <h1 className="font-['Space_Grotesk'] text-3xl font-extrabold uppercase text-[#e1e3e2]">
            TOURNAMENT CONCLUDED
          </h1>
          <p className="font-['Space_Grotesk'] text-sm text-[#9b8f7d] mt-1">
            Official Scoring & Archery Championship Results
          </p>

          {/* Winner Banner */}
          <div className="my-6 p-4 rounded-xl bg-[#0c0f0f] border border-[#f0bf5c]/40 text-[#f0bf5c]">
            <div className="text-xs font-['JetBrains_Mono'] uppercase tracking-widest text-[#9b8f7d]">
              {view.winners.length > 1 ? 'JOINT CHAMPIONS' : 'TOURNAMENT CHAMPION'}
            </div>
            <div className="font-['Space_Grotesk'] text-2xl font-bold mt-1">
              {view.winners.map(w => w.name).join(' & ')}
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="space-y-3 mb-8 text-left">
            {view.leaderboard.map((p) => {
              const isWinner = view.winners.some(w => w.id === p.id);
              return (
                <div
                  key={p.id}
                  className={`p-3.5 rounded-lg border flex items-center justify-between ${
                    isWinner ? 'bg-[#f0bf5c]/10 border-[#f0bf5c]' : 'bg-[#0c0f0f] border-[#323535]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: p.colorHex }} />
                    <span className="font-['Space_Grotesk'] font-bold text-sm text-[#e1e3e2]">
                      {p.name}
                    </span>
                    {isWinner && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold bg-[#f0bf5c] text-[#412d00]">
                        WINNER
                      </span>
                    )}
                  </div>

                  <div className="font-['JetBrains_Mono'] text-xs text-[#d2c5b1]">
                    <span>{p.solved ? `SOLVED IN ${p.attemptsUsed} TRIES` : 'QUIVER DEPLETED'}</span>
                    <span className="ml-3 text-[#9b8f7d]">(SECRET: {p.secretNumber})</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setPhase('setup')}
              className="px-6 py-3 bg-[#10b981] text-[#0c0f0f] font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#34d399] transition-colors"
            >
              NEW TOURNAMENT
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

  // --- SUBVIEW 3: PASS & PLAY HANDOVER SCREEN ---
  if (view && view.stage === 'handover') {
    const active = view.activePlayer;
    return (
      <div className="w-full min-h-screen pt-16 flex flex-col bg-[#111414] select-none text-[#e1e3e2] items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#191c1c] border border-[#323535] rounded-xl p-8 text-center shadow-2xl">
          <span className="material-symbols-outlined text-5xl text-[#f0bf5c] mb-3">
            screen_rotation
          </span>
          <div className="text-xs font-['JetBrains_Mono'] uppercase tracking-wider text-[#9b8f7d] mb-1">
            PASS & PLAY HANDOVER
          </div>
          <h2 className="font-['Space_Grotesk'] text-2xl font-bold uppercase text-[#e1e3e2]">
            PASS DEVICE TO:
          </h2>

          <div className="my-6 p-4 rounded-xl bg-[#0c0f0f] border border-[#323535] flex items-center justify-center gap-3">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: active.colorHex }} />
            <span className="font-['Space_Grotesk'] text-xl font-bold text-[#e1e3e2]">
              {active.name}
            </span>
          </div>

          <p className="font-['Space_Grotesk'] text-xs text-[#9b8f7d] mb-6 leading-relaxed">
            Ensure other players cannot see the screen. Once you have the device, confirm to reveal your target round.
          </p>

          <button
            onClick={handleAcknowledgeHandover}
            className="w-full py-3.5 bg-[#f0bf5c] text-[#412d00] font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-[#ffdea4] transition-all cursor-pointer shadow-lg"
          >
            I AM READY — BEGIN ROUND
          </button>
        </div>
      </div>
    );
  }

  // --- SUBVIEW 4: ACTIVE TOURNAMENT ROUND ---
  const active = view?.activePlayer;

  return (
    <div className="w-full min-h-screen pt-16 flex flex-col bg-[#111414] select-none text-[#e1e3e2]">
      {/* Active Tournament Status Bar */}
      <div className="w-full bg-[#191c1c] border-b border-[#323535] px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: active?.colorHex }} />
          <span className="font-['Space_Grotesk'] font-bold text-sm text-[#e1e3e2]">
            {active?.name} ({active?.color})
          </span>
          <span className="text-xs font-['JetBrains_Mono'] text-[#9b8f7d] px-2 py-0.5 rounded bg-[#282a2a]">
            PLAYER {view.currentPlayerIndex + 1} OF {view.playerCount}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-['JetBrains_Mono']">
          <div className="text-[#d2c5b1]">
            <span className="text-[#9b8f7d]">ATTEMPTS: </span>
            <span className="text-[#f0bf5c] font-bold">{active?.attemptsRemaining} REMAINING</span>
          </div>
        </div>
      </div>

      {/* 3D Arena Viewport */}
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
                  Attempt #{active.lastResult.attemptNumber}: {active.lastResult.guess}
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
        <form onSubmit={handleTournamentGuess} className="w-full">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#9b8f7d]">
                crisis_alert
              </span>
              <input
                type="number"
                disabled={isShooting || flightStatus}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Enter your guess (1–100)..."
                className="w-full pl-12 pr-4 py-3.5 bg-[#191c1c] border border-[#323535] rounded-xl text-[#e1e3e2] placeholder-[#64748b] font-['JetBrains_Mono'] text-base focus:outline-none focus:border-[#f0bf5c] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isShooting || flightStatus || !inputVal}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#10b981] text-[#0c0f0f] font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-[#34d399] active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>{flightStatus || isShooting ? 'FIRING...' : 'RELEASE SHOT'}</span>
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
            ROUND SHOTS LOG ({active?.guesses.length || 0} / 10)
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {(!active?.guesses || active.guesses.length === 0) ? (
              <span className="text-xs font-['JetBrains_Mono'] text-[#64748b]">No shots fired in this round.</span>
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
                  <span className="opacity-60">#{g.attemptNumber}:</span>
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

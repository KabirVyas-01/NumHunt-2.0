import React from 'react';
import soundService from '../services/soundService';

/**
 * Main Menu Screen matching the Stitch UI export precisely.
 * Features:
 * - Immersive medieval archer range backdrop
 * - Tactical header / status indicator
 * - 3 Game Mode Cards: Single Player, Tournament, Duel
 * - Audio, Rules, and System Status widgets
 */
export default function MainMenuScreen({ onSelectMode, onOpenBrief }) {
  const modes = [
    {
      id: 'single_player',
      title: 'SINGLE PLAYER',
      badge: 'TRAINING & CAMPAIGN',
      badgeColor: 'text-[#f0bf5c] bg-[#f0bf5c]/10 border-[#f0bf5c]/30',
      description: 'Test your ballistic precision against autonomous targets. Progress through escalating distance ranges with tactical guidance.',
      meta: 'Level 1 (1–100) & Level 2 (1–1000 with Extreme Hint)',
      icon: 'person',
      buttonText: 'DEPLOY SOLO',
      accentColor: 'hover:border-[#f0bf5c]/60'
    },
    {
      id: 'tournament_setup',
      title: 'MULTIPLAYER TOURNAMENT',
      badge: 'PASS & PLAY (2–4 PLAYERS)',
      badgeColor: 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/30',
      description: 'Sequential round combat on a single device. Each player takes full rounds against distinct targets. Fewest attempts claims victory.',
      meta: 'Player 1 Red, Player 2 Green, Player 3 Blue, Player 4 Yellow',
      icon: 'groups',
      buttonText: 'ENTER TOURNAMENT',
      accentColor: 'hover:border-[#10b981]/60'
    },
    {
      id: 'duel_setup',
      title: 'HEAD-TO-HEAD DUEL',
      badge: '1v1 TACTICAL BATTLE',
      badgeColor: 'text-[#3b82f6] bg-[#3b82f6]/10 border-[#3b82f6]/30',
      description: 'Direct competitive duel. Secretly designate targets for your adversary, then take alternating shots until the first bullseye.',
      meta: 'Alternating turns • Red vs Blue • Instant Kill',
      icon: 'swords',
      buttonText: 'INITIATE DUEL',
      accentColor: 'hover:border-[#3b82f6]/60'
    }
  ];

  return (
    <div className="w-full min-h-screen pt-16 flex flex-col justify-between relative bg-[#111414] select-none">
      {/* Background Ambience / Subtle Grid Lines */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[radial-gradient(#f0bf5c_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Hero Banner Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 w-full">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0bf5c]/10 border border-[#f0bf5c]/30 text-[#f0bf5c] font-['JetBrains_Mono'] text-xs font-semibold uppercase tracking-wider mb-4">
            <span className="material-symbols-outlined text-[16px]">target</span>
            PRECISION BALLISTIC NUMBER HUNTING
          </div>

          <h1 className="font-['Space_Grotesk'] text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-[#e1e3e2]">
            AIM YOUR GUESS. <br />
            <span className="bg-gradient-to-r from-[#f0bf5c] via-[#ffdea4] to-[#c89b3c] bg-clip-text text-transparent">
              HIT THE TARGET.
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm sm:text-base text-[#d2c5b1] font-['Space_Grotesk']">
            NumHunt 2.0 transforms traditional higher-or-lower guessing into an immersive 3D archery combat experience. Select your combat protocol to begin.
          </p>
        </div>

        {/* 3 Game Mode Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {modes.map((mode) => (
            <div
              key={mode.id}
              className={`bg-[#191c1c]/90 border border-[#323535] rounded-xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${mode.accentColor} relative group`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-[#282a2a] flex items-center justify-center text-[#f0bf5c] group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl">{mode.icon}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded border text-[10px] font-['JetBrains_Mono'] font-bold tracking-wider ${mode.badgeColor}`}>
                    {mode.badge}
                  </span>
                </div>

                <h3 className="font-['Space_Grotesk'] text-xl font-bold uppercase text-[#e1e3e2] mb-2 tracking-wide">
                  {mode.title}
                </h3>

                <p className="font-['Space_Grotesk'] text-sm text-[#9b8f7d] leading-relaxed mb-4">
                  {mode.description}
                </p>
              </div>

              <div>
                <div className="font-['JetBrains_Mono'] text-xs text-[#64748b] border-t border-[#323535] pt-3 mb-5">
                  {mode.meta}
                </div>

                <button
                  onClick={() => {
                    soundService.playButtonClick();
                    onSelectMode(mode.id);
                  }}
                  aria-label={mode.buttonText}
                  className="w-full py-3 px-4 rounded-lg bg-[#f0bf5c] text-[#412d00] font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#ffdea4] active:scale-[0.98] transition-all cursor-pointer shadow-lg"
                >
                  <span>{mode.buttonText}</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Status Bar */}
      <footer className="relative z-10 w-full border-t border-[#323535]/80 bg-[#0c0f0f]/90 py-4 px-6 flex flex-wrap items-center justify-between gap-4 text-xs font-['JetBrains_Mono'] text-[#9b8f7d]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[#10b981]">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            THREE.JS ENGINE OPERATIONAL
          </span>
          <span className="hidden sm:inline text-[#4e4637]">|</span>
          <span className="hidden sm:inline">LOCAL PASS-AND-PLAY READY</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onOpenBrief}
            className="hover:text-[#f0bf5c] transition-colors cursor-pointer"
          >
            TACTICAL PROTOCOL
          </button>
          <span>•</span>
          <span>STITCH DESIGN SPEC v2.0</span>
        </div>
      </footer>
    </div>
  );
}

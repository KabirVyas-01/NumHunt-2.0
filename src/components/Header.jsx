import React, { useState } from 'react';

/**
 * Top Tactical Precision Navigation Header from Stitch Design.
 * Features:
 * - Brand emblem & v2.0.4-PROD badge
 * - Audio toggle & rulebook / tactical brief modal
 * - Current screen / mode indicator
 */
export default function Header({ currentScreen, onNavigate, onOpenBrief }) {
  const [isMuted, setIsMuted] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0c0f0f]/85 backdrop-blur-xl border-b border-[#323535]/50 shadow-[0_1px_8px_rgba(0,0,0,0.6)]">
      <div className="h-16 w-full px-4 md:px-8 flex items-center justify-between">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('main_menu')}
            className="flex items-center gap-2 group cursor-pointer focus:outline-none"
          >
            <span className="material-symbols-outlined text-[#f0bf5c] text-[24px] group-hover:scale-110 transition-transform">
              shield
            </span>
            <span className="font-['Space_Grotesk'] text-lg font-bold uppercase tracking-wider text-[#e1e3e2]">
              NUMHUNT <span className="text-[#f0bf5c]">2.0</span>
            </span>
          </button>
          <span className="font-['JetBrains_Mono'] text-[10px] uppercase text-[#9b8f7d] px-2 py-0.5 bg-[#282a2a] rounded hidden sm:inline-block">
            v2.0.4-TACTICAL
          </span>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Tactical Briefing / Rules */}
          <button
            onClick={onOpenBrief}
            title="Tactical Protocol Briefing"
            className="h-9 px-3 flex items-center gap-1.5 rounded bg-[#191c1c] text-[#d2c5b1] hover:bg-[#282a2a] hover:text-[#e1e3e2] transition-colors border border-[#323535]/60 text-xs font-['JetBrains_Mono']"
          >
            <span className="material-symbols-outlined text-[18px] text-[#f0bf5c]">help</span>
            <span className="hidden md:inline font-semibold">RULES</span>
          </button>

          {/* Audio toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="w-9 h-9 flex items-center justify-center rounded bg-[#191c1c] text-[#d2c5b1] hover:bg-[#282a2a] hover:text-[#e1e3e2] transition-colors border border-[#323535]/60"
          >
            <span className="material-symbols-outlined text-[19px]">
              {isMuted ? 'volume_off' : 'volume_up'}
            </span>
          </button>

          {/* Quick Home button if not on main menu */}
          {currentScreen !== 'main_menu' && (
            <button
              onClick={() => onNavigate('main_menu')}
              className="h-9 px-3 flex items-center gap-1.5 rounded bg-[#f0bf5c]/10 text-[#f0bf5c] hover:bg-[#f0bf5c]/20 transition-colors border border-[#f0bf5c]/30 text-xs font-['JetBrains_Mono'] font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">home</span>
              <span className="hidden sm:inline">MENU</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

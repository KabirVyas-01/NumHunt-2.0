import React from 'react';

export default function TacticalBriefModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#191c1c] border border-[#f0bf5c]/30 rounded-xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-[#323535]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#f0bf5c]">military_tech</span>
            <h2 className="font-['Space_Grotesk'] text-xl font-bold uppercase tracking-wider text-[#e1e3e2]">
              NumHunt 2.0 Tactical Briefing
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#9b8f7d] hover:text-[#e1e3e2] p-1 rounded hover:bg-[#282a2a]"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <div className="mt-4 space-y-4 font-['Space_Grotesk'] text-sm text-[#d2c5b1]">
          <div>
            <h3 className="text-base font-bold text-[#f0bf5c] uppercase flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">person</span> Single Player Protocol
            </h3>
            <p className="mt-1">
              <strong>Level 1:</strong> Secret number 1–100, 10 attempts.<br />
              <strong>Level 2:</strong> Secret number 1–1000, 15 attempts. If guess deviation exceeds 500, a one-time <span className="text-[#ffb4ab] font-bold">Extreme Hint ("Too high!" or "Too low!")</span> is granted.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-[#10b981] uppercase flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">groups</span> Multiplayer Tournament (Pass & Play)
            </h3>
            <p className="mt-1">
              2 to 4 Players (Red, Green, Blue, Yellow). Each player gets a distinct 1–100 secret and 10 attempts. Rounds are played sequentially. The player with the fewest solving attempts is crowned champion!
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-[#3b82f6] uppercase flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">swords</span> Head-to-Head Duel (1v1)
            </h3>
            <p className="mt-1">
              Player 1 (Red) and Player 2 (Blue) secretly set target numbers for each other. Players alternate turns guessing their designated target. The first direct hit wins immediately.
            </p>
          </div>

          <div className="p-3 bg-[#0c0f0f] rounded-lg border border-[#323535]">
            <div className="font-['JetBrains_Mono'] text-xs text-[#9b8f7d]">
              🏹 <strong>Ballistic Guidance:</strong> The arrow landing elevation mirrors your guess deviation from the secret. Bullseye represents a exact hit!
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#f0bf5c] text-[#412d00] font-['Space_Grotesk'] font-bold text-sm uppercase rounded hover:bg-[#ffdea4] transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}

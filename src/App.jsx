import React, { useState } from 'react';
import Header from './components/Header';
import TacticalBriefModal from './components/TacticalBriefModal';
import MainMenuScreen from './screens/MainMenuScreen';
import SinglePlayerScreen from './screens/SinglePlayerScreen';
import TournamentScreen from './screens/TournamentScreen';
import DuelScreen from './screens/DuelScreen';
import './styles/global.css';

/**
 * Top-Level Application Orchestrator for NumHunt 2.0.
 * Coordinates screen navigation, global tactical brief modals, and shared state.
 */
export default function App() {
  // Screens: 'main_menu' | 'single_player' | 'tournament_setup' | 'duel_setup'
  const [currentScreen, setCurrentScreen] = useState('main_menu');
  const [isBriefOpen, setIsBriefOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#111414] text-[#e1e3e2] flex flex-col font-['Space_Grotesk']">
      {/* Global Navigation Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
        onOpenBrief={() => setIsBriefOpen(true)}
      />

      {/* Screen Router */}
      <main className="flex-1 w-full flex flex-col">
        {currentScreen === 'main_menu' && (
          <MainMenuScreen
            onSelectMode={(mode) => setCurrentScreen(mode)}
            onOpenBrief={() => setIsBriefOpen(true)}
          />
        )}

        {currentScreen === 'single_player' && (
          <SinglePlayerScreen
            onBackToMenu={() => setCurrentScreen('main_menu')}
          />
        )}

        {currentScreen === 'tournament_setup' && (
          <TournamentScreen
            onBackToMenu={() => setCurrentScreen('main_menu')}
          />
        )}

        {currentScreen === 'duel_setup' && (
          <DuelScreen
            onBackToMenu={() => setCurrentScreen('main_menu')}
          />
        )}
      </main>

      {/* Global Tactical Protocol Briefing Modal */}
      <TacticalBriefModal
        isOpen={isBriefOpen}
        onClose={() => setIsBriefOpen(false)}
      />
    </div>
  );
}

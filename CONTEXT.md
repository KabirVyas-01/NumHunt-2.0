# 🏹 NUMHUNT 2.0 — MASTER CONTEXT & ARCHITECTURAL SPECIFICATION

## 1. Project Overview & Vision
**NumHunt 2.0** is a complete modern evolution of the classic browser number-guessing game **NumHunt** (original: https://kabirvyas-numhunt-game.netlify.app), reimagined as an atmospheric, cinematic, 3D archery-themed experience.

- **Status**: The original `NunHunt` directory remains untouched. NumHunt 2.0 lives exclusively in its own dedicated workspace.
- **Core Premise**: The arrow acts as a physical indicator of the guess result:
  - **Bullseye direct hit**: The guess matches the secret number exactly (`Correct!`).
  - **Lower guess miss**: The arrow drops short and strikes the ground in front of the target with dirt debris.
  - **Higher guess miss**: The arrow launches high and sails over the top of the target into the distant landscape.
- **Suspenseful Guessing Engine**: Guess feedback, attempt decrements, and direction clues are held back while an animated `"ARROW IN FLIGHT... TRACKING TRAJECTORY"` indicator displays until impact.

---

## 2. Technology Stack
- **Framework & Build**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 + Space Grotesk (display/titles) + JetBrains Mono (ballistic telemetry) + Google Material Symbols Outlined
- **3D Graphics Engine**: Three.js (r187) via dedicated modular canvas architecture
- **Design System Source**: Google Stitch (`NumHunt Archery Gaming Interface` / `Tactical Precision Optics HUD`)
- **Testing Engine**: Vitest (100% test pass rate across 39 unit tests)

---

## 3. Game Modes & Rules

### Mode 1: Single Player (Solo Training)
- **Level 1**:
  - Number range: `1 – 100`
  - Max attempts: `10`
- **Level 2**:
  - Number range: `1 – 1000`
  - Max attempts: `15`
  - **Extreme Hint**: If the absolute difference between guess and secret is $> 500$, a special one-time `"Too high!"` or `"Too low!"` hint triggers once per round.
- **Feedback**: Directional arrow trajectory + standard tactical readouts (*"You guessed it higher"*, *"You guessed it lower"*, *"Correct!"*).

### Mode 2: Multiplayer Tournament (Local Pass-and-Play)
- **Players**: 2 to 4 combatants on a single shared device.
- **Color Assignments**:
  - Player 1: **Red** (`#EF4444`)
  - Player 2: **Green** (`#10B981`)
  - Player 3: **Blue** (`#3B82F6`)
  - Player 4: **Yellow** (`#F59E0B`)
- **Format**:
  - Range `1 – 100`, `10 attempts` per player.
  - Sequential full rounds (each player takes all their shots against their own target).
  - Private handover transition shields between turns.
  - Winner: Lowest attempts among solvers; joint winners crowned on ties.

### Mode 3: Head-to-Head Duel (1v1 PVP)
- **Players**: Player 1 (**Red**) vs Player 2 (**Blue**).
- **Format**:
  - Both players secretly input a target number (`1 – 100`) for the opponent.
  - Anti-peeking private input screens.
  - Alternating turns starting with Player 1.
  - First player to hit their target wins instantly.
  - Strict privacy: targets are never exposed in state data during active combat.

---

## 4. Codebase Structure & Directory Map

```text
NumHunt 2.0/
├── CONTEXT.md                     # Master project context, rules, and architecture
├── README.md                      # Setup and usage instructions
├── start_game.bat                 # One-click launcher script for Windows dev server
├── package.json                   # Dependencies (react, three, tailwindcss, vitest)
├── vite.config.js                 # Vite + React + Tailwind v4 + Vitest configuration
├── index.html                     # HTML shell, fonts (Space Grotesk, JetBrains Mono, Material Icons)
├── stitch_designs/                # Downloaded Google Stitch UI design files & guidelines
│   ├── DESIGN_SYSTEM.md           # Style tokens & guidelines
│   ├── main_menu.html
│   ├── single_player_arena.html
│   ├── tournament_setup.html
│   ├── tournament_live_round.html
│   ├── player_handover.html
│   ├── tournament_results.html
│   ├── duel_setup.html
│   ├── secret_target_entry.html
│   ├── duel_combat.html
│   └── duel_results.html
└── src/
    ├── App.jsx                    # Top-level screen router & modal coordinator
    ├── main.jsx                   # React DOM root entry
    ├── components/
    │   ├── ArcheryArena.jsx       # Three.js Canvas container (lifecycle, resize, memory cleanup)
    │   ├── Header.jsx             # Top tactical HUD bar (status, audio toggle, rules button)
    │   └── TacticalBriefModal.jsx # Tactical rules popup
    ├── screens/
    │   ├── MainMenuScreen.jsx     # Main menu & game mode selection cards
    │   ├── SinglePlayerScreen.jsx # Single Player Level 1 & 2 gameplay arena with deferred feedback
    │   ├── TournamentScreen.jsx   # Tournament setup, handover, active round, and podium results
    │   └── DuelScreen.jsx         # 1v1 setup, secret setting, alternating combat, and victory reveal
    ├── game/                      # Pure headless JavaScript game engines (NO DOM/Three.js dependencies)
    │   ├── logic/
    │   │   └── common.js          # Shared validation, RNG, and guess evaluation
    │   ├── singlePlayer/
    │   │   └── singlePlayerEngine.js
    │   ├── tournament/
    │   │   └── tournamentEngine.js
    │   └── duel/
    │       └── duelEngine.js
    ├── three/                     # Standalone Three.js 3D Rendering Pipeline
    │   ├── scene/
    │   │   ├── archerySceneManager.js # Camera, lights, render loop, resize, and asset disposal
    │   │   ├── environment.js     # Outdoor pine forest training clearing, turf, fences, lighting
    │   │   └── target.js          # World Archery target, straw boss, A-frame wooden stand
    │   ├── characters/
    │   │   └── archer.js          # Articulated humanoid archer, bow, dynamic bowstring, color variants
    │   └── animations/
    │       └── shootAnimator.js   # Ballistic flight, ground drops (low), overshoots (high), particles
    ├── styles/
    │   └── global.css             # Tailwind @theme design tokens
    └── tests/
        ├── common.test.js         # RNG & input validation unit tests
        ├── singlePlayer.test.js   # Single Player attempt & Extreme Hint tests
        ├── tournament.test.js     # Sequential rounds & joint-winner tiebreaker tests
        ├── duel.test.js           # 1v1 turn alternation & privacy preservation tests
        └── smoke.test.js          # Base test runner sanity test
```

---

## 5. Development & Running Commands

```bash
# Start local development server (http://localhost:5173/)
npm run dev

# Run Vitest unit test suite (39 tests)
npm test

# Build production bundle (dist/)
npm run build
```

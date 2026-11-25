# 🏹 NUMHUNT 2.0 — MASTER CONTEXT & ARCHITECTURAL SPECIFICATION

> **Last Updated**: November 25, 2026 (Live Production Deployment Verified)  
> **Status**: Stages 0–5 complete. Live in production on Netlify at https://numhunt-2.netlify.app.

---

## 1. Project Overview & Vision
**NumHunt 2.0** is an evolution of the classic browser number-guessing game **NumHunt** (original: https://kabirvyas-numhunt-game.netlify.app; v2.0: https://numhunt-2.netlify.app), reimagined as an atmospheric, cinematic, 3D archery-themed experience.

- **Isolation**: The original `NunHunt` directory remains untouched. NumHunt 2.0 lives exclusively in its own dedicated workspace.
- **Physical Arrow Feedback & Miss Mechanics**:
  - **Bullseye Hit (Correct Guess)**: ONLY the exact secret number strikes the archery target face at the center gold bullseye ($x = 4.422\,	ext{m}$, $y = 1.80\,	ext{m}$), producing wood splinter particle debris and target vibration.
  - **Lower Guess (Miss)**: The arrow drops short and strikes the **ground before the target** ($x = 1.0\,	ext{m}$ to $3.65\,	ext{m}$, ground level $y = 0.02\,	ext{m}$), embedding angled into the dirt with ground dust particles. The target remains completely untouched.
  - **Higher Guess (Miss)**: The arrow launches on a high trajectory, **sailing completely over the top of the target** ($y \ge 3.23\,	ext{m}$ to $4.49\,	ext{m}$, clearing the target's upper edge of $2.65\,	ext{m}$) into the distant background. The target remains completely untouched.
- **Suspenseful Guessing Engine**:
  - While the arrow travels, an animated amber tactical banner displays: `🏹 ARROW IN FLIGHT... TRACKING TRAJECTORY`.
  - Directional feedback (*"You guessed it higher"*, *"You guessed it lower"*), attempt counter decrements, and telemetry updates are **held back during flight** and revealed strictly when the arrow strikes the ground or overshoots (via the `onImpact` callback).

---

## 2. Technology Stack
- **Framework & Build**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 + Space Grotesk (display/titles) + JetBrains Mono (ballistic telemetry) + Google Material Symbols Outlined
- **3D Graphics Engine**: Three.js (r187) via a modular canvas pipeline
- **Design System Source**: Google Stitch (`NumHunt Archery Gaming Interface` / `Tactical Precision Optics HUD`)
- **Testing Engine**: Vitest (100% test pass rate across 8 test suites and 51 integration/unit tests)
- **Audio Synthesizer**: Zero-dependency procedural Web Audio API engine (`soundService.js`) generating realistic bow-draw tension, whooshes, bullseye wood strikes, and ground impacts. Persisted in `localStorage`.
- **Deployment Ready**: Production configuration and headers prepared for Netlify (`netlify.toml`) and Vercel (`vercel.json`).

---

## 3. Game Modes & Rules

### Mode 1: Single Player (Solo Training)
- **Level 1**: Number range `1 – 100`, max `10 attempts`.
- **Level 2**: Number range `1 – 1000`, max `15 attempts`.
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

## 4. Codebase Architecture & File Map

```text
NumHunt 2.0/
├── CONTEXT.md                     # Master project context, rules, and architecture (Always kept current)
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
    │   ├── ArcheryArena.jsx       # Three.js Canvas container (lifecycle, resize, onImpact forwarding, memory cleanup)
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
    │   │   └── archer.js          # Articulated humanoid archer, bow, dynamic bowstring, recoil kick, color variants
    │   └── animations/
    │       └── shootAnimator.js   # Ballistic flight, ground drops (low), overshoots (high), particles, onImpact callback
    ├── styles/
    │   └── global.css             # Tailwind @theme design tokens
    └── tests/
        ├── common.test.js         # RNG & input validation unit tests
        ├── singlePlayer.test.js   # Single Player attempt & Extreme Hint tests
        ├── tournament.test.js     # Sequential rounds & joint-winner tiebreaker tests
        ├── duel.test.js           # 1v1 turn alternation & privacy preservation tests
        ├── shootAnimator.test.js  # Ballistic trajectory boundary clearance tests
        ├── soundService.test.js   # Procedural Web Audio API engine tests
        └── smoke.test.js          # Base test runner sanity test
```

---

## 5. Development & Running Commands

```bash
# Start local development server (http://localhost:5173/)
npm run dev
# OR double-click start_game.bat

# Run Vitest unit test suite (51 tests across 8 test files)
npm test

# Build production bundle (dist/)
npm run build
```

---

## 6. Audit & Verification Record (Stage 5 Sign-off)
- **Vitest Suite**: 51 passed (100% pass rate across 8 test suites, 0 failures, 0 stderr warnings).
- **Vite Build**: Built successfully with zero errors (`dist/index.html`, `dist/assets/`).
- **Audio System**: Procedural Web Audio API sound synthesis synchronized with visual animation timeline (bow draw, arrow whoosh, bullseye strike, dirt thud, tactical UI click, victory fanfare).
- **Responsive Viewports**: Tested & polished down to 320px/375px mobile, 768px tablet, and 1440px desktop displays.
- **Memory & Lifecycle**: Three.js animations, geometries, materials, particle pools, and listeners verified clean on unmount.
- **Input Debouncing & Flight Guard**: Verified that duplicate submits and inputs are blocked while arrow is in flight across all 3 modes.
- **Live Localhost**: Actively verified responding with HTTP 200 on `http://localhost:5173/`.

---

## 7. Secret Number Privacy & State Sanitization
- **Single Player**: The engine conceals `secretNumber: null` in `getSinglePlayerView(state)` while the game is active (`status: 'playing'`). It is only revealed when `status === 'won'` or `status === 'lost'`.
- **Tournament Mode**: The engine strictly masks `secretNumber: null` for all players in `getTournamentView(state)` throughout the entire tournament. It is only revealed on the final results podium after all players have completed their rounds (`status === 'completed'`).
- **Head-to-Head Duel**:
  - `getDuelView(state)` masks `p1.secretNumber: null` and `p2.secretNumber: null` during gameplay.
  - The secret input fields use `<input type="password" />` to prevent over-the-shoulder peeking.
  - Secret numbers are never passed to the 3D rendering pipeline or publicly visible HUD elements during active combat.
- **Pass-and-Play Security Boundary**:
  - While client-side memory or developer tools in the browser can inspect local variables on a shared device, all accidental visual exposure across UI components, props, state objects, and DOM trees is prevented.

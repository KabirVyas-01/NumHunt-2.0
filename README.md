# 🏹 NumHunt 2.0 — Tactical Archery Number Guessing Game

[![Live Demo](https://img.shields.io/badge/Live%20Demo-NumHunt%202.0-f0bf5c?style=for-the-badge&logo=netlify&logoColor=black)](https://numhunt-2.netlify.app)

> **Live Game URL**: [https://numhunt-2.netlify.app](https://numhunt-2.netlify.app)  
> **Original Game (v1.0)**: [https://kabirvyas-numhunt-game.netlify.app](https://kabirvyas-numhunt-game.netlify.app)

**NumHunt 2.0** is an atmospheric, cinematic, 3D archery-themed reimagining of the classic browser number-guessing game **NumHunt**. 

Built with a strictly decoupled architecture: pure authoritative game logic engines, modular UI screens (React 19 + Tailwind CSS v4), and an interactive 3D rendering and ballistics pipeline (Three.js).

---

## 🎯 Live Deployment & Play
Experience NumHunt 2.0 directly in your browser:
- 🌐 **Production URL**: [https://numhunt-2.netlify.app](https://numhunt-2.netlify.app)

---

## 🏹 Ballistics & Miss Mechanics
- **Bullseye Hit (Correct Guess)**: Exact secret number strikes the center gold bullseye with wood splinter particle effects and target vibration.
- **Lower Guess (Miss)**: Arrow falls short and strikes the ground in front of the target, kicking up dust particles.
- **Higher Guess (Miss)**: Arrow sails completely over the top of the archery target boss into the distant background.
- **Suspense Tracking**: An animated `ARROW IN FLIGHT... TRACKING TRAJECTORY` banner engages during flight; directional feedback (*"You guessed it higher"*, *"You guessed it lower"*) and attempt counters are revealed strictly upon arrow impact.

---

## 🎮 Game Modes (Original Rules Preserved)

1. **Single Player (Solo Training)**:
   - **Level 1**: Range 1–100, 10 attempts.
   - **Level 2**: Range 1–1000, 15 attempts, single-use Extreme Hint (> 500 difference).
2. **Multiplayer Tournament (Pass-and-Play)**:
   - 2–4 players on a single device, Range 1–100, 10 attempts per player.
   - Sequential full rounds with private handover transition shields protecting secrets.
   - Lowest guess count wins; joint winners supported.
   - Combat colors: Red (P1), Green (P2), Blue (P3), Yellow (P4).
3. **Head-to-Head Duel (1v1 PVP)**:
   - 2 players, Range 1–100.
   - Secret number entry for opponent via masked inputs; alternating turns; first correct guess wins immediately.
   - Both secrets revealed upon match victory.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Space Grotesk + JetBrains Mono
- **3D Graphics Engine**: [Three.js](https://threejs.org/) (r187)
- **Audio Engine**: Zero-dependency procedural [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) synthesizer (bow draw, whoosh, bullseye strike, ground impact, victory fanfare)
- **Testing Engine**: [Vitest](https://vitest.dev/) (52 unit & integration tests) + TestSprite E2E suite
- **Deployment**: [Netlify](https://www.netlify.com/)

---

## 📁 Project Structure

```text
NumHunt 2.0/
├── dist/                # Production build artifacts
├── src/
│   ├── components/      # UI widgets (Header, Modals, HandoverScreen, ArcheryArena)
│   ├── screens/         # Top-level screen views (MainMenu, SinglePlayer, Tournament, Duel)
│   ├── gameLogic/       # Authoritative headless game rules & state machines
│   │   ├── common.js            # Input validation & secret generator
│   │   ├── singlePlayerEngine.js # Level 1 & 2 state machine & extreme hint
│   │   ├── tournamentEngine.js   # 2-4 player rounds & leaderboard logic
│   │   └── duelEngine.js         # 1v1 turn alternation & victory checks
│   ├── three/           # Three.js 3D canvas pipeline
│   │   ├── scene/       # Scene, camera, lighting, and environment setup
│   │   ├── models/      # Target boss, quiver, environment geometry
│   │   └── animations/  # ArcheryShotAnimator, ballistic trajectories, particles
│   ├── services/        # SoundService (procedural Web Audio API engine)
│   └── tests/           # Vitest unit and integration test suites (52 tests)
├── testsprite_tests/    # TestSprite automated E2E test plan & reports
└── netlify.toml         # Netlify SPA routing & security headers configuration
```

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- `npm` (v9+)

### 2. Installation
```bash
git clone https://github.com/KabirVyas-01/NumHunt-2.0.git
cd NumHunt-2.0
npm install
```

### 3. Development Commands

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server on `http://localhost:5173/` |
| `npm test` | Runs all 52 Vitest unit & integration tests |
| `npm run build` | Builds the production bundle to `dist/` |
| `npm run preview` | Previews the production build locally |

---

## 📄 License
MIT License. Created by Kabir Vyas.

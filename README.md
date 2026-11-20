# NumHunt 2.0

NumHunt 2.0 is a cinematic, 3D archery-themed reimagining of the classic number-guessing game NumHunt.

The game is built with a strictly decoupled architecture: pure authoritative game logic, modular UI screens (React), and a standalone 3D rendering pipeline (Three.js).

---

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev/) + [Vite](https://vite.dev/)
- **Language**: JavaScript (ES Modules)
- **3D Graphics Engine**: [Three.js](https://threejs.org/)
- **Test Runner**: [Vitest](https://vitest.dev/)
- **UI Architecture**: Component & Screen-driven modular design

---

## 📁 Project Structure

```text
src/
├── components/          # Reusable UI widgets (buttons, modals, HUD badges, badges)
├── screens/             # Top-level screen views (HomeScreen, ModeSelect, GameScreens)
├── game/                # Authoritative game logic & rules (NO Three.js or DOM code)
│   ├── logic/           # Core mathematical guessing engine & common validations
│   ├── singlePlayer/    # Single Player mode state machine (Level 1 & Level 2 with Extreme Hint)
│   ├── tournament/      # Tournament mode (2-4 player pass-and-play sequential rounds)
│   └── duel/            # Head-to-Head Duel mode (1v1 alternating turns with secret setting)
├── three/               # Three.js 3D canvas pipeline
│   ├── scene/           # Scene, camera, lighting, and environment management
│   ├── characters/      # Archer model loading, materials, and color tinting
│   ├── animations/      # Archery draw, shoot, and trajectory physics interpolators
│   └── assets/          # 3D model loaders and asset registry
├── services/            # Pluggable services (Audio, Storage, and future Networking)
├── hooks/               # Custom React hooks (game state listeners, viewport sizing)
├── styles/              # Global styles, variables, and typography
├── utils/               # Math, formatting, and helper utilities
└── tests/               # Vitest unit and integration test suites
```

> **Architecture Note**: The `game/` engine has zero coupling to the DOM or Three.js. This ensures local pass-and-play and potential future online multiplayer can swap transport layers through `services/` without altering core rules.

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended, verified on v24)
- `npm` (v9+)

### 2. Installation
Navigate into the `numhunt2.0` directory and install dependencies:

```bash
cd numhunt2.0
npm install
```

### 3. Development Commands

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server with Hot Module Replacement (HMR) |
| `npm test` | Runs the Vitest test suite once |
| `npm run test:watch` | Starts Vitest in interactive watch mode |
| `npm run build` | Builds the production-optimized static bundle to `dist/` |
| `npm run preview` | Locally previews the production build |

---

## 🎯 Game Modes Overview (Original Rules Preserved)

1. **Single Player**:
   - **Level 1**: Range 1–100, 10 attempts.
   - **Level 2**: Range 1–1000, 15 attempts, single-use Extreme Hint (> 500 difference).
2. **Multiplayer Tournament**:
   - 2–4 players, Range 1–100, 10 attempts per round.
   - Sequential full rounds; lowest guess count wins.
   - Colors: Red (P1), Green (P2), Blue (P3), Yellow (P4).
3. **Head-to-Head Duel**:
   - 1v1 PVP, Range 1–100.
   - Secret number entry for opponent; alternating turns; first correct guess wins.
   - Colors: Red (P1) vs. Blue (P2).

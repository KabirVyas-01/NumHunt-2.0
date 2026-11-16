# 🏹 NumHunt 2.0

### Aim Your Guess. Hit the Target.

NumHunt 2.0 is a modern, archery-themed number-guessing game that transforms the classic higher-or-lower guessing experience into a cinematic gaming experience.

Featuring a realistic medieval archery environment, animated bow-and-arrow interactions, and three different game modes, NumHunt 2.0 aims to combine simple number-guessing mechanics with immersive visual gameplay.

This project is a complete visual and experience upgrade of the original NumHunt game, preserving its core rules while introducing a new 3D-inspired gaming interface.

---

## 🎮 Game Modes

### 1. Single Player

Challenge yourself by guessing a randomly generated secret number.

| Level | Number Range | Maximum Attempts |
|---|---|---|
| Level 1 | 1–100 | 10 |
| Level 2 | 1–1000 | 15 |

**Special Feature – Extreme Hint**

In Level 2, if your guess is more than 500 away from the secret number, you receive a special higher/lower hint. This hint can trigger only once per round.

### 2. Multiplayer Tournament

Compete against 2–4 players on the same device.

- Each player gets their own complete guessing round.
- Number range: 1–100.
- Maximum attempts: 10 per player.
- Players take turns completing their rounds.
- The player who guesses the number in the fewest attempts wins.
- Ties result in joint winners.

**Player Colour Identities**

- 🔴 Player 1 – Red
- 🟢 Player 2 – Green
- 🔵 Player 3 – Blue
- 🟡 Player 4 – Yellow

### 3. Head-to-Head Duel

Challenge another player in a one-on-one guessing battle.

- Designed for two players on the same device.
- Both players secretly set numbers for their opponents.
- Players take alternating turns guessing the opponent's secret number.
- The first player to guess correctly wins instantly.

---

## 🏹 Gameplay Experience

NumHunt 2.0 uses archery as its visual representation of number guessing.

The planned gameplay animation sequence:

1. The archer prepares and draws the bowstring.
2. The player enters a guess and shoots.
3. The arrow travels towards the target.
4. The arrow lands at a position representing the guess.

**Arrow Feedback System**

- Guess too high → Arrow lands above the bullseye.
- Guess too low → Arrow lands below the bullseye.
- Correct guess → Arrow hits the bullseye.

The actual game logic determines the result. Animations are purely visual and never control gameplay outcomes.

---

## ✨ Planned Features

- Three distinct game modes.
- Cinematic medieval forest environment.
- Realistic 3D archer and archery target.
- Animated bow-and-arrow shooting sequence.
- Dynamic arrow placement based on guessing feedback.
- Player-specific colour identities.
- Local multiplayer and pass-and-play gameplay.
- Guess history and attempts tracking.
- Tournament winner and joint-winner detection.
- Responsive gameplay interface.

---

## 🛠️ Technology Stack

The planned technology stack includes:

| Technology | Purpose |
|---|---|
| React | User interface |
| Vite | Development and build tooling |
| JavaScript | Game logic |
| Three.js | Real-time 3D environment |
| GLB / GLTF | 3D models and assets |
| Blender | 3D model editing and optimization |
| Mixamo | Character rigging and animations, where suitable |
| Vitest | Game logic testing |
| Netlify / Vercel | Deployment |

---

## 🏗️ Development Roadmap

- [ ] Define the core game concept and rules.
- [ ] Establish the visual direction.
- [ ] Design the Main Menu in Google Stitch.
- [ ] Design the Single Player Gameplay interface.
- [ ] Design the Multiplayer Tournament interface.
- [ ] Design the Head-to-Head Duel interface.
- [ ] Finalize shared UI components and design system.
- [ ] Set up the React + Vite project.
- [ ] Implement the core game logic.
- [ ] Build the Three.js archery environment.
- [ ] Integrate character models and animations.
- [ ] Implement all three game modes.
- [ ] Test gameplay, edge cases and performance.
- [ ] Deploy the finished game.

---

## 🌐 Multiplayer Scope

The initial release focuses entirely on local multiplayer.

All game modes will run on one device. Online matchmaking, room creation, authentication and network-based multiplayer are not part of the initial release.

---

## 🎯 Project Goal

The goal of NumHunt 2.0 is to demonstrate how a simple traditional number-guessing game can be transformed into an engaging gaming experience through modern web technologies, 3D graphics, animations and thoughtful interface design.

This project is being developed as an independent evolution of the original NumHunt game.

---

## 📌 Project Status

**Currently in the UI/UX design and planning phase.**

The game mechanics and visual direction have been established. Implementation of the 3D environment and gameplay systems is planned for the next development stages.

---

*Built with curiosity, creativity and a love for game development. 🏹*

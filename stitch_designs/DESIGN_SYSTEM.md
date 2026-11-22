# Tactical Precision Optics HUD

## Brand & Style

This design system establishes an atmospheric, high-stakes tactical HUD tailored for competitive 3D browser gameplay. It bridges futuristic ballistic computing with mythic archery mechanics, balancing cinematic immersion with immediate split-second readability. The interface mimics military-grade holographic glass, targeting optics, and aerodynamic telemetry rather than static web layouts.

### Emotional Response & Audience
The UI evokes calculating focus, clinical tension, precision mastery, and the thrill of landing deep-distance shots. Engineered for competitive gamers, simulation enthusiasts, and browser-first players who demand console-grade polish with low visual latency.

### Design Movement & Influence
- **Tactical Sci-Fi HUD:** Angular chamfers, telemetry tick-marks, crosshair vectors, and coordinate indicators.
- **Dark Glassmorphism:** Deep translucent charcoal backplates, high blur radii, and razor-thin cyan edge-lighting that maintain viewport clarity behind 3D render viewports.
- **Cinematic High-Contrast:** Heavy pitch-black voids contrasted against focused luminous accents and clean optical typography.

## Layout & Spacing

The interface employs a fixed screen-edge HUD architecture over the active 3D canvas, shifting into an anchored 12-column grid system during menu and loadout overlays.

### Layout Philosophy
- **HUD Safe Zone:** Tactical overlays (wind dial, quiver gauge, guess matrix) dock strictly to the peripheral screen boundaries with a fixed `2rem` screen margin on desktop to prevent occlusion of the central trajectory reticle.
- **Central Optic Corridor:** The central 40vw of the screen remains completely uninhibited by solid cards; only transparent reticle vectors and dynamic telemetry markers can inhabit this zone.
- **Breakpoints:**
  - **Desktop (>= 1280px):** 12 columns, 24px gutters, peripheral pinned telemetry.
  - **Tablet (768px - 1279px):** 8 columns, 16px gutters, bottom-docked modular gauges.
  - **Mobile (< 768px):** 4 columns, 12px gutters, collapsible thumb-accessible HUD drawers with high-density monospaced data strips along top and bottom safe boundaries.

## Elevation & Depth

Depth is defined through optical luminescence, edge refraction, and multi-tiered glassmorphism rather than muddy drop shadows.

### Glassmorphism & Surface Tiers
- **Tier 0 (Viewport):** Real-time WebGL/Three.js 3D canvas backdrop.
- **Tier 1 (Passive HUD Glass):** `rgba(13, 17, 23, 0.45)` with `backdrop-filter: blur(12px)`. Outlined by an ultra-thin 1px stroke of `rgba(240, 246, 252, 0.08)`.
- **Tier 2 (Active Interactive Cards):** `rgba(11, 19, 41, 0.75)` with `backdrop-filter: blur(20px)`. Outlined by 1px `rgba(0, 240, 255, 0.25)` with inner corner bracket highlights.
- **Tier 3 (Modals / Overlays):** `rgba(5, 7, 10, 0.92)` with `backdrop-filter: blur(28px)`. Bordered by dual-gradient borders (`#00f0ff` to `#8b5cf6`).

### Ambient Glows & Tactical Blooms
Shadows are executed as focused neon blooms:
- **Cyan Tactical Glow:** `0 0 20px rgba(0, 240, 255, 0.25), 0 0 40px rgba(0, 240, 255, 0.10)`. Used strictly on active targeting mechanisms and locked targets.
- **Violet Resonance Glow:** `0 0 24px rgba(139, 92, 246, 0.3)`. Applied to high-velocity streaks, critical multiplier scores, and special kinetic arrows.

## Components

### Buttons & Interactive Triggers
- **Primary Kinetic Trigger:** Chamfered corners (top-right and bottom-left cut by 10px). Background: solid `#00f0ff` with dark `#05070a` bold Space Grotesk text. On hover, background shifts to a bright white-cyan glow with an expanded electric cyan outer bloom (`0 0 24px rgba(0, 240, 255, 0.6)`).
- **Secondary Ghost Trigger:** Glass background `rgba(13, 17, 23, 0.6)`, 1px border `rgba(0, 240, 255, 0.4)`. Text in tactical white. On hover, fills with `rgba(0, 240, 255, 0.15)` and border transitions to solid `#00f0ff`.
- **Destructive Trigger:** Dark obsidian surface with 1px border of `#ff3366`. Glow shifts to sharp crimson.

### Reticle & Telemetry Displays (Domain-Specific)
- **Targeting Crosshairs:** Centered dynamically over the camera axis. Consists of four 1px tick-marks, a central 2px target pip, dynamic distance rangefinder readouts, and an arc meter reflecting arrow drop based on dialed-in numbers.
- **Quiver & Arrow Indicators:** Vertical or segmented status battery rendered in JetBrains Mono, filling with luminous violet `#8b5cf6` upon bow draw, pulsing when release velocity reaches peak.

### Chips & Tactical Status Badges
- **Status Chips:** Flat sharp rectangles or chamfered micro-bars. Monospaced 10px text (`JetBrains Mono`). 
- **States:**
  - `ELEVATION / RANGE`: Border `rgba(240, 246, 252, 0.2)`, background `rgba(5, 7, 10, 0.8)`.
  - `TARGET LOCK`: Border `#00f0ff`, text `#00f0ff`, animated pulse dot.
  - `OVERESTIMATE / UNDERESTIMATE`: Angular chip with directional arrow ticks (`▲ +12` / `▼ -04`).

### Number Guess Input Fields
- Monospaced numerical readouts styled like military elevation dials.
- Large numerical display (`Space Grotesk`, 36px) nested within a beveled glass panel.
- Micro increment/decrement steppers styled as triangular crosshair chevrons.
- Active input state triggers a thin cyan scanning line animation across the bottom border of the input module.

### Glassmorphism Telemetry Cards
- Surface composed of `rgba(13, 17, 23, 0.7)` with `backdrop-filter: blur(16px)`.
- Enclosed with 1px low-contrast border (`rgba(240, 246, 252, 0.12)`) and accented with tactical cyan corner ticks.
- Card headers feature uppercase micro-labels (`label-mono-sm`) with a trailing dotted horizontal rule.

### Checkboxes, Radios, & Sliders
- **Checkboxes:** Sharp 14x14px square, no radius. Unchecked: 1px border `rgba(240, 246, 252, 0.3)`. Checked: filled with `#00f0ff` containing a central pitch-black inverted diamond mark.
- **Sliders (Wind / Tension Control):** Track height 2px in `rgba(240, 246, 252, 0.15)`. Thumb is a sharp vertical 6x16px diamond-cut cyan prism with an active luminous glow.

# Vite React Platformer

Live demo: https://vite-react-platformer-mrgbpjpygmailcoms-projects.vercel.app/

A small Mario-like 2D platformer prototype built with React + TypeScript + Vite. Gameplay is stepped by a lightweight TypeScript engine (input, physics, collisions, animation) and rendered with positioned DOM elements (no canvas).

The goal is to practice game-loop fundamentals in a web app: frame stepping, platform collisions, stage routing, and keeping gameplay code separated from UI state.

This project also serves as a reference sandbox for building and evaluating internal
game developer tools such as debuggers, inspectors, and deterministic replay systems.

This project also serves as a reference sandbox for building and evaluating internal
game developer tools such as debuggers, inspectors, and deterministic replay systems.

![Developer Tools Overview](./docs/dev-tools-overview.gif)

## Features

- Start menu -> play through multiple stages -> credits
- Run, jump, and short-hop (release jump early)
- AABB platform collisions (ground/ceiling + basic side resolution)
- Horizontal camera follow + world bounds clamping
- Door trigger zones to transition between stages
- Parallax backgrounds per stage (stacked image layers + gradient fallback)
- HUD driven by Redux (health hearts example)
- Debug panel (Pause, TimeScale, Step Frame). Shown in dev, or in prod when `VITE_SHOW_DEBUG=true` (build-time env var).
- Replay tool (Record / Stop / Replay). Shown in dev, or in prod when `VITE_SHOW_REPLAY=true` (build-time env var).
- Entity inspector + collision overlay. Shown in dev, or in prod when `VITE_SHOW_INSPECTOR=true` (build-time env var).

## Developer Tooling Rationale

This project intentionally includes internal developer tools alongside gameplay
to mirror real-world game development workflows.

### Deterministic Replay

Rather than relying solely on logs, the engine supports deterministic input
recording and replay. Many gameplay bugs are input- and timing-dependent; replay
turns non-reproducible issues into reproducible scenarios that can be inspected
frame-by-frame.

### Non-Invasive Tooling

All tools are implemented at engine boundaries (input, simulation step, runtime
config) and do not modify gameplay logic. Tooling can be enabled or disabled
without affecting physics, collisions, or player behavior, preserving trust in
the simulation.

### Runtime Control & Observability

A dev-only debug panel allows pausing, time scaling, and single-frame stepping,
while an entity inspector visualizes live state (position, velocity, collision
bounds). Together, these tools make engine behavior observable and debuggable
without adding gameplay-side complexity.

### Scalability Considerations

The tooling layer is designed to be portable across multiple games by sharing
stable contracts and opt-in configuration. With additional time, replay artifacts
would be versioned and persisted per build, enabling regression analysis and
cross-title debugging at scale.

## Controls

- Move: `A/D` or `Left/Right`
- Jump: `W` or `Space` (ArrowUp is partially supported; see notes)
- Exit to menu: `Esc`
- Doors: walk into the door zone

## Tech Stack

- React 19 + TypeScript
- Vite + SWC React plugin (`@vitejs/plugin-react-swc`)
- Redux Toolkit + React-Redux (HUD example state)
- Custom game loop via `requestAnimationFrame`
- ESLint flat config (`eslint.config.js`)

## Getting Started

```bash
npm install
npm run dev
```

Build/preview:

```bash
npm run build
npm run preview
```

Other scripts:

- `npm run lint`

## Architecture Overview

### Entry + App Shell

- `index.html` mounts `#root` and loads `src/main.tsx`.
- `src/main.tsx` renders `<App />` inside Redux `<Provider store={store} />` (and React StrictMode).
- `src/App.tsx` renders `src/game/GameRoot.tsx`.

### Screens + Stage Routing

`src/game/GameRoot.tsx` is a tiny screen router:

- `menu` -> `src/game/StartMenu.tsx`
- `game` -> current stage component from `src/game/stages.ts` + `src/game/HUD.tsx`
- `credits` -> `src/game/Credits.tsx`

Stage transitions come from "doors" (trigger rectangles). `GameRoot` maps door ids to the next stage/screen.

### Stages (Content)

Stages are thin wrappers around a shared template:

- `src/game/Stage_1.tsx`
- `src/game/Stage_2.tsx`
- `src/game/Stage_3.tsx`

Each stage passes content into `src/game/stageTemplate/PlatformStage.tsx`:

- `parallaxLayers`: image paths under `public/bg/`
- `platforms`: rectangles `{ x, y, w, h }`
- `doors`: trigger rectangles `{ id, x, y, w, h, label? }`
- `spawn`: player start position

Registered stages live in `src/game/stages.ts`.

Door ids currently used (see `src/game/GameRoot.tsx`):

- stage1: `toStage2` -> stage2
- stage2: `toStage3` -> stage3
- stage3: `toCredits` -> credits

### Game Loop + Rendering (PlatformStage)

`src/game/stageTemplate/PlatformStage.tsx` owns most runtime behavior:

- Input is a mutable object created once (`createInputState`) and mutated by keyboard event listeners (`bindKeyboard`).
- Player is a single mutable object (created once) and mutated each frame.
- A `requestAnimationFrame` loop:
  - clamps `dt` to avoid tab-switch delta spikes
  - supports dev-time pause / timeScale / single-frame stepping via `EngineConfig` (see `src/game/engine/config.ts`)
  - calls `stepPlayer(...)` (physics + collisions + door triggers)
  - calls `updatePlayerAnimation(...)`
  - triggers a tiny rerender so styles update
- Camera: horizontal follow, clamped to world bounds.
- Background: stacked parallax images; each layer hides itself on load error and a gradient fallback stays visible.
- Player sprites: frame-by-frame PNGs; falls back to a blue rectangle if sprites fail.

## Engine Modules

Located in `src/game/engine/`:

- `types.ts` - shared types (`Rect`, `PlayerState`, etc.)
- `input.ts` - keyboard binding + edge-trigger jump (`jumpPressed`)
- `aabb.ts` - AABB intersection helper
- `physics.ts` - `stepPlayer(...)` integration + collisions + door triggers
- `animation.ts` - sprite frame lists + animation timing/state

## UI State (Redux)

Redux is used for UI demonstration (HUD), not gameplay state:

- `src/store.ts` - store configuration
- `src/features/healthSlice.ts` - health reducers (`damage`, `heal`, `resetHealth`, `setMaxHealth`)
- `src/game/HUD.tsx` - reads `health.current/max` and renders heart icons

No gameplay code currently dispatches health actions.

## Assets

Assets are served from `public/` and referenced via absolute paths (example: `/sprites/player/run_right_0.png`).

- `public/bg/` - parallax layers
- `public/sprites/player/` - player sprite frames (idle/run/jump; left/right)
- `public/ui/Heart.png` - HUD hearts

## Styling

The app imports `src/styles.css` from `src/main.tsx`.

`src/index.css` and `src/App.css` exist but are not currently imported (likely leftovers from the default Vite template).

## Notes / Known Quirks

- If sprites fail to load, the player shows a fallback rectangle so the game remains playable.
- `ArrowUp` is handled on keydown for jump, but keyup does not clear jump for ArrowUp (see `src/game/engine/input.ts`).
- Falling off the world resets the player to `(40, 40)` (not the current stage spawn) (see `src/game/engine/physics.ts`).
- Stage 1 door placement: the `toStage2` door is at x=2600, while the last ground segment ends at x=2500, so it may be unreachable without additional platforms/ground (see `src/game/Stage_1.tsx`).
- Debug UI (Pause / TimeScale / Step Frame) renders in dev by default. To enable it in a production build, set `VITE_SHOW_DEBUG=true` at build time (Vercel Environment Variables) and redeploy.
- Replay tool (Record / Stop / Replay) renders in dev by default. To enable it in a production build, set `VITE_SHOW_REPLAY=true` at build time (Vercel Environment Variables) and redeploy.
- Inspector tools (Entity Inspector + AABB overlay) render in dev by default. To enable them in a production build, set `VITE_SHOW_INSPECTOR=true` at build time (Vercel Environment Variables) and redeploy.
- `public/index.html` looks like an older CRA template; Vite uses the root `index.html`.
- `.vercel/` and `.env*.local` are intentionally ignored by git (see `.gitignore`).

## Project Layout (Quick Map)

- `src/game/engine/` - input, physics, collisions, animation
- `src/game/stageTemplate/PlatformStage.tsx` - shared renderer + loop + camera/parallax
- `src/game/Stage_*.tsx` - stage content (platforms, doors, spawn, backgrounds)
- `src/game/GameRoot.tsx` - screen + stage routing
- `src/store.ts`, `src/features/healthSlice.ts` - Redux store + example slice
- `public/` - static assets (sprites/backgrounds/ui)

## Repo Report

For a codebase-level scan (key files + gotchas), see `report.md`.

## Potential Extensions

- Replace placeholder rectangles with tilemaps (Tiled) + a level pipeline
- Improve movement feel (coyote time, jump buffering, one-way platforms, slopes)
- Add enemies/collectibles + checkpoints (spawn per stage)
- Consider rendering to `canvas` (or a lightweight renderer) for performance
- Add sound/FX and a real pause/settings screen
- Add tests for core utilities (AABB + physics invariants) and CI


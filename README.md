
# Vite React Platformer

Live demo: https://vite-react-platformer-mrgbpjpygmailcoms-projects.vercel.app/

A small Mario-like 2D platformer prototype built with **React + TypeScript + Vite**. Gameplay is stepped by a lightweight TypeScript "engine" (input, physics, collisions, animation) and rendered with simple, positioned DOM elements (no canvas).

The project goal is practicing game-loop fundamentals in a web app: frame stepping, platform collisions, stage routing, and keeping gameplay code separated from UI state.

## Features

- Start menu -> play through multiple stages -> credits
- Platformer movement (run + jump + short-hop)
- AABB platform collisions (ground/ceiling + basic side resolution)
- Horizontal camera follow + world bounds clamping
- Door trigger zones to transition between stages
- Parallax background layers per stage (stacked images + fallback gradient)
- HUD driven by Redux (health hearts example)

## Controls

- Move: `A/D` or `Left/Right`
- Jump: `W` or `Space` (also supports `ArrowUp` on keydown)
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

## How It Works

### App + Screen Routing

- `index.html` mounts `#root` and loads `src/main.tsx`.
- `src/main.tsx` wraps the app in Redux `<Provider store={store} />`.
- `src/App.tsx` renders `src/game/GameRoot.tsx`.

`src/game/GameRoot.tsx` is a small screen router:

- `menu` -> `src/game/StartMenu.tsx`
- `game` -> current stage component + `src/game/HUD.tsx`
- `credits` -> `src/game/Credits.tsx`

### Stages / Content

Stages are declared in `src/game/stages.ts` and implemented as thin wrappers around a shared stage template:

- `src/game/Stage_1.tsx`
- `src/game/Stage_2.tsx`
- `src/game/Stage_3.tsx`

Each stage passes these props into `src/game/stageTemplate/PlatformStage.tsx`:

- `parallaxLayers`: image paths under `public/bg/`
- `platforms`: array of `{ x, y, w, h }` rectangles
- `doors`: array of trigger rectangles with `id` and optional `label`
- `spawn`: player start position

Door ids are routed in `src/game/GameRoot.tsx`:

- stage1: `toStage2` -> stage2
- stage2: `toStage3` -> stage3
- stage3: `toCredits` -> credits

### Game Loop + Rendering (PlatformStage)

`src/game/stageTemplate/PlatformStage.tsx` owns most of the runtime:

- Input is a mutable object created once (`createInputState`) and updated by DOM key events (`bindKeyboard`).
- Player is a single mutable object (stored via `useState(() => initialPlayer)`), mutated each frame.
- A `requestAnimationFrame` loop steps physics + animation, clamps `dt`, and forces a tiny rerender.
- Camera: horizontal follow based on player X, clamped to `WORLD`.
- Background: parallax `<img>` layers with a gradient fallback if an image fails.
- Player rendering: frame-by-frame sprites from `public/sprites/player/`; falls back to a blue rectangle if sprites fail.

## Engine Modules

Located in `src/game/engine/`:

- `types.ts` - shared types (`Rect`, `PlayerState`, etc.)
- `input.ts` - keyboard binding + edge-trigger jump (`jumpPressed`)
- `aabb.ts` - AABB intersection
- `physics.ts` - `stepPlayer(...)` integration + collisions + door triggers
- `animation.ts` - sprite frame lists + animation timing/state

## UI State (Redux)

Redux is currently used for UI demonstration (HUD), not gameplay logic:

- `src/store.ts` configures the store
- `src/features/healthSlice.ts` defines health reducers (`damage`, `heal`, etc.)
- `src/game/HUD.tsx` reads `health.current/max` and renders hearts

## Assets

Static assets are served from `public/` and referenced via absolute paths:

- `public/bg/` - stage parallax layers
- `public/sprites/player/` - player sprites (idle/run/jump; left/right)
- `public/ui/Heart.png` - HUD hearts

## Styling

The app imports `src/styles.css` from `src/main.tsx`. (Note: `src/index.css` and `src/App.css` exist but are not currently imported.)

## Notes / Known Quirks

- If sprites fail to load, the player shows a fallback rectangle so the game remains playable.
- Jump supports `ArrowUp` on keydown, but keyup does not clear the jump flag for `ArrowUp` (see `src/game/engine/input.ts`).
- Falling off the world resets the player to `(40, 40)` (not the current stage spawn) (see `src/game/engine/physics.ts`).
- `public/index.html` looks like an older CRA template; Vite uses the root `index.html`.
- `.vercel/` and `.env*.local` are intentionally ignored by git (see `.gitignore`).

## Project Layout (Quick Map)

- `src/game/engine/` - input, physics, collisions, animation
- `src/game/stageTemplate/PlatformStage.tsx` - shared renderer + loop + camera/parallax
- `src/game/Stage_*.tsx` - stage definitions (platforms, doors, spawn, backgrounds)
- `src/game/GameRoot.tsx` - screen + stage routing
- `src/store.ts`, `src/features/healthSlice.ts` - Redux store + example slice
- `public/` - static assets (sprites/backgrounds/ui)

## Next Ideas

- Replace placeholder rectangles with tilemaps (Tiled) + a level pipeline
- Improve movement feel (coyote time, jump buffering, one-way platforms, slopes)
- Add enemies/collectibles + checkpoints (spawn per stage)
- Consider rendering to `canvas` (or a lightweight renderer) for performance
- Add sound/FX and a real pause/settings screen
- Add tests for core utilities (AABB + physics invariants) and CI


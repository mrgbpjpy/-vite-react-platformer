# Vite React Platformer - Codebase Report

This repository is a small Mario-like 2D platformer prototype built with React + TypeScript + Vite. Gameplay is stepped in a lightweight TypeScript "engine" (input/physics/collisions/animation) and rendered with positioned DOM elements (no canvas).

Live demo (from repo README): https://vite-react-platformer-mrgbpjpygmailcoms-projects.vercel.app/

## How To Run

```bash
npm install
npm run dev
```

Other scripts (from `package.json`):

- `npm run build` -> `tsc -b && vite build`
- `npm run preview` -> `vite preview`
- `npm run lint` -> `eslint .`

## Tech Stack

- React 19 (`react`, `react-dom`)
- TypeScript (project references via `tsconfig.json` -> `tsconfig.app.json`, `tsconfig.node.json`)
- Vite + `@vitejs/plugin-react-swc`
- Redux Toolkit + React-Redux (used for HUD example state)
- ESLint flat config (`eslint.config.js`)

## App Entry / Screen Flow

- `index.html` mounts `#root` and loads `src/main.tsx`.
- `src/main.tsx` renders `<App />` inside Redux `<Provider store={store} />`.
- `src/App.tsx` renders `<GameRoot />`.
- `src/game/GameRoot.tsx` is a simple screen router:
  - `menu` -> `src/game/StartMenu.tsx`
  - `game` -> current stage component from `src/game/stages.ts` plus `src/game/HUD.tsx`
  - `credits` -> `src/game/Credits.tsx`

Stage transitions are handled by "door" trigger zones; `GameRoot` maps door ids to next stage/screen.

## Core Game Runtime (PlatformStage)

Most gameplay/rendering is centralized in `src/game/stageTemplate/PlatformStage.tsx`.

- Defines constants:
  - `WORLD = { w: 4000, h: 440 }`
  - `VIEW = { w: 900, h: 440 }`
- Creates a mutable input object via `createInputState()` and binds keyboard listeners with `bindKeyboard()`.
- Creates a single mutable `player` state object (kept stable via `useState(() => initialPlayer)`), then mutates it each frame.
- Runs a `requestAnimationFrame` loop:
  - Computes `dt` in seconds and clamps it: `Math.min(0.033, (now - last) / 1000)`
  - Calls `stepPlayer(player, input, platforms, doors, dt, WORLD, onDoor)`
  - Calls `updatePlayerAnimation(player, dt)`
  - Forces a tiny React rerender via `setTick(...)` so DOM styles update
- Camera:
  - Horizontal follow only (computed from player X)
  - Clamped so the viewport never shows outside the world
- Parallax backgrounds:
  - `parallaxLayers` are `<img>` elements stacked behind gameplay
  - Offset is based on `-player.pos.x * speed` per layer
- Rendering:
  - Platforms/doors/player are absolutely positioned divs inside a translated `.world`
  - Player uses frame-by-frame sprites; if sprites fail to load it shows a blue fallback rectangle
  - A small debug line renders player position/velocity/onGround

### Developer Tools (Runtime)

The runtime includes optional developer tooling that mounts alongside gameplay.
These tools are gated by build-time env vars and default to enabled in dev.

- Debug controls: `src/game/tools/EngineDebugPanel.tsx`
  - Pause, time scale, and single-frame stepping via `src/game/engine/config.ts` (`EngineConfig`)
  - Mounted at the `stageWrap` level in `src/game/stageTemplate/PlatformStage.tsx`
  - Enabled when `import.meta.env.DEV` or `VITE_SHOW_DEBUG=true`
- Deterministic replay: `src/game/tools/ReplayPanel.tsx` + `src/game/engine/replay.ts`
  - Records input streams and replays them deterministically through the same simulation step
  - Mounted at the `stageWrap` level in `src/game/stageTemplate/PlatformStage.tsx`
  - Enabled when `import.meta.env.DEV` or `VITE_SHOW_REPLAY=true`
- Entity inspector + collision overlay:
  - Inspector panel: `src/game/tools/EntityInspector.tsx` (fixed-position UI)
  - AABB overlay: `src/game/tools/AABBOverlay.tsx` (world-space boxes)
  - Mounted in `src/game/stageTemplate/PlatformStage.tsx`:
    - Inspector panel at `stageWrap` (top-level, like other tools)
    - Overlay inside `.world`: after platforms/doors and before player
  - Enabled when `import.meta.env.DEV` or `VITE_SHOW_INSPECTOR=true`

## "Engine" Modules

Located in `src/game/engine/`:

- `types.ts`
  - `Rect`, `Vec2`, `Platform`, `Door`, `Facing`, `PlayerState`
- `input.ts`
  - `InputState` has `left`, `right`, `jump`, and `jumpPressed` (edge-trigger)
  - `bindKeyboard()` listens to keydown/keyup and mutates the passed object
- `aabb.ts`
  - `aabbIntersect(a, b)` rectangle intersection
- `physics.ts`
  - `stepPlayer(...)` does the frame step:
    - Horizontal accel + friction, max speed clamp
    - Jump impulse + gravity; early release cuts jump height (short hop)
    - Integrates velocity -> position
    - World bounds clamp; falling below world resets player to `(40, 40)` with zero velocity
    - Platform collisions via AABB; resolves Y first, with simple side resolution when not clearly above/below
    - Door trigger zones via AABB; calls `onDoor(door.id)` when intersecting
    - Resets `input.jumpPressed = false` each frame
- `animation.ts`
  - `getPlayerAnimFrames(facing)` returns hardcoded sprite paths in `public/sprites/player/`
  - `updatePlayerAnimation(player, dt)` selects `idle/run/jump` and advances frame timers

## Stages / Content

Stages are defined as React components that feed data into `PlatformStage`:

- `src/game/stages.ts` registers:
  - `stage1` -> `src/game/Stage_1.tsx`
  - `stage2` -> `src/game/Stage_2.tsx`
  - `stage3` -> `src/game/Stage_3.tsx`

Each stage provides:

- `parallaxLayers`: image paths under `public/bg/`
- `platforms`: an array of `{x,y,w,h}` rectangles
- `doors`: an array of trigger rects with `id` and optional `label`
- `spawn`: initial player position

Door routing (in `src/game/GameRoot.tsx`):

- stage1 door id `toStage2` -> stage2
- stage2 door id `toStage3` -> stage3
- stage3 door id `toCredits` -> credits screen

## UI State (Redux)

Redux is currently used as an example HUD state, not as the gameplay state.

- `src/store.ts` configures a single slice: `health`
- `src/features/healthSlice.ts` contains reducers: `damage`, `heal`, `resetHealth`, `setMaxHealth`
- `src/game/HUD.tsx` renders heart icons from `health.current/max` using `useSelector`

No code currently dispatches health actions during gameplay.

## Styling

Primary styles are in `src/styles.css` (this is what `src/main.tsx` imports).

It defines:

- `.appShell` centered layout
- `.gameRoot` frame and layout
- menu, HUD hearts, stage viewport, parallax background stack
- platform/door/player styling (pixelated sprites)
- a credits screen with a scrolling roll animation

`src/index.css` and `src/App.css` exist but are not imported by the app entrypoint (so they appear unused).

## Static Assets

Assets are served from `public/` and referenced by absolute paths (e.g. `/bg/stage1_layer0.png`).

- Backgrounds: `public/bg/` (stage layers, plus `StartScreen.png`)
- Player sprites: `public/sprites/player/` (idle/run/jump; left/right)
- UI icons: `public/ui/Heart.png` (plus `Start Game.png`)

## Notable Quirks / Gotchas

- `src/game/engine/input.ts`: Jump supports `ArrowUp` on keydown, but keyup does not clear `jump` for `ArrowUp`, so jump may remain "held" if the player uses ArrowUp.
- `src/game/Stage_1.tsx`: The door to Stage 2 is at `x: 2600`, but the last ground segment ends at `x: 2500` (1500 + 1000). As written, the door may be unreachable without additional platforms/ground.
- `src/game/engine/physics.ts`: Falling resets the player to `(40, 40)` rather than the current stage spawn.
- `public/index.html` exists and looks like a Create React App template; Vite uses the root `index.html`, so `public/index.html` is likely unused.
- `.vercel/` exists locally (Vercel linkage metadata). It is ignored by `.gitignore` and should not be committed/shared.
- `.env.local` exists locally and is ignored by `.gitignore` (`.env*.local`). This report did not inspect its contents.

## Recent Changes (Since Prior Report)

- Added inspector tooling:
  - `src/game/tools/EntityInspector.tsx`
  - `src/game/tools/AABBOverlay.tsx`
- Updated `src/game/stageTemplate/PlatformStage.tsx` to mount:
  - `EntityInspector` at the `stageWrap` level
  - `AABBOverlay` inside `.world` between platforms/doors and player
- Updated `README.md` with a "Developer Tooling Rationale" section and `VITE_SHOW_INSPECTOR` documentation.

## Key Files (Quick Map)

- `package.json` (scripts/deps)
- `index.html` (Vite entry)
- `src/main.tsx` (React + Redux Provider mount)
- `src/store.ts`, `src/features/healthSlice.ts` (Redux)
- `src/game/GameRoot.tsx` (screen + stage routing)
- `src/game/stageTemplate/PlatformStage.tsx` (game loop + rendering)
- `src/game/engine/*` (input/physics/animation/aabb/types)
- `src/game/Stage_1.tsx`, `src/game/Stage_2.tsx`, `src/game/Stage_3.tsx` (level content)
- `src/game/tools/EngineDebugPanel.tsx` (debug controls)
- `src/game/tools/ReplayPanel.tsx` (replay UI)
- `src/game/tools/EntityInspector.tsx` (inspector UI)
- `src/game/tools/AABBOverlay.tsx` (AABB world overlay)
- `src/styles.css` (main styling)

## Current Repository File Inventory

This list is intended to be copy/pasted into another tool as a concise snapshot
of the repo contents. It is generated from:

`git ls-files --cached --others --exclude-standard`

So it includes tracked + untracked (non-ignored) files, and excludes ignored
folders like `node_modules/` and build outputs like `dist/`.

```text
src/game/tools/AABBOverlay.tsx
src/game/tools/EntityInspector.tsx
.gitignore
README.md
eslint.config.js
index.html
package-lock.json
package.json
public/bg/StartScreen.png
public/bg/stage1_layer0.png
public/bg/stage1_layer1.png
public/bg/stage1_layer2.jpg
public/bg/stage2_layer0.png
public/bg/stage2_layer1.png
public/bg/stage2_layer2.png
public/bg/stage3_layer1.png
public/index.html
public/sprites/player/idle_left_0.png
public/sprites/player/idle_left_1.png
public/sprites/player/idle_right_0.png
public/sprites/player/idle_right_1.png
public/sprites/player/jump_left_0.png
public/sprites/player/jump_left_1.png
public/sprites/player/jump_right_0.png
public/sprites/player/jump_right_1.png
public/sprites/player/run_left_0.png
public/sprites/player/run_left_1.png
public/sprites/player/run_left_2.png
public/sprites/player/run_left_3.png
public/sprites/player/run_right_0.png
public/sprites/player/run_right_1.png
public/sprites/player/run_right_2.png
public/sprites/player/run_right_3.png
public/ui/Heart.png
public/ui/Start Game.png
public/vite.svg
report.md
src/App.css
src/App.tsx
src/assets/react.svg
src/features/healthSlice.ts
src/game/Credits.tsx
src/game/GameRoot.tsx
src/game/HUD.tsx
src/game/Stage_1.tsx
src/game/Stage_2.tsx
src/game/Stage_3.tsx
src/game/StartMenu.tsx
src/game/engine/aabb.ts
src/game/engine/animation.ts
src/game/engine/config.ts
src/game/engine/input.ts
src/game/engine/physics.ts
src/game/engine/replay.ts
src/game/engine/types.ts
src/game/stageTemplate/PlatformStage.tsx
src/game/stages.ts
src/game/tools/EngineDebugPanel.tsx
src/game/tools/ReplayPanel.tsx
src/index.css
src/main.tsx
src/store.ts
src/styles.css
src/vite-env.d.ts
tsconfig.app.json
tsconfig.json
tsconfig.node.json
vite.config.ts
```

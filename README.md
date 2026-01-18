# Vite React Platformer

Live Demo: https://vite-react-platformer-mrgbpjpygmailcoms-projects.vercel.app/

A small 2D platformer prototype built with **React + TypeScript + Vite**, with a lightweight “engine” (input, physics, collisions, animation) implemented in plain TS and rendered with simple DOM elements.

The goal of this project is to practice game-loop fundamentals in a web app: frame stepping, platform collisions, stage routing, and keeping gameplay code separated from UI.

## What The App Does

- Start menu -> play through multiple stages -> reach credits
- Basic platformer movement (run, jump, short-hop)
- AABB platform collisions (ground / ceiling)
- Simple camera follow
- Door trigger zones to transition between stages
- Parallax background layers per stage
- HUD driven by Redux (example of UI state living alongside game state)

## Controls

- Move: `A/D` or `Left/Right`
- Jump: `W` or `Space`
- Pause/Exit: `Esc` (back to menu)
- Doors: walk into the door zone

## Tech Stack

- React 19 + TypeScript
- Vite (dev server + build)
- Redux Toolkit (HUD/health example)
- Custom game loop via `requestAnimationFrame`

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

## Project Layout (High Level)

- `src/game/engine/` - input handling, physics step, AABB helpers, animation helpers
- `src/game/stageTemplate/PlatformStage.tsx` - shared stage renderer + loop + camera/parallax
- `src/game/Stage_*.tsx` - level definitions (platforms, doors, spawn, background layers)
- `src/store.ts`, `src/features/healthSlice.ts` - Redux store + example slice used by HUD
- `public/` - static assets (sprites/backgrounds)

## Lessons Learned

- Game code feels best when it is **pure and step-based** (ex: `stepPlayer(...)`) and React is used mainly as a renderer.
- Collision resolution is much easier to reason about when resolving **Y before X** (classic platformer feel).
- Clamping `dt` is important; switching tabs can produce huge deltas that break physics.
- Keeping “engine” logic (physics/input) separated from “content” (stage definitions) makes it much easier to iterate.
- Redux is a good fit for UI/state like HUD, but you still want gameplay stepping to stay lean to avoid rerender thrash.

## What I Want To Do Next

- Replace placeholder geometry with tilemaps (Tiled) and a real level pipeline
- Add better collision (slopes, one-way platforms, coyote time, jump buffering)
- Add enemies/collectibles and a simple checkpoint system
- Improve performance by rendering to `canvas` (or using a lightweight renderer) instead of DOM nodes
- Add sound, basic FX, and a proper pause/settings screen
- Add tests for core utilities (AABB + physics invariants) and CI

## Notes

If sprites fail to load, the player shows a simple fallback block so the game remains playable.


import { useEffect, useMemo, useRef, useState } from "react";
import { createInputState, bindKeyboard } from "../engine/input";
import { stepPlayer } from "../engine/physics";
import {
  getPlayerAnimFrames,
  updatePlayerAnimation,
} from "../engine/animation";
import type { Door, Platform, PlayerState, Rect } from "../engine/types";
import { EngineConfig } from "../engine/config";
import { EngineDebugPanel } from "../tools/EngineDebugPanel";
import { ReplayController } from "../engine/replay";
import { ReplayPanel } from "../tools/ReplayPanel";
import { EntityInspector } from "../tools/EntityInspector";
import { AABBOverlay } from "../tools/AABBOverlay";


type Props = {
  stageId: string;
  parallaxLayers: string[];
  platforms: Platform[];
  doors: Door[];
  spawn: { x: number; y: number };
  onDoor: (doorId: string) => void;
  onExitToMenu: () => void;
};

const WORLD = { w: 4000, h: 440 };
const VIEW = { w: 900, h: 440 };

function rectStyle(r: Rect): React.CSSProperties {
  return { left: r.x, top: r.y, width: r.w, height: r.h };
}

export default function PlatformStage({
  stageId,
  parallaxLayers,
  platforms,
  doors,
  spawn,
  onDoor,
  onExitToMenu,
}: Props) {
  const showDebug =
    import.meta.env.DEV || import.meta.env.VITE_SHOW_DEBUG === "true";

  const showReplay =
    import.meta.env.DEV || import.meta.env.VITE_SHOW_REPLAY === "true";

  const showInspector =
    import.meta.env.DEV || import.meta.env.VITE_SHOW_INSPECTOR === "true";


  const input = useMemo(() => createInputState(), []);
  const [, setTick] = useState(0); // tiny rerender trigger
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);


  const [player] = useState<PlayerState>(() => ({
    pos: { x: spawn.x, y: spawn.y },
    vel: { x: 0, y: 0 },
    size: { w: 48, h: 64 },
    onGround: false,
    facing: "right",
    anim: "idle",
    animFrame: 0,
    animTimer: 0,
  }));

  // Only show the blue fallback box if sprite images fail to load.
  const [spriteFailed, setSpriteFailed] = useState(false);

  // simple camera follows player
  // Center camera on player
  let camX = player.pos.x + player.size.w / 2 - VIEW.w / 2;

  // Clamp camera so it never shows outside the world
  camX = Math.max(0, Math.min(camX, WORLD.w - VIEW.w));

  useEffect(() => {
    const unbind = bindKeyboard(input);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onExitToMenu();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      unbind();
      window.removeEventListener("keydown", onKey);
    };
  }, [input, onExitToMenu]);

  useEffect(() => {
    // Initialize timing inside effect to satisfy hook purity rules.
    lastRef.current = performance.now();

    const loop = (now: number) => {
      if(EngineConfig.paused && !EngineConfig.stepOnce){
        lastRef.current = now;
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const last = lastRef.current;
      lastRef.current = now;


      // dt in seconds; clamp to prevent huge jumps when tab switches
      const rawDt = Math.min(0.033, (now- last) /1000);
      const dt = rawDt * EngineConfig.timeScale;

      // physics step
      let frameInput = input;

      if(ReplayController.mode === "replaying"){
        const replayed = ReplayController.nextInput();
        if (replayed) frameInput = replayed;
        // Prevent edge-trigger inputs from accumulating while we ignore live input.
        input.jumpPressed = false;
      } else if (ReplayController.mode === "recording") {
        // Capture input BEFORE physics consumes edge triggers (jumpPressed).
        ReplayController.record(input);
      }

      stepPlayer(player, frameInput, platforms, doors, dt, WORLD, onDoor);

      // animation step
      updatePlayerAnimation(player, dt);

      //consume single-step
      EngineConfig.stepOnce = false;

      // trigger rerender
      setTick((t) => (t + 1) % 1000000);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [doors, input, onDoor, platforms, player]);

  const frames = getPlayerAnimFrames(player.facing);
  const activeFrames = frames[player.anim];
  const frameIndex = player.animFrame % activeFrames.length;
  const frameSrc = activeFrames[frameIndex];

  // Parallax: each layer moves slower than player movement.
  // Using player X (instead of camX) keeps parallax visible even when the camera
  // doesn't scroll (ex: WORLD.w === VIEW.w).
  const parallaxOffsets = parallaxLayers.map((_, i) => {
    const speed = 0.06 + i * 0.12; // layer0 -> layer2
    return -player.pos.x * speed;
  });


  return (
      <div className="stageWrap">
        {showDebug && <EngineDebugPanel />}
        {showReplay && <ReplayPanel />}
        {showInspector && (
          <EntityInspector player={player} platforms={platforms} />
        )}
        <div className="stageHeader">
          <div className="stageTitle">{stageId.toUpperCase()}</div>
          <div className="stageHint">Esc to Menu</div>
        </div>

      <div className="viewport" style={{ width: VIEW.w, height: VIEW.h }}>
        {/* Parallax background */}
        <div className="bgStack">
          <div className="bgFallback" />
          {parallaxLayers.map((src, i) => (
            <img
              key={src}
              className="bgLayer"
              src={src}
              alt=""
              style={{
                transform: `translateX(${parallaxOffsets[i]}px)`,
              }}
              onError={(e) => {
                // If an image path is wrong or missing, hide that layer.
                // The fallback gradient stays visible.
                e.currentTarget.style.display = "none";
              }}
            />
          ))}
        </div>


        {/* World */}
        <div
          className="world"
          style={{
            width: WORLD.w,
            height: WORLD.h,
            transform: `translateX(${-camX}px)`,
          }}
        >
          {/* Platforms */}
          {platforms.map((p, idx) => (
            <div key={idx} className="platform" style={rectStyle(p)} />
          ))}

          {/* Doors (trigger zones) */}
          {doors.map((d) => (
            <div key={d.id} className="door" style={rectStyle(d)}>
              <div className="doorLabel">{d.label ?? d.id}</div>
            </div>
          ))}

          {showInspector && (
            <AABBOverlay player={player} platforms={platforms} />
          )}

          {/* Player */}
          <div
            className="player"
            style={{
              left: player.pos.x,
              top: player.pos.y,
              width: player.size.w,
              height: player.size.h,
            }}
          >
            <img
              className="playerSprite"
              src={frameSrc}
              alt="player"
              onLoad={() => setSpriteFailed(false)}
              onError={() => setSpriteFailed(true)}
            />
            {spriteFailed && <div className="playerFallback" />}
          </div>
        </div>
      </div>

      {/* tiny debug */}
      <div className="debug">
        x:{player.pos.x.toFixed(0)} y:{player.pos.y.toFixed(0)} vx:
        {player.vel.x.toFixed(0)} vy:{player.vel.y.toFixed(0)} ground:
        {String(player.onGround)}
      </div>
    </div>
  );
}

import type { PlayerState, Platform } from "../engine/types";

type Props = {
  player: PlayerState;
  platforms: Platform[];
};

export function AABBOverlay({ player, platforms }: Props) {
  return (
    <>
      {/* Player AABB */}
      <div
        style={{
          position: "absolute",
          left: player.pos.x,
          top: player.pos.y,
          width: player.size.w,
          height: player.size.h,
          border: "2px solid rgba(0,255,255,0.9)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* Platform AABBs */}
      {platforms.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: p.w,
            height: p.h,
            border: "1px solid rgba(255,0,0,0.5)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}

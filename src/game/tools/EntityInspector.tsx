import type { PlayerState, Platform } from "../engine/types";

type Props = {
  player: PlayerState;
  platforms: Platform[];
};

export function EntityInspector({ player, platforms }: Props) {
    return(
        <div
      style={{
        position: "fixed",
        top: 240,
        right: 8,
        padding: 12,
        background: "rgba(0,0,0,0.85)",
        color: "#fff",
        fontFamily: "monospace",
        fontSize: 12,
        zIndex: 9999,
        width: 220,
      }}
    >
            <div style={{ fontWeight: "bold", marginBottom: 6 }}>
            Entity Inspector
            </div>

            <div>pos: {player.pos.x.toFixed(1)}, {player.pos.y.toFixed(1)}</div>
            <div>vel: {player.vel.x.toFixed(1)}, {player.vel.y.toFixed(1)}</div>
            <div>onGround: {String(player.onGround)}</div>
            <div>facing: {player.facing}</div>
            <div>anim: {player.anim}</div>

            <div style={{ marginTop: 6 }}>
                platforms: {platforms.length}
            </div>

        </div>
        
    )
}

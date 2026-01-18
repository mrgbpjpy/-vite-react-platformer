import type { Facing, PlayerState } from "./types";

type AnimSet = {
  idle: string[];
  run: string[];
  jump: string[];
};

export function getPlayerAnimFrames(facing: Facing): AnimSet {
  // Frame-by-frame images (you supply PNGs)
  // If images don't exist, renderer will fall back to a rectangle.
  if (facing === "right") {
    return {
      idle: [
        "/sprites/player/idle_right_0.png",
        "/sprites/player/idle_right_1.png",
      ],
      run: [
        "/sprites/player/run_right_0.png",
        "/sprites/player/run_right_1.png",
        "/sprites/player/run_right_2.png",
        "/sprites/player/run_right_3.png",
      ],
      jump: [
        "/sprites/player/jump_right_0.png",
        "/sprites/player/jump_right_1.png",
      ],
    };
  }
  return {
    idle: ["/sprites/player/idle_left_0.png", "/sprites/player/idle_left_1.png"],
    run: [
      "/sprites/player/run_left_0.png",
      "/sprites/player/run_left_1.png",
      "/sprites/player/run_left_2.png",
      "/sprites/player/run_left_3.png",
    ],
    jump: ["/sprites/player/jump_left_0.png", "/sprites/player/jump_left_1.png"],
  };
}

export function updatePlayerAnimation(player: PlayerState, dt: number) {
  // Decide animation state
  const moving = Math.abs(player.vel.x) > 10;
  if (!player.onGround) player.anim = "jump";
  else if (moving) player.anim = "run";
  else player.anim = "idle";

  // Frame timing (hold key => loop run frames)
  const fps = player.anim === "run" ? 12 : player.anim === "jump" ? 10 : 6;
  const frameTime = 1 / fps;

  player.animTimer += dt;
  if (player.animTimer >= frameTime) {
    player.animTimer -= frameTime;
    player.animFrame += 1;
  }
}

import type { InputState } from "./input";
import type { Door, Platform, PlayerState, Rect } from "./types";
import { aabbIntersect } from "./aabb";

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

/**
 * “Calculus” approach:
 *  - acceleration integrates into velocity: v(t+dt) = v(t) + a * dt
 *  - velocity integrates into position:     x(t+dt) = x(t) + v * dt
 *
 * dt is in seconds.
 */
export function stepPlayer(
  player: PlayerState,
  input: InputState,
  platforms: Platform[],
  doors: Door[],
  dt: number,
  world: { w: number; h: number },
  onDoor: (doorId: string) => void
) {
  // ----- Horizontal movement (you can discuss trig by using sin-based easing if desired) -----
  // "Trig flavor": accelerate based on a smooth curve of input strength (sin)
  const moveDir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const inputStrength = Math.abs(moveDir); // 0 or 1
  const eased = Math.sin((inputStrength * Math.PI) / 2); // 0..1 using sine easing

  const RUN_ACCEL = 2200; // px/s^2
  const MAX_SPEED = 260; // px/s
  const FRICTION = 2200; // px/s^2 (when no input)

  if (moveDir !== 0) {
    player.vel.x += moveDir * RUN_ACCEL * eased * dt;
    player.vel.x = clamp(player.vel.x, -MAX_SPEED, MAX_SPEED);
    player.facing = moveDir < 0 ? "left" : "right";
  } else {
    // friction toward 0
    const sign = Math.sign(player.vel.x);
    const decel = FRICTION * dt;
    const next = Math.abs(player.vel.x) - decel;
    player.vel.x = next <= 0 ? 0 : sign * next;
  }

  // ----- Jump -----
  const GRAVITY = 1800; // px/s^2
  const JUMP_VEL = 620; // px/s (instant impulse)
  const SHORT_HOP_CUT = 0.55; // release jump early → smaller jump

  if (input.jumpPressed && player.onGround) {
    player.vel.y = -JUMP_VEL;
    player.onGround = false;
  }

  // gravity integrates into velocity (calculus integration)
  player.vel.y += GRAVITY * dt;

  // optional: short hop (if they release jump, reduce upward velocity)
  if (!input.jump && player.vel.y < 0) {
    player.vel.y *= SHORT_HOP_CUT;
  }

  // ----- Integrate position (calculus integration) -----
  const prev = { x: player.pos.x, y: player.pos.y };
  player.pos.x += player.vel.x * dt;
  player.pos.y += player.vel.y * dt;

  // ----- World bounds -----
  player.pos.x = clamp(player.pos.x, 0, world.w - player.size.w);

  // If falls off bottom: reset to top-ish
  if (player.pos.y > world.h + 200) {
    player.pos.x = 40;
    player.pos.y = 40;
    player.vel.x = 0;
    player.vel.y = 0;
  }

  // ----- Platform collisions (AABB) -----
  player.onGround = false;

  const playerRect = (): Rect => ({
    x: player.pos.x,
    y: player.pos.y,
    w: player.size.w,
    h: player.size.h,
  });

  // Resolve Y collisions first (classic platformer feel)
  // Check each platform: if we intersect, push player out based on previous position.
  for (const p of platforms) {
    const r = playerRect();
    if (!aabbIntersect(r, p)) continue;

    const wasAbove = prev.y + player.size.h <= p.y;
    const wasBelow = prev.y >= p.y + p.h;

    if (wasAbove) {
      // land on top
      player.pos.y = p.y - player.size.h;
      player.vel.y = 0;
      player.onGround = true;
    } else if (wasBelow) {
      // hit head
      player.pos.y = p.y + p.h;
      player.vel.y = Math.max(0, player.vel.y);
    } else {
      // side collision: resolve X
      const wasLeft = prev.x + player.size.w <= p.x;
      const wasRight = prev.x >= p.x + p.w;

      if (wasLeft) {
        player.pos.x = p.x - player.size.w;
        player.vel.x = Math.min(0, player.vel.x);
      } else if (wasRight) {
        player.pos.x = p.x + p.w;
        player.vel.x = Math.max(0, player.vel.x);
      }
    }
  }

  // ----- Door trigger collisions (AABB) -----
  const r = playerRect();
  for (const d of doors) {
    if (aabbIntersect(r, d)) {
      onDoor(d.id);
    }
  }

  // reset edge trigger each frame
  input.jumpPressed = false;
}

export type Rect = { x: number; y: number; w: number; h: number };

export type Vec2 = { x: number; y: number };

export type Door = Rect & { id: string; label?: string };

export type Platform = Rect;

export type Facing = "left" | "right";

export type PlayerState = {
  pos: Vec2;
  vel: Vec2;
  size: { w: number; h: number };
  onGround: boolean;
  facing: Facing;

  // animation
  anim: "idle" | "run" | "jump";
  animFrame: number;
  animTimer: number;
};

export type InputState = {
  left: boolean;
  right: boolean;
  jump: boolean;
  jumpPressed: boolean; // edge trigger (pressed this frame)
};

export function createInputState(): InputState {
  return { left: false, right: false, jump: false, jumpPressed: false };
}

export function bindKeyboard(input: InputState) {
  const down = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();

    if (k === "a" || e.key === "ArrowLeft") input.left = true;
    if (k === "d" || e.key === "ArrowRight") input.right = true;

    if (
      k === "w" ||
      e.key === " " ||
      e.key === "ArrowUp" ||
      e.code === "Space"
    ) {
      if (!input.jump) input.jumpPressed = true; // edge trigger
      input.jump = true;
    }

    if (e.key === " ") e.preventDefault();
  };

  const up = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (k === "a" || e.key === "ArrowLeft") input.left = false;
    if (k === "d" || e.key === "ArrowRight") input.right = false;

    if (k === "w" || e.key === " " || e.code === "Space") {
      input.jump = false;
    }
  };

  window.addEventListener("keydown", down);
  window.addEventListener("keyup", up);

  return () => {
    window.removeEventListener("keydown", down);
    window.removeEventListener("keyup", up);
  };
}

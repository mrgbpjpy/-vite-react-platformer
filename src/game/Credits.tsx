import { useEffect, useRef } from "react";

type Props = {
  onBackToMenu: () => void;
};

export default function Credits({ onBackToMenu }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        onBackToMenu();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBackToMenu]);

  return (
    <div className="creditsScreen">
      <div className="creditsTop">
        <h2>Credits</h2>
        <button className="btn" onClick={onBackToMenu}>
          Back to Menu
        </button>
        <p className="subtitle">Press Esc / Enter / Space to return</p>
      </div>

      <div className="creditsViewport">
        <div ref={wrapRef} className="creditsRoll">
          <h3>Developer</h3>
          <p>Erick Esquilin</p>

          <h3>Game Development</h3>
          <p>React + Redux Toolkit</p>
          <p>AABB collisions • Parallax • Animation loops</p>

          <h3>Controls</h3>
          <p>A/D or ←/→ to run</p>
          <p>W or Space to jump</p>

          <h3>Thanks for playing!</h3>
          <p style={{ marginTop: 40, opacity: 0.8 }}></p>
        </div>
      </div>
    </div>
  );
}

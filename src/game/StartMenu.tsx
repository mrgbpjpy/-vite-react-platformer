type Props = {
  onStart: () => void;
};

export default function StartMenu({ onStart }: Props) {
  return (
    <div className="menu">
      <h1 className="title">2D Platformer (React + Redux)</h1>
      <p className="subtitle">
        Move: A/D or ←/→ • Jump: W or Space • Door: walk into it
      </p>

      <button className="btn" onClick={onStart}>
        Start Game
      </button>

      <div className="hint">
        Tip: Drop your PNG assets into <code>public/</code> folders (see file
        tree).
      </div>
    </div>
  );
}

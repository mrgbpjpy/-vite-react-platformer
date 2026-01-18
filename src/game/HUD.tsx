import { useSelector } from "react-redux";
import type { RootState } from "../store";

export default function HUD() {
  const { current, max } = useSelector((s: RootState) => s.health);

  const hearts = Array.from({ length: max }, (_, i) => i < current);

  return (
    <div className="hud">
      <div className="hearts">
        {hearts.map((filled, i) => (
          <img
            key={i}
            className={`heart ${filled ? "" : "heartDim"}`}
            src="/ui/Heart.png"
            alt="heart"
            onError={(e) => {
              // fallback: show a simple square if missing image
              const img = e.currentTarget;
              img.style.display = "none";
            }}
          />
        ))}

        {/* Fallback boxes if no PNGs exist */}
        
      </div>
    </div>
  );
}

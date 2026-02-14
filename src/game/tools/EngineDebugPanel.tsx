import { EngineConfig } from "../engine/config";

export function EngineDebugPanel() {
  return (
    <div
      style={{
        position: "fixed",
        top: 8,
        right: 8,
        padding: 12,
        background: "rgba(0,0,0,0.8)",
        color: "#0f0",
        fontFamily: "monospace",
        fontSize: 12,
        zIndex: 9999,
      }}
    >
      <div>
        <label>
          <input
            type="checkbox"
            checked={EngineConfig.paused}
            onChange={(e) => (EngineConfig.paused = e.target.checked)}
          />
          Pause
        </label>
      </div>

      <div>
        <label>
          TimeScale
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.1}
            value={EngineConfig.timeScale}
            onChange={(e) =>
              (EngineConfig.timeScale = Number(e.target.value))
            }
          />
        </label>
      </div>

      <button onClick={() => (EngineConfig.stepOnce = true)}>
        Step Frame
      </button>
    </div>
  );
}

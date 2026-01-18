import { useMemo, useState } from "react";
import StartMenu from "./StartMenu";
import HUD from "./HUD";
import Credits from "./Credits";
import { type StageId, STAGES } from "./stages";

type Screen = "menu" | "game" | "credits";

export default function GameRoot() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [stageId, setStageId] = useState<StageId>("stage1");

  const stage = useMemo(() => STAGES[stageId], [stageId]);

  return (
    <div className="gameRoot">
      {screen === "menu" && (
        <StartMenu
          onStart={() => {
            setStageId("stage1");
            setScreen("game");
          }}
        />
      )}

      {screen === "game" && (
        <>
        <div style={{position: "absolute",left: '10%'}}>
          <HUD />
        </div>
          <stage.Component
            onDoor={(doorId: string) => {
              // Door routing:
              if (stageId === "stage1" && doorId === "toStage2") {
                setStageId("stage2");
              } else if (stageId === "stage2" && doorId === "toStage3") {
                setStageId("stage3");
              } else if (stageId === "stage3" && doorId === "toCredits") {
                setScreen("credits");
              }
            }}
            onExitToMenu={() => setScreen("menu")}
          />
        </>
      )}

      {screen === "credits" && (
        <Credits
          onBackToMenu={() => {
            setScreen("menu");
            setStageId("stage1");
          }}
        />
      )}
    </div>
  );
}

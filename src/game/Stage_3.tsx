import PlatformStage from "./stageTemplate/PlatformStage";

export default function Stage3(props: {
  onDoor: (doorId: string) => void;
  onExitToMenu: () => void;
}) {
  return (
    <PlatformStage
      stageId="stage3"
      parallaxLayers={[
        "/bg/stage2_layer1.png",
        "/bg/stage3_layer1.png",
        
      ]}
      platforms={[
        //ground
       { x: 0, y: 400, w: 900, h: 60 },
        { x: 1000, y: 400, w: 400, h: 60 },
        { x: 1500, y: 400, w: 1000, h: 60 },

        { x: 100, y: 300, w: 150, h: 20 },
        { x: 300, y: 280, w: 140, h: 20 },
        { x: 520, y: 240, w: 140, h: 20 },
        { x: 700, y: 200, w: 120, h: 20 },
        { x: 1800, y: 300, w: 120, h: 20 },
        { x: 2000, y: 200, w: 120, h: 20 },
      ]}
      doors={[
        { id: "toCredits", x: 2075, y: 125, w: 40, h: 60, label: "Credits" },
      ]}
      spawn={{ x: 40, y: 320 }}
      {...props}
    />
  );
}

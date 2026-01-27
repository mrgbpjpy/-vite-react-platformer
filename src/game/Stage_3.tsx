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
        { x: 0, y: 395, w: 900, h: 60 },
        { x: 100, y: 320, w: 150, h: 20 },
        { x: 300, y: 280, w: 140, h: 20 },
        { x: 520, y: 240, w: 140, h: 20 },
        { x: 700, y: 200, w: 120, h: 20 },
        { x: 2000, y: 200, w: 120, h: 20 },
      ]}
      doors={[
        { id: "toCredits", x: 820, y: 71, w: 40, h: 60, label: "Credits" },
      ]}
      spawn={{ x: 40, y: 320 }}
      {...props}
    />
  );
}

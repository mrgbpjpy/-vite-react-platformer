import PlatformStage from "./stageTemplate/PlatformStage";

export default function Stage2(props: {
  onDoor: (doorId: string) => void;
  onExitToMenu: () => void;
}) {
  return (
    <PlatformStage
      stageId="stage2"
      parallaxLayers={[
        "/bg/stage2_layer0.png",
        "/bg/stage2_layer1.png",
        "/bg/stage2_layer2.png",
      ]}
      platforms={[
        { x: 0, y: 395, w: 900, h: 60 },
        { x: 120, y: 310, w: 160, h: 20 },
        { x: 320, y: 270, w: 140, h: 20 },
        { x: 520, y: 230, w: 140, h: 20 },
        { x: 700, y: 190, w: 120, h: 20 },
      ]}
      doors={[
        { id: "toStage3", x: 780, y: 120, w: 40, h: 60, label: "Stage 3" },
      ]}
      spawn={{ x: 40, y: 320 }}
      {...props}
    />
  );
}

import PlatformStage from "./stageTemplate/PlatformStage";

export default function Stage1(props: {
  onDoor: (doorId: string) => void;
  onExitToMenu: () => void;
}) {
  return (
    <PlatformStage
      stageId="stage1"
      parallaxLayers={[
        "/bg/stage1_layer0.png",
        "/bg/stage1_layer1.png",
        "/bg/stage1_layer2.jpg",
      ]}
      platforms={[
        // ground
        { x: 0, y: 400, w: 900, h: 60 },
        { x: 1000, y: 400, w: 400, h: 60 },
        { x: 1500, y: 400, w: 1000, h: 60 },
        // floating platforms
        { x: 140, y: 330, w: 160, h: 20 },
        { x: 360, y: 260, w: 140, h: 20 },
        { x: 560, y: 200, w: 160, h: 20 },
      ]}
      doors={[
        { id: "toStage2", x: 2600, y: 325, w: 40, h: 60, label: "Stage 2" },
      ]}
      spawn={{ x: 40, y: 320 }}
      {...props}
    />
  );
}

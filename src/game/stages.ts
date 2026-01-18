import Stage1 from "./Stage_1";
import Stage2 from "./Stage_2";
import Stage3 from "./Stage_3";

export type StageId = "stage1" | "stage2" | "stage3";

export const STAGES: Record<StageId, { Component: any; name: string }> = {
  stage1: { Component: Stage1, name: "Stage 1" },
  stage2: { Component: Stage2, name: "Stage 2" },
  stage3: { Component: Stage3, name: "Stage 3" },
};

import type {InputState} from "./input"

export type ReplayFrame = {
    input: InputState;
};

export const ReplayController = {
    mode: "idle" as "idle" | "recording" | "replaying",
    frames: [] as ReplayFrame[],
    index: 0,

    startRecording() {
        this.frames = [];
        this.index = 0;
        this.mode = "recording";
    },

    stopRecording() {
        this.mode = "idle";
    },

    startReplay() {
        if (this.frames.length === 0) return;
        this.index = 0;
        this.mode = "replaying";
    },

    stopReplay() {
        this.mode = "idle";
    },

    record(input: InputState){
        this.frames.push({
            input: {...input},
        });
    },

    nextInput(): InputState | null {
        if(this.index >= this.frames.length){
            this.stopReplay();
            return null;
        }
        // Return a copy so downstream systems can safely mutate edge triggers.
        return { ...this.frames[this.index++].input };
    }
}

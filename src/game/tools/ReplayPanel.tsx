import { ReplayController } from "../engine/replay";

export function ReplayPanel(){
    return(
        <div 
            style={{
                position: "fixed",
                top: 120,
                right: 8,
                padding: 12,
                background: "rgba(0,0,0,0.8)",
                color: "#0ff",
                fontFamily: "monospace",
                fontSize: 12,
                zIndex: 9999,
            }}
        >

            <div>Replay Tool</div>
            <button onClick={() => ReplayController.startRecording()}>
                Record
            </button>
            <button onClick={() => ReplayController.stopRecording()}>
                Stop
            </button>
            <button onClick={() => ReplayController.startReplay()}>
                Replay
            </button>
        </div>
    );
}
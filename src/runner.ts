import { Component } from "./component";
import { CursorCanvas } from "./cursor";
import { FrameUpdater } from "./frameupdater";
import { Replay, ReplayRecorder } from "./replay";
import { State } from "./state";

export class GameRunner {
    components: Component[] = [];
    updaters: FrameUpdater[] = [];
    recorders: ReplayRecorder[] = [];

    replays: Replay[];
    merged: Replay;

    state: State;
    startTime: number | null = null;

    cursorCanvas: CursorCanvas;

    constructor(replays?: Replay[]) {
        this.replays = replays ?? [];
        this.merged = Replay.merge(this.replays);
        this.state = new State();

        this.cursorCanvas = new CursorCanvas();
        this.components.push(this.cursorCanvas);
        this.recorders.push(this.cursorCanvas);
        this.updaters.push(this.cursorCanvas);
    }

    async start() {
        await this.cursorCanvas.loadImage();
        for (const r of this.recorders) {
            r.load(this.merged);
        }
        this.state = new State();
        for (const c of this.components) {
            c.init(this.state);
        }
        this.startTime = Date.now();
    }

    draw() {
        if (this.startTime === null) {
            return;
        }

        const endFrame = Date.now() - this.startTime;
        while (this.state.frame != endFrame) {
            this.state.frame++;
            for (const f of this.updaters) {
                f.frame(this.state);
            }
        }
        for (const c of this.components) {
            c.update(this.state);
        }
    }

    stop() {
        let replay = new Replay(this.replays.length.toString());
        for (const r of this.recorders) {
            r.save(replay);
        }
        this.replays.push(replay);
        this.merged = Replay.merge([this.merged, replay]);
        this.startTime = null;
    }
}

import { Component } from "./component";
import { FrameUpdater } from "./frameupdater";
import { Replay, ReplayRecorder } from "./replay";
import { State } from "./state";

export class GameRunner {
    components: Component[] = [];
    updaters: FrameUpdater[] = [];
    recorders: ReplayRecorder[] = [];

    replays: Replay[];
    merged: Replay;

    state: State = new State();
    startTime: number | null = null;

    constructor(replays?: Replay[]) {
        this.replays = replays ?? [];
        this.merged = Replay.merge(this.replays);
    }

    start() {
        for (const r of this.recorders) {
            r.load(this.merged);
        }
        this.startTime = Date.now();
        this.state = new State();
        console.log(this.state);
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
        console.log(this.merged);
        this.startTime = null;
    }
}

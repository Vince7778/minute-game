import { State } from "./state";

export interface FrameUpdater {
    frame(state: State): void;
}

import { State } from "./state";

export interface Component {
    elem: HTMLElement | null;
    init(state: State): HTMLElement;
    update(state: State): void;
}

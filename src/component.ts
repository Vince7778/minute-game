import { State } from "./state";

export interface Component {
    id: string;
    init(state: State): void;
    update(state: State): void;
}

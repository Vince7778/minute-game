import { Component } from "./component";
import { State } from "./state";

type TextFn = (state: State) => string;
export class CText implements Component {
    elem: HTMLElement | null = null;
    fn: TextFn;

    constructor(fn: TextFn) {
        this.fn = fn;
    }

    init(state: State): HTMLElement {
        let e = document.createElement("div");
        e.innerText = this.fn(state);
        this.elem = e;
        return e;
    }

    update(state: State): void {
        if (!this.elem) return;
        this.elem.innerText = this.fn(state);
    }
}

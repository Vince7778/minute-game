import { Component } from "./component";
import { GameRunner } from "./runner";
import { State } from "./state";

type TextFn = (state: State) => string;
export class CText implements Component {
    id: string;
    fn: TextFn;
    color?: string;

    constructor(id: string, fn: TextFn, color?: string) {
        this.id = id;
        this.fn = fn;
        this.color = color;
    }

    getElem(): HTMLElement {
        let e = document.getElementById(this.id);
        if (!e) {
            throw new Error(`No element with id ${this.id} exists`);
        }
        return e;
    }

    init(state: State): void {
        let e = this.getElem();
        if (e.hasChildNodes()) {
            this.update(state);
            return;
        }

        e.innerText = this.fn(state);
        e.classList.add("ctext");
        if (this.color) e.style.color = this.color;
    }

    addTo(runner: GameRunner) {
        runner.components.push(this);
    }

    update(state: State): void {
        let e = this.getElem();
        e.innerText = this.fn(state);
    }
}

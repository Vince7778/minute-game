import { Component } from "./component";
import { GameRunner } from "./runner";
import { State } from "./state";

type TextFn = (state: State) => string;
export class CText implements Component {
    id: string;
    fn: TextFn;

    constructor(id: string, fn: TextFn) {
        this.id = id;
        this.fn = fn;
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
        e.innerText = this.fn(state);
        e.classList.add("ctext");
    }

    addTo(runner: GameRunner) {
        runner.components.push(this);
        this.init(runner.state);
    }

    update(state: State): void {
        let e = this.getElem();
        e.innerText = this.fn(state);
    }
}

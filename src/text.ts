import { Component } from "./component";
import { GameRunner } from "./runner";
import { State } from "./state";

// order matters!
const SUBS = [
    { "r": /\blemons?\b/, "color": "lightgoldenrodyellow" },
    { "r": /\b(lemonade )?stand\b/, "color": "goldenrod" },
    { "r": /\blemonades?\b/, "color": "lemonchiffon" },
    { "r": /\$\d+\b/, "color": "lightgreen" },
];

class TextFragment {
    t: string;
    color?: string;

    constructor(t: string, color?: string) {
        this.t = t;
        this.color = color;
    }

    toSpan(): HTMLSpanElement {
        const el = document.createElement("span");
        if (this.color) el.style.color = this.color;
        el.innerText = this.t;
        return el;
    }
}

function substitute(t: string): TextFragment[] {
    for (const sub of SUBS) {
        const res = sub.r.exec(t);
        if (res) {
            console.log("matched");
            const frag = new TextFragment(res[0], sub.color);
            const before = t.substring(0, res.index);
            const after = t.substring(res.index + res[0].length);
            return [...substitute(before), frag, ...substitute(after)];
        }
    }
    return [new TextFragment(t)];
}

// Automatically colors text based on keywords
export function fancyText(t: string, el?: HTMLElement): HTMLElement {
    const sub = substitute(t);
    if (!el) el = document.createElement("div");
    el.replaceChildren(...sub.map(s => s.toSpan()));
    return el;
}

type TextFn = (state: State) => string;
export class CText implements Component {
    id: string;
    fn: TextFn;

    curText: string = "";

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
        const e = this.getElem();
        if (e.hasChildNodes()) {
            this.update(state);
            return;
        }

        const text = this.fn(state);
        fancyText(text, e);
        this.curText = text;
        e.classList.add("ctext");
    }

    addTo(runner: GameRunner) {
        runner.components.push(this);
    }

    update(state: State): void {
        const newText = this.fn(state);
        if (newText !== this.curText) {
            const e = this.getElem();
            fancyText(newText, e);
            this.curText = newText;
        }
    }
}

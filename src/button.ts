import { Component } from "./component";
import { FrameUpdater } from "./frameupdater";
import { Interaction } from "./interaction";
import { State } from "./state";

type CompleteFn = (state: State, completions: number) => void;
export class CButton implements Component, FrameUpdater {
    id: string;
    elem: HTMLElement | null = null;
    maxProgress: number;
    progress: number = 0;
    clickers: number = 0;
    realMousePressed: boolean = false;
    onComplete: CompleteFn;

    constructor(id: string, maxProgress: number, onComplete: CompleteFn) {
        this.id = id;
        this.maxProgress = maxProgress;
        this.onComplete = onComplete;
    }

    frame(state: State) {
        this.progress += this.clickers;
        if (this.progress >= this.maxProgress) {
            let completions = Math.floor(this.progress / this.maxProgress);
            this.onComplete(state, completions);
            this.progress -= this.maxProgress * completions;
        }
    }

    init(_: State): HTMLElement {
        let e = document.createElement("div");

        let p = document.createElement("progress");
        p.max = this.maxProgress;
        p.value = this.progress;
        e.appendChild(p);

        let t = document.createElement("div");
        t.innerText = `Clickers: ${this.clickers}`;
        e.appendChild(t);

        e.addEventListener("mousedown", (e) =>
            this.onmousedown(Interaction.fromMouseEvent(e)),
        );
        e.addEventListener("mouseup", (e) =>
            this.onmouseup(Interaction.fromMouseEvent(e)),
        );
        e.addEventListener("mouseleave", (e) =>
            this.onmouseleave(Interaction.fromMouseEvent(e)),
        );

        this.elem = e;
        return e;
    }

    update(_: State): void {
        if (!this.elem) return;

        let p = this.elem.children[0] as HTMLProgressElement;
        p.value = this.progress;

        let t = this.elem.children[1] as HTMLDivElement;
        t.innerText = `Clickers: ${this.clickers}`;
    }

    onmousedown(inter: Interaction) {
        this.clickers++;
        if (inter.real) {
            this.realMousePressed = true;
        }
    }

    onmouseup(inter: Interaction) {
        if (inter.real && !this.realMousePressed) return;
        this.clickers--;
        if (inter.real) {
            this.realMousePressed = false;
        }
    }

    onmouseleave(inter: Interaction) {
        if (inter.real && this.realMousePressed) {
            this.clickers--;
            this.realMousePressed = false;
        }
    }
}

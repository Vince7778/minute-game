import { Component } from "./component";
import { FrameUpdater } from "./frameupdater";
import { Interaction } from "./interaction";
import { ReplayRecorder } from "./replay";
import { GameRunner } from "./runner";
import { State } from "./state";
import { formatTime } from "./utils";

export enum CompleteResult {
    NORMAL,
    DISABLE,
}

type CompleteFn = (state: State, completions: number) => CompleteResult | void;
export interface CButtonSettings {
    id: string;
    maxProgress: number;
    text?: string;
    belowText?: string;
    getBelowText?: (state: State) => string;
    onComplete?: CompleteFn;
    shouldEnable?: (state: State) => boolean;
    shouldShow?: (state: State) => boolean;
}

export class CButton extends ReplayRecorder implements Component, FrameUpdater {
    id: string;
    text: string;
    belowText?: string;
    maxProgress: number;
    realMousePressed: boolean = false;
    onComplete?: CompleteFn;
    shouldEnable?: (state: State) => boolean;
    shouldShow: (state: State) => boolean;
    getBelowText?: (state: State) => string;

    constructor(settings: CButtonSettings) {
        super(settings.id);
        this.id = settings.id;
        this.text = settings.text ?? "";
        this.maxProgress = settings.maxProgress;
        this.onComplete = settings.onComplete;
        this.shouldEnable = settings.shouldEnable;
        this.belowText = settings.belowText;
        this.getBelowText = settings.getBelowText;
        this.shouldShow = settings.shouldShow ?? (() => true);
    }

    frame(state: State) {
        super.frame(state);
        this.setEnabled(state, this.shouldEnable?.(state) ?? true);
        if (!state.button[this.id].enabled) return;
        state.button[this.id].progress += state.button[this.id].clickers;
        if (state.button[this.id].progress >= this.maxProgress) {
            let completions = Math.floor(state.button[this.id].progress / this.maxProgress);
            let res =
                this.onComplete?.(state, completions) ?? CompleteResult.NORMAL;
            switch (res) {
                case CompleteResult.NORMAL:
                    state.button[this.id].progress -= this.maxProgress * completions;
                    break;
                case CompleteResult.DISABLE:
                    this.disable(state);
                    state.button[this.id].progress = this.maxProgress;
                    break;
            }
        }
    }

    private getElem(): HTMLElement {
        const e = document.getElementById(this.id);
        if (!e) {
            throw new Error(`No element with id ${this.id} exists`);
        }
        return e;
    }

    private getProgressText(state: State): string {
        return `${formatTime(state.button[this.id].progress)} / ${formatTime(this.maxProgress)}`;
    }

    init(state: State): void {
        state.button[this.id] = {
            progress: 0,
            clickers: 0,
            enabled: true,
        };

        let e = this.getElem();
        if (e.hasChildNodes()) {
            this.update(state);
            return;
        }

        e.classList.add("cbutton");
        e.classList.toggle("cbutton-hidden", !this.shouldShow(state));

        let topText = document.createElement("div");
        topText.innerText = this.text;
        e.appendChild(topText);

        let p = document.createElement("progress");
        p.max = this.maxProgress;
        p.value = state.button[this.id].progress;
        e.appendChild(p);

        let bottomText = document.createElement("div");
        bottomText.innerText = this.getProgressText(state);
        e.appendChild(bottomText);

        let belowText = document.createElement("div");
        if (this.belowText) {
            belowText.innerText = this.belowText;
        }
        e.appendChild(belowText);

        this.addHandler(e, "mousedown", this.onmousedown);
        this.addHandler(e, "mouseup", this.onmouseup);
        this.addHandler(e, "mouseleave", this.onmouseleave);
    }

    addTo(runner: GameRunner) {
        runner.components.push(this);
        runner.updaters.push(this);
        runner.recorders.push(this);
    }

    update(state: State): void {
        let e = this.getElem();
        e.classList.toggle("cbutton-disabled", !state.button[this.id].enabled);
        e.classList.toggle("cbutton-pressed", this.realMousePressed);
        e.classList.toggle("cbutton-hidden", !this.shouldShow(state));

        let p = e.children[1] as HTMLProgressElement;
        p.value = state.button[this.id].progress;

        let bottomText = e.children[2] as HTMLDivElement;
        bottomText.innerText = this.getProgressText(state);

        let belowText = e.children[3] as HTMLDivElement;
        belowText.innerText =
            this.getBelowText?.(state) ?? this.belowText ?? "";
    }

    onmousedown(state: State, inter: Interaction) {
        state.button[this.id].clickers++;
        if (inter.real) {
            this.realMousePressed = true;
        }
    }

    onmouseup(state: State, inter: Interaction) {
        if (inter.real && !this.realMousePressed) return;
        state.button[this.id].clickers--;
        if (inter.real) {
            this.realMousePressed = false;
        }
    }

    onmouseleave(state: State, inter: Interaction) {
        if (inter.real && this.realMousePressed) {
            state.button[this.id].clickers--;
            this.realMousePressed = false;
        }
    }

    disable(state: State) {
        state.button[this.id].enabled = false;
        state.button[this.id].progress = 0;
    }

    enable(state: State) {
        state.button[this.id].enabled = true;
    }

    setEnabled(state: State, e: boolean) {
        if (state.button[this.id].enabled && !e) {
            this.disable(state);
        } else if (!state.button[this.id].enabled && e) {
            this.enable(state);
        }
    }
}

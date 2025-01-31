import { Component } from "./component";
import { FrameUpdater } from "./frameupdater";
import { Interaction } from "./interaction";
import { ReplayRecorder } from "./replay";
import { GameRunner } from "./runner";
import { State } from "./state";
import { fancyText } from "./text";
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

    progress = 0;
    clickers = 0;
    enabled = true;

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

        this.setupElements();
    }

    private getElem(): HTMLElement {
        const e = document.getElementById(this.id);
        if (!e) {
            throw new Error(`No element with id ${this.id} exists`);
        }
        return e;
    }

    setupElements() {
        const e = this.getElem();
        e.classList.add("cbutton");

        let topText = document.createElement("div");
        fancyText(this.text, topText);
        e.appendChild(topText);

        let p = document.createElement("progress");
        p.max = this.maxProgress;
        e.appendChild(p);

        let bottomText = document.createElement("div");
        e.appendChild(bottomText);

        let belowText = document.createElement("div");
        if (this.belowText) {
            fancyText(this.belowText, belowText);
        }
        e.appendChild(belowText);

        this.addHandler(e, "mousedown", this.onmousedown);
        this.addHandler(e, "mouseup", this.onmouseup);
        this.addHandler(e, "mouseleave", this.onmouseleave);
    }

    frame(state: State) {
        super.frame(state);
        this.setEnabled(this.shouldEnable?.(state) ?? true);
        if (!this.enabled) return;
        this.progress += this.clickers;
        if (this.progress >= this.maxProgress) {
            let completions = Math.floor(this.progress / this.maxProgress);
            let res =
                this.onComplete?.(state, completions) ?? CompleteResult.NORMAL;
            switch (res) {
                case CompleteResult.NORMAL:
                    this.progress -= this.maxProgress * completions;
                    break;
                case CompleteResult.DISABLE:
                    this.disable();
                    this.progress = this.maxProgress;
                    break;
            }
        }
    }

    private getProgressText(): string {
        return `${formatTime(this.progress)} / ${formatTime(this.maxProgress)}`;
    }

    init(_: State): void {
        this.progress = 0;
        this.clickers = 0;
        this.enabled = true;
    }

    addTo(runner: GameRunner) {
        runner.components.push(this);
        runner.updaters.push(this);
        runner.recorders.push(this);
    }

    update(state: State): void {
        let e = this.getElem();
        e.classList.toggle("cbutton-disabled", !this.enabled);
        e.classList.toggle("cbutton-pressed", this.realMousePressed);
        e.classList.toggle("cbutton-hidden", !this.shouldShow(state));

        let p = e.children[1] as HTMLProgressElement;
        p.value = this.progress;

        let bottomText = e.children[2] as HTMLDivElement;
        bottomText.innerText = this.getProgressText();

        let belowElem = e.children[3] as HTMLDivElement;
        const belowText = this.getBelowText?.(state) ?? this.belowText ?? "";
        fancyText(belowText, belowElem);
    }

    onmousedown(_: State, inter: Interaction) {
        this.clickers++;
        if (inter.real) {
            this.realMousePressed = true;
        }
    }

    onmouseup(_: State, inter: Interaction) {
        if (inter.real && !this.realMousePressed) return;
        this.clickers--;
        if (inter.real) {
            this.realMousePressed = false;
        }
    }

    onmouseleave(_: State, inter: Interaction) {
        if (inter.real && this.realMousePressed) {
            this.clickers--;
            this.realMousePressed = false;
        }
    }

    disable() {
        this.enabled = false;
        this.progress = 0;
    }

    enable() {
        this.enabled = true;
    }

    setEnabled(e: boolean) {
        if (this.enabled && !e) {
            this.disable();
        } else if (!this.enabled && e) {
            this.enable();
        }
    }
}

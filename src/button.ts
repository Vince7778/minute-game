import { Component } from "./component";
import { FrameUpdater } from "./frameupdater";
import { Interaction } from "./interaction";
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

export class CButton implements Component, FrameUpdater {
    id: string;
    text: string;
    belowText?: string;
    maxProgress: number;
    progress: number = 0;
    clickers: number = 0;
    realMousePressed: boolean = false;
    enabled: boolean = true;
    shown: boolean = true;
    onComplete?: CompleteFn;
    shouldEnable?: (state: State) => boolean;
    shouldShow: (state: State) => boolean;
    getBelowText?: (state: State) => string;

    constructor(settings: CButtonSettings) {
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

    private getElem(): HTMLElement {
        const e = document.getElementById(this.id);
        if (!e) {
            throw new Error(`No element with id ${this.id} exists`);
        }
        return e;
    }

    private getProgressText(): string {
        return `${formatTime(this.progress)} / ${formatTime(this.maxProgress)}`;
    }

    init(state: State): void {
        let e = this.getElem();
        e.classList.add("cbutton");
        e.classList.toggle("cbutton-hidden", !this.shouldShow(state));

        let topText = document.createElement("div");
        topText.innerText = this.text;
        e.appendChild(topText);

        let p = document.createElement("progress");
        p.max = this.maxProgress;
        p.value = this.progress;
        e.appendChild(p);

        let bottomText = document.createElement("div");
        bottomText.innerText = this.getProgressText();
        e.appendChild(bottomText);

        let belowText = document.createElement("div");
        if (this.belowText) {
            belowText.innerText = this.belowText;
        }
        e.appendChild(belowText);

        e.addEventListener("mousedown", (e) =>
            this.onmousedown(Interaction.fromMouseEvent(e)),
        );
        e.addEventListener("mouseup", (e) =>
            this.onmouseup(Interaction.fromMouseEvent(e)),
        );
        e.addEventListener("mouseleave", (e) =>
            this.onmouseleave(Interaction.fromMouseEvent(e)),
        );
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

        let belowText = e.children[3] as HTMLDivElement;
        belowText.innerText =
            this.getBelowText?.(state) ?? this.belowText ?? "";
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

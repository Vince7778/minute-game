import { Component } from "./component";
import { Interaction } from "./interaction";
import { ReplayRecorder } from "./replay";
import { State } from "./state";

interface CursorData {
    x: number;
    y: number;
}

export class CursorCanvas extends ReplayRecorder implements Component {
    didInit: boolean = false;

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    cursorImage: HTMLImageElement;

    lastPositions: { [key: string]: CursorData } = {};

    constructor() {
        super("cursorCanvas");

        this.canvas = document.getElementById(
            "cursorCanvas",
        )! as HTMLCanvasElement;
        let ctx = this.canvas.getContext("2d");
        if (!ctx) {
            throw new Error("This browser does not support canvas");
        }
        this.ctx = ctx;

        this.cursorImage = new Image();
        this.cursorImage.src = "/static/cursor.png";

        this.addHandler(document, "mousemove", this.onmousemove);
    }

    init(_: State): void {
        this.lastPositions = {};
    }

    update(_: State): void {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const imageWidth = 15;
        const imageHeight =
            (imageWidth * this.cursorImage.height) / this.cursorImage.width;
        for (const pos of Object.values(this.lastPositions)) {
            this.ctx.drawImage(
                this.cursorImage,
                pos.x,
                pos.y,
                imageWidth,
                imageHeight,
            );
        }
    }

    async loadImage() {
        if (this.cursorImage.complete) {
            return;
        }
        await new Promise((res, _) => {
            this.cursorImage.addEventListener("load", res);
        });
    }

    onmousemove(_: State, inter: Interaction) {
        if (!inter.real) {
            const x = inter.details.x;
            const y = inter.details.y;
            const id = inter.details.replayId;
            if (!x || !y || !id) return;
            this.lastPositions[id] = { x, y };
        }
    }
}

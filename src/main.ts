import { CButton } from "./button";
import { Component } from "./component";
import { FrameUpdater } from "./frameupdater";
import { State } from "./state";
import { CText } from "./text";

let e = document.getElementById("app")!;

let state = new State();

let testButton = new CButton("test", 2000, (s, c) => {
    s.testResource += c;
});
e.appendChild(testButton.init(state));

let testText = new CText((s) => `${s.testResource} test resources`);
e.appendChild(testText.init(state));

let components: Component[] = [testButton, testText];
let frameUpdaters: FrameUpdater[] = [testButton];

let startTime = Date.now();

function draw() {
    let endFrame = Date.now() - startTime;
    while (state.frame != endFrame) {
        state.frame++;
        for (let f of frameUpdaters) {
            f.frame(state);
        }
    }
    for (let c of components) {
        c.update(state);
    }
    testButton.update(state);
    requestAnimationFrame(draw);
}

requestAnimationFrame(draw);

import { CButton, CompleteResult } from "./button";
import { Component } from "./component";
import { FrameUpdater } from "./frameupdater";
import { State } from "./state";
import { CText } from "./text";
import { formatTime, pluralify } from "./utils";

let state = new State();

let lemonText = new CText("lemonText", (s) =>
    pluralify(s.resources.lemons, "lemon"),
);
lemonText.init(state);

let lemonadeText = new CText("lemonadeText", (s) =>
    pluralify(s.resources.lemonades, "lemonade"),
);
lemonadeText.init(state);

let moneyText = new CText(
    "moneyText",
    (s) => "$" + s.resources.money + " owned",
);
moneyText.init(state);

let lemonButton = new CButton({
    id: "lemonButton",
    text: "Gather lemons",
    maxProgress: 1000,
    onComplete: (s, c) => {
        s.resources.lemons += c;
    },
});
lemonButton.init(state);

let standButton = new CButton({
    id: "standButton",
    text: "Set up lemonade stand",
    maxProgress: 8000,
    onComplete: (s) => {
        s.isStandSetUp = true;
        return CompleteResult.DISABLE;
    },
});
standButton.init(state);

// TODO: how many lemons are actually in an average lemonade?
const LEMONS_PER_LEMONADE = 4;
let squeezeButton = new CButton({
    id: "squeezeButton",
    text: "Squeeze lemons",
    belowText: `Requires ${LEMONS_PER_LEMONADE} lemons`,
    maxProgress: 4000,
    shouldEnable(state) {
        return state.resources.lemons >= LEMONS_PER_LEMONADE;
    },
    onComplete(s, completions) {
        let goodCompletions = Math.min(
            completions,
            Math.floor(s.resources.lemons / LEMONS_PER_LEMONADE),
        );
        s.resources.lemons -= LEMONS_PER_LEMONADE * goodCompletions;
        s.resources.lemonades += goodCompletions;
    },
});
squeezeButton.init(state);

let sellButton = new CButton({
    id: "sellButton",
    text: "Sell lemonade",
    getBelowText: (s) =>
        `Requires a lemonade and a stand\nEarns $${s.moneyPerLemonade} per lemon`,
    maxProgress: 4000,
    shouldEnable(state) {
        return state.isStandSetUp && state.resources.lemonades > 0;
    },
    onComplete(state, completions) {
        let goodCompletions = Math.min(completions, state.resources.lemonades);
        state.resources.lemonades -= goodCompletions;
        state.resources.money += goodCompletions * state.moneyPerLemonade;
    },
});
sellButton.init(state);

let timerText = new CText(
    "timerText",
    (s) => `Time elapsed: ${formatTime(s.frame)}`,
);
timerText.init(state);

let components: Component[] = [
    lemonButton,
    lemonText,
    lemonadeText,
    timerText,
    standButton,
    squeezeButton,
    sellButton,
    moneyText,
];
let frameUpdaters: FrameUpdater[] = [
    lemonButton,
    standButton,
    squeezeButton,
    sellButton,
];

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
    lemonButton.update(state);
    requestAnimationFrame(draw);
}

requestAnimationFrame(draw);

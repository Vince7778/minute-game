import { CButton, CompleteResult } from "./button";
import { GameRunner } from "./runner";
import { CText } from "./text";
import { formatTime, pluralify } from "./utils";

// discount jquery
const $ = (e: string) => document.getElementById(e);

const runner = new GameRunner();
$("restartButton")?.addEventListener("click", () => {
    runner.stop();
    runner.start();
});

let timerText = new CText(
    "timer",
    (s) => `${formatTime(s.endFrame - s.frame)}`,
);
timerText.addTo(runner);

let lemonText = new CText("lemonText", (s) => pluralify(s.resources.lemons, "lemon"), "yellow");
lemonText.addTo(runner);

let lemonadeText = new CText("lemonadeText", (s) =>
    pluralify(s.resources.lemonades, "lemonade"), "lightyellow"
);
lemonadeText.addTo(runner);

let moneyText = new CText(
    "moneyText",
    (s) => "$" + s.resources.money + " owned",
    "lightgreen",
);
moneyText.addTo(runner);

let lemonButton = new CButton({
    id: "lemonButton",
    text: "Gather lemons",
    maxProgress: 1000,
    onComplete: (s, c) => {
        s.resources.lemons += c;
    },
});
lemonButton.addTo(runner);

let standButton = new CButton({
    id: "standButton",
    text: "Set up lemonade stand",
    maxProgress: 8000,
    onComplete: (s) => {
        s.isStandSetUp = true;
        return CompleteResult.DISABLE;
    },
});
standButton.addTo(runner);

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
squeezeButton.addTo(runner);

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
sellButton.addTo(runner);

const COMPUTER_COST = 500;
let computerButton = new CButton({
    id: "computerButton",
    text: "Buy a computer",
    belowText: `Costs $${COMPUTER_COST}`,
    maxProgress: 5000,
    shouldEnable(state) {
        return state.resources.money >= COMPUTER_COST;
    },
    shouldShow(state) {
        if (!state.showComputerButton && state.resources.money >= 15) {
            state.showComputerButton = true;
        }
        return state.showComputerButton;
    },
    onComplete(state) {
        state.resources.money -= COMPUTER_COST;
        return CompleteResult.DISABLE;
    },
});
computerButton.addTo(runner);

await runner.start();

function draw() {
    runner.draw();
    requestAnimationFrame(draw);
}

requestAnimationFrame(draw);

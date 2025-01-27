export class State {
    frame = 0;
    endFrame = 60_000; // 60 seconds

    isStandSetUp = false;
    moneyPerLemonade = 5;

    showComputerButton = false;

    resources = {
        money: 0,
        lemons: 0,
        lemonades: 0,
    };
}

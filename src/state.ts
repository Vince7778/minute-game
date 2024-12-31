export interface ButtonState {
    progress: number;
    clickers: number;
    enabled: boolean;
}

export class State {
    frame: number = 0;

    isStandSetUp = false;
    moneyPerLemonade = 5;

    showComputerButton = false;

    resources = {
        money: 0,
        lemons: 0,
        lemonades: 0,
    };

    button: { [id: string]: ButtonState } = {};
}

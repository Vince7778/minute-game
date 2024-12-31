import { Interaction, SavedInteraction, UserInteraction } from "./interaction";
import { State } from "./state";

type EventHandler = (event: Interaction) => void;
export class ReplayRecorder {
    id: string;
    handlers: { [type: string]: EventHandler } = {};
    inters: SavedInteraction[] = []; // should be in sorted order by frame
    interIndex: number = 0;

    userInters: UserInteraction[] = [];
    // interactions that the user did this replay, but haven't been saved yet
    // should be added to the rest at save time
    newInters: SavedInteraction[] = [];

    constructor(id: string) {
        this.id = id;
    }

    protected addHandler(elem: HTMLElement, type: string, fn: EventHandler) {
        fn = fn.bind(this);
        this.handlers[type] = fn;
        elem.addEventListener(type, (e) => {
            const inter = UserInteraction.fromEvent(e);
            this.userInters.push(inter);
            fn(inter); // we can run user events in between frames, maybe remove?
        });
    }

    frame(state: State) {
        for (const userInter of this.userInters) {
            this.newInters.push(userInter.convert(state.frame));
        }
        this.userInters = [];
        while (
            this.interIndex < this.inters.length &&
            this.inters[this.interIndex].frame === state.frame
        ) {
            const inter = this.inters[this.interIndex];
            const handler = this.handlers[inter.type];
            if (!handler) {
                throw new Error(
                    `Replay failed: handler for event type ${inter.type} does not exist on ${this.id}`,
                );
            }
            handler(inter);
            this.interIndex++;
        }
    }

    save(replay: Replay) {
        const allInters = [...this.inters, ...this.newInters];
        allInters.sort((a, b) => a.frame - b.frame);
        replay.inters[this.id] = allInters;
    }

    load(replay: Replay) {
        const inters = replay.inters[this.id] ?? [];
        this.inters = inters;
        this.interIndex = 0;
        this.userInters = [];
        this.newInters = [];
    }
}

export class Replay {
    id?: string;
    inters: { [id: string]: SavedInteraction[] } = {};

    constructor(id?: string) {
        this.id = id;
    }

    static merge(rs: Replay[]): Replay {
        let res = new Replay();
        for (const r of rs) {
            for (const [id, inters] of Object.entries(r.inters)) {
                if (!(id in res.inters)) {
                    res.inters[id] = [];
                }
                res.inters[id].push(...inters);
            }
        }

        for (let inters of Object.values(res.inters)) {
            inters.sort((a, b) => a.frame - b.frame);
        }
        return res;
    }
}

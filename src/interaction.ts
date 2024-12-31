export interface Interaction {
    real: boolean;
}

// this class is necessary since events don't come with frame numbers attached
// we must determine this ourselves on the next frame event
export class UserInteraction implements Interaction {
    type: string;
    real: boolean = false;

    constructor(type: string) {
        this.type = type;
    }

    convert(frame: number): SavedInteraction {
        return new SavedInteraction(this.type, frame);
    }

    static fromEvent(e: Event) {
        e.preventDefault();
        let res = new UserInteraction(e.type);
        res.real = true;
        return res;
    }
}

export class SavedInteraction implements Interaction {
    type: string;
    frame: number;
    real: false = false;

    constructor(type: string, frame: number) {
        this.type = type;
        this.frame = frame;
    }
}

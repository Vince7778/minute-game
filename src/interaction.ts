interface InteractionDetails {
    x?: number;
    y?: number;
    replayId?: string;
}

export interface Interaction {
    real: boolean;
    details: InteractionDetails;
}

// this class is necessary since events don't come with frame numbers attached
// we must determine this ourselves on the next frame event
export class UserInteraction implements Interaction {
    type: string;
    real: boolean = false;
    details: InteractionDetails = {};

    constructor(type: string) {
        this.type = type;
    }

    convert(frame: number): SavedInteraction {
        return new SavedInteraction(this.type, frame, this.details);
    }

    static fromEvent(e: Event) {
        e.preventDefault();
        let res = new UserInteraction(e.type);
        res.real = true;

        if (e instanceof MouseEvent) {
            res.details.x = e.pageX;
            res.details.y = e.pageY;
        }
        return res;
    }
}

export class SavedInteraction implements Interaction {
    type: string;
    frame: number;
    real: false = false;
    details: InteractionDetails;

    constructor(type: string, frame: number, details?: InteractionDetails) {
        this.type = type;
        this.frame = frame;
        this.details = details ?? {};
    }
}

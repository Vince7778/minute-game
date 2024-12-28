export class Interaction {
    real: boolean = false;

    static fromMouseEvent(e: MouseEvent) {
        e.preventDefault();
        let res = new Interaction();
        res.real = true;
        return res;
    }
}

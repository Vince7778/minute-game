export function pluralify(n: number, s: string, suffix: string = "s") {
    if (n == 1) return n + " " + s;
    return n + " " + s + suffix;
}

// very naive
function padWithZero(n: number, len: number): string {
    let out = n.toString();
    while (out.length < len) {
        out = "0" + out;
    }
    return out;
}

export function formatTime(ms: number): string {
    if (ms < 0) return "-" + formatTime(-ms);
    let secs = Math.floor(ms / 1000);
    ms = ms % 1000;
    let mins = Math.floor(secs / 60);
    secs = secs % 60;
    const msStr = padWithZero(Math.floor(ms / 10), 2);
    if (mins === 0) {
        // show 2 digits
        return `${secs}.${msStr}`;
    } else {
        return `${mins}:${padWithZero(secs, 2)}.${msStr}`;
    }
}

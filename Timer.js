class Timer {
    constructor() {
        this.t0 = 0;
    }
    start() {
        this.t0 = performance.now();
    };
    elapsed() {
        return (performance.now() - this.t0).toPrecision(3);
    };
}

/** 
 * The timer is going to track the amount of time since the last clock tick. 
 * @author Seth Ladd
 */
class Timer {
    constructor() {
        this.gameTime = 0;
        this.maxStep = 0.05;
        this.lastTimestamp = 0;
    };

    /** Ticks the clock.
     * @returns the time (in seconds) since the last clock tick.
     */
    tick() {
        const current = Date.now();
        const delta = (current - this.lastTimestamp) / 1000;
        this.lastTimestamp = current;

        const gameDelta = Math.min(delta, this.maxStep);
        this.gameTime += gameDelta;
        return gameDelta;
    };
};

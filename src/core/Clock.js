
/**
 * Manages the timeline of commits with undo/redo capabilities.
 */
class Clock {
    constructor() {
        // Maximum timestamp in history
        this.t = 0;
        // Current position in history
        this.p = 0;
    }

    /**
     * Advances the clock, handling branch truncation if needed.
     * @returns {number} New current time
     */
    tick() {
        if (this.p < this.t) {
            // Truncate future history when branching
            this.t = this.p;
        }
        this.p++;
        this.t = this.p;
        return this.p;
    }

    /**
     * Moves backward in time.
     * @returns {number} New current time
     */
    undo() {
        if (this.p > 0) this.p--;
        return this.p;
    }

    /**
     * Moves forward in time.
     * @returns {number} New current time
     */
    redo() {
        if (this.p < this.t) this.p++;
        return this.p;
    }

    /**
     * Gets current time.
     * @returns {number}
     */
    peek() {
        return this.p;
    }

    /**
     * Gets maximum available time.
     * @returns {number}
     */
    max() {
        return this.t;
    }

    /**
     * Jumps to a specific time (for advanced use cases).
     * @param {number} time
     */
    resetTo(time) {
        if (time >= 0 && time <= this.t) {
            this.p = time;
        }
    }
}

export default Clock;

import CommitNode from "./CommitNode.js";
import Clock from "./Clock.js";



class Layer {
    /**
     * @param {Clock} clock - Shared clock instance
     * @param {number} [flushThreshold=30] - Max history entries to keep per key
     */
    constructor(clock, flushThreshold = 30) {
        this.clock = clock;
        this.flushThreshold = flushThreshold;
        this.history = new Map(); // Map<string, CommitNode<any>[]>
    }

    /**
  * Sets values at current time, automatically flattening nested objects
  * @param {string|Object} keyOrObject - Key or object of key-value pairs
  * @param {any} [value] - Required if first param is string
  */
    set(keyOrObject, value, time = this.clock.peek()) {

        console.log("SET", keyOrObject, value, time);


        if (typeof keyOrObject === 'object') {
            const flatUpdates = this._flattenObject(keyOrObject);
            for (const [key, val] of Object.entries(flatUpdates)) {
                this._setSingleKey(key, val, time);
            }
        } else {
            this._setSingleKey(keyOrObject, value, time);
        }
    }

    _pruneAllKeys(forkTime) {
        for (const [key, commits] of this.history) {
            if (commits.length > 0 && commits[commits.length - 1].t > forkTime) {
                const lastValidCommit = this._findLatestCommit(commits, forkTime);
                const cutIndex = lastValidCommit
                    ? commits.indexOf(lastValidCommit)
                    : -1;
                this.history.set(key, cutIndex >= 0 ? commits.slice(0, cutIndex + 1) : []);
            }
        }
    }

    isUpdateMeaningful(updates, time) {
        const flat = typeof updates === 'object'
            ? this._flattenObject(updates)
            : { [updates]: value };

        return Object.entries(flat).some(([key, value]) => {
            const commits = this.history.get(key) || [];
            const prev = this._findLatestCommit(commits, time + 1)?.v;
            return !CommitNode.valuesEqual(prev, value);
        });
    }


    _trimHistory(minTime, { direction = "after", keepLatest = false } = {}) {
        for (const [key, commits] of this.history) {
            if (commits.length === 0) continue;
            const effectiveMinTime = direction === "before" ? minTime - 1 : minTime;
            const lastValid = this._findLatestCommit(commits, effectiveMinTime);
            const idx = commits.indexOf(lastValid);
            let newCommits;
            if (lastValid) {
                if (direction === "after") {
                    // Keep from lastValid onward
                    lastValid.t = minTime;
                    newCommits = commits.slice(idx);
                } else if (direction === "before") {
                    // Keep from beginning up to and including lastValid
                    newCommits = commits.slice(0, idx + 1);
                } else {
                    throw new Error(`Unknown trim direction: ${direction}`);
                }
            } else if (keepLatest && commits.length > 0) {
                newCommits = [commits[commits.length - 1]];
            } else {
                newCommits = [];
            }
            // if the newCommits is empty, remove the key
            if (newCommits.length === 0) {
                this.history.delete(key);
                continue;
            }
            this.history.set(key, newCommits);
        }
    }



    // Fork pruning (exact match)
    prune(forkTime) {
        this._trimHistory(forkTime, { direction: "before", keepLatest: false });
    }

    // History flushing (keep at least one)
    flush(thresholdTime) {
        console.log("FLUSHING...", this.history, thresholdTime); // thresholdTime === 2
        this._trimHistory(thresholdTime, { direction: "after", keepLatest: true });
        console.log("FLUSHED ", this.history);

    }

    // Internal Helpers
    _setSingleKey(key, value, time) {
        const commits = this.history.get(key) || [];
        commits.push(new CommitNode(time, value));
        this.history.set(key, commits);
    }
    /**
     * Marks a key as deleted at current time
     * @param {string} key
     */
    remove(key) {
        this.set(key, undefined); // Tombstone
    }

    /**
     * Gets value of a key at specific time (defaults to current time)
     * @param {string} key
     * @param {number} [time=this.clock.peek()]
     * @returns {any|undefined} undefined means key doesn't exist at this time
     */
    get(key, time = this.clock.peek()) {
        const commits = this.history.get(key);
        if (!commits || commits.length === 0) return undefined;

        return this._findLatestCommit(commits, time)?.v;
    }

    /**
     * Gets full state at specific time
     * @param {number} [time=this.clock.peek()]
     * @returns {Object} Key-value pairs of alive keys
     */
    getState(time = this.clock.peek()) {
        const state = {};
        for (const [key, commits] of this.history) {
            const value = this._findLatestCommit(commits, time)?.v;
            if (value !== undefined) { // Skip tombstones
                state[key] = value;
            }
        }
        return state;
    }

    /**
     * Binary search for latest commit <= target time
     * @private
     */
    _findLatestCommit(commits, targetTime) {

        let low = 0;
        let high = commits.length - 1;
        let result;

        while (low <= high) {
            const mid = (low + high) >> 1; // Bitwise version is slightly faster
            if (commits[mid].t <= targetTime) {
                result = commits[mid];
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return result; // undefined, why?
    }

    /**
  * Recursively flattens nested objects into dot notation
  * @private
  */
    _flattenObject(obj, prefix = '') {
        return Object.keys(obj).reduce((acc, k) => {
            const pre = prefix.length ? `${prefix}.` : '';
            if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
                Object.assign(acc, this._flattenObject(obj[k], pre + k));
            } else {
                acc[pre + k] = obj[k];
            }
            return acc;
        }, {});
    }

}

export default Layer;

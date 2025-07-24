/**
 * Represents a single commit in the history with a value and timestamp.
 * @template T - Type of the stored value
 */
class CommitNode {
    /**
     * @param {number} time - Timestamp of the commit
     * @param {T} value - Committed value
     */
    constructor(time, value) {
        this.t = time;
        this.v = value;
    }


    static valuesEqual(a, b) {
        // Both undefined/null
        if (a == null && b == null) return true;

        // Only one undefined/null
        if (a == null || b == null) return false;

        // Primitive values or same reference
        if (a === b) return true;

        // Handle Date objects
        if (a instanceof Date && b instanceof Date) {
            return a.getTime() === b.getTime();
        }

        // Handle arrays
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) return false;
            return a.every((item, i) => CommitNode.valuesEqual(item, b[i]));
        }

        // Handle objects
        if (typeof a === 'object' && typeof b === 'object') {
            const aKeys = Object.keys(a);
            const bKeys = Object.keys(b);
            if (aKeys.length !== bKeys.length) return false;
            return aKeys.every(key => CommitNode.valuesEqual(a[key], b[key]));
        }

        // Fallback for other cases
        return false;
    }
}

export default CommitNode;

import Clock from "./Clock.js";
import Layer from "./Layer.js";

class Ledger {
    constructor({ bufferSize = 100, toleranceWindow = 20 } = {}) {
        this.clock = new Clock();
        this.layers = new Map();
        this.genesis = new Layer(this.clock);
        this.bufferSize = bufferSize;
        this.toleranceWindow = toleranceWindow;
        this.lastFlushTime = 0;
        this.subscribers = new Set();
    }



    // Core Methods
    set(updates) {
        // 1. Check for meaningful updates
        let hasMeaningfulUpdate = false;
        const timeBeforeCheck = this.clock.peek();

        for (const [layerId, layerUpdates] of Object.entries(updates)) {
            const layer = this._getLayer(layerId, this.clock.peek() + 1);
            if (layer.isUpdateMeaningful(layerUpdates, timeBeforeCheck)) {
                hasMeaningfulUpdate = true;
                break;
            }
        }

        if (!hasMeaningfulUpdate) return;

        // 2. Handle time advancement
        const isFork = this.clock.p < this.clock.t;
        const time = this.clock.tick();

        if (isFork) {
            this.prune(time);
        }

        // 3. Process updates
        for (const [layerId, layerUpdates] of Object.entries(updates)) {
            this._getLayer(layerId).set(layerUpdates, time);
        }

        this._autoFlush(time);

        // 4. Notify subscribers
        this._notify();
    }

    _getLayer(layerId, timeIfNotSet = this.clock.peek()) {
        if (!this.layers.has(layerId)) {
            this.layers.set(layerId, new Layer(this.clock));
            this.genesis.set(layerId, true, timeIfNotSet);
        }
        return this.layers.get(layerId);
    }

    get(layerIds) {
        const result = {};
        const targets = layerIds || [...this.layers.keys()];
        const time = this.clock.peek();

        for (const layerId of targets) {
            if (this._isLayerActive(layerId, time)) {
                result[layerId] = this.layers.get(layerId).getState(time);
            }
        }
        return result;
    }

    undo() {
        const time = this.clock.undo();
        const state = this.get();
        this._notify();
        return state;
    }

    redo() {
        const time = this.clock.redo();
        const state = this.get();
        this._notify();
        return state;
    }

    remove(layerId) {
        this.clock.tick();
        this.genesis.set(layerId, false);
        this._notify();
    }

    prune(minTime) {
        for (const [layerId, layer] of this.layers) {
            layer.prune(minTime);
            const state = layer.getState();
            if (state && Object.keys(state).length === 0) {
                this.layers.delete(layerId);
            }
        }
        this.genesis.prune(minTime);
        this._notify();
    }

    flush() {
        const minTime = this.clock.t - this.bufferSize;
        this.lastFlushTime = this.clock.t;

        for (const [layerId, layer] of this.layers) {
            layer.flush(minTime);
        }
        this.genesis.flush(minTime);
        this._notify();
    }

    // Internal Utilities
    _getOrCreateLayer(layerId) {
        if (!this.layers.has(layerId)) {
            const layer = new Layer(this.clock);
            this.layers.set(layerId, layer);
            this.genesis.set(layerId, [
                new CommitNode(this.clock.t, true)
            ]);
        }
        return this.layers.get(layerId);
    }

    _isLayerActive(layerId, time) {
        const layerState = this.genesis.get(layerId);
        return layerState || false;
    }

    _autoFlush(currentTime) {
        if (currentTime - this.lastFlushTime >
            (this.bufferSize + this.toleranceWindow)) {
            this.flush();
        }
    }

    /**
 * Subscribe to state changes
 * @param {Function} callback - Called after any state change
 * @returns {Function} Unsubscribe function
 */
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    /**
     * Notify all subscribers (internal)
     */
    _notify() {
        queueMicrotask(() => {
            this.subscribers.forEach(cb => cb());
        });
    }
}

export { Ledger };

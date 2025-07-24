import { useContext, useMemo } from 'react';
import { LedgexContext } from './LedgexProvider';


export function useLedgex() {
    const ledger = useContext(LedgexContext);
    if (!ledger) throw new Error('Missing LedgexProvider');

    return useMemo(() => ({
        // State access
        get: (layerIds) => ledger.get(layerIds),

        // State modification
        set: (updates) => ledger.set(updates),
        remove: (id) => ledger.remove(id),

        // Time travel
        undo: () => ledger.undo(),
        redo: () => ledger.redo(),

        // Utilities
        flush: () => ledger.flush(),
        prune: (time) => ledger.prune(time),

        // Metadata
        getTimeInfo: () => ({
            currentTime: ledger.clock.p,
            maxTime: ledger.clock.t,
            canUndo: ledger.clock.p > 0,
            canRedo: ledger.clock.p < ledger.clock.t
        })
    }), [ledger]);
}

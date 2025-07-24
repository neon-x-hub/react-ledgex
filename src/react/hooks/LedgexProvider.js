import { createContext, useContext, useRef, useEffect, useCallback, useState } from 'react';
import { Ledger } from '../../core/Ledger';

export const LedgexContext = createContext();

export function LedgexProvider({ children, bufferSize = 100 }) {
    const ledgerRef = useRef(new Ledger({ bufferSize }));
    const [_, forceUpdate] = useState({});

    const handleUpdate = useCallback((state) => {
        forceUpdate({}); // Trigger re-render
    }, []);

    // Subscribe to changes
    useEffect(() => {
        return ledgerRef.current.subscribe(handleUpdate);
    }, [handleUpdate]);

    return React.createElement(
        LedgexContext.Provider,
        { value: ledgerRef.current },
        children
    );
}

// Optional: Add display name for debugging
LedgexProvider.displayName = 'LedgexProvider';

import { createContext, useRef, useEffect, useCallback, useState } from 'react';
import { Ledgex } from '@ledgex/core';

export const LedgexContext = createContext();

export function LedgexProvider({ children, bufferSize = 100 }) {
    const ledgerRef = useRef(new Ledgex({ bufferSize }));
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

LedgexProvider.displayName = 'LedgexProvider';

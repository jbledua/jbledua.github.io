import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const DrawerContext = createContext(null);

export function DrawerProvider({ children }) {
    const [open, setOpen] = useState(false);
    const [content, setContent] = useState(null);

    const openDrawer = useCallback((node) => {
        setContent(node || null);
        setOpen(true);
    }, []);

    const closeDrawer = useCallback(() => {
        setOpen(false);
        // Defer clearing content to keep unmount smooth; optional clear can be added if needed
    }, []);

    const toggleDrawer = useCallback((node) => {
        if (open) {
            setOpen(false);
        } else {
            setContent(node || content);
            setOpen(true);
        }
    }, [open, content]);

    const value = useMemo(() => ({ open, content, openDrawer, closeDrawer, toggleDrawer, setContent }), [open, content, openDrawer, closeDrawer, toggleDrawer]);

    return (
        <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>
    );
}

export function useDrawer() {
    const ctx = useContext(DrawerContext);
    if (!ctx) throw new Error('useDrawer must be used within a DrawerProvider');
    return ctx;
}

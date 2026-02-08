import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

interface ArsenalSidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

const ArsenalSidebarContext = createContext<ArsenalSidebarContextType>({
  isOpen: false,
  toggle: () => {},
  open: () => {},
  close: () => {},
});

export function useArsenalSidebar() {
  return useContext(ArsenalSidebarContext);
}

export function ArsenalSidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(() => {
    try { return localStorage.getItem('arsenal-sidebar-open') === 'true'; }
    catch { return false; }
  });

  useEffect(() => {
    localStorage.setItem('arsenal-sidebar-open', String(isOpen));
  }, [isOpen]);

  // Ctrl+Shift+A hotkey
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <ArsenalSidebarContext.Provider value={{ isOpen, toggle, open, close }}>
      {children}
    </ArsenalSidebarContext.Provider>
  );
}

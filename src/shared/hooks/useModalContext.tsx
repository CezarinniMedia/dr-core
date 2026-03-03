import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type ModalId = "import" | "quickAdd" | "fullForm" | "exportCsv";

interface ModalContextValue {
  /** Currently open modal (null if none) */
  activeModal: ModalId | null;
  /** Open a specific modal */
  openModal: (id: ModalId) => void;
  /** Close the currently active modal */
  closeModal: () => void;
  /** Check if a specific modal is open */
  isOpen: (id: ModalId) => boolean;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [activeModal, setActiveModal] = useState<ModalId | null>(null);

  const openModal = useCallback((id: ModalId) => {
    setActiveModal(id);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  const isOpen = useCallback(
    (id: ModalId) => activeModal === id,
    [activeModal]
  );

  return (
    <ModalContext.Provider value={{ activeModal, openModal, closeModal, isOpen }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModalContext(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error("useModalContext must be used within a ModalProvider");
  }
  return ctx;
}

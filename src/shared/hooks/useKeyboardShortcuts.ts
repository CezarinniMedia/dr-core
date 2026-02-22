import { useEffect, useCallback, useRef } from "react";

interface KeyboardShortcut {
  key: string;
  meta?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: (e: KeyboardEvent) => void;
  description?: string;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
}

function matchesShortcut(e: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
  const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
  const metaMatch = shortcut.meta ? e.metaKey : !e.metaKey;
  const ctrlMatch = shortcut.ctrl ? e.ctrlKey : !e.ctrlKey;
  const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
  const altMatch = shortcut.alt ? e.altKey : !e.altKey;

  // For Mac shortcuts using meta, also match ctrl on Windows/Linux
  if (shortcut.meta && !shortcut.ctrl) {
    return keyMatch && (e.metaKey || e.ctrlKey) && shiftMatch && altMatch;
  }

  return keyMatch && metaMatch && ctrlMatch && shiftMatch && altMatch;
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true } = options;
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      // Skip shortcuts when typing in inputs/textareas (unless meta/ctrl is held)
      const target = e.target as HTMLElement;
      const isEditable =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      for (const shortcut of shortcutsRef.current) {
        if (matchesShortcut(e, shortcut)) {
          // Allow meta/ctrl shortcuts even in editable elements
          const hasModifier = shortcut.meta || shortcut.ctrl;
          if (isEditable && !hasModifier) continue;

          e.preventDefault();
          shortcut.handler(e);
          return;
        }
      }
    },
    [enabled]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

export type { KeyboardShortcut };

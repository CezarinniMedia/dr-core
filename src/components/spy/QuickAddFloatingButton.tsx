import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { QuickAddOferta } from './QuickAddOferta';

export function QuickAddFloatingButton() {
  const [open, setOpen] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  // Check for pending draft
  const checkDraft = useCallback(() => {
    try {
      const saved = localStorage.getItem('quick-add-draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        setHasDraft(!!(parsed.dominio_principal || parsed.nome));
      } else {
        setHasDraft(false);
      }
    } catch {
      setHasDraft(false);
    }
  }, []);

  useEffect(() => {
    checkDraft();
    const interval = setInterval(checkDraft, 10000);
    return () => clearInterval(interval);
  }, [checkDraft]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all bg-accent text-accent-foreground hover:bg-accent/90"
        size="icon"
        title="Quick Add (Ctrl+Shift+N)"
      >
        <Zap className="h-6 w-6" />
        {hasDraft && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full border-2 border-background animate-pulse" />
        )}
      </Button>

      <QuickAddOferta open={open} onOpenChange={setOpen} />
    </>
  );
}

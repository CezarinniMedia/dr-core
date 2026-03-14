import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { seedDemoData, cleanupDemoData, checkDemoActive } from '@/shared/lib/demo-seed';
import { FlaskConical, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';

const LS_KEY = 'dr-ops-demo-mode';
const SYNC_EVENT = 'demo-mode-changed';

function syncState() {
  window.dispatchEvent(new Event(SYNC_EVENT));
}

// ─── Hook ────────────────────────────────────────────
export function useDemoMode() {
  const [isActive, setIsActive] = useState(() => localStorage.getItem(LS_KEY) === '1');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = () => setIsActive(localStorage.getItem(LS_KEY) === '1');
    window.addEventListener(SYNC_EVENT, handler);

    // Verify against DB on mount
    checkDemoActive().then(active => {
      const localActive = localStorage.getItem(LS_KEY) === '1';
      if (active !== localActive) {
        if (active) localStorage.setItem(LS_KEY, '1');
        else localStorage.removeItem(LS_KEY);
        setIsActive(active);
      }
    });

    return () => window.removeEventListener(SYNC_EVENT, handler);
  }, []);

  const toggle = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isActive) {
        await cleanupDemoData(setProgress);
        localStorage.removeItem(LS_KEY);
        setIsActive(false);
      } else {
        await seedDemoData(setProgress);
        localStorage.setItem(LS_KEY, '1');
        setIsActive(true);
      }
      syncState();
      await queryClient.invalidateQueries();
    } catch (err) {
      console.error('[DemoMode] Error:', err);
    } finally {
      setIsLoading(false);
      setProgress('');
    }
  }, [isActive, queryClient]);

  return { isActive, isLoading, progress, toggle };
}

// ─── Read-only status hook (no queryClient dependency) ──
export function useDemoModeStatus() {
  const [isActive, setIsActive] = useState(() => localStorage.getItem(LS_KEY) === '1');

  useEffect(() => {
    const handler = () => setIsActive(localStorage.getItem(LS_KEY) === '1');
    window.addEventListener(SYNC_EVENT, handler);
    return () => window.removeEventListener(SYNC_EVENT, handler);
  }, []);

  return isActive;
}

// ─── Toggle Button ───────────────────────────────────
export function DemoModeToggle() {
  const { isActive, isLoading, progress, toggle } = useDemoMode();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isActive ? 'default' : 'ghost'}
            size="icon"
            className={`h-8 w-8 ${
              isActive
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={toggle}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FlaskConical className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {isLoading
            ? progress || 'Processando...'
            : isActive
              ? 'Desativar Modo Demo'
              : 'Ativar Modo Demo'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ─── Banner ──────────────────────────────────────────
export function DemoModeBanner() {
  const isActive = useDemoModeStatus();

  if (!isActive) return null;

  return (
    <div className="bg-amber-600/90 text-white text-center py-1.5 px-4 text-xs font-medium flex items-center justify-center gap-2 shrink-0">
      <FlaskConical className="h-3 w-3" />
      MODO DEMO — Dados simulados para visualização
    </div>
  );
}

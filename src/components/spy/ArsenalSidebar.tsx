import { Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ArsenalPanel } from './ArsenalPanel';
import { useArsenalSidebar } from './ArsenalSidebarContext';
import { cn } from '@/lib/utils';

export function ArsenalSidebar() {
  const { isOpen, toggle } = useArsenalSidebar();

  return (
    <>
      {/* Collapsed toggle button */}
      {!isOpen && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className="fixed right-0 top-1/2 -translate-y-1/2 z-40 h-10 w-8 rounded-l-md rounded-r-none border border-r-0 border-border bg-card hover:bg-muted shadow-md"
              title="Arsenal (Ctrl+Shift+A)"
            >
              <Crosshair className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            Arsenal <kbd className="ml-1 text-[10px] bg-muted px-1 rounded">Ctrl+Shift+A</kbd>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Sidebar panel */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full z-30 border-l border-border bg-card shadow-xl transition-all duration-200 ease-in-out',
          isOpen ? 'w-[350px] translate-x-0' : 'w-0 translate-x-full'
        )}
      >
        {isOpen && <ArsenalPanel />}
      </div>
    </>
  );
}

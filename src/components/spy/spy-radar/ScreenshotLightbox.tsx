import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, X } from "lucide-react";

export function ScreenshotLightbox({ url, onClose }: { url: string; onClose: () => void }) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startOffX: number; startOffY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const clampZoom = (z: number) => Math.min(5, Math.max(0.2, z));
  const zoomIn = () => setZoom(z => clampZoom(z * 1.3));
  const zoomOut = () => setZoom(z => clampZoom(z / 1.3));
  const resetZoom = () => { setZoom(1); setOffset({ x: 0, y: 0 }); };

  const handleWheel = useCallback((e: WheelEvent) => {
    if (!e.altKey) return;
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    setZoom(z => clampZoom(z * factor));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, startOffX: offset.x, startOffY: offset.y };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragRef.current) return;
    setOffset({
      x: dragRef.current.startOffX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.startOffY + (e.clientY - dragRef.current.startY),
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragRef.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div
        className="relative flex flex-col bg-background rounded-lg shadow-2xl overflow-hidden w-[90vw] max-w-5xl h-[85svh] max-h-[900px]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/50 shrink-0">
          <span className="text-xs text-muted-foreground truncate flex-1 hidden sm:block">{url}</span>
          <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-7 sm:w-7" onClick={zoomOut} aria-label="Diminuir zoom" title="Diminuir zoom">
            <ZoomOut className="h-5 w-5 sm:h-4 sm:w-4" />
          </Button>
          <button
            className="text-xs text-muted-foreground w-14 sm:w-12 text-center hover:text-foreground transition-colors py-1"
            onClick={resetZoom}
            aria-label="Resetar zoom"
            title="Resetar zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-7 sm:w-7" onClick={zoomIn} aria-label="Aumentar zoom" title="Aumentar zoom">
            <ZoomIn className="h-5 w-5 sm:h-4 sm:w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-7 sm:w-7" onClick={onClose} aria-label="Fechar" title="Fechar">
            <X className="h-5 w-5 sm:h-4 sm:w-4" />
          </Button>
        </div>
        <div
          ref={containerRef}
          className="flex-1 overflow-hidden flex items-center justify-center"
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
          onMouseDown={handleMouseDown}
        >
          <img
            src={url}
            alt="Screenshot"
            draggable={false}
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transformOrigin: "center center",
              maxWidth: "100%",
              maxHeight: "100%",
              userSelect: "none",
              transition: isDragging ? "none" : "transform 0.1s ease",
            }}
          />
        </div>
        <p className="text-center text-[10px] text-muted-foreground py-1 shrink-0">
          Alt + scroll para zoom · Arrastar para mover
        </p>
      </div>
    </div>
  );
}

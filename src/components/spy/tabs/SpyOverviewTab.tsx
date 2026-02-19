import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Copy, Eye, X, ZoomIn, ZoomOut } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useUpdateSpiedOffer } from "@/hooks/useSpiedOffers";
import { useToast } from "@/hooks/use-toast";

interface SpyOverviewTabProps {
  offer: any;
}

// ─── Screenshot Lightbox ───────────────────────────────────────────────────

interface LightboxProps {
  url: string;
  onClose: () => void;
}

function ScreenshotLightbox({ url, onClose }: LightboxProps) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startOffX: number; startOffY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const clampZoom = (z: number) => Math.min(5, Math.max(0.2, z));

  const zoomIn = () => setZoom(z => clampZoom(z * 1.3));
  const zoomOut = () => setZoom(z => clampZoom(z / 1.3));
  const resetZoom = () => { setZoom(1); setOffset({ x: 0, y: 0 }); };

  // Alt + scroll to zoom
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

  // Drag to pan
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

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      {/* Modal box */}
      <div
        className="relative flex flex-col bg-background rounded-lg shadow-2xl overflow-hidden"
        style={{ width: "min(85vw, 1200px)", height: "min(85vh, 900px)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/50 shrink-0">
          <span className="text-xs text-muted-foreground truncate flex-1">{url}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={zoomOut} title="Diminuir zoom">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <button
            className="text-xs text-muted-foreground w-12 text-center hover:text-foreground transition-colors"
            onClick={resetZoom}
            title="Resetar zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={zoomIn} title="Aumentar zoom">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose} title="Fechar">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Image area */}
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

// ─── Screenshot Field ──────────────────────────────────────────────────────

interface ScreenshotFieldProps {
  offerId: string;
  value: string | null;
  onUpdated: (url: string) => void;
}

function ScreenshotField({ offerId, value, onUpdated }: ScreenshotFieldProps) {
  const [editMode, setEditMode] = useState(false);
  const [editValue, setEditValue] = useState(value || "");
  const [showPreview, setShowPreview] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateMutation = useUpdateSpiedOffer();
  const { toast } = useToast();

  const handleSave = () => {
    updateMutation.mutate({ id: offerId, data: { screenshot_url: editValue.trim() || null } });
    onUpdated(editValue.trim());
    setEditMode(false);
  };

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    toast({ title: "URL copiada!" });
  };

  const handleOpenTab = () => {
    if (!value) return;
    window.open(value, "_blank", "noopener,noreferrer");
  };

  const handleStartEdit = () => {
    setEditValue(value || "");
    setEditMode(true);
  };

  const handlePreviewEnter = () => {
    if (!value) return;
    previewTimerRef.current = setTimeout(() => setShowPreview(true), 200);
  };
  const handlePreviewLeave = () => {
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    setShowPreview(false);
  };

  if (editMode) {
    return (
      <div className="flex gap-2 items-center">
        <Input
          autoFocus
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditMode(false); }}
          placeholder="https://site-images.similarcdn.com/..."
          className="h-7 text-xs flex-1"
        />
        <Button size="sm" className="h-7 text-xs px-2" onClick={handleSave}>Salvar</Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => setEditMode(false)}>Cancelar</Button>
      </div>
    );
  }

  if (!value) {
    return (
      <button
        className="text-xs text-muted-foreground hover:text-foreground transition-colors italic"
        onClick={handleStartEdit}
      >
        Clique para adicionar screenshot...
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 min-w-0">
      {/* URL text — click to edit */}
      <button
        className="text-xs text-muted-foreground truncate flex-1 text-left hover:text-foreground transition-colors"
        title="Clique para editar"
        onClick={handleStartEdit}
      >
        {value}
      </button>

      {/* Preview button with hover mini-preview */}
      <div className="relative shrink-0" onMouseEnter={handlePreviewEnter} onMouseLeave={handlePreviewLeave}>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={() => setShowLightbox(true)}
          title="Pré-visualizar screenshot"
        >
          <Eye className="h-3.5 w-3.5" />
        </Button>
        {showPreview && (
          <div
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-40 rounded-lg border bg-background shadow-xl overflow-hidden"
            style={{ width: 280, pointerEvents: "none" }}
          >
            <img
              src={value}
              alt="Preview"
              className="w-full h-auto block"
              style={{ maxHeight: 200, objectFit: "contain" }}
            />
          </div>
        )}
      </div>

      {/* Copy button */}
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6 shrink-0"
        onClick={handleCopy}
        title="Copiar URL"
      >
        <Copy className="h-3.5 w-3.5" />
      </Button>

      {/* Open in new tab */}
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6 shrink-0"
        onClick={handleOpenTab}
        title="Abrir em nova aba"
      >
        <ExternalLink className="h-3.5 w-3.5" />
      </Button>

      {/* Lightbox */}
      {showLightbox && (
        <ScreenshotLightbox url={value} onClose={() => setShowLightbox(false)} />
      )}
    </div>
  );
}

// ─── Overview Tab ──────────────────────────────────────────────────────────

export function SpyOverviewTab({ offer }: SpyOverviewTabProps) {
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(offer.screenshot_url ?? null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Screenshot card — full width, first */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Screenshot</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <ScreenshotField
            offerId={offer.id}
            value={screenshotUrl}
            onUpdated={url => setScreenshotUrl(url)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Produto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <InfoRow label="Nome" value={offer.product_name} />
          <InfoRow label="Promessa" value={offer.product_promise} />
          <InfoRow label="Ticket" value={offer.product_ticket ? `R$ ${offer.product_ticket}` : null} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Checkout & VSL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <InfoRow label="Checkout" value={offer.checkout_provider} />
          {offer.checkout_url && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs w-20 shrink-0">URL</span>
              <a href={offer.checkout_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs truncate flex items-center gap-1">
                {offer.checkout_url} <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>
          )}
          <InfoRow label="VSL Player" value={offer.vsl_player} />
          <InfoRow label="Duração" value={offer.vsl_duration} />
          {offer.vsl_url && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs w-20 shrink-0">VSL URL</span>
              <a href={offer.vsl_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs truncate flex items-center gap-1">
                {offer.vsl_url} <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Descoberta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <InfoRow label="Fonte" value={offer.discovery_source} />
          <InfoRow label="Query" value={offer.discovery_query} />
          <InfoRow label="Detalhe" value={offer.discovery_tool_detail} />
          <InfoRow label="Descoberto em" value={offer.discovered_at ? format(new Date(offer.discovered_at), "dd MMM yyyy", { locale: ptBR }) : null} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Operador</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <InfoRow label="Nome" value={offer.operator_name} />
          <InfoRow label="Rede" value={offer.operator_network} />
          <InfoRow label="Geo" value={offer.geo} />
          <InfoRow label="Vertical" value={offer.vertical} />
          <InfoRow label="Subnicho" value={offer.subnicho} />
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Estimativas</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-8 text-sm">
          <InfoRow label="Tráfego mensal" value={offer.estimated_monthly_traffic ? `${offer.estimated_monthly_traffic.toLocaleString()}` : null} />
          <InfoRow label="Revenue mensal" value={offer.estimated_monthly_revenue ? `R$ ${Number(offer.estimated_monthly_revenue).toLocaleString()}` : null} />
          <InfoRow label="Tendência" value={offer.traffic_trend} />
          <InfoRow label="Prioridade" value={offer.priority !== null && offer.priority !== undefined ? `${offer.priority}/10` : null} />
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-muted-foreground text-xs w-20 shrink-0">{label}</span>
      <span className="text-xs">{value || "—"}</span>
    </div>
  );
}

import { useState, useRef, useEffect, useCallback } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { ExternalLink, Copy, Eye, X, ZoomIn, ZoomOut, MoreHorizontal, Pencil, Brain, TrendingUp, Megaphone, Palette, Clock, Building, Timer, ShoppingCart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useUpdateSpiedOffer } from "@/features/spy/hooks/useSpiedOffers";
import { Switch } from "@/shared/components/ui/switch";
import { useToast } from "@/shared/hooks/use-toast";

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
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={zoomOut} aria-label="Diminuir zoom" title="Diminuir zoom">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <button
            className="text-xs text-muted-foreground w-12 text-center hover:text-foreground transition-colors"
            onClick={resetZoom}
            title="Resetar zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={zoomIn} aria-label="Aumentar zoom" title="Aumentar zoom">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose} aria-label="Fechar" title="Fechar">
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
      {/* URL text — non-clickable, truncated */}
      <span
        className="text-xs text-muted-foreground truncate flex-1 text-left"
        title={value}
      >
        {value}
      </span>

      {/* Preview button (primary action) with hover mini-preview */}
      <div className="relative shrink-0" onMouseEnter={handlePreviewEnter} onMouseLeave={handlePreviewLeave}>
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-xs px-2 gap-1"
          onClick={() => setShowLightbox(true)}
          title="Pré-visualizar screenshot"
        >
          <Eye className="h-3 w-3" />
          Preview
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

      {/* More actions dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 shrink-0"
            title="Mais ações"
            aria-label="Mais ações"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={handleCopy}>
            <Copy className="h-3.5 w-3.5 mr-2" />
            Copiar URL
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleOpenTab}>
            <ExternalLink className="h-3.5 w-3.5 mr-2" />
            Abrir em nova aba
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleStartEdit}>
            <Pencil className="h-3.5 w-3.5 mr-2" />
            Editar URL
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
      <div className="md:col-span-2 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)]">
        <div className="px-4 pt-4 pb-2">
          <h3 className="text-[length:var(--text-label)] [font-weight:var(--font-semibold)] text-[color:var(--text-secondary)]">Screenshot</h3>
        </div>
        <div className="px-4 pb-4 text-sm">
          <ScreenshotField
            offerId={offer.id}
            value={screenshotUrl}
            onUpdated={url => setScreenshotUrl(url)}
          />
        </div>
      </div>

      {/* Intelligence card — full width */}
      <IntelligenceCard offer={offer} />

      {/* Scale Signals card — full width */}
      <ScaleSignalsCard offer={offer} />

      <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)]">
        <div className="px-4 pt-4 pb-2">
          <h3 className="text-[length:var(--text-label)] [font-weight:var(--font-semibold)] text-[color:var(--text-secondary)]">Produto</h3>
        </div>
        <div className="px-4 pb-4 space-y-2 text-sm">
          <InfoRow label="Nome" value={offer.product_name} />
          <InfoRow label="Promessa" value={offer.product_promise} />
          <InfoRow label="Ticket" value={offer.product_ticket ? `R$ ${offer.product_ticket}` : null} />
        </div>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)]">
        <div className="px-4 pt-4 pb-2">
          <h3 className="text-[length:var(--text-label)] [font-weight:var(--font-semibold)] text-[color:var(--text-secondary)]">Checkout & VSL</h3>
        </div>
        <div className="px-4 pb-4 space-y-2 text-sm">
          <InfoRow label="Checkout" value={offer.checkout_provider} />
          {offer.checkout_url && (
            <div className="flex items-center gap-2">
              <span className="text-[color:var(--text-muted)] text-xs w-20 shrink-0">URL</span>
              <a href={offer.checkout_url} target="_blank" rel="noopener noreferrer" className="text-[color:var(--accent-teal)] hover:underline text-xs truncate flex items-center gap-1">
                {offer.checkout_url} <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>
          )}
          <InfoRow label="VSL Player" value={offer.vsl_player} />
          <InfoRow label="Duração" value={offer.vsl_duration} />
          {offer.vsl_url && (
            <div className="flex items-center gap-2">
              <span className="text-[color:var(--text-muted)] text-xs w-20 shrink-0">VSL URL</span>
              <a href={offer.vsl_url} target="_blank" rel="noopener noreferrer" className="text-[color:var(--accent-teal)] hover:underline text-xs truncate flex items-center gap-1">
                {offer.vsl_url} <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)]">
        <div className="px-4 pt-4 pb-2">
          <h3 className="text-[length:var(--text-label)] [font-weight:var(--font-semibold)] text-[color:var(--text-secondary)]">Descoberta</h3>
        </div>
        <div className="px-4 pb-4 space-y-2 text-sm">
          <InfoRow label="Fonte" value={offer.discovery_source} />
          <InfoRow label="Query" value={offer.discovery_query} />
          <InfoRow label="Detalhe" value={offer.discovery_tool_detail} />
          <InfoRow label="Descoberto em" value={offer.discovered_at ? format(new Date(offer.discovered_at), "dd MMM yyyy", { locale: ptBR }) : null} />
        </div>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)]">
        <div className="px-4 pt-4 pb-2">
          <h3 className="text-[length:var(--text-label)] [font-weight:var(--font-semibold)] text-[color:var(--text-secondary)]">Operador</h3>
        </div>
        <div className="px-4 pb-4 space-y-2 text-sm">
          <InfoRow label="Nome" value={offer.operator_name} />
          <InfoRow label="Rede" value={offer.operator_network} />
          <InfoRow label="Geo" value={offer.geo} />
          <InfoRow label="Vertical" value={offer.vertical} />
          <InfoRow label="Subnicho" value={offer.subnicho} />
        </div>
      </div>

      <div className="md:col-span-2 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)]">
        <div className="px-4 pt-4 pb-2">
          <h3 className="text-[length:var(--text-label)] [font-weight:var(--font-semibold)] text-[color:var(--text-secondary)]">Estimativas</h3>
        </div>
        <div className="px-4 pb-4 flex gap-8 text-sm">
          <InfoRow label="Tráfego mensal" value={offer.estimated_monthly_traffic ? `${offer.estimated_monthly_traffic.toLocaleString()}` : null} />
          <InfoRow label="Revenue mensal" value={offer.estimated_monthly_revenue ? `R$ ${Number(offer.estimated_monthly_revenue).toLocaleString()}` : null} />
          <InfoRow label="Tendência" value={offer.traffic_trend} />
          <InfoRow label="Prioridade" value={offer.priority !== null && offer.priority !== undefined ? `${offer.priority}/10` : null} />
        </div>
      </div>
    </div>
  );
}

// ─── Funnel / Angle labels ────────────────────────────────────────────────

const FUNNEL_LABELS: Record<string, { label: string; className: string }> = {
  vsl_direta: { label: "VSL Direta", className: "bg-blue-500/20 text-blue-400" },
  preland_vsl: { label: "Preland + VSL", className: "bg-purple-500/20 text-purple-400" },
  quiz_vsl: { label: "Quiz + VSL", className: "bg-cyan-500/20 text-cyan-400" },
  webinar: { label: "Webinar", className: "bg-amber-500/20 text-amber-400" },
  challenge: { label: "Challenge", className: "bg-green-500/20 text-green-400" },
};

const ANGLE_LABELS: Record<string, { label: string; className: string }> = {
  dor: { label: "Dor", className: "bg-red-500/20 text-red-400" },
  desejo: { label: "Desejo", className: "bg-pink-500/20 text-pink-400" },
  curiosidade: { label: "Curiosidade", className: "bg-yellow-500/20 text-yellow-400" },
  autoridade: { label: "Autoridade", className: "bg-blue-500/20 text-blue-400" },
  medo: { label: "Medo", className: "bg-orange-500/20 text-orange-400" },
  prova_social: { label: "Prova Social", className: "bg-green-500/20 text-green-400" },
};

const SCALE_SIGNAL_CONFIG = [
  { key: "ads_running", label: "Ads Ativos", icon: Megaphone },
  { key: "multiple_creatives", label: "Criativos Variados", icon: Palette },
  { key: "traffic_growing", label: "Trafego Crescendo", icon: TrendingUp },
  { key: "new_domain", label: "Dominio Novo", icon: Clock },
  { key: "corporate_structure", label: "Estrutura Corp.", icon: Building },
  { key: "urgency_elements", label: "Urgencia na Pagina", icon: Timer },
  { key: "upsells_present", label: "Upsells Presentes", icon: ShoppingCart },
];

function countScaleSignals(signals: Record<string, boolean> | null | undefined): number {
  if (!signals || typeof signals !== "object") return 0;
  return Object.values(signals).filter(Boolean).length;
}

function IntelligenceCard({ offer }: { offer: any }) {
  const funnel = offer.funnel_type ? FUNNEL_LABELS[offer.funnel_type] : null;
  const angle = offer.creative_angle ? ANGLE_LABELS[offer.creative_angle] : null;
  const score = offer.relevance_score;

  if (!funnel && !angle && !score) return null;

  return (
    <div className="md:col-span-2 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)]">
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-[length:var(--text-label)] [font-weight:var(--font-semibold)] text-[color:var(--text-secondary)] flex items-center gap-1.5">
          <Brain className="h-4 w-4" /> Inteligencia
        </h3>
      </div>
      <div className="px-4 pb-4 flex flex-wrap gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-[color:var(--text-muted)] text-xs">Funil</span>
          {funnel ? (
            <Badge variant="outline" className={funnel.className}>{funnel.label}</Badge>
          ) : (
            <span className="text-xs text-[color:var(--text-muted)]">—</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[color:var(--text-muted)] text-xs">Angulo</span>
          {angle ? (
            <Badge variant="outline" className={angle.className}>{angle.label}</Badge>
          ) : (
            <span className="text-xs text-[color:var(--text-muted)]">—</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[color:var(--text-muted)] text-xs">Relevancia</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className={`h-2.5 w-2.5 rounded-full ${n <= (score || 0) ? "bg-[var(--accent-primary)]" : "bg-[var(--border-default)]"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScaleSignalsCard({ offer }: { offer: any }) {
  const updateMutation = useUpdateSpiedOffer();
  const signals: Record<string, boolean> = (offer.scale_signals && typeof offer.scale_signals === "object") ? offer.scale_signals : {};
  const count = countScaleSignals(signals);

  const handleToggle = (key: string, checked: boolean) => {
    const updated = { ...signals, [key]: checked };
    updateMutation.mutate({ id: offer.id, data: { scale_signals: updated } });
  };

  return (
    <div className="md:col-span-2 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)]">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h3 className="text-[length:var(--text-label)] [font-weight:var(--font-semibold)] text-[color:var(--text-secondary)] flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4" /> Sinais de Escala
        </h3>
        <span className="text-xs text-[color:var(--text-muted)]">{count}/7 sinais</span>
      </div>
      <div className="px-4 pb-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {SCALE_SIGNAL_CONFIG.map(({ key, label, icon: Icon }) => (
          <label key={key} className="flex items-center gap-2 cursor-pointer">
            <Switch
              checked={!!signals[key]}
              onCheckedChange={(checked) => handleToggle(key, checked)}
            />
            <Icon className="h-3.5 w-3.5 text-[color:var(--text-muted)]" />
            <span className="text-xs text-[color:var(--text-body)]">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-[color:var(--text-muted)] text-xs w-20 shrink-0">{label}</span>
      <span className="text-xs text-[color:var(--text-body)]">{value || "—"}</span>
    </div>
  );
}

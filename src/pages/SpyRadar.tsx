import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useSpiedOffers, useDeleteSpiedOffer, useUpdateSpiedOffer, useLatestTrafficPerOffer } from "@/hooks/useSpiedOffers";
import { QuickAddOfferModal } from "@/components/spy/QuickAddOfferModal";
import { FullOfferFormModal } from "@/components/spy/FullOfferFormModal";
import { UniversalImportModal } from "@/components/spy/UniversalImportModal";
import { TrafficIntelligenceView } from "@/components/spy/TrafficIntelligenceView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus, Zap, Search, Eye, Trash2, Radar, FileSpreadsheet,
  ChevronLeft, ChevronRight, Columns, X, FileText,
  ZoomIn, ZoomOut, BookmarkPlus, Image as ImageIcon,
  ArrowUpRight, ArrowDownRight, ArrowRight, Sparkles,
  LayoutList, BarChart3, Info, Radio, Flame, Rocket,
  TrendingDown, Skull, Dna, Archive, BarChart2,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "RADAR", label: "Radar" },
  { value: "ANALYZING", label: "Analyzing" },
  { value: "HOT", label: "HOT" },
  { value: "SCALING", label: "Scaling" },
  { value: "DYING", label: "Dying" },
  { value: "DEAD", label: "Dead" },
  { value: "CLONED", label: "Cloned" },
  { value: "VAULT", label: "Vault" },
  { value: "NEVER_SCALED", label: "Never Scaled" },
];

const STATUS_BADGE: Record<string, { label: string; className: string; tip: string }> = {
  RADAR: { label: "Radar", className: "bg-muted text-muted-foreground", tip: "Recém-descoberta, aguardando análise" },
  ANALYZING: { label: "Analyzing", className: "bg-warning/20 text-warning", tip: "Sob investigação ativa" },
  HOT: { label: "HOT", className: "bg-destructive/20 text-destructive", tip: "Sinais fortes — merece atenção imediata" },
  SCALING: { label: "Scaling", className: "bg-success/20 text-success animate-pulse", tip: "Crescimento acelerado — hora de agir" },
  DYING: { label: "Dying", className: "bg-accent/20 text-accent", tip: "Tráfego em queda, perdendo força" },
  DEAD: { label: "Dead", className: "bg-muted text-muted-foreground line-through", tip: "Parou completamente, referência histórica" },
  CLONED: { label: "Cloned", className: "bg-primary/20 text-primary", tip: "Já clonada/adaptada para sua operação" },
  VAULT: { label: "Vault", className: "bg-muted text-muted-foreground", tip: "Sites irrelevantes (google, youtube, etc)" },
  NEVER_SCALED: { label: "Never Scaled", className: "bg-muted/50 text-muted-foreground", tip: "Nunca escalou — mantido como referência" },
};

// ─── Column groups (all possible offer fields) ───────────────────────────────

const COLUMN_GROUPS: { group: string; columns: { key: string; label: string }[] }[] = [
  {
    group: "Identificação",
    columns: [
      { key: "status", label: "Status" },
      { key: "nome", label: "Nome / Domínio" },
      { key: "notas", label: "Notas" },
      { key: "priority", label: "Prioridade" },
    ],
  },
  {
    group: "Produto",
    columns: [
      { key: "vertical", label: "Vertical" },
      { key: "subnicho", label: "Subnicho" },
      { key: "product_name", label: "Nome do Produto" },
      { key: "product_promise", label: "Promessa" },
      { key: "ticket", label: "Ticket" },
      { key: "geo", label: "Geo" },
    ],
  },
  {
    group: "Tráfego",
    columns: [
      { key: "trafego", label: "Tráfego" },
      { key: "traffic_trend", label: "Tendência" },
      { key: "estimated_revenue", label: "Receita Est." },
    ],
  },
  {
    group: "Operacional",
    columns: [
      { key: "operator", label: "Operador" },
      { key: "checkout", label: "Checkout" },
      { key: "vsl", label: "VSL" },
    ],
  },
  {
    group: "Descoberta",
    columns: [
      { key: "fonte", label: "Fonte" },
      { key: "discovery_query", label: "Query de Busca" },
      { key: "discovered", label: "Descoberto" },
    ],
  },
  {
    group: "Contagens",
    columns: [
      { key: "dom", label: "Domínios" },
      { key: "ads", label: "Ads" },
      { key: "funil", label: "Funil" },
    ],
  },
];

const DEFAULT_SPY_COLUMNS = new Set([
  "status", "nome", "notas", "vertical", "ticket", "trafego", "fonte", "dom", "ads", "funil", "discovered",
]);

const LS_KEY_SPY_COLUMNS = "spy-radar-columns";
const LS_KEY_TRAFFIC_SOURCE = "spy-radar-traffic-source";
const LS_KEY_PRESETS = "spy-radar-presets";

function loadSpyColumns(): Set<string> {
  try {
    const saved = localStorage.getItem(LS_KEY_SPY_COLUMNS);
    if (saved) return new Set(JSON.parse(saved));
  } catch {}
  return new Set(DEFAULT_SPY_COLUMNS);
}

type ColumnPreset = { name: string; columns: string[] };

function loadPresets(): ColumnPreset[] {
  try {
    const saved = localStorage.getItem(LS_KEY_PRESETS);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

function savePresetsToStorage(presets: ColumnPreset[]) {
  localStorage.setItem(LS_KEY_PRESETS, JSON.stringify(presets));
}

const VERTICAL_BADGE: Record<string, string> = {
  nutra: "bg-success/20 text-success",
  info: "bg-info/20 text-info",
  tech: "bg-primary/20 text-primary",
};

const TREND_ICON: Record<string, React.ReactNode> = {
  UP: <ArrowUpRight className="h-3.5 w-3.5 text-green-500" />,
  DOWN: <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />,
  STABLE: <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />,
  SPIKE: <Zap className="h-3.5 w-3.5 text-yellow-500" />,
  NEW: <Sparkles className="h-3.5 w-3.5 text-blue-500" />,
};

const PAGE_SIZE_OPTIONS = [
  { value: "10", label: "10 por página" },
  { value: "25", label: "25 por página" },
  { value: "50", label: "50 por página" },
  { value: "100", label: "100 por página" },
  { value: "all", label: "Todas (infinito)" },
];

function formatCurrency(value: number | null | undefined) {
  if (!value) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function stripMarkdown(text: string) {
  return text.replace(/[#*`>\[\]_~]/g, "").replace(/\n+/g, " ").trim();
}

// ─── Screenshot Lightbox ─────────────────────────────────────────────────────

function ScreenshotLightbox({ url, onClose }: { url: string; onClose: () => void }) {
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col bg-background rounded-lg shadow-2xl overflow-hidden w-[90vw] max-w-5xl h-[85svh] max-h-[900px]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/50 shrink-0">
          <span className="text-xs text-muted-foreground truncate flex-1 hidden sm:block">{url}</span>
          <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-7 sm:w-7" onClick={zoomOut} title="Diminuir zoom">
            <ZoomOut className="h-5 w-5 sm:h-4 sm:w-4" />
          </Button>
          <button
            className="text-xs text-muted-foreground w-14 sm:w-12 text-center hover:text-foreground transition-colors py-1"
            onClick={resetZoom}
            title="Resetar zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-7 sm:w-7" onClick={zoomIn} title="Aumentar zoom">
            <ZoomIn className="h-5 w-5 sm:h-4 sm:w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-7 sm:w-7" onClick={onClose} title="Fechar">
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SpyRadar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Filters
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [vertical, setVertical] = useState("");
  const [source, setSource] = useState("");
  const [search, setSearch] = useState("");

  // Columns
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(loadSpyColumns);
  const [colSearch, setColSearch] = useState("");
  const [presets, setPresets] = useState<ColumnPreset[]>(loadPresets);
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [presetName, setPresetName] = useState("");

  // Modals
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showFullForm, setShowFullForm] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<"single" | "bulk" | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Tabs
  const [mainTab, setMainTab] = useState("offers");

  // Traffic source
  const [trafficDataSource, setTrafficDataSource] = useState<'similarweb' | 'semrush'>(() => {
    return (localStorage.getItem(LS_KEY_TRAFFIC_SOURCE) as 'similarweb' | 'semrush') || 'similarweb';
  });

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const lastClickedIndex = useRef<number | null>(null);

  // Pagination
  const [pageSize, setPageSize] = useState("25");
  const [currentPage, setCurrentPage] = useState(0);

  // Screenshot lightbox
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [hoverScreenshotId, setHoverScreenshotId] = useState<string | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Notes inline edit
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState("");

  const deleteMutation = useDeleteSpiedOffer();
  const updateMutation = useUpdateSpiedOffer();

  // Persist column prefs
  useEffect(() => {
    localStorage.setItem(LS_KEY_SPY_COLUMNS, JSON.stringify([...visibleColumns]));
  }, [visibleColumns]);

  const toggleStatusFilter = (value: string) => {
    setStatusFilter(prev => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value); else next.add(value);
      return next;
    });
    handleFilterChange();
  };

  const toggleSpyColumn = (key: string) => {
    setVisibleColumns(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  // Preset management
  const handleSavePreset = () => {
    if (!presetName.trim()) return;
    const newPresets = [...presets, { name: presetName.trim(), columns: [...visibleColumns] }];
    setPresets(newPresets);
    savePresetsToStorage(newPresets);
    setPresetName("");
    setShowSavePreset(false);
    toast({ title: `Preset "${presetName.trim()}" salvo!` });
  };

  const handleLoadPreset = (preset: ColumnPreset) => {
    setVisibleColumns(new Set(preset.columns));
  };

  const handleDeletePreset = (index: number) => {
    const newPresets = presets.filter((_, i) => i !== index);
    setPresets(newPresets);
    savePresetsToStorage(newPresets);
  };

  // Inline status change (optimistic)
  const handleInlineStatusChange = async (offerId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("spied_offers").update({ status: newStatus } as any).eq("id", offerId);
      if (error) throw error;
      queryClient.setQueriesData({ queryKey: ['spied-offers'] }, (old: any) => {
        if (!old) return old;
        return old.map((o: any) => o.id === offerId ? { ...o, status: newStatus } : o);
      });
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ['spied-offers'] }), 1500);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  // Notes update
  const handleNotesUpdate = async (offerId: string) => {
    try {
      const { error } = await supabase.from("spied_offers").update({ notas: notesValue } as any).eq("id", offerId);
      if (error) throw error;
      queryClient.setQueriesData({ queryKey: ['spied-offers'] }, (old: any) => {
        if (!old) return old;
        return old.map((o: any) => o.id === offerId ? { ...o, notas: notesValue } : o);
      });
      setEditingNotesId(null);
      toast({ title: "Notas salvas!" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const { data: allOffersRaw, isLoading, refetch } = useSpiedOffers({
    vertical: vertical || undefined,
    discovery_source: source || undefined,
    search: search || undefined,
  });

  const { data: latestTrafficMap } = useLatestTrafficPerOffer(trafficDataSource);

  const handleTrafficSourceChange = (src: 'similarweb' | 'semrush') => {
    setTrafficDataSource(src);
    localStorage.setItem(LS_KEY_TRAFFIC_SOURCE, src);
  };

  // Client-side multi-status filter
  const offers = useMemo(() => {
    if (!allOffersRaw) return allOffersRaw;
    if (statusFilter.size === 0) return allOffersRaw;
    return allOffersRaw.filter((o: any) => statusFilter.has(o.status || "RADAR"));
  }, [allOffersRaw, statusFilter]);

  const getCount = (item: any, relation: string) => {
    const rel = item[relation];
    if (!rel) return 0;
    if (Array.isArray(rel) && rel.length > 0 && rel[0]?.count !== undefined) return rel[0].count;
    if (Array.isArray(rel)) return rel.length;
    return 0;
  };

  // Pagination logic
  const totalOffers = offers?.length ?? 0;
  const isInfinite = pageSize === "all";
  const pageSizeNum = isInfinite ? totalOffers : parseInt(pageSize);
  const totalPages = isInfinite ? 1 : Math.max(1, Math.ceil(totalOffers / pageSizeNum));
  const visibleOffers = isInfinite
    ? (offers ?? [])
    : (offers ?? []).slice(currentPage * pageSizeNum, (currentPage + 1) * pageSizeNum);

  // Reset page when filters change
  const handleFilterChange = useCallback(() => {
    setCurrentPage(0);
    setSelectedIds(new Set());
  }, []);

  // Selection handlers — NEW-05: track absolute index for reliable shift+click cross-page
  const handleRowSelect = useCallback((offerId: string, visibleIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const absoluteIdx = isInfinite ? visibleIdx : currentPage * pageSizeNum + visibleIdx;
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (e.shiftKey && lastClickedIndex.current !== null && offers) {
        const start = Math.min(lastClickedIndex.current, absoluteIdx);
        const end = Math.max(lastClickedIndex.current, absoluteIdx);
        for (let i = start; i <= end; i++) {
          if (offers[i]) next.add(offers[i].id);
        }
      } else if (e.metaKey || e.ctrlKey) {
        if (next.has(offerId)) next.delete(offerId);
        else next.add(offerId);
      } else {
        if (next.size === 1 && next.has(offerId)) {
          next.clear();
        } else {
          next.clear();
          next.add(offerId);
        }
      }
      lastClickedIndex.current = absoluteIdx;
      return next;
    });
  }, [offers, currentPage, pageSizeNum, isInfinite]);

  const handleSelectAll = useCallback(() => {
    if (!offers) return;
    if (selectedIds.size === offers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(offers.map(o => o.id)));
    }
  }, [offers, selectedIds]);

  const handleSelectPage = useCallback(() => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      const allPageSelected = visibleOffers.every(o => next.has(o.id));
      if (allPageSelected) {
        visibleOffers.forEach(o => next.delete(o.id));
      } else {
        visibleOffers.forEach(o => next.add(o.id));
      }
      return next;
    });
  }, [visibleOffers]);

  // Bulk actions
  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    try {
      const { error } = await supabase.from('spied_offers').delete().in('id', ids);
      if (error) throw error;
      toast({ title: `${ids.length} ofertas removidas!` });
      setSelectedIds(new Set());
      refetch();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
    setDeleteTarget(null);
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    const ids = Array.from(selectedIds);
    try {
      const { error } = await supabase.from('spied_offers').update({ status: newStatus } as any).in('id', ids);
      if (error) throw error;
      toast({ title: `${ids.length} ofertas → ${newStatus}` });
      // Optimistic update: immediately apply to cache so status filter takes effect at once
      queryClient.setQueriesData({ queryKey: ['spied-offers'] }, (old: any) => {
        if (!old) return old;
        return old.map((o: any) => ids.includes(o.id) ? { ...o, status: newStatus } : o);
      });
      setSelectedIds(new Set());
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ['spied-offers'] }), 1500);
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  const allPageChecked = visibleOffers.length > 0 && visibleOffers.every(o => selectedIds.has(o.id));
  const somePageChecked = visibleOffers.some(o => selectedIds.has(o.id));

  // Filtered column groups for search
  // NEW-06: normalize string removing diacritics for accent-insensitive search
  const normalizeStr = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filteredColumnGroups = useMemo(() => {
    if (!colSearch.trim()) return COLUMN_GROUPS;
    const q = normalizeStr(colSearch);
    return COLUMN_GROUPS.map(g => ({
      ...g,
      columns: g.columns.filter(c => normalizeStr(c.label).includes(q) || c.key.toLowerCase().includes(q)),
    })).filter(g => g.columns.length > 0);
  }, [colSearch]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Search className="h-6 w-6" /> Radar de Ofertas</h1>
            <p className="text-muted-foreground text-sm">
              Monitore ofertas, espione funis e escale mais rápido
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowQuickAdd(true)}>
              <Zap className="h-4 w-4 mr-2" />
              Quick Add
            </Button>
            <Button variant="outline" onClick={() => setShowFullForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Oferta Completa
            </Button>
            <Button variant="outline" onClick={() => setShowImport(true)}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Importar CSV
            </Button>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={mainTab} onValueChange={setMainTab}>
          <TabsList>
            <TabsTrigger value="offers" className="flex items-center gap-1.5"><LayoutList className="h-4 w-4" /> Ofertas</TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-1.5"><BarChart3 className="h-4 w-4" /> Inteligencia de Trafego</TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-1.5"><Info className="h-4 w-4" /> Sobre</TabsTrigger>
          </TabsList>

          <TabsContent value="offers" className="mt-4 space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center border rounded-md overflow-hidden text-xs" title="Fonte dos dados de tráfego exibidos na coluna Tráfego">
                <button
                  className={`px-2.5 py-1.5 transition-colors ${trafficDataSource === 'similarweb' ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                  onClick={() => handleTrafficSourceChange('similarweb')}
                >
                  SimilarWeb
                </button>
                <button
                  className={`px-2.5 py-1.5 transition-colors ${trafficDataSource === 'semrush' ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                  onClick={() => handleTrafficSourceChange('semrush')}
                >
                  SEMrush
                </button>
              </div>
              <Select value={vertical} onValueChange={(v) => { setVertical(v === "all" ? "" : v); handleFilterChange(); }}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Vertical" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="nutra">Nutra</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="tech">Tech</SelectItem>
                </SelectContent>
              </Select>
              <Select value={source} onValueChange={(v) => { setSource(v === "all" ? "" : v); handleFilterChange(); }}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Fonte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="publicwww">PublicWWW</SelectItem>
                  <SelectItem value="fb_ads_library">FB Ads Library</SelectItem>
                  <SelectItem value="adheart">AdHeart</SelectItem>
                  <SelectItem value="semrush">Semrush</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>

              {/* Column selector */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs gap-1">
                    <Columns className="h-3.5 w-3.5" />
                    Colunas
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-3" align="end">
                  {/* Search */}
                  <div className="relative mb-3">
                    <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Buscar coluna..."
                      value={colSearch}
                      onChange={(e) => setColSearch(e.target.value)}
                      className="pl-7 h-8 text-xs"
                    />
                  </div>

                  {/* Column groups */}
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {filteredColumnGroups.map(g => (
                      <div key={g.group}>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                          {g.group}
                        </p>
                        <div className="space-y-1">
                          {g.columns.map(col => (
                            <label key={col.key} className="flex items-center gap-2 text-xs cursor-pointer hover:text-foreground">
                              <Checkbox
                                checked={visibleColumns.has(col.key)}
                                onCheckedChange={() => toggleSpyColumn(col.key)}
                              />
                              {col.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Presets */}
                  <div className="border-t mt-3 pt-3 space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Presets
                    </p>
                    {presets.length > 0 && (
                      <div className="space-y-0.5">
                        {presets.map((p, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <button
                              className="flex-1 text-left text-xs px-2 py-1 rounded hover:bg-muted/50 transition-colors"
                              onClick={() => handleLoadPreset(p)}
                            >
                              {p.name}
                            </button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 text-destructive shrink-0"
                              onClick={() => handleDeletePreset(i)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    {showSavePreset ? (
                      <div className="flex gap-1">
                        <Input
                          placeholder="Nome do preset"
                          value={presetName}
                          onChange={(e) => setPresetName(e.target.value)}
                          className="h-7 text-xs flex-1"
                          onKeyDown={(e) => e.key === "Enter" && handleSavePreset()}
                          autoFocus
                        />
                        <Button size="sm" className="h-7 px-2 text-xs" onClick={handleSavePreset}>OK</Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => { setShowSavePreset(false); setPresetName(""); }}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-7 text-xs gap-1"
                        onClick={() => setShowSavePreset(true)}
                      >
                        <BookmarkPlus className="h-3 w-3" />
                        Salvar preset atual
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar nome, dominio, produto..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); handleFilterChange(); }}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Multi-status filter badges */}
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map(s => {
                const active = statusFilter.has(s.value);
                return (
                  <Badge
                    key={s.value}
                    variant="outline"
                    className={`cursor-pointer transition-colors ${active ? "ring-2 ring-primary bg-primary/10" : "hover:bg-muted/50"}`}
                    onClick={() => toggleStatusFilter(s.value)}
                  >
                    {s.label}
                  </Badge>
                );
              })}
              {statusFilter.size > 0 && (
                <Button variant="ghost" size="sm" className="h-5 text-xs px-2" onClick={() => { setStatusFilter(new Set()); handleFilterChange(); }}>
                  <X className="h-3 w-3 mr-1" /> Limpar
                </Button>
              )}
            </div>

            {/* Bulk action bar */}
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                <span className="text-sm font-medium">{selectedIds.size} selecionada(s)</span>
                <Button size="sm" variant="outline" onClick={handleSelectAll}>
                  {selectedIds.size === totalOffers ? "Desmarcar todas" : `Selecionar todas (${totalOffers})`}
                </Button>
                <div className="flex-1" />
                <Select onValueChange={(v) => handleBulkStatusChange(v)}>
                  <SelectTrigger className="w-40 h-8">
                    <SelectValue placeholder="Alterar status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" variant="destructive" onClick={() => setDeleteTarget("bulk")}>
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Apagar ({selectedIds.size})
                </Button>
              </div>
            )}

            {/* Table */}
            {isLoading ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : !offers || offers.length === 0 ? (
              <div className="border border-dashed rounded-lg p-12 text-center space-y-4">
                <Radar className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">Nenhuma oferta no radar ainda.</p>
                <p className="text-sm text-muted-foreground">Comece adicionando ofertas que você encontrou espionando.</p>
                <Button onClick={() => setShowQuickAdd(true)}>
                  <Zap className="h-4 w-4 mr-2" /> Quick Add
                </Button>
              </div>
            ) : (
              <>
                <div className="border rounded-lg overflow-x-auto">
                  <Table style={{ tableLayout: "fixed", minWidth: "800px" }}>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]">
                          <Checkbox
                            checked={allPageChecked}
                            ref={(el) => {
                              if (el) {
                                const input = el as unknown as HTMLButtonElement;
                                if (somePageChecked && !allPageChecked) {
                                  input.dataset.state = "indeterminate";
                                }
                              }
                            }}
                            onCheckedChange={handleSelectPage}
                            aria-label="Selecionar pagina"
                          />
                        </TableHead>
                        {visibleColumns.has("status") && <TableHead className="w-[90px]">Status</TableHead>}
                        {visibleColumns.has("nome") && <TableHead className="w-[200px]">Nome</TableHead>}
                        {visibleColumns.has("notas") && <TableHead className="w-[200px]">Notas</TableHead>}
                        {visibleColumns.has("priority") && <TableHead className="w-[70px] text-center">Prior.</TableHead>}
                        {visibleColumns.has("vertical") && <TableHead className="w-[80px]">Vertical</TableHead>}
                        {visibleColumns.has("subnicho") && <TableHead className="w-[90px]">Subnicho</TableHead>}
                        {visibleColumns.has("product_name") && <TableHead className="w-[140px]">Produto</TableHead>}
                        {visibleColumns.has("product_promise") && <TableHead className="w-[160px]">Promessa</TableHead>}
                        {visibleColumns.has("ticket") && <TableHead className="w-[80px]">Ticket</TableHead>}
                        {visibleColumns.has("geo") && <TableHead className="w-[60px]">Geo</TableHead>}
                        {visibleColumns.has("trafego") && (
                          <TableHead className="w-[120px]">
                            Tráfego
                            <span className="ml-1 text-[10px] text-muted-foreground font-normal">
                              ({trafficDataSource === 'similarweb' ? 'SW' : 'SR'})
                            </span>
                          </TableHead>
                        )}
                        {visibleColumns.has("traffic_trend") && <TableHead className="w-[70px]">Tend.</TableHead>}
                        {visibleColumns.has("estimated_revenue") && <TableHead className="w-[100px]">Receita</TableHead>}
                        {visibleColumns.has("operator") && <TableHead className="w-[100px]">Operador</TableHead>}
                        {visibleColumns.has("checkout") && <TableHead className="w-[90px]">Checkout</TableHead>}
                        {visibleColumns.has("vsl") && <TableHead className="w-[60px]">VSL</TableHead>}
                        {visibleColumns.has("fonte") && <TableHead className="w-[100px]">Fonte</TableHead>}
                        {visibleColumns.has("discovery_query") && <TableHead className="w-[120px]">Query</TableHead>}
                        {visibleColumns.has("dom") && <TableHead className="w-[60px] text-center">Dom.</TableHead>}
                        {visibleColumns.has("ads") && <TableHead className="w-[60px] text-center">Ads</TableHead>}
                        {visibleColumns.has("funil") && <TableHead className="w-[60px] text-center">Funil</TableHead>}
                        {visibleColumns.has("discovered") && <TableHead className="w-[90px]">Descoberto</TableHead>}
                        <TableHead className="w-[100px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleOffers.map((offer: any, visibleIdx: number) => {
                        const sb = STATUS_BADGE[offer.status] || STATUS_BADGE.RADAR;
                        const domainsCount = getCount(offer, "offer_domains");
                        const adsCount = getCount(offer, "ad_creatives");
                        const funnelCount = getCount(offer, "offer_funnel_steps");
                        const isSelected = selectedIds.has(offer.id);

                        return (
                          <TableRow
                            key={offer.id}
                            className={`cursor-pointer transition-colors ${isSelected ? "bg-primary/10" : "hover:bg-muted/50"}`}
                            onClick={(e) => {
                              if (e.metaKey || e.ctrlKey || e.shiftKey) {
                                handleRowSelect(offer.id, visibleIdx, e);
                              } else if (selectedIds.size > 0) {
                                handleRowSelect(offer.id, visibleIdx, e);
                              } else {
                                navigate(`/spy/${offer.id}`);
                              }
                            }}
                          >
                            {/* Checkbox */}
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => {
                                  setSelectedIds(prev => {
                                    const next = new Set(prev);
                                    if (next.has(offer.id)) next.delete(offer.id);
                                    else next.add(offer.id);
                                    return next;
                                  });
                                }}
                                aria-label={`Selecionar ${offer.nome}`}
                              />
                            </TableCell>

                            {/* Status — DropdownMenu with tooltip */}
                            {visibleColumns.has("status") && (
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <Tooltip>
                                  <DropdownMenu modal={true}>
                                    <TooltipTrigger asChild>
                                      <DropdownMenuTrigger asChild>
                                        <button className="cursor-pointer">
                                          <Badge variant="outline" className={`${sb.className} whitespace-nowrap`}>
                                            {sb.label}
                                          </Badge>
                                        </button>
                                      </DropdownMenuTrigger>
                                    </TooltipTrigger>
                                    <DropdownMenuContent align="start" className="w-40">
                                      {STATUS_OPTIONS.map(s => (
                                        <DropdownMenuItem
                                          key={s.value}
                                          onClick={() => handleInlineStatusChange(offer.id, s.value)}
                                        >
                                          {s.label}
                                        </DropdownMenuItem>
                                      ))}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                  <TooltipContent side="right" className="text-xs max-w-[200px]">
                                    {sb.tip}
                                  </TooltipContent>
                                </Tooltip>
                              </TableCell>
                            )}

                            {/* Nome */}
                            {visibleColumns.has("nome") && (
                              <TableCell>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <p className="font-medium text-sm truncate max-w-[190px]">{offer.nome}</p>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs max-w-xs">{offer.nome}</TooltipContent>
                                </Tooltip>
                                {offer.main_domain && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <p className="text-xs text-muted-foreground truncate max-w-[190px]">{offer.main_domain}</p>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="text-xs">{offer.main_domain}</TooltipContent>
                                  </Tooltip>
                                )}
                              </TableCell>
                            )}

                            {/* Notas — truncated text with hover tooltip + click-to-edit */}
                            {visibleColumns.has("notas") && (
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-start gap-1 group max-w-[190px]">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <p className="text-xs text-muted-foreground line-clamp-2 flex-1 min-w-0">
                                        {offer.notas
                                          ? stripMarkdown(offer.notas).slice(0, 120)
                                          : <span className="text-muted-foreground/30">—</span>
                                        }
                                      </p>
                                    </TooltipTrigger>
                                    {offer.notas && (
                                      <TooltipContent className="max-w-xs text-xs whitespace-pre-wrap" side="top">
                                        {stripMarkdown(offer.notas).slice(0, 500)}
                                      </TooltipContent>
                                    )}
                                  </Tooltip>
                                  <Popover
                                    open={editingNotesId === offer.id}
                                    onOpenChange={(open) => {
                                      if (open) {
                                        setEditingNotesId(offer.id);
                                        setNotesValue(offer.notas || "");
                                      } else {
                                        setEditingNotesId(null);
                                      }
                                    }}
                                  >
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Editar notas"
                                      >
                                        <FileText className="h-3 w-3" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 p-3" side="left" align="start" avoidCollisions collisionPadding={16}>
                                      <p className="text-xs font-medium mb-2 flex items-center gap-1.5">
                                        <FileText className="h-3.5 w-3.5" />
                                        Notas — {offer.nome}
                                      </p>
                                      <Textarea
                                        value={notesValue}
                                        onChange={(e) => setNotesValue(e.target.value)}
                                        className="text-xs min-h-[120px] resize-y"
                                        placeholder="Escreva notas em markdown..."
                                      />
                                      <div className="flex justify-end gap-2 mt-2">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 text-xs"
                                          onClick={() => setEditingNotesId(null)}
                                        >
                                          Cancelar
                                        </Button>
                                        <Button
                                          size="sm"
                                          className="h-7 text-xs"
                                          onClick={() => handleNotesUpdate(offer.id)}
                                        >
                                          Salvar
                                        </Button>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </TableCell>
                            )}

                            {/* Priority */}
                            {visibleColumns.has("priority") && (
                              <TableCell className="text-sm text-center text-muted-foreground">
                                {offer.priority ?? "—"}
                              </TableCell>
                            )}

                            {/* Vertical */}
                            {visibleColumns.has("vertical") && (
                              <TableCell>
                                {offer.vertical && (
                                  <Badge variant="outline" className={`${VERTICAL_BADGE[offer.vertical] || ""} whitespace-nowrap`}>
                                    {offer.vertical}
                                  </Badge>
                                )}
                              </TableCell>
                            )}

                            {/* Subnicho */}
                            {visibleColumns.has("subnicho") && (
                              <TableCell className="text-xs text-muted-foreground max-w-[80px]">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="block truncate">{offer.subnicho || "—"}</span>
                                  </TooltipTrigger>
                                  {offer.subnicho && <TooltipContent side="top" className="text-xs">{offer.subnicho}</TooltipContent>}
                                </Tooltip>
                              </TableCell>
                            )}

                            {/* Product name */}
                            {visibleColumns.has("product_name") && (
                              <TableCell className="text-xs max-w-[130px]">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="block truncate">{offer.product_name || "—"}</span>
                                  </TooltipTrigger>
                                  {offer.product_name && <TooltipContent side="top" className="text-xs">{offer.product_name}</TooltipContent>}
                                </Tooltip>
                              </TableCell>
                            )}

                            {/* Product promise */}
                            {visibleColumns.has("product_promise") && (
                              <TableCell>
                                {offer.product_promise ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <p className="text-xs text-muted-foreground line-clamp-2 max-w-[150px]">
                                        {offer.product_promise}
                                      </p>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs text-xs" side="top">
                                      {offer.product_promise}
                                    </TooltipContent>
                                  </Tooltip>
                                ) : (
                                  <span className="text-muted-foreground text-xs">—</span>
                                )}
                              </TableCell>
                            )}

                            {/* Ticket */}
                            {visibleColumns.has("ticket") && (
                              <TableCell className="text-sm">
                                {formatCurrency(offer.product_ticket)}
                              </TableCell>
                            )}

                            {/* Geo */}
                            {visibleColumns.has("geo") && (
                              <TableCell className="text-xs text-muted-foreground">
                                {offer.geo || "—"}
                              </TableCell>
                            )}

                            {/* Tráfego */}
                            {visibleColumns.has("trafego") && (
                              <TableCell className="text-sm">
                                {(() => {
                                  const trafficVal = latestTrafficMap?.get(offer.id) ?? offer.estimated_monthly_traffic;
                                  return trafficVal
                                    ? `${(trafficVal / 1000).toFixed(0)}k`
                                    : "—";
                                })()}
                                {offer.traffic_trend && (
                                  <span className="ml-1">{TREND_ICON[offer.traffic_trend] || ""}</span>
                                )}
                              </TableCell>
                            )}

                            {/* Traffic trend */}
                            {visibleColumns.has("traffic_trend") && (
                              <TableCell className="text-sm">
                                {offer.traffic_trend ? (TREND_ICON[offer.traffic_trend] || offer.traffic_trend) : "—"}
                              </TableCell>
                            )}

                            {/* Estimated revenue */}
                            {visibleColumns.has("estimated_revenue") && (
                              <TableCell className="text-sm">
                                {formatCurrency(offer.estimated_monthly_revenue)}
                              </TableCell>
                            )}

                            {/* Operator */}
                            {visibleColumns.has("operator") && (
                              <TableCell className="text-xs text-muted-foreground max-w-[90px]">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="block truncate">{offer.operator_name || "—"}</span>
                                  </TooltipTrigger>
                                  {offer.operator_name && <TooltipContent side="top" className="text-xs">{offer.operator_name}</TooltipContent>}
                                </Tooltip>
                              </TableCell>
                            )}

                            {/* Checkout */}
                            {visibleColumns.has("checkout") && (
                              <TableCell className="text-xs text-muted-foreground max-w-[80px]">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="block truncate">{offer.checkout_provider || "—"}</span>
                                  </TooltipTrigger>
                                  {offer.checkout_provider && <TooltipContent side="top" className="text-xs">{offer.checkout_provider}</TooltipContent>}
                                </Tooltip>
                              </TableCell>
                            )}

                            {/* VSL */}
                            {visibleColumns.has("vsl") && (
                              <TableCell className="text-xs text-muted-foreground">
                                {offer.vsl_player ? "Sim" : "—"}
                              </TableCell>
                            )}

                            {/* Fonte */}
                            {visibleColumns.has("fonte") && (
                              <TableCell className="text-xs text-muted-foreground max-w-[90px]">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="block truncate">{offer.discovery_source || "—"}</span>
                                  </TooltipTrigger>
                                  {offer.discovery_source && <TooltipContent side="top" className="text-xs">{offer.discovery_source}</TooltipContent>}
                                </Tooltip>
                              </TableCell>
                            )}

                            {/* Discovery query */}
                            {visibleColumns.has("discovery_query") && (
                              <TableCell>
                                {offer.discovery_query ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <p className="text-xs text-muted-foreground truncate max-w-[110px]">
                                        {offer.discovery_query}
                                      </p>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs text-xs" side="top">
                                      {offer.discovery_query}
                                    </TooltipContent>
                                  </Tooltip>
                                ) : (
                                  <span className="text-muted-foreground text-xs">—</span>
                                )}
                              </TableCell>
                            )}

                            {/* Dom count */}
                            {visibleColumns.has("dom") && <TableCell className="text-center text-sm">{domainsCount}</TableCell>}

                            {/* Ads count */}
                            {visibleColumns.has("ads") && <TableCell className="text-center text-sm">{adsCount}</TableCell>}

                            {/* Funil */}
                            {visibleColumns.has("funil") && (
                              <TableCell className="text-center text-sm">
                                {funnelCount > 0 ? "OK" : "—"}
                              </TableCell>
                            )}

                            {/* Discovered */}
                            {visibleColumns.has("discovered") && (
                              <TableCell className="text-xs text-muted-foreground">
                                {offer.discovered_at
                                  ? format(new Date(offer.discovered_at), "dd MMM", { locale: ptBR })
                                  : "—"}
                              </TableCell>
                            )}

                            {/* Actions */}
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <div className="flex gap-0.5 items-center">
                                {/* Screenshot preview — hover reveals thumbnail, click opens lightbox */}
                                {offer.screenshot_url && (
                                  <div
                                    onMouseEnter={() => {
                                      if (hoverTimer.current) clearTimeout(hoverTimer.current);
                                      hoverTimer.current = setTimeout(() => setHoverScreenshotId(offer.id), 120);
                                    }}
                                    onMouseLeave={() => {
                                      if (hoverTimer.current) clearTimeout(hoverTimer.current);
                                      hoverTimer.current = setTimeout(() => setHoverScreenshotId(null), 80);
                                    }}
                                  >
                                    <Popover open={hoverScreenshotId === offer.id}>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setHoverScreenshotId(null);
                                            setLightboxUrl(offer.screenshot_url);
                                          }}
                                        >
                                          <ImageIcon className="h-3.5 w-3.5" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent
                                        className="w-56 p-1.5"
                                        side="left"
                                        onMouseEnter={() => {
                                          if (hoverTimer.current) clearTimeout(hoverTimer.current);
                                          setHoverScreenshotId(offer.id);
                                        }}
                                        onMouseLeave={() => {
                                          if (hoverTimer.current) clearTimeout(hoverTimer.current);
                                          setHoverScreenshotId(null);
                                        }}
                                        onInteractOutside={(e) => e.preventDefault()}
                                      >
                                        <img
                                          src={offer.screenshot_url}
                                          alt="Preview"
                                          className="w-full rounded"
                                          style={{ maxHeight: 140, objectFit: "cover" }}
                                        />
                                        <p className="text-[10px] text-muted-foreground text-center mt-1">
                                          Clique para abrir em tela cheia
                                        </p>
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                )}

                                {/* Open offer detail */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => navigate(`/spy/${offer.id}`)}
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs">Abrir oferta</TooltipContent>
                                </Tooltip>

                                {/* Delete */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-destructive"
                                      onClick={() => { setDeleteId(offer.id); setDeleteTarget("single"); }}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs">Deletar oferta</TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Select value={pageSize} onValueChange={(v) => { setPageSize(v); setCurrentPage(0); }}>
                      <SelectTrigger className="w-40 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAGE_SIZE_OPTIONS.map(o => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground">
                      {totalOffers} oferta(s)
                    </span>
                  </div>
                  {!isInfinite && totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={currentPage === 0}
                        onClick={() => setCurrentPage(p => p - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {currentPage + 1} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={currentPage >= totalPages - 1}
                        onClick={() => setCurrentPage(p => p + 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="comparison" className="mt-4">
            <TrafficIntelligenceView />
          </TabsContent>

          <TabsContent value="about" className="mt-4">
            <div className="border rounded-lg p-6 max-w-2xl space-y-4">
              <h2 className="text-lg font-semibold">Ciclo de Vida das Ofertas</h2>
              <p className="text-sm text-muted-foreground">Cada oferta no radar passa por um ciclo de qualificação. Use os status abaixo para organizar seu pipeline de espionagem:</p>
              <div className="space-y-3">
                {[
                  { status: "RADAR", icon: <Radio className="h-5 w-5 text-blue-400" />, title: "Radar", desc: "Oferta recém-descoberta. Ainda não foi analisada em detalhe. É o ponto de entrada — tudo que você encontra espionando começa aqui." },
                  { status: "ANALYZING", icon: <Search className="h-5 w-5 text-yellow-400" />, title: "Analyzing", desc: "Você está investigando ativamente: analisando funil, criativos, tráfego e viabilidade. A oferta está sob avaliação." },
                  { status: "HOT", icon: <Flame className="h-5 w-5 text-orange-500" />, title: "HOT", desc: "A oferta mostrou sinais fortes: tráfego crescente, múltiplos criativos ativos, funil validado. Merece atenção imediata e possível clone." },
                  { status: "SCALING", icon: <Rocket className="h-5 w-5 text-green-500" />, title: "Scaling", desc: "A oferta está em fase de crescimento acelerado. Tráfego subindo consistentemente, novos criativos aparecendo. É o momento de agir rápido." },
                  { status: "DYING", icon: <TrendingDown className="h-5 w-5 text-red-400" />, title: "Dying", desc: "Tráfego em queda, criativos sendo pausados. A oferta está perdendo força. Ainda pode ter insights úteis, mas o timing já passou." },
                  { status: "DEAD", icon: <Skull className="h-5 w-5 text-gray-500" />, title: "Dead", desc: "A oferta parou completamente. Sem tráfego, sem criativos ativos. Mantida no radar apenas como referência histórica." },
                  { status: "CLONED", icon: <Dna className="h-5 w-5 text-purple-400" />, title: "Cloned", desc: "Voce ja clonou/adaptou esta oferta. Indica que o ciclo de espionagem foi concluido e a inteligencia foi aplicada na sua propria operacao." },
                  { status: "VAULT", icon: <Archive className="h-5 w-5 text-gray-400" />, title: "Vault", desc: "Bau de sites irrelevantes (google, youtube, hotmart, etc). Nao polui o radar nem os dados de trafego." },
                  { status: "NEVER_SCALED", icon: <BarChart2 className="h-5 w-5 text-slate-400" />, title: "Never Scaled", desc: "Sites que nunca escalaram. Mantidos para referencia mas separados dos dados ativos." },
                ].map(item => (
                  <div key={item.status} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                    <span className="shrink-0 mt-0.5">{item.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <QuickAddOfferModal open={showQuickAdd} onClose={() => setShowQuickAdd(false)} />
        <FullOfferFormModal open={showFullForm} onClose={() => setShowFullForm(false)} />
        <UniversalImportModal open={showImport} onClose={() => setShowImport(false)} />

        {/* Screenshot lightbox */}
        {lightboxUrl && (
          <ScreenshotLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
        )}

        {/* Delete confirmation */}
        <AlertDialog open={deleteTarget !== null} onOpenChange={() => { setDeleteTarget(null); setDeleteId(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {deleteTarget === "bulk" ? `Deletar ${selectedIds.size} ofertas?` : "Deletar oferta?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {deleteTarget === "bulk"
                  ? "Todos os domínios, bibliotecas, funil e ads associados a essas ofertas serão removidos."
                  : "Todos os domínios, bibliotecas, funil e ads associados serão removidos."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deleteTarget === "bulk") {
                    handleBulkDelete();
                  } else if (deleteId) {
                    deleteMutation.mutate(deleteId);
                    setDeleteTarget(null);
                    setDeleteId(null);
                  }
                }}
              >
                Deletar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

import React from "react";
import {
  ArrowUpRight, ArrowDownRight, ArrowRight, Zap, Sparkles,
} from "lucide-react";
import {
  stripMarkdown as stripMdService,
  formatCurrency as formatCurrencyService,
} from "@/services";

// ─── Status ───────────────────────────────────────────────────────────────

export const STATUS_OPTIONS = [
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

export const STATUS_BADGE: Record<string, { label: string; className: string; tip: string }> = {
  RADAR: { label: "Radar", className: "bg-muted text-muted-foreground", tip: "Recem-descoberta, aguardando analise" },
  ANALYZING: { label: "Analyzing", className: "bg-warning/20 text-warning", tip: "Sob investigacao ativa" },
  HOT: { label: "HOT", className: "bg-destructive/20 text-destructive", tip: "Sinais fortes — merece atencao imediata" },
  SCALING: { label: "Scaling", className: "bg-success/20 text-success animate-pulse", tip: "Crescimento acelerado — hora de agir" },
  DYING: { label: "Dying", className: "bg-accent/20 text-accent", tip: "Trafego em queda, perdendo forca" },
  DEAD: { label: "Dead", className: "bg-muted text-muted-foreground line-through", tip: "Parou completamente, referencia historica" },
  CLONED: { label: "Cloned", className: "bg-primary/20 text-primary", tip: "Ja clonada/adaptada para sua operacao" },
  VAULT: { label: "Vault", className: "bg-muted text-muted-foreground", tip: "Sites irrelevantes (google, youtube, etc)" },
  NEVER_SCALED: { label: "Never Scaled", className: "bg-muted/50 text-muted-foreground", tip: "Nunca escalou — mantido como referencia" },
};

// ─── Columns ──────────────────────────────────────────────────────────────

export const COLUMN_GROUPS: { group: string; columns: { key: string; label: string }[] }[] = [
  {
    group: "Identificacao",
    columns: [
      { key: "status", label: "Status" },
      { key: "nome", label: "Nome / Dominio" },
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
    group: "Trafego",
    columns: [
      { key: "trafego", label: "Trafego" },
      { key: "traffic_trend", label: "Tendencia" },
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
      { key: "dom", label: "Dominios" },
      { key: "ads", label: "Ads" },
      { key: "funil", label: "Funil" },
    ],
  },
];

export const DEFAULT_SPY_COLUMNS = new Set([
  "status", "nome", "notas", "vertical", "ticket", "trafego", "fonte", "dom", "ads", "funil", "discovered",
]);

export const LS_KEY_SPY_COLUMNS = "spy-radar-columns";
export const LS_KEY_TRAFFIC_SOURCE = "spy-radar-traffic-source";
export const LS_KEY_PRESETS = "spy-radar-presets";

export type ColumnPreset = { name: string; columns: string[] };

export function loadSpyColumns(): Set<string> {
  try {
    const saved = localStorage.getItem(LS_KEY_SPY_COLUMNS);
    if (saved) return new Set(JSON.parse(saved));
  } catch {}
  return new Set(DEFAULT_SPY_COLUMNS);
}

export function loadPresets(): ColumnPreset[] {
  try {
    const saved = localStorage.getItem(LS_KEY_PRESETS);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

export function savePresetsToStorage(presets: ColumnPreset[]) {
  localStorage.setItem(LS_KEY_PRESETS, JSON.stringify(presets));
}

export const PAGE_SIZE_OPTIONS = [
  { value: "10", label: "10 por pagina" },
  { value: "25", label: "25 por pagina" },
  { value: "50", label: "50 por pagina" },
  { value: "100", label: "100 por pagina" },
  { value: "all", label: "Todas (infinito)" },
];

// ─── Visual maps ──────────────────────────────────────────────────────────

export const VERTICAL_BADGE: Record<string, string> = {
  nutra: "bg-success/20 text-success",
  info: "bg-info/20 text-info",
  tech: "bg-primary/20 text-primary",
};

export const TREND_ICON: Record<string, React.ReactNode> = {
  UP: React.createElement(ArrowUpRight, { className: "h-3.5 w-3.5 text-green-500" }),
  DOWN: React.createElement(ArrowDownRight, { className: "h-3.5 w-3.5 text-red-500" }),
  STABLE: React.createElement(ArrowRight, { className: "h-3.5 w-3.5 text-muted-foreground" }),
  SPIKE: React.createElement(Zap, { className: "h-3.5 w-3.5 text-yellow-500" }),
  NEW: React.createElement(Sparkles, { className: "h-3.5 w-3.5 text-blue-500" }),
};

// ─── Helpers ──────────────────────────────────────────────────────────────

export const stripMarkdown = stripMdService;
export const formatCurrency = formatCurrencyService;

export function getCount(item: any, relation: string) {
  const rel = item[relation];
  if (!rel) return 0;
  if (Array.isArray(rel) && rel.length > 0 && rel[0]?.count !== undefined) return rel[0].count;
  if (Array.isArray(rel)) return rel.length;
  return 0;
}

export function normalizeStr(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

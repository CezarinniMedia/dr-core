import React from "react";
import {
  ArrowUpRight, ArrowDownRight, ArrowRight, Zap, Sparkles,
  Radar, Search, Flame, TrendingUp, TrendingDown, Copy, Skull, Archive, Ban,
  Megaphone, Palette, Clock, Building, Timer, ShoppingCart,
  type LucideIcon,
} from "lucide-react";
import {
  stripMarkdown as stripMdService,
  formatCurrency as formatCurrencyService,
} from "@/shared/services";

// ─── Status ───────────────────────────────────────────────────────────────

export const STATUS_OPTIONS = [
  { value: "RADAR", label: "Radar", icon: Radar },
  { value: "ANALYZING", label: "Analyzing", icon: Search },
  { value: "HOT", label: "Hot", icon: Flame },
  { value: "SCALING", label: "Scaling", icon: TrendingUp },
  { value: "DYING", label: "Dying", icon: TrendingDown },
  { value: "DEAD", label: "Dead", icon: Skull },
  { value: "CLONED", label: "Cloned", icon: Copy },
  { value: "VAULT", label: "Vault", icon: Archive },
  { value: "NEVER_SCALED", label: "Never Scaled", icon: Ban },
];

export const STATUS_BADGE: Record<string, { label: string; className: string; tip: string }> = {
  RADAR: { label: "Radar", className: "bg-[rgba(107,114,128,0.1)] text-[color:var(--text-muted)] border border-[rgba(107,114,128,0.2)]", tip: "Recem-descoberta, aguardando analise" },
  ANALYZING: { label: "Analyzing", className: "bg-[rgba(59,130,246,0.1)] text-[color:var(--accent-blue)] border border-[rgba(59,130,246,0.2)]", tip: "Sob investigacao ativa" },
  HOT: { label: "Hot", className: "bg-[rgba(239,68,68,0.1)] text-[color:var(--semantic-hot)] border border-[rgba(239,68,68,0.2)] animate-glow-pulse", tip: "Sinais fortes — merece atencao imediata" },
  SCALING: { label: "Scaling", className: "bg-[rgba(34,197,94,0.1)] text-[color:var(--accent-green)] border border-[rgba(34,197,94,0.2)]", tip: "Crescimento acelerado — hora de agir" },
  DYING: { label: "Dying", className: "bg-[rgba(234,179,8,0.1)] text-[color:var(--semantic-warning)] border border-[rgba(234,179,8,0.2)]", tip: "Trafego em queda, perdendo forca" },
  DEAD: { label: "Dead", className: "bg-[rgba(107,114,128,0.1)] text-[color:var(--text-muted)] border border-[rgba(107,114,128,0.2)] line-through", tip: "Parou completamente, referencia historica" },
  CLONED: { label: "Cloned", className: "bg-[rgba(124,58,237,0.1)] text-[color:var(--accent-primary)] border border-[rgba(124,58,237,0.2)]", tip: "Ja clonada/adaptada para sua operacao" },
  VAULT: { label: "Vault", className: "bg-[rgba(107,114,128,0.1)] text-[color:var(--text-muted)] border border-[rgba(107,114,128,0.2)]", tip: "Sites irrelevantes (google, youtube, etc)" },
  NEVER_SCALED: { label: "Never Scaled", className: "bg-[rgba(107,114,128,0.05)] text-[color:var(--text-muted)] border border-[rgba(107,114,128,0.15)]", tip: "Nunca escalou — mantido como referencia" },
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

// ─── Verticals ───────────────────────────────────────────────────────────

export const VERTICAL_OPTIONS = [
  { value: "nutra", label: "Nutra" },
  { value: "info", label: "Info" },
  { value: "tech", label: "Tech" },
  { value: "financas", label: "Financas" },
  { value: "relacionamento", label: "Relacionamento" },
  { value: "educacao", label: "Educacao" },
  { value: "outro", label: "Outro" },
];

// ─── Visual maps ──────────────────────────────────────────────────────────

export const VERTICAL_BADGE: Record<string, string> = {
  nutra: "bg-success/20 text-success",
  info: "bg-info/20 text-info",
  tech: "bg-primary/20 text-primary",
  financas: "bg-yellow-500/20 text-yellow-400",
  relacionamento: "bg-pink-500/20 text-pink-400",
  educacao: "bg-cyan-500/20 text-cyan-400",
  outro: "bg-gray-500/20 text-gray-400",
};

// ─── Intelligence ─────────────────────────────────────────────────────────

export const FUNNEL_OPTIONS = [
  { value: "vsl_direta", label: "VSL Direta" },
  { value: "preland_vsl", label: "Preland + VSL" },
  { value: "quiz_vsl", label: "Quiz + VSL" },
  { value: "webinar", label: "Webinar" },
  { value: "challenge", label: "Challenge" },
];

export const ANGLE_OPTIONS = [
  { value: "dor", label: "Dor" },
  { value: "desejo", label: "Desejo" },
  { value: "curiosidade", label: "Curiosidade" },
  { value: "autoridade", label: "Autoridade" },
  { value: "medo", label: "Medo" },
  { value: "prova_social", label: "Prova Social" },
];

export const FUNNEL_BADGE: Record<string, { label: string; className: string }> = {
  vsl_direta: { label: "VSL Direta", className: "bg-blue-500/20 text-blue-400" },
  preland_vsl: { label: "Preland + VSL", className: "bg-purple-500/20 text-purple-400" },
  quiz_vsl: { label: "Quiz + VSL", className: "bg-cyan-500/20 text-cyan-400" },
  webinar: { label: "Webinar", className: "bg-amber-500/20 text-amber-400" },
  challenge: { label: "Challenge", className: "bg-green-500/20 text-green-400" },
};

export const ANGLE_BADGE: Record<string, { label: string; className: string }> = {
  dor: { label: "Dor", className: "bg-red-500/20 text-red-400" },
  desejo: { label: "Desejo", className: "bg-pink-500/20 text-pink-400" },
  curiosidade: { label: "Curiosidade", className: "bg-yellow-500/20 text-yellow-400" },
  autoridade: { label: "Autoridade", className: "bg-blue-500/20 text-blue-400" },
  medo: { label: "Medo", className: "bg-orange-500/20 text-orange-400" },
  prova_social: { label: "Prova Social", className: "bg-green-500/20 text-green-400" },
};

export const SCALE_SIGNAL_CONFIG: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "ads_running", label: "Ads Ativos", icon: Megaphone },
  { key: "multiple_creatives", label: "Criativos Variados", icon: Palette },
  { key: "traffic_growing", label: "Trafego Crescendo", icon: TrendingUp },
  { key: "new_domain", label: "Dominio Novo", icon: Clock },
  { key: "corporate_structure", label: "Estrutura Corp.", icon: Building },
  { key: "urgency_elements", label: "Urgencia na Pagina", icon: Timer },
  { key: "upsells_present", label: "Upsells Presentes", icon: ShoppingCart },
];

export function countScaleSignals(signals: Record<string, boolean> | null | undefined): number {
  if (!signals || typeof signals !== "object") return 0;
  return Object.values(signals).filter(Boolean).length;
}

// ─── Trend ────────────────────────────────────────────────────────────────

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

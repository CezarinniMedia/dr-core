import { supabase } from "@/integrations/supabase/client";

// Design system chart palette — aligned with vision-architecture tokens
export const CHART_LINE_COLORS = [
  "#00D4AA",  // accent-teal
  "#7C3AED",  // accent-primary (violet)
  "#F97316",  // accent-orange
  "#3B82F6",  // accent-blue
  "#22C55E",  // accent-green
  "#D4A574",  // accent-amber (LED signature)
  "#06B6D4",  // accent-cyan
  "#EF4444",  // semantic-error
  "#8B5CF6",  // accent-primary-light
  "#EAB308",  // semantic-warning
  "#EC4899",  // pink
  "#C4954A",  // accent-gold
];

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
  RADAR: { label: "Radar", className: "bg-muted text-muted-foreground", tip: "Recém-descoberta, aguardando análise" },
  ANALYZING: { label: "Analyzing", className: "bg-warning/20 text-warning", tip: "Sob investigação ativa" },
  HOT: { label: "HOT", className: "bg-destructive/20 text-destructive", tip: "Sinais fortes — merece atenção imediata" },
  SCALING: { label: "Scaling", className: "bg-success/20 text-success animate-pulse", tip: "Crescimento acelerado — hora de agir" },
  DYING: { label: "Dying", className: "bg-accent/20 text-accent", tip: "Tráfego em queda, perdendo força" },
  DEAD: { label: "Dead", className: "bg-muted text-muted-foreground", tip: "Parou completamente, referência histórica" },
  CLONED: { label: "Cloned", className: "bg-primary/20 text-primary", tip: "Já clonada/adaptada para sua operação" },
  VAULT: { label: "Vault", className: "bg-muted text-muted-foreground", tip: "Sites irrelevantes (google, youtube, etc)" },
  NEVER_SCALED: { label: "Never Scaled", className: "bg-muted/50 text-muted-foreground", tip: "Nunca escalou — mantido como referência" },
};

export const PAGE_SIZE_OPTIONS = [
  { value: "10", label: "10 por pagina" },
  { value: "25", label: "25 por pagina" },
  { value: "50", label: "50 por pagina" },
  { value: "100", label: "100 por pagina" },
  { value: "all", label: "Todas" },
];

export const DEFAULT_COLUMNS = new Set(["status", "oferta", "trend", "lastMonth", "variation", "peak", "discovered"]);
export const ALL_COLUMNS: { key: string; label: string }[] = [
  { key: "status", label: "Status" },
  { key: "oferta", label: "Oferta" },
  { key: "trend", label: "Trend" },
  { key: "lastMonth", label: "Ultimo Mes" },
  { key: "variation", label: "Variacao" },
  { key: "peak", label: "Pico" },
  { key: "discovered", label: "Descoberto" },
];

export const LS_KEY_COLUMNS = "traffic-intel-columns";
export const LS_KEY_PAGE_SIZE = "traffic-intel-page-size";
export const LS_KEY_TRAFFIC_SOURCE = "traffic-intel-traffic-source";

export function loadColumns(): Set<string> {
  try {
    const saved = localStorage.getItem(LS_KEY_COLUMNS);
    if (saved) return new Set(JSON.parse(saved));
  } catch {}
  return new Set(DEFAULT_COLUMNS);
}

// Parallel paginated fetch — gets row count first, then fetches pages 5 at a time
export async function fetchAllTrafficRows(periodType: string) {
  type Row = { spied_offer_id: string; domain: string; period_date: string; visits: number | null };
  const pageSize = 1000;
  const PARALLEL = 5;

  const { data: first, error: firstErr, count } = await supabase
    .from("offer_traffic_data")
    .select("spied_offer_id, domain, period_date, visits", { count: "exact" })
    .eq("period_type", periodType)
    .order("period_date", { ascending: true })
    .range(0, pageSize - 1);

  if (firstErr) throw firstErr;
  if (!first || first.length === 0) return [] as Row[];

  const all: Row[] = [...first];
  if (first.length < pageSize || !count || count <= pageSize) return all;

  const totalPages = Math.ceil(count / pageSize);
  for (let batch = 1; batch < totalPages; batch += PARALLEL) {
    const promises = [];
    for (let p = batch; p < Math.min(batch + PARALLEL, totalPages); p++) {
      const from = p * pageSize;
      promises.push(
        supabase
          .from("offer_traffic_data")
          .select("spied_offer_id, domain, period_date, visits")
          .eq("period_type", periodType)
          .order("period_date", { ascending: true })
          .range(from, from + pageSize - 1)
      );
    }
    const results = await Promise.all(promises);
    for (const { data, error } of results) {
      if (error) throw error;
      if (data) all.push(...data);
    }
  }

  return all;
}

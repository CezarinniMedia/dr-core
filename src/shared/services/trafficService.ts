/**
 * Traffic Service
 * Extracted from: TrafficIntelligenceView.tsx, useSpiedOffers.ts
 *
 * Pure business logic for traffic analysis, trend detection, and aggregation.
 * No React or Supabase dependencies — all functions are pure.
 */

// ─── Types ───

export interface TrafficRecord {
  spied_offer_id: string;
  domain: string;
  period_date: string;
  visits: number | null;
}

export interface DateRange {
  from: string | null; // "YYYY-MM" format
  to: string | null;
}

export interface TrendResult {
  lastMonth: number;
  prevMonth: number;
  variation: number; // percentage
  direction: "UP" | "DOWN" | "STABLE" | "SPIKE" | "NEW";
}

export interface SpikeResult {
  offerId: string;
  domain: string;
  period: string;
  visits: number;
  previousVisits: number;
  growthPercent: number;
}

export interface AggregatedData {
  period: string;
  totalVisits: number;
  domainCount: number;
}

export interface OfferTrafficRow {
  id: string;
  nome: string;
  domain: string;
  status: string;
  vertical: string | null;
  discovered_at: string | null;
  lastMonth: number;
  prevMonth: number;
  variation: number;
  peak: number;
  peakDate: string;
  sparkline: number[];
  hasTrafficData: boolean;
  monthlyData: Map<string, number>;
}

export interface ComparisonData {
  domain: string;
  months: Map<string, number>;
  trend: TrendResult;
}

// ─── Traffic Trend Calculation ───

/**
 * Calculate traffic trend for a set of monthly data points.
 * Uses the last two data points to determine variation.
 */
export function calculateTrafficTrend(
  monthlyValues: number[]
): TrendResult {
  if (monthlyValues.length === 0) {
    return { lastMonth: 0, prevMonth: 0, variation: 0, direction: "NEW" };
  }

  const last = monthlyValues[monthlyValues.length - 1];
  const prev = monthlyValues.length >= 2 ? monthlyValues[monthlyValues.length - 2] : 0;
  const variation = prev > 0 ? ((last - prev) / prev) * 100 : (last > 0 ? 100 : 0);

  let direction: TrendResult["direction"];
  if (monthlyValues.length < 2) {
    direction = "NEW";
  } else if (variation > 100) {
    direction = "SPIKE";
  } else if (variation > 5) {
    direction = "UP";
  } else if (variation < -5) {
    direction = "DOWN";
  } else {
    direction = "STABLE";
  }

  return { lastMonth: last, prevMonth: prev, variation, direction };
}

// ─── Traffic Comparison ───

/**
 * Build comparison data for multiple offers/domains.
 * Aggregates traffic by offer across all their domains per month.
 */
export function compareTraffic(
  offers: Array<{ id: string; nome: string; main_domain: string | null; status: string; vertical: string | null; discovered_at: string | null }>,
  trafficRecords: TrafficRecord[],
  dateRange?: DateRange
): OfferTrafficRow[] {
  // Group traffic by offer ID — preserve domain for filtering
  const trafficByOffer = new Map<string, { date: string; visits: number; domain: string }[]>();
  for (const t of trafficRecords) {
    const key = t.spied_offer_id;
    if (!trafficByOffer.has(key)) trafficByOffer.set(key, []);
    trafficByOffer.get(key)!.push({ date: t.period_date, visits: t.visits ?? 0, domain: t.domain });
  }

  return offers.map((o) => {
    const allRecords = trafficByOffer.get(o.id) || [];
    // Filter to main_domain to avoid doubling when multiple domains have traffic for same period
    const mainDomainRecords = o.main_domain
      ? allRecords.filter(r => r.domain === o.main_domain)
      : [];
    const records = mainDomainRecords.length > 0 ? mainDomainRecords : allRecords;
    const hasTrafficData = allRecords.length > 0;

    // Aggregate visits per month (safe now — filtered to single domain)
    const monthMap = new Map<string, number>();
    for (const r of records) {
      monthMap.set(r.date, Math.max(monthMap.get(r.date) || 0, r.visits));
    }
    const sorted = [...monthMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));

    // Apply date range filter
    const filtered = sorted.filter(([date]) => {
      const dateMonth = date.slice(0, 7);
      if (dateRange?.from && dateMonth < dateRange.from) return false;
      if (dateRange?.to && dateMonth > dateRange.to) return false;
      return true;
    });

    const vals = filtered.map(([, v]) => v);
    const trend = calculateTrafficTrend(vals);
    const peak = vals.length > 0 ? Math.max(...vals) : 0;
    const peakIdx = vals.indexOf(peak);
    const peakDate = filtered[peakIdx]?.[0] || "";

    return {
      id: o.id,
      nome: o.nome,
      domain: o.main_domain || "—",
      status: o.status || "RADAR",
      vertical: o.vertical,
      discovered_at: o.discovered_at,
      lastMonth: trend.lastMonth,
      prevMonth: trend.prevMonth,
      variation: trend.variation,
      peak,
      peakDate,
      sparkline: vals,
      hasTrafficData,
      monthlyData: monthMap,
    };
  });
}

// ─── Spike Detection ───

/**
 * Detect traffic spikes across all offers.
 * A spike is defined as month-over-month growth exceeding the threshold percentage.
 */
export function detectSpikes(
  trafficRecords: TrafficRecord[],
  threshold: number = 100
): SpikeResult[] {
  // Group by offer+domain
  const byKey = new Map<string, { offerId: string; domain: string; data: { date: string; visits: number }[] }>();

  for (const t of trafficRecords) {
    const key = `${t.spied_offer_id}:${t.domain}`;
    if (!byKey.has(key)) {
      byKey.set(key, { offerId: t.spied_offer_id, domain: t.domain, data: [] });
    }
    byKey.get(key)!.data.push({ date: t.period_date, visits: t.visits ?? 0 });
  }

  const spikes: SpikeResult[] = [];

  for (const [, entry] of byKey) {
    const sorted = entry.data.sort((a, b) => a.date.localeCompare(b.date));

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1].visits;
      const curr = sorted[i].visits;
      if (prev <= 0) continue;

      const growth = ((curr - prev) / prev) * 100;
      if (growth >= threshold) {
        spikes.push({
          offerId: entry.offerId,
          domain: entry.domain,
          period: sorted[i].date,
          visits: curr,
          previousVisits: prev,
          growthPercent: growth,
        });
      }
    }
  }

  return spikes.sort((a, b) => b.growthPercent - a.growthPercent);
}

// ─── Aggregation ───

/**
 * Aggregate traffic records by period (month or week).
 * Returns total visits per period across all domains.
 */
export function aggregateByPeriod(
  trafficRecords: TrafficRecord[],
  groupBy: "month" | "week" = "month"
): AggregatedData[] {
  const groups = new Map<string, { visits: number; domains: Set<string> }>();

  for (const t of trafficRecords) {
    const period =
      groupBy === "month"
        ? t.period_date.slice(0, 7) // "YYYY-MM"
        : getWeekKey(t.period_date);

    if (!groups.has(period)) {
      groups.set(period, { visits: 0, domains: new Set() });
    }
    const g = groups.get(period)!;
    g.visits += t.visits ?? 0;
    g.domains.add(t.domain);
  }

  return [...groups.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([period, data]) => ({
      period,
      totalVisits: data.visits,
      domainCount: data.domains.size,
    }));
}

// ─── Sorting ───

export type SortField = "nome" | "lastMonth" | "variation" | "peak" | "status" | "discovered";
export type SortDir = "asc" | "desc";

/**
 * Sort offer traffic rows by the specified field and direction.
 */
export function sortTrafficRows(
  rows: OfferTrafficRow[],
  field: SortField,
  dir: SortDir
): OfferTrafficRow[] {
  const arr = [...rows];
  const d = dir === "asc" ? 1 : -1;

  arr.sort((a, b) => {
    switch (field) {
      case "nome": return a.nome.localeCompare(b.nome) * d;
      case "lastMonth": return (a.lastMonth - b.lastMonth) * d;
      case "variation": return (a.variation - b.variation) * d;
      case "peak": return (a.peak - b.peak) * d;
      case "status": return a.status.localeCompare(b.status) * d;
      case "discovered": return (a.discovered_at || "").localeCompare(b.discovered_at || "") * d;
      default: return 0;
    }
  });

  return arr;
}

// ─── Filtering ───

/**
 * Filter traffic rows by status and search text.
 */
export function filterTrafficRows(
  rows: OfferTrafficRow[],
  statusFilter: Set<string>,
  searchText: string
): OfferTrafficRow[] {
  let result = rows;

  if (statusFilter.size > 0) {
    result = result.filter((x) => statusFilter.has(x.status));
  }

  if (searchText) {
    const s = searchText.toLowerCase();
    result = result.filter(
      (x) => x.nome.toLowerCase().includes(s) || x.domain.toLowerCase().includes(s)
    );
  }

  return result;
}

// ─── Formatting Utilities ───

/**
 * Format number as K/M notation (e.g., 1500 -> "2K", 1500000 -> "1.5M").
 */
export function formatTrafficNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

/**
 * Format a date string as "Mmm YY" (e.g., "2026-01-01" -> "Jan 26").
 */
export function formatPeriodDate(d: string): string {
  const [y, m] = d.split("-");
  const names = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${names[parseInt(m) - 1]} ${y.slice(2)}`;
}

// ─── Available Months ───

/**
 * Extract unique sorted months from traffic records.
 */
export function getAvailableMonths(trafficRecords: TrafficRecord[]): string[] {
  const months = new Set<string>();
  for (const t of trafficRecords) months.add(t.period_date);
  return [...months].sort();
}

// ─── Helpers ───

function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr);
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

import type { ClassifiedCsv, CsvType, ProcessedCsvResult } from "@/lib/csvClassifier";

export interface FileEntry {
  name: string;
  text: string;
  classified: ClassifiedCsv;
  processed: ProcessedCsvResult;
  delimiterOverride?: string;
  excludedColumns?: Set<number>;
  excludedRows?: Set<number>;
}

export interface DomainMatchInfo {
  domain: string;
  matched: boolean;
  offerId?: string;
  offerName?: string;
  action: string;
  csvTypes: string[];
  trafficRecords: number;
  newDomains: number;
}

export interface ImportResult {
  newOffers: number;
  updated: number;
  trafficRecords: number;
}

export const TYPE_COLORS: Record<CsvType, string> = {
  publicwww: "bg-success/20 text-success",
  semrush_bulk: "bg-info/20 text-info",
  semrush_geo: "bg-warning/20 text-warning",
  semrush_pages: "bg-primary/20 text-primary",
  semrush_subdomains: "bg-accent/20 text-accent",
  semrush_subfolders: "bg-accent/20 text-accent",
  semrush_traffic_trend: "bg-destructive/20 text-destructive",
  semrush_summary: "bg-muted text-muted-foreground",
  semrush_bulk_historical: "bg-info/20 text-info",
  similarweb: "bg-purple-500/20 text-purple-400",
  unknown: "bg-muted text-muted-foreground",
};

export const ALL_TYPES: { value: CsvType; label: string }[] = [
  { value: "publicwww", label: "PublicWWW" },
  { value: "similarweb", label: "SimilarWeb" },
  { value: "semrush_bulk", label: "Semrush Bulk" },
  { value: "semrush_geo", label: "Semrush Geo" },
  { value: "semrush_pages", label: "Semrush Páginas" },
  { value: "semrush_subdomains", label: "Semrush Subdomínios" },
  { value: "semrush_subfolders", label: "Semrush Subpastas" },
  { value: "semrush_traffic_trend", label: "Semrush Tendência" },
  { value: "semrush_summary", label: "Semrush Resumo" },
  { value: "semrush_bulk_historical", label: "Semrush Bulk Histórico" },
];

export function extractPeriodFromFilename(fileName: string): { date: string; label: string } | null {
  // 1. ISO format: "2026-01", "2025-12"
  const isoMatch = fileName.match(/(\d{4})[-_](\d{2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1]);
    const mo = parseInt(isoMatch[2]);
    if (year >= 2020 && year <= 2030 && mo >= 1 && mo <= 12) {
      const names = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      return { date: `${isoMatch[1]}-${isoMatch[2]}-01`, label: `${names[mo - 1]} ${isoMatch[1]}` };
    }
  }

  // 2. Month name format: "Jan 2026", "jan. de 2026", etc.
  const match = fileName.match(/([a-záéíóúâêîôûãõç]+)\.?\s*(?:de\s+)?(\d{4})/i);
  if (!match) return null;
  const MONTH_MAP: Record<string, number> = {
    jan: 1, janeiro: 1, january: 1, fev: 2, feb: 2, fevereiro: 2, february: 2,
    mar: 3, março: 3, marco: 3, march: 3, abr: 4, apr: 4, abril: 4, april: 4,
    mai: 5, may: 5, maio: 5, jun: 6, junho: 6, june: 6, jul: 7, julho: 7, july: 7,
    ago: 8, aug: 8, agosto: 8, august: 8, set: 9, sep: 9, setembro: 9, september: 9,
    out: 10, oct: 10, outubro: 10, october: 10, nov: 11, novembro: 11, november: 11,
    dez: 12, dec: 12, dezembro: 12, december: 12,
  };
  const monthKey = match[1].toLowerCase().replace(/\.$/, "");
  const month = MONTH_MAP[monthKey];
  if (!month) return null;
  return { date: `${match[2]}-${String(month).padStart(2, "0")}-01`, label: match[0].trim() };
}

export function groupBy<T>(arr: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of arr) {
    const key = keyFn(item);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return map;
}

export function findOfferForSubdomain(domain: string, offerIdMap: Map<string, string>): string | undefined {
  const parts = domain.split(".");
  for (let i = 1; i < parts.length - 1; i++) {
    const parent = parts.slice(i).join(".");
    if (offerIdMap.has(parent)) return offerIdMap.get(parent);
  }
  return undefined;
}

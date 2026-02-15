import Papa from "papaparse";

export type CsvType =
  | "publicwww"
  | "semrush_bulk"
  | "semrush_geo"
  | "semrush_pages"
  | "semrush_subdomains"
  | "semrush_subfolders"
  | "semrush_traffic_trend"
  | "semrush_summary"
  | "semrush_bulk_historical"
  | "unknown";

export interface ClassifiedCsv {
  type: CsvType;
  label: string;
  fileName?: string;
  rawText: string;
  delimiter: string;
  headers: string[];
  previewRows: string[][];
  periodDate?: string; // extracted from filename for all types
  periodLabel?: string; // human-readable period (e.g. "jan. de 2026")
  discoveryQuery?: string; // extracted footprint for publicwww
}

// ─── Month mapping (PT + EN) ───
const MONTH_MAP: Record<string, number> = {
  jan: 1, janeiro: 1, january: 1,
  fev: 2, feb: 2, fevereiro: 2, february: 2,
  mar: 3, março: 3, marco: 3, march: 3,
  abr: 4, apr: 4, abril: 4, april: 4,
  mai: 5, may: 5, maio: 5,
  jun: 6, junho: 6, june: 6,
  jul: 7, julho: 7, july: 7,
  ago: 8, aug: 8, agosto: 8, august: 8,
  set: 9, sep: 9, setembro: 9, september: 9,
  out: 10, oct: 10, outubro: 10, october: 10,
  nov: 11, novembro: 11, november: 11,
  dez: 12, dec: 12, dezembro: 12, december: 12,
};

export function detectDelimiter(csvText: string): string {
  const firstLine = csvText.trim().split(/\r?\n/)[0] || "";
  const counts: Record<string, number> = { ",": 0, ";": 0, "\t": 0, "|": 0 };
  for (const char of Object.keys(counts)) {
    counts[char] = (firstLine.match(new RegExp(char === "|" ? "\\|" : char === "\t" ? "\t" : char, "g")) || []).length;
  }
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] > 0 ? best[0] : ",";
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/^["']+|["']+$/g, "");
}

function isDateHeader(h: string): boolean {
  const n = normalizeHeader(h);
  if (/^\d{4}-\d{1,2}/.test(n)) return true;
  if (/^\d{1,2}\/\d{4}$/.test(n)) return true;
  const wordMatch = n.match(/([a-záéíóúâêîôûãõç]+)[.\-\s]+(\d{2,4})/);
  if (wordMatch && MONTH_MAP[wordMatch[1]]) return true;
  return false;
}

function extractPeriodFromFilename(fileName: string): { date: string; label: string } | null {
  // Matches patterns like "Jan 2026", "jan. de 2026", "fev. de 2025", etc.
  const match = fileName.match(/([a-záéíóúâêîôûãõç]+)\.?\s*(?:de\s+)?(\d{4})/i);
  if (!match) return null;
  const monthKey = match[1].toLowerCase().replace(/\.$/, "");
  const month = MONTH_MAP[monthKey];
  if (!month) return null;
  return {
    date: `${match[2]}-${String(month).padStart(2, "0")}-01`,
    label: match[0].trim(),
  };
}

function extractFootprintFromData(rows: string[][]): string | null {
  // PublicWWW: col3 has "script src=\https://cdn.utmify.com.br/scripts/utms/latest"
  if (!rows[0] || rows[0].length < 3) return null;
  const raw = rows[0][2] || "";
  // Remove "script src=\" prefix, quotes, https://
  let cleaned = raw
    .replace(/^script\s+src=\\?/i, "")
    .replace(/^["'\\]+|["'\\]+$/g, "")
    .replace(/^https?:\/\//, "")
    .replace(/\s+$/, "");
  // Extract the domain/path core (e.g. cdn.utmify.com.br/scripts/utms/latest -> cdn.utmify.com.br)
  const domainMatch = cleaned.match(/^([a-z0-9.-]+\.[a-z]{2,})/i);
  if (domainMatch) cleaned = domainMatch[1];
  return cleaned || null;
}

export function filterCsvData(
  classified: ClassifiedCsv,
  excludedColumns: Set<number>,
  excludedRows: Set<number>
): ClassifiedCsv {
  if (excludedColumns.size === 0 && excludedRows.size === 0) return classified;

  // Filter headers
  const headers = classified.headers.filter((_, i) => !excludedColumns.has(i));

  // Rebuild rawText by re-parsing and filtering
  const result = Papa.parse(classified.rawText.trim(), {
    header: false,
    skipEmptyLines: true,
    delimiter: classified.delimiter,
  });
  const allRows = (result.data as string[][]) || [];
  const hasHeader = classified.headers.length > 0;
  const dataStartIdx = hasHeader ? 1 : 0;

  const filteredRows = allRows
    .filter((_, i) => {
      if (i < dataStartIdx) return true; // keep header row
      return !excludedRows.has(i - dataStartIdx);
    })
    .map(row => row.filter((_, ci) => !excludedColumns.has(ci)));

  const newRawText = filteredRows.map(row => row.join(classified.delimiter)).join("\n");
  const previewRows = filteredRows.slice(hasHeader ? 1 : 0, hasHeader ? 6 : 5);

  return {
    ...classified,
    rawText: newRawText,
    headers,
    previewRows,
  };
}

export function classifyCsv(csvText: string, fileName?: string, delimiterOverride?: string): ClassifiedCsv {
  const delimiter = delimiterOverride || detectDelimiter(csvText);
  const result = Papa.parse(csvText.trim(), {
    header: false,
    skipEmptyLines: true,
    delimiter,
  });
  const allRows = (result.data as string[][]) || [];
  if (allRows.length === 0) {
    return { type: "unknown", label: "Desconhecido", rawText: csvText, delimiter, headers: [], previewRows: [] };
  }

  const firstRow = allRows[0].map(normalizeHeader);
  const hasHeader = firstRow.some(h =>
    ["target", "destino", "data", "página", "página", "subdomínio", "subpasta", "país", "período", "subdominio", "pagina", "pais", "periodo"].includes(h)
  );

  let headers: string[] = [];
  let dataRows: string[][] = [];

  if (hasHeader) {
    headers = allRows[0].map(h => h.trim().replace(/^["']+|["']+$/g, ""));
    dataRows = allRows.slice(1);
  } else {
    headers = [];
    dataRows = allRows;
  }

  const headersLower = headers.map(normalizeHeader);
  const previewRows = dataRows.slice(0, 5);

  // Detect type
  let type: CsvType = "unknown";
  let label = "Desconhecido";
  let periodDate: string | undefined;
  let periodLabel: string | undefined;
  let discoveryQuery: string | undefined;

  // Extract period from filename for ALL types
  if (fileName) {
    const periodInfo = extractPeriodFromFilename(fileName);
    if (periodInfo) {
      periodDate = periodInfo.date;
      periodLabel = periodInfo.label;
    }
  }

  // semrush_traffic_trend: "Data" in col1, domains as other headers
  if (headersLower[0] === "data" && headers.length > 1) {
    type = "semrush_traffic_trend";
    label = "Semrush: Tendência de Tráfego";
  }
  // semrush_bulk: has Target/Destino, target_type, Visits/Visitas
  else if (
    (headersLower.includes("target") || headersLower.includes("destino")) &&
    (headersLower.includes("target_type") || headersLower.includes("tipo de destino")) &&
    (headersLower.includes("visits") || headersLower.includes("visitas"))
  ) {
    type = "semrush_bulk";
    label = "Semrush: Bulk Analysis";
  }
  // semrush_summary: Destino + Período + Visitas
  else if (headersLower.includes("destino") && headersLower.includes("período") || headersLower.includes("periodo")) {
    if (headersLower.includes("visitas")) {
      type = "semrush_summary";
      label = "Semrush: Resumo";
    }
  }
  // semrush_geo: Destino + País + Proporção de tráfego
  if (type === "unknown" && headersLower.includes("destino") && (headersLower.includes("país") || headersLower.includes("pais")) && headersLower.some(h => h.includes("proporção de tráfego") || h.includes("proporcao de trafego"))) {
    type = "semrush_geo";
    label = "Semrush: Geodistribuição";
  }
  // semrush_pages: has "Página" + "Proporção de tráfego"
  else if (type === "unknown" && (headersLower.includes("página") || headersLower.includes("pagina")) && headersLower.some(h => h.includes("proporção de tráfego") || h.includes("proporcao de trafego"))) {
    type = "semrush_pages";
    label = "Semrush: Páginas";
  }
  // semrush_subdomains: has "Subdomínio" + "Visitas"
  else if (type === "unknown" && (headersLower.includes("subdomínio") || headersLower.includes("subdominio")) && headersLower.includes("visitas")) {
    type = "semrush_subdomains";
    label = "Semrush: Subdomínios";
  }
  // semrush_subfolders: has "Subpasta"
  else if (type === "unknown" && headersLower.includes("subpasta")) {
    type = "semrush_subfolders";
    label = "Semrush: Subpastas";
  }
  // semrush_bulk_historical: col1 = domain + date headers
  else if (type === "unknown" && hasHeader && headers.length > 1) {
    const dateHeaders = headers.slice(1).filter(h => isDateHeader(h));
    if (dateHeaders.length > 0) {
      type = "semrush_bulk_historical";
      label = "Semrush: Bulk Histórico";
    }
  }

  // publicwww: headerless, col1 looks like URL/domain, col2 is numeric
  if (type === "unknown" && !hasHeader && dataRows.length > 0) {
    const firstVal = (dataRows[0][0] || "").trim();
    if (firstVal.includes(".") && (firstVal.includes("http") || /^[a-z0-9.-]+\.[a-z]{2,}/i.test(firstVal))) {
      type = "publicwww";
      label = "PublicWWW";
      discoveryQuery = extractFootprintFromData(dataRows) ?? undefined;
    }
  }

  return { type, label, rawText: csvText, delimiter, headers, previewRows, periodDate, periodLabel, discoveryQuery, fileName };
}

// ─── Data extraction helpers ───

export function extractDomain(raw: string): string {
  return raw.trim().toLowerCase().replace(/^["'\s]+|["'\s]+$/g, "").replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/:\d+$/, "");
}

function parseNumber(val: string): number {
  if (!val || val.toLowerCase() === "n/a") return 0;
  const cleaned = val.replace(/["'\s%]/g, "").replace(/\./g, "").replace(/,/g, ".");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function parseIntNumber(val: string): number {
  if (!val || val.toLowerCase() === "n/a") return 0;
  const cleaned = val.replace(/["'\s]/g, "").replace(/\./g, "").replace(/,/g, "");
  const n = parseInt(cleaned, 10);
  if (isNaN(n)) return 0;
  // Cap to PostgreSQL integer max to prevent numeric overflow
  return Math.min(n, 2147483647);
}

function parsePtDate(dateStr: string): string | null {
  // "ago. de 2025" -> "2025-08-01", "jan. de 2026" -> "2026-01-01"
  const match = dateStr.trim().toLowerCase().match(/([a-záéíóúâêîôûãõç]+)\.?\s*(?:de\s+)?(\d{4})/);
  if (!match) return null;
  const month = MONTH_MAP[match[1]];
  if (!month) return null;
  return `${match[2]}-${String(month).padStart(2, "0")}-01`;
}

function parseDateHeader(header: string): string | null {
  const h = header.trim().toLowerCase();
  const isoMatch = h.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}-01`;
  const slashMatch = h.match(/^(\d{1,2})\/(\d{4})$/);
  if (slashMatch) return `${slashMatch[2]}-${slashMatch[1].padStart(2, "0")}-01`;
  const wordMatch = h.match(/([a-záéíóúâêîôûãõç]+)[.\-\s]+(\d{2,4})/);
  if (wordMatch) {
    const month = MONTH_MAP[wordMatch[1]];
    if (!month) return null;
    let year = parseInt(wordMatch[2]);
    if (year < 100) year += 2000;
    return `${year}-${String(month).padStart(2, "0")}-01`;
  }
  return null;
}

function inferDomainType(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes("/checkout") || lower.includes("/pay") || lower.includes("/comprar")) return "checkout";
  if (lower.includes("/obrigado") || lower.includes("/thankyou") || lower.includes("/thank-you") || lower.includes("/thanks")) return "thank_you";
  if (lower.includes("/quiz") || lower.includes("/teste") || lower.includes("/avaliacao")) return "quiz";
  if (lower.includes("/up") || lower.includes("/upsell") || lower.includes("/oferta-especial")) return "upsell";
  if (lower.includes("app.") || lower.includes("/login") || lower.includes("/register") || lower.includes("/clientarea")) return "redirect";
  return "landing_page";
}

// ─── Extracted data types ───

export interface ExtractedTrafficRecord {
  domain: string;
  period_date: string;
  visits: number;
  unique_visitors?: number;
  pages_per_visit?: number;
  avg_visit_duration?: number;
  bounce_rate?: number;
  source: string;
}

export interface ExtractedDomain {
  domain: string;
  url?: string;
  domain_type: string;
  traffic_share?: number;
  notas?: string;
  first_seen?: string;
  discovery_source: string;
  discovery_query?: string;
}

export interface ExtractedGeoData {
  domain: string;
  countries: Array<{ country: string; share: number; visits: number }>;
  mainGeo?: string;
  secondaryGeos?: string[];
  geoNotes?: string;
}

export interface ProcessedCsvResult {
  trafficRecords: ExtractedTrafficRecord[];
  domains: ExtractedDomain[];
  geoData: ExtractedGeoData[];
  summary: {
    totalDomains: number;
    totalTrafficRecords: number;
    totalNewDomains: number;
  };
}

// ─── Processors ───

export function processCsv(classified: ClassifiedCsv): ProcessedCsvResult {
  switch (classified.type) {
    case "publicwww": return processPublicWWW(classified);
    case "semrush_bulk": return processSemrushBulk(classified);
    case "semrush_geo": return processSemrushGeo(classified);
    case "semrush_pages": return processSemrushPages(classified);
    case "semrush_subdomains": return processSemrushSubdomains(classified);
    case "semrush_subfolders": return processSemrushSubfolders(classified);
    case "semrush_traffic_trend": return processSemrushTrafficTrend(classified);
    case "semrush_summary": return processSemrushSummary(classified);
    case "semrush_bulk_historical": return processSemrushBulkHistorical(classified);
    default: return emptyResult();
  }
}

function emptyResult(): ProcessedCsvResult {
  return { trafficRecords: [], domains: [], geoData: [], summary: { totalDomains: 0, totalTrafficRecords: 0, totalNewDomains: 0 } };
}

function processPublicWWW(c: ClassifiedCsv): ProcessedCsvResult {
  const result = Papa.parse(c.rawText.trim(), { header: false, skipEmptyLines: true, delimiter: c.delimiter });
  const rows = result.data as string[][];
  const today = new Date().toISOString().slice(0, 7) + "-01";
  const domains: ExtractedDomain[] = [];
  const seen = new Set<string>();

  for (const row of rows) {
    if (!row || row.length < 1) continue;
    const domain = extractDomain(row[0]);
    if (!domain || !domain.includes(".")) continue;
    if (seen.has(domain)) continue;
    seen.add(domain);

    // PublicWWW col2 is a ranking/position number, NOT traffic. Do not import as visits.
    domains.push({
      domain,
      domain_type: "landing_page",
      discovery_source: "publicwww",
      discovery_query: c.discoveryQuery,
      first_seen: today,
    });
  }

  return { trafficRecords: [], domains, geoData: [], summary: { totalDomains: domains.length, totalTrafficRecords: 0, totalNewDomains: domains.length } };
}

function processSemrushBulk(c: ClassifiedCsv): ProcessedCsvResult {
  const result = Papa.parse(c.rawText.trim(), { header: true, skipEmptyLines: true, delimiter: c.delimiter });
  const rows = result.data as Record<string, string>[];
  const periodDate = c.periodDate || new Date().toISOString().slice(0, 7) + "-01";
  const trafficRecords: ExtractedTrafficRecord[] = [];
  const domains: ExtractedDomain[] = [];
  const seen = new Set<string>();

  for (const row of rows) {
    const target = row["Target"] || row["target"] || row["Destino"] || row["destino"] || "";
    const targetType = row["target_type"] || row["Target Type"] || row["Tipo de destino"] || row["tipo de destino"] || "";
    const visitsRaw = row["Visits"] || row["visits"] || row["Visitas"] || row["visitas"] || "";
    const domain = extractDomain(target);
    if (!domain || !domain.includes(".")) continue;

    // N/A or empty → treat as 0 visits, still create traffic record
    const isNA = !visitsRaw || visitsRaw.toLowerCase() === "n/a";
    const visits = isNA ? 0 : parseIntNumber(visitsRaw);
    const uniqueVisitors = isNA ? 0 : parseIntNumber(row["Unique Visitors"] || row["Exclusivo"] || "");
    const pagesPerVisit = isNA ? 0 : parseNumber(row["Pages / Visits"] || row["Pages/Visits"] || row["Páginas / visita"] || row["Paginas / visita"] || "");
    const bounceRate = isNA ? 0 : parseNumber((row["Bounce Rate"] || row["Taxa de rejeição"] || row["Taxa de rejeicao"] || "").replace("%", ""));

    // Parse avg visit duration "12:09" -> seconds
    const durationRaw = row["Avg. Visit Duration"] || row["Avg Visit Duration"] || row["Méd. de duração da visita"] || row["Med. de duracao da visita"] || "";
    let avgDuration = 0;
    if (!isNA) {
      const dMatch = durationRaw.match(/(\d+):(\d+)/);
      if (dMatch) avgDuration = parseInt(dMatch[1]) * 60 + parseInt(dMatch[2]);
    }

    trafficRecords.push({
      domain,
      period_date: periodDate,
      visits,
      unique_visitors: uniqueVisitors || undefined,
      pages_per_visit: pagesPerVisit || undefined,
      avg_visit_duration: avgDuration || undefined,
      bounce_rate: bounceRate || undefined,
      source: "semrush_bulk",
    });

    if (!seen.has(domain)) {
      seen.add(domain);
      const isSubfolder = targetType === "subfolder" || targetType === "subpasta";
      const dtype = isSubfolder ? "other" : "landing_page";
      domains.push({
        domain,
        url: isSubfolder ? target : undefined,
        domain_type: dtype,
        discovery_source: "semrush_bulk",
        first_seen: periodDate,
      });
    }
  }

  return { trafficRecords, domains, geoData: [], summary: { totalDomains: domains.length, totalTrafficRecords: trafficRecords.length, totalNewDomains: domains.length } };
}

function processSemrushGeo(c: ClassifiedCsv): ProcessedCsvResult {
  const result = Papa.parse(c.rawText.trim(), { header: true, skipEmptyLines: true, delimiter: c.delimiter });
  const rows = result.data as Record<string, string>[];
  const geoData: ExtractedGeoData[] = [];
  let current: ExtractedGeoData | null = null;

  for (const row of rows) {
    const destino = (row["Destino"] || row["destino"] || "").trim();
    const country = (row["País"] || row["Pais"] || row["país"] || row["pais"] || "").trim();
    const shareRaw = row["Proporção de tráfego"] || row["proporção de tráfego"] || "";
    const share = parseNumber(shareRaw.replace("%", "").replace(",", "."));
    const visits = parseIntNumber(row["Todos os dispositivos"] || row["todos os dispositivos"] || "");

    if (destino) {
      if (current) geoData.push(current);
      current = { domain: extractDomain(destino), countries: [] };
    }
    if (current && country) {
      current.countries.push({ country, share, visits });
    }
  }
  if (current) geoData.push(current);

  // Determine main geo with multi-country logic
  const analysisPeriod = c.periodLabel || c.periodDate || "data desconhecida";
  for (const geo of geoData) {
    if (geo.countries.length === 0) continue;
    const sorted = [...geo.countries].sort((a, b) => b.share - a.share);
    geo.mainGeo = countryToCode(sorted[0].country);
    
    // Find secondary countries with 15%+ share
    const secondary = sorted.slice(1).filter(c => c.share >= 15);
    if (secondary.length > 0) {
      geo.secondaryGeos = secondary.map(c => countryToCode(c.country));
    }

    // Build geo notes with analysis date — always include traffic even if not imported to traffic section
    const countryLines = sorted
      .filter(c => c.share > 0)
      .map(c => `- ${c.country}: ${c.share.toFixed(2)}% (${c.visits > 0 ? c.visits.toLocaleString("pt-BR") : "—"} visitas)`)
      .join("\n");
    geo.geoNotes = `## Geodistribuição (${analysisPeriod})\n${countryLines}`;
  }

  return { trafficRecords: [], domains: [], geoData, summary: { totalDomains: geoData.length, totalTrafficRecords: 0, totalNewDomains: 0 } };
}

function countryToCode(country: string): string {
  const map: Record<string, string> = {
    "brasil": "BR", "brazil": "BR",
    "estados unidos": "US", "united states": "US",
    "países baixos": "NL", "netherlands": "NL",
    "portugal": "PT", "reino unido": "GB", "united kingdom": "GB",
    "espanha": "ES", "spain": "ES", "alemanha": "DE", "germany": "DE",
    "frança": "FR", "france": "FR", "itália": "IT", "italy": "IT",
    "canadá": "CA", "canada": "CA", "méxico": "MX", "mexico": "MX",
    "argentina": "AR", "colômbia": "CO", "colombia": "CO",
    "chile": "CL", "peru": "PE", "japão": "JP", "japan": "JP",
  };
  return map[country.toLowerCase()] || country.substring(0, 2).toUpperCase();
}

function processSemrushPages(c: ClassifiedCsv): ProcessedCsvResult {
  const result = Papa.parse(c.rawText.trim(), { header: true, skipEmptyLines: true, delimiter: c.delimiter });
  const rows = result.data as Record<string, string>[];
  const domains: ExtractedDomain[] = [];
  const seen = new Set<string>();
  let currentDestino = "";

  for (const row of rows) {
    const destino = (row["Destino"] || row["destino"] || "").trim();
    if (destino) currentDestino = destino;

    const pageUrl = (row["Página"] || row["página"] || row["Pagina"] || row["pagina"] || "").trim();
    if (!pageUrl) continue;

    const domain = extractDomain(pageUrl);
    const fullUrl = pageUrl.startsWith("http") ? pageUrl : `http://${pageUrl}`;
    const shareRaw = row["Proporção de tráfego"] || "";
    const share = parseNumber(shareRaw.replace("%", "").replace(",", "."));

    if (!seen.has(pageUrl.toLowerCase())) {
      seen.add(pageUrl.toLowerCase());
      const visitsRaw = row["Visitas"] || row["visitas"] || "";
      const visits = parseIntNumber(visitsRaw);
      const notaParts: string[] = [];
      if (share) notaParts.push(`Proporção: ${shareRaw}`);
      if (visits) notaParts.push(`Visitas: ${visits.toLocaleString("pt-BR")}`);
      if (c.periodLabel) notaParts.push(`Período: ${c.periodLabel}`);
      
      domains.push({
        domain,
        url: fullUrl,
        domain_type: inferDomainType(pageUrl),
        traffic_share: share || undefined,
        notas: notaParts.length > 0 ? notaParts.join(" | ") : undefined,
        discovery_source: "semrush_pages",
      });
    }
  }

  return { trafficRecords: [], domains, geoData: [], summary: { totalDomains: domains.length, totalTrafficRecords: 0, totalNewDomains: domains.length } };
}

function processSemrushSubdomains(c: ClassifiedCsv): ProcessedCsvResult {
  const result = Papa.parse(c.rawText.trim(), { header: true, skipEmptyLines: true, delimiter: c.delimiter });
  const rows = result.data as Record<string, string>[];
  const domains: ExtractedDomain[] = [];
  const seen = new Set<string>();
  let currentDestino = "";

  for (const row of rows) {
    const destino = (row["Destino"] || row["destino"] || "").trim();
    if (destino) currentDestino = destino;

    const subdomain = (row["Subdomínio"] || row["subdomínio"] || row["Subdominio"] || row["subdominio"] || "").trim();
    if (!subdomain) continue;
    const domain = extractDomain(subdomain);
    if (!domain || seen.has(domain)) continue;
    seen.add(domain);

    // Store parentDomain for matching purposes
    const parentDomain = currentDestino ? extractDomain(currentDestino) : undefined;
    domains.push({
      domain,
      domain_type: "landing_page",
      discovery_source: "semrush_subdomains",
      notas: parentDomain && parentDomain !== domain ? `Subdomínio de ${parentDomain}` : undefined,
    });
  }

  return { trafficRecords: [], domains, geoData: [], summary: { totalDomains: domains.length, totalTrafficRecords: 0, totalNewDomains: domains.length } };
}

function processSemrushSubfolders(c: ClassifiedCsv): ProcessedCsvResult {
  const result = Papa.parse(c.rawText.trim(), { header: true, skipEmptyLines: true, delimiter: c.delimiter });
  const rows = result.data as Record<string, string>[];
  const domains: ExtractedDomain[] = [];
  const seen = new Set<string>();
  let currentDestino = "";

  for (const row of rows) {
    const destino = (row["Destino"] || row["destino"] || "").trim();
    if (destino) currentDestino = destino;

    const subfolder = (row["Subpasta"] || row["subpasta"] || "").trim();
    if (!subfolder) continue;
    const domain = extractDomain(subfolder);
    if (!domain || seen.has(subfolder.toLowerCase())) continue;
    seen.add(subfolder.toLowerCase());

    const parentDomain = currentDestino ? extractDomain(currentDestino) : undefined;
    domains.push({
      domain,
      url: subfolder.startsWith("http") ? subfolder : `http://${subfolder}`,
      domain_type: inferDomainType(subfolder),
      discovery_source: "semrush_subfolders",
      notas: parentDomain && parentDomain !== domain ? `Subpasta de ${parentDomain}` : undefined,
    });
  }

  return { trafficRecords: [], domains, geoData: [], summary: { totalDomains: domains.length, totalTrafficRecords: 0, totalNewDomains: domains.length } };
}

function processSemrushTrafficTrend(c: ClassifiedCsv): ProcessedCsvResult {
  const result = Papa.parse(c.rawText.trim(), { header: true, skipEmptyLines: true, delimiter: c.delimiter });
  const rows = result.data as Record<string, string>[];
  const headers = result.meta.fields || [];
  // Col 0 = "Data", cols 1+ = domain names
  const domainHeaders = headers.slice(1);
  const trafficRecords: ExtractedTrafficRecord[] = [];
  const domainSet = new Set<string>();

  for (const row of rows) {
    const dateRaw = row[headers[0]] || "";
    const periodDate = parsePtDate(dateRaw);
    if (!periodDate) continue;

    for (const dh of domainHeaders) {
      const domain = extractDomain(dh);
      if (!domain) continue;
      domainSet.add(domain);
      const visits = parseIntNumber(row[dh] || "");
      trafficRecords.push({ domain, period_date: periodDate, visits, source: "semrush_trend" });
    }
  }

  const domains: ExtractedDomain[] = [...domainSet].map(d => ({
    domain: d,
    domain_type: "landing_page",
    discovery_source: "semrush_trend",
  }));

  return { trafficRecords, domains, geoData: [], summary: { totalDomains: domains.length, totalTrafficRecords: trafficRecords.length, totalNewDomains: domains.length } };
}

function processSemrushSummary(c: ClassifiedCsv): ProcessedCsvResult {
  const result = Papa.parse(c.rawText.trim(), { header: true, skipEmptyLines: true, delimiter: c.delimiter });
  const rows = result.data as Record<string, string>[];
  const trafficRecords: ExtractedTrafficRecord[] = [];
  let currentDomain = "";

  for (const row of rows) {
    const destino = (row["Destino"] || row["destino"] || "").trim();
    if (destino) currentDomain = extractDomain(destino);
    if (!currentDomain) continue;

    const periodoRaw = (row["Período"] || row["período"] || row["Periodo"] || row["periodo"] || "").trim();
    const periodDate = parsePtDate(periodoRaw);
    if (!periodDate) continue;

    const visits = parseIntNumber(row["Visitas"] || row["visitas"] || "");
    const pagesPerVisit = parseNumber(row["Páginas / Visita"] || row["Páginas/Visita"] || "");
    const bounceRate = parseNumber((row["Taxa de rejeição"] || "").replace("%", "").replace(",", "."));
    const durationRaw = row["Méd. de duração da visita"] || "";
    let avgDuration = 0;
    const dMatch = durationRaw.match(/(\d+):(\d+)/);
    if (dMatch) avgDuration = parseInt(dMatch[1]) * 60 + parseInt(dMatch[2]);
    const uniqueVisitors = parseIntNumber(row["Exclusivo"] || row["Visitantes únicos"] || "");

    trafficRecords.push({
      domain: currentDomain,
      period_date: periodDate,
      visits,
      unique_visitors: uniqueVisitors || undefined,
      pages_per_visit: pagesPerVisit || undefined,
      avg_visit_duration: avgDuration || undefined,
      bounce_rate: bounceRate || undefined,
      source: "semrush_summary",
    });
  }

  return { trafficRecords, domains: [], geoData: [], summary: { totalDomains: 0, totalTrafficRecords: trafficRecords.length, totalNewDomains: 0 } };
}

function processSemrushBulkHistorical(c: ClassifiedCsv): ProcessedCsvResult {
  const result = Papa.parse(c.rawText.trim(), { header: true, skipEmptyLines: true, delimiter: c.delimiter });
  const rows = result.data as Record<string, string>[];
  const headers = result.meta.fields || [];
  const domainKey = headers[0];
  const dateHeaders = headers.slice(1).map(h => ({ original: h, parsed: parseDateHeader(h) })).filter(d => d.parsed !== null);
  const trafficRecords: ExtractedTrafficRecord[] = [];

  for (const row of rows) {
    const domain = extractDomain(row[domainKey] || "");
    if (!domain) continue;
    for (const dh of dateHeaders) {
      const visits = parseIntNumber(row[dh.original]);
      trafficRecords.push({ domain, period_date: dh.parsed!, visits, source: "semrush_bulk_historical" });
    }
  }

  return { trafficRecords, domains: [], geoData: [], summary: { totalDomains: 0, totalTrafficRecords: trafficRecords.length, totalNewDomains: 0 } };
}

// ─── Auto-exclude irrelevant columns per CSV type ───

export function getDefaultExcludedColumns(type: CsvType, headers: string[]): Set<number> {
  const excluded = new Set<number>();
  if (headers.length === 0) return excluded;
  const headersLower = headers.map(h => h.trim().toLowerCase());

  const relevantMap: Partial<Record<CsvType, string[]>> = {
    semrush_bulk: ["target", "target_type", "visits", "destino", "tipo de destino", "visitas"],
    semrush_geo: ["destino", "país", "pais", "proporção de tráfego", "proporcao de trafego", "todos os dispositivos"],
    semrush_pages: ["destino", "página", "pagina", "proporção de tráfego", "proporcao de trafego", "visitas"],
    semrush_subdomains: ["destino", "subdomínio", "subdominio", "visitas"],
    semrush_subfolders: ["destino", "subpasta", "visitas"],
  };

  const relevant = relevantMap[type];
  if (!relevant) return excluded;

  headersLower.forEach((h, i) => {
    // Use exact match to prevent "pages / visits" from matching "visits"
    if (!relevant.some(r => h === r)) {
      excluded.add(i);
    }
  });

  return excluded;
}

import Papa from "papaparse";

export interface SemrushTrafficRow {
  domain: string;
  period_date: string; // ISO: "2024-10-01"
  visits: number;
  period_type: "monthly";
}

const MONTH_MAP: Record<string, number> = {
  jan: 1, janeiro: 1, january: 1,
  feb: 2, fev: 2, fevereiro: 2, february: 2,
  mar: 3, março: 3, marco: 3, march: 3,
  apr: 4, abr: 4, abril: 4, april: 4,
  may: 5, mai: 5, maio: 5,
  jun: 6, junho: 6, june: 6,
  jul: 7, julho: 7, july: 7,
  aug: 8, ago: 8, agosto: 8, august: 8,
  sep: 9, set: 9, setembro: 9, september: 9,
  oct: 10, out: 10, outubro: 10, october: 10,
  nov: 11, novembro: 11, november: 11,
  dec: 12, dez: 12, dezembro: 12, december: 12,
};

function parseDateHeader(header: string): string | null {
  const h = header.trim().toLowerCase();

  // "2024-10" or "2024-10-01"
  const isoMatch = h.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}-01`;

  // "10/2024"
  const slashMatch = h.match(/^(\d{1,2})\/(\d{4})$/);
  if (slashMatch) return `${slashMatch[2]}-${slashMatch[1].padStart(2, "0")}-01`;

  // "Oct 2024", "Visits Oct 2024", "October 2024", "oct-24"
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

function parseNumber(val: string): number {
  if (!val) return 0;
  const cleaned = val.replace(/["'\s]/g, "").replace(/\./g, "").replace(/,/g, "");
  const n = parseInt(cleaned, 10);
  return isNaN(n) ? 0 : n;
}

export function detectDelimiter(csvText: string): string {
  const firstLine = csvText.trim().split(/\r?\n/)[0] || "";
  const counts: Record<string, number> = { ",": 0, ";": 0, "\t": 0, "|": 0 };
  for (const char of Object.keys(counts)) {
    counts[char] = (firstLine.match(new RegExp(char === "|" ? "\\|" : char === "\t" ? "\t" : char, "g")) || []).length;
  }
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] > 0 ? best[0] : ",";
}

function extractDomain(raw: string): string {
  return raw.trim().toLowerCase().replace(/^["'\s]+|["'\s]+$/g, "").replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/:\d+$/, "");
}

function tryParseHeaderless(csvText: string, delimiter?: string): SemrushTrafficRow[] {
  // Handles PublicWWW-style CSVs: URL;visits;footprint (no header row)
  const effectiveDelimiter = delimiter || detectDelimiter(csvText);
  const result = Papa.parse(csvText.trim(), {
    header: false,
    skipEmptyLines: true,
    delimiter: effectiveDelimiter,
  });

  if (!result.data || result.data.length === 0) return [];

  const rows: SemrushTrafficRow[] = [];
  const today = new Date().toISOString().slice(0, 7) + "-01"; // current month

  for (const line of result.data as string[][]) {
    if (!line || line.length < 1) continue;

    // Find the column that looks like a domain/URL
    const domainCol = line[0] || "";
    const domain = extractDomain(domainCol);
    if (!domain || !domain.includes(".")) continue;

    // Find a numeric column for visits (check columns 1, 2, etc.)
    let visits = 0;
    for (let i = 1; i < line.length; i++) {
      const num = parseNumber(line[i]);
      if (num > 0) { visits = num; break; }
    }

    rows.push({
      domain,
      period_date: today,
      visits,
      period_type: "monthly",
    });
  }

  return rows;
}

export function parseSemrushCSV(csvText: string, delimiter?: string): SemrushTrafficRow[] {
  // First try with headers (Semrush format)
  const result = Papa.parse(csvText.trim(), {
    header: true,
    skipEmptyLines: true,
    delimiter: delimiter || "",
  });

  if (result.data && result.data.length > 0) {
    const headers = result.meta.fields || [];
    const domainKey = headers[0];
    const dateHeaders = headers.slice(1).map((h) => ({
      original: h,
      parsed: parseDateHeader(h),
    })).filter((d) => d.parsed !== null);

    // If we found date headers, use Semrush format
    if (dateHeaders.length > 0) {
      const rows: SemrushTrafficRow[] = [];
      for (const row of result.data as Record<string, string>[]) {
        const domain = extractDomain(row[domainKey] || "");
        if (!domain) continue;

        for (const dh of dateHeaders) {
          const visits = parseNumber(row[dh.original]);
          rows.push({
            domain,
            period_date: dh.parsed!,
            visits,
            period_type: "monthly",
          });
        }
      }
      if (rows.length > 0) return rows;
    }
  }

  // Fallback: try headerless format (PublicWWW: domain;visits;footprint)
  return tryParseHeaderless(csvText, delimiter);
}

export function extractDomainsFromText(text: string): string[] {
  const lines = text.split(/[\n\r]+/).map((l) => l.trim()).filter(Boolean);
  const domains: string[] = [];

  for (const line of lines) {
    // Extract domain from URL or plain text
    const cleaned = line
      .replace(/^["']|["']$/g, "")
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "")
      .replace(/:\d+$/, "")
      .toLowerCase()
      .trim();

    // Basic domain validation
    if (cleaned && cleaned.includes(".") && !cleaned.includes(" ")) {
      domains.push(cleaned);
    }
  }

  return [...new Set(domains)];
}

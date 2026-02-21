/**
 * CSV Import Service
 * Extracted from: csvClassifier.ts, parseSemrushCSV.ts, UniversalImportModal
 *
 * Pure business logic for CSV classification, parsing, domain matching, and import execution.
 * Components/hooks should call these functions instead of handling CSV logic directly.
 */

import {
  classifyCsv,
  processCsv,
  filterCsvData,
  detectDelimiter,
  extractDomain,
  getDefaultExcludedColumns,
  type CsvType,
  type ClassifiedCsv,
  type ProcessedCsvResult,
  type ExtractedTrafficRecord,
  type ExtractedDomain,
  type ExtractedGeoData,
  type ExtractedOfferUpdate,
} from "@/lib/csvClassifier";

// Re-export types for consumers
export type {
  CsvType,
  ClassifiedCsv,
  ProcessedCsvResult,
  ExtractedTrafficRecord,
  ExtractedDomain,
  ExtractedGeoData,
  ExtractedOfferUpdate,
};

// ─── Types ───

export interface MatchResult {
  matched: DomainMatch[];
  unmatched: ExtractedDomain[];
  stats: {
    totalDomains: number;
    matchedCount: number;
    unmatchedCount: number;
    newOffersNeeded: number;
  };
}

export interface DomainMatch {
  domain: string;
  offerId: string;
  offerName: string;
  matchType: "exact" | "domain_table" | "parent_domain";
  isNew: boolean;
}

export interface ImportResult {
  offersCreated: number;
  domainsLinked: number;
  trafficRecords: number;
  geoUpdates: number;
  errors: string[];
}

// ─── Classification ───

/**
 * Classify a CSV file by reading its content and detecting the format.
 * Wraps classifyCsv with File reading.
 */
export async function classifyCSV(file: File): Promise<ClassifiedCsv> {
  const text = await file.text();
  return classifyCsv(text, file.name);
}

/**
 * Classify raw CSV text (when file content is already available).
 */
export function classifyCSVText(
  text: string,
  fileName?: string,
  delimiterOverride?: string
): ClassifiedCsv {
  return classifyCsv(text, fileName, delimiterOverride);
}

// ─── Parsing ───

/**
 * Parse a classified CSV into structured data (traffic records, domains, geo, etc).
 */
export function parseCSV(classified: ClassifiedCsv): ProcessedCsvResult {
  return processCsv(classified);
}

/**
 * Filter CSV data by excluding specific columns and rows.
 */
export function filterCSVData(
  classified: ClassifiedCsv,
  excludedColumns: Set<number>,
  excludedRows: Set<number>
): ClassifiedCsv {
  return filterCsvData(classified, excludedColumns, excludedRows);
}

/**
 * Get default excluded columns for a CSV type (irrelevant columns auto-hidden).
 */
export function getDefaultExclusions(
  type: CsvType,
  headers: string[]
): Set<number> {
  return getDefaultExcludedColumns(type, headers);
}

// ─── Domain Matching ───

/**
 * Match extracted domains against existing offers.
 * Pure function — requires pre-fetched offer data.
 *
 * @param domains - Domains extracted from CSV
 * @param existingOffers - Map of main_domain -> { id, nome }
 * @param existingDomains - Map of domain -> { offerId, offerName } from offer_domains table
 */
export function matchDomains(
  domains: ExtractedDomain[],
  existingOffers: Map<string, { id: string; nome: string }>,
  existingDomains: Map<string, { offerId: string; offerName: string }>
): MatchResult {
  const matched: DomainMatch[] = [];
  const unmatched: ExtractedDomain[] = [];
  const seen = new Set<string>();

  for (const d of domains) {
    const domain = d.domain.toLowerCase();
    if (seen.has(domain)) continue;
    seen.add(domain);

    // Level 1: exact match on spied_offers.main_domain
    const exactMatch = existingOffers.get(domain);
    if (exactMatch) {
      matched.push({
        domain,
        offerId: exactMatch.id,
        offerName: exactMatch.nome,
        matchType: "exact",
        isNew: false,
      });
      continue;
    }

    // Level 2: match on offer_domains table
    const domainTableMatch = existingDomains.get(domain);
    if (domainTableMatch) {
      matched.push({
        domain,
        offerId: domainTableMatch.offerId,
        offerName: domainTableMatch.offerName,
        matchType: "domain_table",
        isNew: false,
      });
      continue;
    }

    // Level 3: parent domain match (e.g., app.example.com -> example.com)
    const parts = domain.split(".");
    if (parts.length > 2) {
      const parentDomain = parts.slice(-2).join(".");
      const parentMatch =
        existingOffers.get(parentDomain) ||
        (existingDomains.has(parentDomain)
          ? {
              id: existingDomains.get(parentDomain)!.offerId,
              nome: existingDomains.get(parentDomain)!.offerName,
            }
          : null);

      if (parentMatch) {
        matched.push({
          domain,
          offerId: parentMatch.id,
          offerName: parentMatch.nome,
          matchType: "parent_domain",
          isNew: false,
        });
        continue;
      }
    }

    // No match found
    unmatched.push(d);
  }

  return {
    matched,
    unmatched,
    stats: {
      totalDomains: domains.length,
      matchedCount: matched.length,
      unmatchedCount: unmatched.length,
      newOffersNeeded: unmatched.length,
    },
  };
}

// ─── Import Preparation ───

/**
 * Prepare traffic records for batch import, grouping by domain and enriching with offer IDs.
 * Pure function — no Supabase calls.
 */
export function prepareTrafficImport(
  records: ExtractedTrafficRecord[],
  domainToOfferId: Map<string, string>,
  periodType: string
): Array<{
  spied_offer_id: string;
  domain: string;
  period_date: string;
  visits: number;
  unique_visitors?: number;
  pages_per_visit?: number;
  avg_visit_duration?: number;
  bounce_rate?: number;
  period_type: string;
  source: string;
}> {
  const prepared: Array<{
    spied_offer_id: string;
    domain: string;
    period_date: string;
    visits: number;
    unique_visitors?: number;
    pages_per_visit?: number;
    avg_visit_duration?: number;
    bounce_rate?: number;
    period_type: string;
    source: string;
  }> = [];

  for (const r of records) {
    const offerId = domainToOfferId.get(r.domain);
    if (!offerId) continue;

    prepared.push({
      spied_offer_id: offerId,
      domain: r.domain,
      period_date: r.period_date,
      visits: r.visits,
      unique_visitors: r.unique_visitors,
      pages_per_visit: r.pages_per_visit,
      avg_visit_duration: r.avg_visit_duration,
      bounce_rate: r.bounce_rate,
      period_type: periodType,
      source: r.source,
    });
  }

  return prepared;
}

/**
 * Prepare geo data as notes appendix for offers.
 * Returns map of offerId -> notes to append.
 */
export function prepareGeoNotes(
  geoData: ExtractedGeoData[],
  domainToOfferId: Map<string, string>
): Map<string, string> {
  const notes = new Map<string, string>();

  for (const geo of geoData) {
    const offerId = domainToOfferId.get(geo.domain);
    if (!offerId || !geo.geoNotes) continue;

    const existing = notes.get(offerId) || "";
    notes.set(offerId, existing ? `${existing}\n\n${geo.geoNotes}` : geo.geoNotes);
  }

  return notes;
}

// ─── Utilities (re-exported) ───

export { detectDelimiter, extractDomain };

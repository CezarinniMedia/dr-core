/**
 * Services barrel export
 * BD-2.2: Service Layer for business logic separation
 */

// CSV Import — classification, parsing, domain matching
export {
  classifyCSV,
  classifyCSVText,
  parseCSV,
  filterCSVData,
  getDefaultExclusions,
  matchDomains,
  prepareTrafficImport,
  prepareGeoNotes,
  detectDelimiter,
  extractDomain,
  type CsvType,
  type ClassifiedCsv,
  type ProcessedCsvResult,
  type ExtractedTrafficRecord,
  type ExtractedDomain,
  type ExtractedGeoData,
  type ExtractedOfferUpdate,
  type MatchResult,
  type DomainMatch,
  type ImportResult,
} from "./csvImportService";

// Traffic — analysis, trends, spikes, aggregation
export {
  calculateTrafficTrend,
  compareTraffic,
  detectSpikes,
  aggregateByPeriod,
  sortTrafficRows,
  filterTrafficRows,
  formatTrafficNumber,
  formatPeriodDate,
  getAvailableMonths,
  type TrafficRecord,
  type DateRange,
  type TrendResult,
  type SpikeResult,
  type AggregatedData,
  type OfferTrafficRow,
  type ComparisonData,
  type SortField,
  type SortDir,
} from "./trafficService";

// Offers — filtering, bulk ops, export, stats
export {
  filterOffers,
  bulkUpdateStatus,
  bulkDeleteOffers,
  updateOfferStatus,
  updateOfferNotes,
  exportToCSV,
  calculateOfferStats,
  stripMarkdown,
  formatCurrency,
  type SpiedOffer,
  type FilterState,
  type OfferStats,
} from "./offerService";

// Domains — enrichment, relations, dedup
export {
  enrichDomainData,
  inferDomainType,
  findRelatedDomains,
  mergeDuplicateDomains,
  getRootDomain,
  isSubdomainOf,
  type DomainInfo,
  type RelatedDomain,
  type MergeResult,
} from "./domainService";

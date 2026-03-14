/**
 * Domain Service
 * Extracted from: csvClassifier.ts, various components
 *
 * Pure business logic for domain operations — enrichment, relation finding, deduplication.
 */

import { extractDomain } from "@/shared/lib/csvClassifier";

// ─── Types ───

export interface DomainInfo {
  domain: string;
  rootDomain: string;
  isSubdomain: boolean;
  domainType: string;
  tld: string;
}

export interface RelatedDomain {
  domain: string;
  relationship: "subdomain" | "same_root" | "sibling";
  source: string;
}

export interface MergeResult {
  kept: string[];
  merged: string[];
  conflicts: Array<{ domains: string[]; reason: string }>;
}

// ─── Domain Enrichment ───

/**
 * Enrich a domain string with structural metadata.
 * Pure function — no external API calls.
 */
export function enrichDomainData(domain: string): DomainInfo {
  const cleaned = extractDomain(domain);
  const parts = cleaned.split(".");
  const tld = parts[parts.length - 1] || "";
  const rootDomain = parts.length > 2 ? parts.slice(-2).join(".") : cleaned;
  const isSubdomain = parts.length > 2;
  const domainType = inferDomainType(cleaned);

  return {
    domain: cleaned,
    rootDomain,
    isSubdomain,
    domainType,
    tld,
  };
}

/**
 * Infer domain type from URL/domain structure.
 */
export function inferDomainType(urlOrDomain: string): string {
  const lower = urlOrDomain.toLowerCase();
  if (lower.includes("/checkout") || lower.includes("/pay") || lower.includes("/comprar"))
    return "checkout";
  if (
    lower.includes("/obrigado") ||
    lower.includes("/thankyou") ||
    lower.includes("/thank-you") ||
    lower.includes("/thanks")
  )
    return "thank_you";
  if (lower.includes("/quiz") || lower.includes("/teste") || lower.includes("/avaliacao"))
    return "quiz";
  if (lower.includes("/up") || lower.includes("/upsell") || lower.includes("/oferta-especial"))
    return "upsell";
  if (
    lower.includes("app.") ||
    lower.includes("/login") ||
    lower.includes("/register") ||
    lower.includes("/clientarea")
  )
    return "redirect";
  return "landing_page";
}

// ─── Related Domains ───

/**
 * Find domains related to a given offer's domain from a list of all domains.
 * Matches subdomains, same root domains, and sibling patterns.
 */
export function findRelatedDomains(
  offerDomain: string,
  allDomains: Array<{ domain: string; spied_offer_id: string; discovery_source?: string }>
): RelatedDomain[] {
  const info = enrichDomainData(offerDomain);
  const related: RelatedDomain[] = [];
  const seen = new Set<string>();

  for (const d of allDomains) {
    const candidate = d.domain.toLowerCase();
    if (candidate === info.domain || seen.has(candidate)) continue;

    const candidateInfo = enrichDomainData(candidate);

    // Subdomain of the same root
    if (candidateInfo.rootDomain === info.rootDomain && candidateInfo.isSubdomain) {
      seen.add(candidate);
      related.push({
        domain: candidate,
        relationship: "subdomain",
        source: d.discovery_source || "unknown",
      });
      continue;
    }

    // Same root domain (different subdomain or exact match)
    if (candidateInfo.rootDomain === info.rootDomain) {
      seen.add(candidate);
      related.push({
        domain: candidate,
        relationship: "same_root",
        source: d.discovery_source || "unknown",
      });
      continue;
    }
  }

  return related;
}

// ─── Domain Deduplication ───

/**
 * Merge duplicate domains in a list.
 * Keeps the first occurrence and marks subsequent ones for merging.
 *
 * Deduplication rules:
 * - Exact match: merge immediately
 * - Subdomain of same root: flag as potential merge
 * - www vs non-www: treat as same
 */
export function mergeDuplicateDomains(
  domains: Array<{ domain: string; url?: string; [key: string]: unknown }>
): MergeResult {
  const kept: string[] = [];
  const merged: string[] = [];
  const conflicts: Array<{ domains: string[]; reason: string }> = [];
  const rootMap = new Map<string, string[]>();

  for (const d of domains) {
    const cleaned = d.domain.toLowerCase().replace(/^www\./, "");
    const info = enrichDomainData(cleaned);

    if (!rootMap.has(info.rootDomain)) {
      rootMap.set(info.rootDomain, []);
    }
    rootMap.get(info.rootDomain)!.push(cleaned);
  }

  for (const [root, domainList] of rootMap) {
    // Remove exact duplicates (including www variants)
    const unique = [...new Set(domainList.map((d) => d.replace(/^www\./, "")))];

    if (unique.length === 1) {
      kept.push(unique[0]);
    } else {
      // Keep root domain, merge subdomains
      const rootIdx = unique.findIndex((d) => d === root);
      if (rootIdx >= 0) {
        kept.push(unique[rootIdx]);
        merged.push(...unique.filter((_, i) => i !== rootIdx));
      } else {
        // No root domain found — keep first, flag as conflict
        kept.push(unique[0]);
        merged.push(...unique.slice(1));
        if (unique.length > 2) {
          conflicts.push({
            domains: unique,
            reason: `Multiple subdomains of ${root} found — manual review recommended`,
          });
        }
      }
    }
  }

  return { kept, merged, conflicts };
}

// ─── Utilities ───

/**
 * Extract root domain from a full URL or domain string.
 */
export function getRootDomain(urlOrDomain: string): string {
  const cleaned = extractDomain(urlOrDomain);
  const parts = cleaned.split(".");
  return parts.length > 2 ? parts.slice(-2).join(".") : cleaned;
}

/**
 * Check if a domain is a subdomain of another.
 */
export function isSubdomainOf(subdomain: string, parent: string): boolean {
  const sub = subdomain.toLowerCase().replace(/^www\./, "");
  const par = parent.toLowerCase().replace(/^www\./, "");
  return sub !== par && sub.endsWith(`.${par}`);
}

// Re-export extractDomain for convenience
export { extractDomain };

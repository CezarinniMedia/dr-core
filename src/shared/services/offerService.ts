/**
 * Offer Service
 * Extracted from: SpyRadar.tsx, useSpiedOffers.ts
 *
 * Pure business logic for offer filtering, stats, bulk operations, and CSV export.
 * No React or Supabase dependencies — all functions are pure.
 */

import { supabase } from "@/integrations/supabase/client";

// ─── Types ───

export interface SpiedOffer {
  id: string;
  nome: string;
  main_domain: string | null;
  status: string | null;
  vertical: string | null;
  discovery_source: string | null;
  notas: string | null;
  product_name: string | null;
  product_promise: string | null;
  product_ticket: number | null;
  geo: string | null;
  priority: number | null;
  estimated_monthly_traffic: number | null;
  traffic_trend: string | null;
  estimated_monthly_revenue: number | null;
  discovered_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  [key: string]: unknown;
}

export interface FilterState {
  statusFilter: Set<string>;
  vertical: string;
  discoverySource: string;
  search: string;
}

export interface OfferStats {
  total: number;
  byStatus: Record<string, number>;
  byVertical: Record<string, number>;
  bySource: Record<string, number>;
  withTraffic: number;
  avgTraffic: number;
}

// ─── Filtering ───

/**
 * Filter offers by multiple criteria (client-side filtering).
 * Used for status multi-select which is applied after Supabase query.
 */
export function filterOffers(
  offers: SpiedOffer[],
  filters: Partial<FilterState>
): SpiedOffer[] {
  let result = offers;

  if (filters.statusFilter && filters.statusFilter.size > 0) {
    result = result.filter((o) => filters.statusFilter!.has(o.status || "RADAR"));
  }

  if (filters.vertical) {
    result = result.filter((o) => o.vertical === filters.vertical);
  }

  if (filters.discoverySource) {
    result = result.filter((o) => o.discovery_source === filters.discoverySource);
  }

  if (filters.search) {
    const s = filters.search.toLowerCase();
    result = result.filter(
      (o) =>
        (o.nome || "").toLowerCase().includes(s) ||
        (o.main_domain || "").toLowerCase().includes(s) ||
        (o.product_name || "").toLowerCase().includes(s)
    );
  }

  return result;
}

// ─── Bulk Operations ───

/**
 * Bulk update status for multiple offers via Supabase.
 * Returns the number of updated offers.
 */
export async function bulkUpdateStatus(
  ids: string[],
  status: string
): Promise<{ count: number; error: string | null }> {
  try {
    const { error } = await supabase
      .from("spied_offers")
      .update({ status } as any)
      .in("id", ids);

    if (error) return { count: 0, error: error.message };
    return { count: ids.length, error: null };
  } catch (err: any) {
    return { count: 0, error: err.message };
  }
}

/**
 * Bulk delete offers via Supabase.
 */
export async function bulkDeleteOffers(
  ids: string[]
): Promise<{ count: number; error: string | null }> {
  try {
    const { error } = await supabase
      .from("spied_offers")
      .delete()
      .in("id", ids);

    if (error) return { count: 0, error: error.message };
    return { count: ids.length, error: null };
  } catch (err: any) {
    return { count: 0, error: err.message };
  }
}

/**
 * Inline status change for a single offer.
 */
export async function updateOfferStatus(
  offerId: string,
  newStatus: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("spied_offers")
      .update({ status: newStatus } as any)
      .eq("id", offerId);

    if (error) return { error: error.message };
    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
}

/**
 * Update offer notes.
 */
export async function updateOfferNotes(
  offerId: string,
  notes: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("spied_offers")
      .update({ notas: notes } as any)
      .eq("id", offerId);

    if (error) return { error: error.message };
    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ─── CSV Export ───

/**
 * Export offers to CSV as a downloadable Blob.
 * @param offers - Offers to export
 * @param columns - Column keys to include in export
 */
export function exportToCSV(
  offers: SpiedOffer[],
  columns: string[]
): Blob {
  const COLUMN_LABELS: Record<string, string> = {
    nome: "Nome",
    main_domain: "Dominio",
    status: "Status",
    vertical: "Vertical",
    discovery_source: "Fonte",
    product_name: "Produto",
    product_promise: "Promessa",
    product_ticket: "Ticket",
    geo: "Geo",
    notas: "Notas",
    priority: "Prioridade",
    estimated_monthly_traffic: "Trafego Mensal",
    traffic_trend: "Tendencia",
    estimated_monthly_revenue: "Receita Mensal",
    discovered_at: "Descoberto Em",
  };

  const header = columns.map((c) => COLUMN_LABELS[c] || c).join(",");

  const rows = offers.map((offer) =>
    columns
      .map((col) => {
        const value = offer[col];
        if (value === null || value === undefined) return "";
        const str = String(value);
        // Escape CSV values containing commas, quotes, or newlines
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
      .join(",")
  );

  const csvContent = [header, ...rows].join("\n");
  return new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
}

// ─── Stats Calculation ───

/**
 * Calculate aggregate statistics for a set of offers.
 */
export function calculateOfferStats(offers: SpiedOffer[]): OfferStats {
  const byStatus: Record<string, number> = {};
  const byVertical: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  let withTraffic = 0;
  let totalTraffic = 0;

  for (const o of offers) {
    const status = o.status || "RADAR";
    byStatus[status] = (byStatus[status] || 0) + 1;

    if (o.vertical) {
      byVertical[o.vertical] = (byVertical[o.vertical] || 0) + 1;
    }

    if (o.discovery_source) {
      bySource[o.discovery_source] = (bySource[o.discovery_source] || 0) + 1;
    }

    if (o.estimated_monthly_traffic && o.estimated_monthly_traffic > 0) {
      withTraffic++;
      totalTraffic += o.estimated_monthly_traffic;
    }
  }

  return {
    total: offers.length,
    byStatus,
    byVertical,
    bySource,
    withTraffic,
    avgTraffic: withTraffic > 0 ? Math.round(totalTraffic / withTraffic) : 0,
  };
}

// ─── Utility ───

/**
 * Strip markdown formatting from text (for display in table cells).
 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/[#*`>\[\]_~]/g, "")
    .replace(/\n+/g, " ")
    .trim();
}

/**
 * Format currency in BRL.
 */
export function formatCurrency(value: number | null | undefined): string {
  if (!value) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

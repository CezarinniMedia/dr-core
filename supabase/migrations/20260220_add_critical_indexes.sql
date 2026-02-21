-- BD-0.2: Add Critical Database Indexes
-- Date: 2026-02-20
-- Performance optimization for 87k+ traffic records and 12k+ spied offers
-- Expected impact: 10-100x faster queries on radar and dashboard

-- ============================================
-- offer_traffic_data - CRITICAL INDEXES
-- ============================================

-- FK index MISSING - improves cascading deletes and lookups
CREATE INDEX IF NOT EXISTS idx_offer_traffic_spied_offer
  ON offer_traffic_data(spied_offer_id);

-- Composite index for most common queries (offer + period range + source)
-- Used by: radar queries, traffic intelligence, dashboard aggregations
CREATE INDEX IF NOT EXISTS idx_offer_traffic_composite
  ON offer_traffic_data(spied_offer_id, period_date DESC, source);

-- ============================================
-- spied_offers - FILTER OPTIMIZATION
-- ============================================

-- Status + vertical combo is the most common filter pair in radar
CREATE INDEX IF NOT EXISTS idx_spied_offers_status_vertical
  ON spied_offers(status, vertical, workspace_id);

-- Full-text search on discovery_query (Portuguese support)
-- Used for searching by keywords/footprints
CREATE INDEX IF NOT EXISTS idx_spied_offers_discovery_gin
  ON spied_offers USING GIN (to_tsvector('portuguese', COALESCE(discovery_query, '')));

-- ============================================
-- offer_domains - WORKSPACE ISOLATION
-- ============================================

-- Missing workspace index for filtered queries
CREATE INDEX IF NOT EXISTS idx_offer_domains_workspace
  ON offer_domains(workspace_id);

-- ============================================
-- offer_funnel_steps - NEW COLUMN INDEX
-- ============================================

-- domain_id FK added in schema - needs index
CREATE INDEX IF NOT EXISTS idx_offer_funnel_domain
  ON offer_funnel_steps(domain_id);

-- ============================================
-- ad_creatives - MULTI-SOURCE INDEXING
-- ============================================

-- Supports querying by competitor OR spied_offer OR library source
CREATE INDEX IF NOT EXISTS idx_ad_creatives_sources
  ON ad_creatives(competitor_id, spied_offer_id, library_id);

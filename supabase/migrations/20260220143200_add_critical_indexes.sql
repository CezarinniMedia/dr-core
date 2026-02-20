-- =============================================================
-- Add Critical Performance Indexes
-- Story: BD-0.2 | Sprint: 0 | Priority: CRITICO
-- =============================================================
-- offer_traffic_data has 87k+ records with MISSING FK index.
-- Dashboard queries are 10-100x slower than necessary.
-- =============================================================

-- CRITICAL 1: FK index on offer_traffic_data (MISSING!)
-- Every JOIN from spied_offers to traffic data does a seq scan
CREATE INDEX IF NOT EXISTS idx_offer_traffic_spied_offer
ON offer_traffic_data(spied_offer_id);

-- CRITICAL 2: Composite for dashboard/radar queries
-- Covers: WHERE spied_offer_id = X ORDER BY period_date DESC
CREATE INDEX IF NOT EXISTS idx_offer_traffic_composite
ON offer_traffic_data(spied_offer_id, period_date DESC, source);

-- CRITICAL 3: Status + vertical filter (most common radar filter)
CREATE INDEX IF NOT EXISTS idx_spied_offers_status_vertical
ON spied_offers(status, vertical, workspace_id);

-- CRITICAL 4: Workspace isolation on offer_domains
CREATE INDEX IF NOT EXISTS idx_offer_domains_workspace
ON offer_domains(workspace_id);

-- HIGH 5: FK index on offer_funnel_steps.domain_id
CREATE INDEX IF NOT EXISTS idx_offer_funnel_domain
ON offer_funnel_steps(domain_id);

-- HIGH 6: Full-text search on discovery_query (GIN index)
CREATE INDEX IF NOT EXISTS idx_spied_offers_discovery_gin
ON spied_offers USING GIN(to_tsvector('portuguese', COALESCE(discovery_query, '')));

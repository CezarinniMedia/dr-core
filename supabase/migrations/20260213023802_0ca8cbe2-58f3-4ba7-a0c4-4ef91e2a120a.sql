
ALTER TABLE offer_domains
  ADD COLUMN IF NOT EXISTS first_seen DATE,
  ADD COLUMN IF NOT EXISTS discovery_source VARCHAR(100),
  ADD COLUMN IF NOT EXISTS discovery_query TEXT,
  ADD COLUMN IF NOT EXISTS traffic_share DECIMAL(5,2);

ALTER TABLE spied_offers
  ADD COLUMN IF NOT EXISTS domain_created_at DATE;

ALTER TABLE offer_funnel_steps
  ADD COLUMN IF NOT EXISTS domain_id UUID REFERENCES offer_domains(id) ON DELETE SET NULL;

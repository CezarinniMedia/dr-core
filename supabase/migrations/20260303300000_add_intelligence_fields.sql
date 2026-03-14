-- Migration: Add intelligence fields to spied_offers
-- Date: 2026-03-03
-- Purpose: Support offer UX redesign with funnel_type, creative_angle, scale_signals, relevance_score

ALTER TABLE spied_offers ADD COLUMN IF NOT EXISTS funnel_type VARCHAR(50);
ALTER TABLE spied_offers ADD COLUMN IF NOT EXISTS creative_angle VARCHAR(50);
ALTER TABLE spied_offers ADD COLUMN IF NOT EXISTS scale_signals JSONB DEFAULT '{}';
ALTER TABLE spied_offers ADD COLUMN IF NOT EXISTS relevance_score INTEGER CHECK (relevance_score >= 1 AND relevance_score <= 5);

-- ROLLBACK:
-- ALTER TABLE spied_offers DROP COLUMN IF EXISTS funnel_type;
-- ALTER TABLE spied_offers DROP COLUMN IF EXISTS creative_angle;
-- ALTER TABLE spied_offers DROP COLUMN IF EXISTS scale_signals;
-- ALTER TABLE spied_offers DROP COLUMN IF EXISTS relevance_score;

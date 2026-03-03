-- Creative Lifecycle Migration
-- Adds WINNER/KILLED lifecycle to criativos table
-- Status flow: DRAFT → TEST → WINNER | KILLED

-- 1. Add new lifecycle columns to criativos
ALTER TABLE criativos ADD COLUMN IF NOT EXISTS decision_metrics JSONB;
-- { ctr: number, cpa: number, roas: number }

ALTER TABLE criativos ADD COLUMN IF NOT EXISTS decision_notes TEXT;
-- Learning obrigatório para KILLED, opcional para WINNER

ALTER TABLE criativos ADD COLUMN IF NOT EXISTS decided_at TIMESTAMPTZ;
-- Quando a decisão WINNER/KILLED foi tomada

ALTER TABLE criativos ADD COLUMN IF NOT EXISTS test_started_at TIMESTAMPTZ;
-- Quando entrou em TEST (para calcular dias em teste)

-- 2. Migrate existing status values
-- PRODUCAO → TEST (em produção = em teste)
-- Backfill test_started_at with updated_at so >72h alerts work for migrated rows
UPDATE criativos SET status = 'TEST', test_started_at = COALESCE(updated_at, created_at, now()) WHERE status = 'PRODUCAO';

-- ATIVO → WINNER (ativo = estava funcionando)
UPDATE criativos SET status = 'WINNER', decided_at = updated_at WHERE status = 'ATIVO';

-- MORTO → KILLED (morto = parou de funcionar)
UPDATE criativos SET status = 'KILLED', decided_at = updated_at WHERE status = 'MORTO';

-- 3. Index for performance on new status values
CREATE INDEX IF NOT EXISTS idx_criativos_status_lifecycle ON criativos (status) WHERE status IN ('TEST', 'WINNER', 'KILLED');

-- 4. Index for test duration queries (finding >72h alerts)
CREATE INDEX IF NOT EXISTS idx_criativos_test_started ON criativos (test_started_at) WHERE status = 'TEST' AND test_started_at IS NOT NULL;

-- ROLLBACK:
-- DROP INDEX IF EXISTS idx_criativos_test_started;
-- DROP INDEX IF EXISTS idx_criativos_status_lifecycle;
-- UPDATE criativos SET status = 'MORTO' WHERE status = 'KILLED';
-- UPDATE criativos SET status = 'ATIVO' WHERE status = 'WINNER';
-- UPDATE criativos SET status = 'PRODUCAO' WHERE status = 'TEST';
-- ALTER TABLE criativos DROP COLUMN IF EXISTS test_started_at;
-- ALTER TABLE criativos DROP COLUMN IF EXISTS decided_at;
-- ALTER TABLE criativos DROP COLUMN IF EXISTS decision_notes;
-- ALTER TABLE criativos DROP COLUMN IF EXISTS decision_metrics;

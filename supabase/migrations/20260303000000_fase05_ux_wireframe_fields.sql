-- ============================================================
-- FASE 0.5: UX Design System — Database Migrations
-- Data Engineer: Dara | Date: 2026-03-03
--
-- Wireframes de origem:
--   WF-1: Daily Briefing       (sem alteracoes DB — queries existentes)
--   WF-2: Clone-to-Own         → ofertas +spied_offer_id +source
--   WF-3: Command Palette      (sem alteracoes DB — ILIKE queries)
--   WF-4: Creative Lifecycle   → ad_creatives +decision_metrics +decision_notes +decided_at +test_started_at
--   WF-5: Spike Notifications  → spike_alerts +seen_at
--
-- Modificacoes:
--   1. ofertas: +spied_offer_id (FK), +source (TEXT)
--   2. ad_creatives: +decision_metrics (JSONB), +decision_notes (TEXT),
--                    +decided_at (TIMESTAMPTZ), +test_started_at (TIMESTAMPTZ)
--   3. spike_alerts: +seen_at (TIMESTAMPTZ)
--
-- Total: 7 novos campos, 0 breaking changes, todas adicoes aditivas.
-- Rollback: ver secao DOWN MIGRATION no final do arquivo.
-- ============================================================


-- ============================================================
-- 1. TABELA: ofertas — Clone-to-Own (WF-2)
-- ============================================================
-- spied_offer_id: FK para spied_offers — vincula oferta propria a oferta espionada de origem.
-- source: Origem da oferta — 'manual' (criada do zero) ou 'clone' (clonada do Radar).

ALTER TABLE ofertas
  ADD COLUMN IF NOT EXISTS spied_offer_id UUID REFERENCES spied_offers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual'
    CHECK (source IN ('manual', 'clone'));

-- Index para buscar ofertas clonadas a partir da oferta espionada
CREATE INDEX IF NOT EXISTS idx_ofertas_spied_offer_id
  ON ofertas(spied_offer_id)
  WHERE spied_offer_id IS NOT NULL;

-- Index para filtrar por origem (manual vs clone)
CREATE INDEX IF NOT EXISTS idx_ofertas_source
  ON ofertas(source);

COMMENT ON COLUMN ofertas.spied_offer_id IS
  'FK para spied_offers. Null se criada manualmente. Preenchida no Clone-to-Own (WF-2).';
COMMENT ON COLUMN ofertas.source IS
  'Metodo de criacao: manual (do zero) ou clone (clonada de spied_offer). WF-2.';


-- ============================================================
-- 2. TABELA: ad_creatives — Creative Lifecycle WINNER/KILLED (WF-4)
-- ============================================================
-- decision_metrics: JSONB com metricas do teste { ctr, cpa, roas, ... }
-- decision_notes: Aprendizado obrigatorio para KILLED, opcional para WINNER
-- decided_at: Timestamp da decisao WINNER/KILLED
-- test_started_at: Timestamp de entrada em teste (calcula "Xd em teste")

ALTER TABLE ad_creatives
  ADD COLUMN IF NOT EXISTS decision_metrics JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS decision_notes TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS decided_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS test_started_at TIMESTAMPTZ DEFAULT NULL;

-- Index parcial: criativos em teste com data de inicio (query "criativos >72h")
CREATE INDEX IF NOT EXISTS idx_ad_creatives_testing_started
  ON ad_creatives(test_started_at)
  WHERE status = 'testing' AND test_started_at IS NOT NULL;

-- Index parcial: criativos com decisao tomada, ordenados por data
CREATE INDEX IF NOT EXISTS idx_ad_creatives_decided
  ON ad_creatives(decided_at DESC)
  WHERE decided_at IS NOT NULL;

COMMENT ON COLUMN ad_creatives.decision_metrics IS
  'JSONB com metricas do teste: { ctr: number, cpa: number, roas: number }. Preenchido na decisao WINNER/KILLED. WF-4.';
COMMENT ON COLUMN ad_creatives.decision_notes IS
  'Aprendizado do teste. OBRIGATORIO para KILLED, opcional para WINNER. WF-4.';
COMMENT ON COLUMN ad_creatives.decided_at IS
  'Timestamp de quando a decisao WINNER/KILLED foi tomada. WF-4.';
COMMENT ON COLUMN ad_creatives.test_started_at IS
  'Timestamp de quando entrou em status testing. Usado para calcular dias em teste. WF-4.';


-- ============================================================
-- 3. TABELA: spike_alerts — Spike Notification System (WF-5)
-- ============================================================
-- seen_at: Quando o usuario marcou o alerta como "visto".
-- NULL = nao visto (conta no badge). Timestamp = momento que foi marcado.

ALTER TABLE spike_alerts
  ADD COLUMN IF NOT EXISTS seen_at TIMESTAMPTZ DEFAULT NULL;

-- Index parcial: alertas nao vistos por workspace (usado para badge count)
CREATE INDEX IF NOT EXISTS idx_spike_alerts_unseen
  ON spike_alerts(workspace_id)
  WHERE seen_at IS NULL;

COMMENT ON COLUMN spike_alerts.seen_at IS
  'Timestamp de quando usuario marcou como visto. NULL = nao visto (badge count). WF-5.';


-- ============================================================
-- QUERIES DE REFERENCIA (nao executadas — doc para @dev)
-- ============================================================

-- [WF-1] Daily Briefing KPIs:
--   Criativos >72h em teste:
--     SELECT count(*) FROM ad_creatives
--     WHERE status = 'testing'
--       AND test_started_at < now() - interval '72 hours'
--       AND workspace_id = $1;
--
--   Spikes nao vistos (badge):
--     SELECT count(*) FROM spike_alerts
--     WHERE seen_at IS NULL
--       AND workspace_id = $1;

-- [WF-2] Clone-to-Own INSERT:
--   INSERT INTO ofertas (nome, vertical, ..., spied_offer_id, source, workspace_id)
--   VALUES ($nome || ' (clone)', $vertical, ..., $spied_offer_id, 'clone', $workspace_id);

-- [WF-5] Mark all spikes as seen:
--   UPDATE spike_alerts
--   SET seen_at = now(), updated_at = now()
--   WHERE workspace_id = $1 AND seen_at IS NULL;


-- ============================================================
-- DOWN MIGRATION (rollback)
-- ============================================================
-- Para reverter, execute manualmente:
--
-- -- 1. ofertas
-- DROP INDEX IF EXISTS idx_ofertas_source;
-- DROP INDEX IF EXISTS idx_ofertas_spied_offer_id;
-- ALTER TABLE ofertas DROP COLUMN IF EXISTS source;
-- ALTER TABLE ofertas DROP COLUMN IF EXISTS spied_offer_id;
--
-- -- 2. ad_creatives
-- DROP INDEX IF EXISTS idx_ad_creatives_decided;
-- DROP INDEX IF EXISTS idx_ad_creatives_testing_started;
-- ALTER TABLE ad_creatives DROP COLUMN IF EXISTS test_started_at;
-- ALTER TABLE ad_creatives DROP COLUMN IF EXISTS decided_at;
-- ALTER TABLE ad_creatives DROP COLUMN IF EXISTS decision_notes;
-- ALTER TABLE ad_creatives DROP COLUMN IF EXISTS decision_metrics;
--
-- -- 3. spike_alerts
-- DROP INDEX IF EXISTS idx_spike_alerts_unseen;
-- ALTER TABLE spike_alerts DROP COLUMN IF EXISTS seen_at;

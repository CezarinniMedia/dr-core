
-- Adicionar campos de comparação à trafego_historico
ALTER TABLE trafego_historico
  ADD COLUMN IF NOT EXISTS comparacao_batch_id UUID,
  ADD COLUMN IF NOT EXISTS rank_no_batch INT;

-- Index para busca por batch de comparação
CREATE INDEX IF NOT EXISTS idx_trafego_batch ON trafego_historico(comparacao_batch_id);

-- Tabela auxiliar para batches de comparação
CREATE TABLE IF NOT EXISTS comparacao_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  nome VARCHAR(255),
  dominios TEXT[] NOT NULL,
  data_criacao TIMESTAMPTZ DEFAULT NOW(),
  notas TEXT
);

ALTER TABLE comparacao_batches ENABLE ROW LEVEL SECURITY;

-- RLS policies separadas por operação usando is_workspace_member
CREATE POLICY "Users view comparacao_batches via workspace"
  ON comparacao_batches FOR SELECT
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users insert comparacao_batches via workspace"
  ON comparacao_batches FOR INSERT
  WITH CHECK (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users update comparacao_batches via workspace"
  ON comparacao_batches FOR UPDATE
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users delete comparacao_batches via workspace"
  ON comparacao_batches FOR DELETE
  USING (is_workspace_member(auth.uid(), workspace_id));

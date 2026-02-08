
-- ============================================
-- 1.2 Campos extras em ofertas
-- ============================================
ALTER TABLE ofertas ADD COLUMN IF NOT EXISTS urls_sites JSONB DEFAULT '[]';
ALTER TABLE ofertas ADD COLUMN IF NOT EXISTS fb_pages JSONB DEFAULT '[]';
ALTER TABLE ofertas ADD COLUMN IF NOT EXISTS reclame_aqui_termo TEXT;
ALTER TABLE ofertas ADD COLUMN IF NOT EXISTS escalada BOOLEAN DEFAULT FALSE;

-- ============================================
-- 1.3 Campos extras em import_batches (tabela já existe)
-- ============================================
ALTER TABLE import_batches ADD COLUMN IF NOT EXISTS linhas_processadas INT;
ALTER TABLE import_batches ADD COLUMN IF NOT EXISTS ofertas_criadas INT DEFAULT 0;
ALTER TABLE import_batches ADD COLUMN IF NOT EXISTS ofertas_atualizadas INT DEFAULT 0;
ALTER TABLE import_batches ADD COLUMN IF NOT EXISTS dominios_novos INT DEFAULT 0;
ALTER TABLE import_batches ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}';
ALTER TABLE import_batches ADD COLUMN IF NOT EXISTS erro_mensagem TEXT;

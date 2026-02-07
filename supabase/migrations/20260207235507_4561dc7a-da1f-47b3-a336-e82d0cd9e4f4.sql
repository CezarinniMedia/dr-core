-- ============================================
-- PLAN-04 SPY OVERHAUL: Schema Completo
-- ============================================

-- ============================================
-- 1. ALTER TABLE ofertas (ADD COLUMNS)
-- ============================================
ALTER TABLE ofertas ADD COLUMN IF NOT EXISTS dominio_principal VARCHAR(255);
ALTER TABLE ofertas ADD COLUMN IF NOT EXISTS nicho VARCHAR(100);
ALTER TABLE ofertas ADD COLUMN IF NOT EXISTS sub_nicho VARCHAR(100);
ALTER TABLE ofertas ADD COLUMN IF NOT EXISTS pais_alvo VARCHAR(50) DEFAULT 'BR';
ALTER TABLE ofertas ADD COLUMN IF NOT EXISTS idioma VARCHAR(20) DEFAULT 'pt-BR';
ALTER TABLE ofertas ADD COLUMN IF NOT EXISTS status_spy VARCHAR(50) DEFAULT 'RADAR';
ALTER TABLE ofertas ADD COLUMN IF NOT EXISTS prioridade VARCHAR(20) DEFAULT 'MEDIA';
ALTER TABLE ofertas ADD COLUMN IF NOT EXISTS trafego_atual INT;
ALTER TABLE ofertas ADD COLUMN IF NOT EXISTS trafego_tendencia DECIMAL(5,2);
ALTER TABLE ofertas ADD COLUMN IF NOT EXISTS trafego_atualizado_em TIMESTAMPTZ;
ALTER TABLE ofertas ADD COLUMN IF NOT EXISTS checkout_provider VARCHAR(100);
ALTER TABLE ofertas ADD COLUMN IF NOT EXISTS vsl_player VARCHAR(100);
ALTER TABLE ofertas ADD COLUMN IF NOT EXISTS tem_quiz BOOLEAN DEFAULT FALSE;
ALTER TABLE ofertas ADD COLUMN IF NOT EXISTS tem_cloaker BOOLEAN DEFAULT FALSE;
ALTER TABLE ofertas ADD COLUMN IF NOT EXISTS plataforma_quiz VARCHAR(100);
ALTER TABLE ofertas ADD COLUMN IF NOT EXISTS notas_spy TEXT;
ALTER TABLE ofertas ADD COLUMN IF NOT EXISTS score_potencial INT;
ALTER TABLE ofertas ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';

CREATE INDEX IF NOT EXISTS idx_ofertas_dominio ON ofertas(dominio_principal);
CREATE INDEX IF NOT EXISTS idx_ofertas_status_spy ON ofertas(status_spy);
CREATE INDEX IF NOT EXISTS idx_ofertas_nicho ON ofertas(nicho);
CREATE INDEX IF NOT EXISTS idx_ofertas_prioridade ON ofertas(prioridade);

-- ============================================
-- 2. TABELA: oferta_dominios
-- ============================================
CREATE TABLE oferta_dominios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oferta_id UUID REFERENCES ofertas(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  dominio VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) DEFAULT 'PRINCIPAL',
  whois_registrant TEXT,
  whois_criado_em DATE,
  whois_expira_em DATE,
  whois_nameservers TEXT[],
  ip_address VARCHAR(45),
  hosting_provider VARCHAR(100),
  trafego_ultimo INT,
  trafego_fonte VARCHAR(50),
  is_principal BOOLEAN DEFAULT FALSE,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE oferta_dominios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view oferta_dominios via workspace" ON oferta_dominios FOR SELECT
  USING (is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Users insert oferta_dominios via workspace" ON oferta_dominios FOR INSERT
  WITH CHECK (is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Users update oferta_dominios via workspace" ON oferta_dominios FOR UPDATE
  USING (is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Users delete oferta_dominios via workspace" ON oferta_dominios FOR DELETE
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE INDEX idx_oferta_dominios_oferta ON oferta_dominios(oferta_id);
CREATE INDEX idx_oferta_dominios_dominio ON oferta_dominios(dominio);
CREATE UNIQUE INDEX idx_oferta_dominios_unique ON oferta_dominios(oferta_id, dominio);

-- ============================================
-- 3. TABELA: trafego_historico
-- ============================================
CREATE TABLE trafego_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oferta_id UUID REFERENCES ofertas(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  dominio VARCHAR(255) NOT NULL,
  periodo_tipo VARCHAR(10) NOT NULL,
  periodo_data DATE NOT NULL,
  visitas INT,
  visitas_unicas INT,
  pageviews INT,
  bounce_rate DECIMAL(5,2),
  pages_per_visit DECIMAL(5,2),
  avg_visit_duration INT,
  pct_direct DECIMAL(5,2),
  pct_search DECIMAL(5,2),
  pct_social DECIMAL(5,2),
  pct_referral DECIMAL(5,2),
  pct_paid DECIMAL(5,2),
  pct_email DECIMAL(5,2),
  pct_display DECIMAL(5,2),
  pais_principal VARCHAR(5),
  pct_pais_principal DECIMAL(5,2),
  fonte_dados VARCHAR(50) NOT NULL,
  import_batch_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dominio, periodo_tipo, periodo_data, workspace_id)
);

ALTER TABLE trafego_historico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view trafego via workspace" ON trafego_historico FOR SELECT
  USING (is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Users insert trafego via workspace" ON trafego_historico FOR INSERT
  WITH CHECK (is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Users update trafego via workspace" ON trafego_historico FOR UPDATE
  USING (is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Users delete trafego via workspace" ON trafego_historico FOR DELETE
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE INDEX idx_trafego_oferta ON trafego_historico(oferta_id);
CREATE INDEX idx_trafego_dominio ON trafego_historico(dominio);
CREATE INDEX idx_trafego_periodo ON trafego_historico(periodo_data);
CREATE INDEX idx_trafego_dominio_periodo ON trafego_historico(dominio, periodo_data);

-- ============================================
-- 4. TABELA: fontes_captura
-- ============================================
CREATE TABLE fontes_captura (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oferta_id UUID REFERENCES ofertas(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  metodo VARCHAR(50) NOT NULL,
  query_usada TEXT,
  footprint_usado TEXT,
  keyword_usada TEXT,
  footprint_categoria VARCHAR(50),
  resultado_bruto TEXT,
  quantidade_resultados INT,
  data_captura TIMESTAMPTZ DEFAULT NOW(),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fontes_captura ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view fontes via workspace" ON fontes_captura FOR SELECT
  USING (is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Users insert fontes via workspace" ON fontes_captura FOR INSERT
  WITH CHECK (is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Users update fontes via workspace" ON fontes_captura FOR UPDATE
  USING (is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Users delete fontes via workspace" ON fontes_captura FOR DELETE
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE INDEX idx_fontes_oferta ON fontes_captura(oferta_id);
CREATE INDEX idx_fontes_metodo ON fontes_captura(metodo);
CREATE INDEX idx_fontes_footprint ON fontes_captura(footprint_categoria);

-- ============================================
-- 5. TABELA: ad_bibliotecas
-- ============================================
CREATE TABLE ad_bibliotecas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oferta_id UUID REFERENCES ofertas(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  plataforma VARCHAR(50) NOT NULL,
  pagina_nome VARCHAR(255),
  pagina_id VARCHAR(100),
  pagina_url TEXT,
  biblioteca_url TEXT,
  total_anuncios INT,
  total_anuncios_historico INT,
  links_destino JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'ATIVO',
  primeira_detecao DATE,
  ultima_verificacao DATE,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ad_bibliotecas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view ad_bibliotecas via workspace" ON ad_bibliotecas FOR SELECT
  USING (is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Users insert ad_bibliotecas via workspace" ON ad_bibliotecas FOR INSERT
  WITH CHECK (is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Users update ad_bibliotecas via workspace" ON ad_bibliotecas FOR UPDATE
  USING (is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Users delete ad_bibliotecas via workspace" ON ad_bibliotecas FOR DELETE
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE INDEX idx_ad_bibliotecas_oferta ON ad_bibliotecas(oferta_id);
CREATE INDEX idx_ad_bibliotecas_plataforma ON ad_bibliotecas(plataforma);

-- ============================================
-- 6. TABELA: funil_paginas
-- ============================================
CREATE TABLE funil_paginas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oferta_id UUID REFERENCES ofertas(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  ordem INT NOT NULL,
  tipo_pagina VARCHAR(50) NOT NULL,
  nome VARCHAR(255),
  url TEXT,
  url_real TEXT,
  produto_nome TEXT,
  produto_promessa TEXT,
  preco DECIMAL(10,2),
  preco_parcelado TEXT,
  screenshot_url TEXT,
  html_completo TEXT,
  html_arquivo_url TEXT,
  stack_detectado JSONB DEFAULT '[]',
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE funil_paginas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view funil_paginas via workspace" ON funil_paginas FOR SELECT
  USING (is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Users insert funil_paginas via workspace" ON funil_paginas FOR INSERT
  WITH CHECK (is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Users update funil_paginas via workspace" ON funil_paginas FOR UPDATE
  USING (is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Users delete funil_paginas via workspace" ON funil_paginas FOR DELETE
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE INDEX idx_funil_paginas_oferta ON funil_paginas(oferta_id);
CREATE INDEX idx_funil_paginas_tipo ON funil_paginas(tipo_pagina);

-- ============================================
-- 7. TABELA: arsenal_footprints
-- ============================================
CREATE TABLE arsenal_footprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  footprint TEXT NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  plataforma VARCHAR(100),
  regiao VARCHAR(50),
  ferramenta VARCHAR(50) NOT NULL,
  query_publicwww TEXT,
  query_google_dorks TEXT,
  eficacia VARCHAR(20) DEFAULT 'MEDIA',
  resultados_tipicos INT,
  ultima_verificacao DATE,
  vezes_usado INT DEFAULT 0,
  combina_com JSONB DEFAULT '[]',
  notas TEXT,
  is_favorito BOOLEAN DEFAULT FALSE,
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE arsenal_footprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view footprints via workspace" ON arsenal_footprints FOR SELECT
  USING (is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Users insert footprints via workspace" ON arsenal_footprints FOR INSERT
  WITH CHECK (is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Users update footprints via workspace" ON arsenal_footprints FOR UPDATE
  USING (is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Users delete footprints via workspace" ON arsenal_footprints FOR DELETE
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE INDEX idx_arsenal_fp_categoria ON arsenal_footprints(categoria);
CREATE INDEX idx_arsenal_fp_ferramenta ON arsenal_footprints(ferramenta);
CREATE INDEX idx_arsenal_fp_plataforma ON arsenal_footprints(plataforma);
CREATE INDEX idx_arsenal_fp_eficacia ON arsenal_footprints(eficacia);

-- ============================================
-- 8. TABELA: arsenal_keywords
-- ============================================
CREATE TABLE arsenal_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  idioma VARCHAR(20) DEFAULT 'pt-BR',
  tipo VARCHAR(50) NOT NULL,
  plataforma VARCHAR(50),
  nichos JSONB DEFAULT '[]',
  eficacia VARCHAR(20) DEFAULT 'MEDIA',
  vezes_usado INT DEFAULT 0,
  ultima_verificacao DATE,
  combinacoes JSONB DEFAULT '[]',
  notas TEXT,
  is_favorito BOOLEAN DEFAULT FALSE,
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE arsenal_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view keywords via workspace" ON arsenal_keywords FOR SELECT
  USING (is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Users insert keywords via workspace" ON arsenal_keywords FOR INSERT
  WITH CHECK (is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Users update keywords via workspace" ON arsenal_keywords FOR UPDATE
  USING (is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Users delete keywords via workspace" ON arsenal_keywords FOR DELETE
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE INDEX idx_arsenal_kw_tipo ON arsenal_keywords(tipo);
CREATE INDEX idx_arsenal_kw_plataforma ON arsenal_keywords(plataforma);
CREATE INDEX idx_arsenal_kw_idioma ON arsenal_keywords(idioma);

-- ============================================
-- 9. TABELA: arsenal_dorks
-- ============================================
CREATE TABLE arsenal_dorks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  dork_query TEXT NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  objetivo TEXT,
  ferramenta VARCHAR(100),
  url_ferramenta TEXT,
  eficacia VARCHAR(20) DEFAULT 'MEDIA',
  vezes_usado INT DEFAULT 0,
  exemplo_resultado TEXT,
  notas TEXT,
  is_favorito BOOLEAN DEFAULT FALSE,
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE arsenal_dorks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view dorks via workspace" ON arsenal_dorks FOR SELECT
  USING (is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Users insert dorks via workspace" ON arsenal_dorks FOR INSERT
  WITH CHECK (is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Users update dorks via workspace" ON arsenal_dorks FOR UPDATE
  USING (is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Users delete dorks via workspace" ON arsenal_dorks FOR DELETE
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE INDEX idx_arsenal_dorks_tipo ON arsenal_dorks(tipo);

-- ============================================
-- 10. TABELA: import_batches
-- ============================================
CREATE TABLE import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  arquivo_nome VARCHAR(255),
  arquivo_url TEXT,
  total_linhas INT,
  linhas_importadas INT,
  linhas_ignoradas INT,
  linhas_erro INT,
  ofertas_novas_criadas INT DEFAULT 0,
  ofertas_existentes_atualizadas INT DEFAULT 0,
  contexto JSONB,
  status VARCHAR(50) DEFAULT 'PROCESSING',
  erro_msg TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE import_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view imports via workspace" ON import_batches FOR SELECT
  USING (is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Users insert imports via workspace" ON import_batches FOR INSERT
  WITH CHECK (is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Users update imports via workspace" ON import_batches FOR UPDATE
  USING (is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Users delete imports via workspace" ON import_batches FOR DELETE
  USING (is_workspace_member(auth.uid(), workspace_id));

-- ============================================
-- FIM DA MIGRATION
-- ============================================
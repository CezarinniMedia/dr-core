
-- ============================================
-- MIGRATION: competitors → ofertas (spy fields)
-- SAFE: Não deleta tabelas antigas
-- IDEMPOTENT: Pode rodar múltiplas vezes
-- ============================================

DO $$
BEGIN

-- Checar se tabela competitors existe
IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'competitors' AND table_schema = 'public') THEN

  -- ============================================
  -- STEP 1: Migrar competitors → ofertas
  -- ============================================
  
  INSERT INTO ofertas (
    workspace_id, nome, slug, dominio_principal,
    status_spy, prioridade, trafego_atual, notas_spy,
    created_at, updated_at
  )
  SELECT
    c.workspace_id,
    c.nome,
    LOWER(REGEXP_REPLACE(c.nome, '[^a-zA-Z0-9]', '-', 'g')),
    c.dominio,
    CASE 
      WHEN c.status_tracking = 'HOT' THEN 'MONITORANDO'
      WHEN c.status_tracking = 'WARM' THEN 'TRIAGEM'
      WHEN c.status_tracking = 'COLD' THEN 'ARQUIVADA'
      ELSE 'RADAR'
    END,
    CASE 
      WHEN c.status_tracking = 'HOT' THEN 'ALTA'
      WHEN c.status_tracking = 'WARM' THEN 'MEDIA'
      ELSE 'BAIXA'
    END,
    CASE 
      WHEN c.traffic_score IS NOT NULL THEN c.traffic_score * 1000
      ELSE NULL
    END,
    c.notas,
    c.created_at,
    COALESCE(c.updated_at, c.created_at, now())
  FROM competitors c
  WHERE NOT EXISTS (
    SELECT 1 FROM ofertas o
    WHERE o.dominio_principal = c.dominio
    AND o.workspace_id = c.workspace_id
  )
  AND c.workspace_id IS NOT NULL;

  RAISE NOTICE 'Step 1 done: competitors migrated to ofertas';

  -- ============================================
  -- STEP 2: Migrar ad_creatives → associar oferta_id
  -- ============================================
  
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'ad_creatives' 
    AND column_name = 'competitor_id'
    AND table_schema = 'public'
  ) THEN
  
    -- Adicionar coluna oferta_id se não existir
    IF NOT EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_name = 'ad_creatives'
      AND column_name = 'oferta_id'
      AND table_schema = 'public'
    ) THEN
      ALTER TABLE ad_creatives ADD COLUMN oferta_id UUID REFERENCES ofertas(id);
    END IF;

    -- Associar ad_creatives ao oferta_id correspondente
    UPDATE ad_creatives ac
    SET oferta_id = (
      SELECT o.id FROM ofertas o
      JOIN competitors c ON c.workspace_id = o.workspace_id 
        AND c.dominio = o.dominio_principal
      WHERE c.id = ac.competitor_id
      LIMIT 1
    )
    WHERE ac.competitor_id IS NOT NULL
    AND ac.oferta_id IS NULL;

    RAISE NOTICE 'Step 2 done: ad_creatives linked to ofertas';
  END IF;

  -- ============================================
  -- STEP 3: Migrar funnel_maps → funil_paginas
  -- ============================================
  
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'funnel_maps' 
    AND table_schema = 'public'
  ) THEN

    INSERT INTO funil_paginas (
      workspace_id, oferta_id, ordem, tipo_pagina, nome, url, preco,
      created_at
    )
    SELECT
      fm.workspace_id,
      (
        SELECT o.id FROM ofertas o
        JOIN competitors c ON c.workspace_id = o.workspace_id 
          AND c.dominio = o.dominio_principal
        WHERE c.id = fm.competitor_id 
        LIMIT 1
      ),
      COALESCE((step_data->>'step')::int, 0),
      UPPER(COALESCE(step_data->>'type', 'PAGINA')),
      COALESCE(step_data->>'type', 'Página'),
      step_data->>'url',
      (step_data->>'price')::decimal,
      fm.created_at
    FROM funnel_maps fm,
      jsonb_array_elements(fm.steps) AS step_data
    WHERE fm.steps IS NOT NULL
    AND fm.competitor_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM funil_paginas fp
      WHERE fp.workspace_id = fm.workspace_id
      AND fp.url = (step_data->>'url')
    );

    RAISE NOTICE 'Step 3 done: funnel_maps migrated to funil_paginas';
  END IF;

ELSE
  RAISE NOTICE 'Tabela competitors não encontrada — migration skipped (projeto novo ou já migrado)';
END IF;

END
$$;

# RPC Spec: Traffic Intelligence Performance Fix

> **Date:** 2026-03-09
> **Author:** Dex (@dev)
> **Target:** Dara (@data-engineer)
> **Priority:** CRITICAL — view unusable at current data volumes (12k offers + 87k traffic records)

---

## Problema Atual

A Traffic Intelligence View faz **2 fetches de tabela inteira** (12k ofertas + 87k registros de trafego) e depois **junta e agrega tudo em JavaScript** no browser.

```
Frontend hoje:
  fetchAllOffersLite()     → 12k rows (5 fields)    → ~15MB
  fetchAllTrafficRows()    → 87k rows (4 fields)    → ~40MB
  compareTraffic()         → O(m + n*k) em JS        → 200-800ms CPU
                              m=87k traffic records grouping
                              n=12k offers * k=~7 avg records/offer
```

**Impacto:** Load time 1-2s, CPU spike, ~55MB de memoria, re-agrega a cada mudanca de filtro/sort.

---

## Solucao: 2 RPCs Novas

### RPC 1: `get_traffic_intel_rows`

**Objetivo:** Substituir `fetchAllOffersLite()` + `fetchAllTrafficRows()` + `compareTraffic()` com uma UNICA query server-side que retorna dados ja agregados, filtrados, ordenados e paginados.

#### Parametros

| Param | Tipo | Default | Descricao |
|-------|------|---------|-----------|
| `p_workspace_id` | UUID | required | Workspace do usuario |
| `p_source` | TEXT | `'similarweb'` | `'similarweb'` ou `'semrush'` (filtro por `source` column, nao `period_type`) |
| `p_date_from` | TEXT | NULL | `'YYYY-MM'` — inicio do range (NULL = sem limite) |
| `p_date_to` | TEXT | NULL | `'YYYY-MM'` — fim do range (NULL = sem limite) |
| `p_statuses` | TEXT[] | NULL | Filtro por status (`['HOT','SCALING']`). NULL = todos |
| `p_search` | TEXT | NULL | Busca ILIKE em `nome` e `main_domain`. NULL = sem filtro |
| `p_sort_field` | TEXT | `'last_month'` | Campo de ordenacao (ver tabela abaixo) |
| `p_sort_dir` | TEXT | `'desc'` | `'asc'` ou `'desc'` |
| `p_page` | INT | `0` | Pagina (zero-based) |
| `p_page_size` | INT | `25` | Linhas por pagina (max 200, ou -1 para todas) |

#### Campos de ordenacao validos (`p_sort_field`)

| Valor | Ordena por |
|-------|-----------|
| `'last_month'` | Visitas do ultimo mes no range |
| `'variation'` | Variacao percentual (ultimo vs penultimo mes) |
| `'peak'` | Pico de visitas no range |
| `'nome'` | Nome da oferta (alphabetical) |
| `'status'` | Status (alphabetical) |
| `'discovered'` | Data de descoberta |

#### Retorno

```sql
RETURNS TABLE(
  id              UUID,
  nome            TEXT,
  main_domain     TEXT,
  status          TEXT,
  vertical        TEXT,
  discovered_at   DATE,
  last_month      BIGINT,      -- visitas do ultimo mes no range
  prev_month      BIGINT,      -- visitas do penultimo mes no range
  variation       NUMERIC(8,2),-- ((last - prev) / prev) * 100
  peak            BIGINT,      -- MAX(visits) no range
  peak_date       TEXT,        -- 'YYYY-MM' do pico
  sparkline       INT[],       -- array de visitas mensais (cronologico, dentro do range)
  sparkline_months TEXT[],     -- array de meses paralelo ao sparkline: ['2025-01','2025-02',...]
  has_traffic     BOOLEAN,     -- true se tem QUALQUER registro de trafego (sem filtros de data/dominio)
  total_count     BIGINT       -- total de rows SEM paginacao (para UI calcular total pages)
)
```

> **NOTA:** `sparkline_months` e paralelo a `sparkline` — o frontend reconstroi `monthlyData` com:
> `new Map(sparkline_months.map((m, i) => [m, sparkline[i]]))`

#### Logica SQL (pseudocodigo)

```sql
-- CTE 1: Filtrar ofertas base (com validacao de workspace via auth.uid())
WITH offers_base AS (
  SELECT id, nome, main_domain, status, vertical, discovered_at
  FROM spied_offers
  WHERE workspace_id = p_workspace_id
    AND workspace_id IN (
      SELECT wm.workspace_id FROM workspace_members wm WHERE wm.user_id = auth.uid()
    )
    AND (p_statuses IS NULL OR status = ANY(p_statuses))
    AND (p_search IS NULL OR (
      nome ILIKE '%' || p_search || '%'
      OR main_domain ILIKE '%' || p_search || '%'
    ))
),

-- CTE 2: Trafego do main_domain (quando oferta tem main_domain E existem registros para ele)
traffic_main AS (
  SELECT
    t.spied_offer_id,
    to_char(t.period_date, 'YYYY-MM') AS month,
    MAX(COALESCE(t.visits, 0)) AS visits
  FROM offer_traffic_data t
  INNER JOIN offers_base o ON o.id = t.spied_offer_id
  WHERE o.main_domain IS NOT NULL
    AND t.domain = o.main_domain
    AND (
      (p_source = 'similarweb' AND t.source = 'similarweb')
      OR (p_source != 'similarweb' AND t.source != 'similarweb')
    )
    AND (p_date_from IS NULL OR t.period_date >= to_date(p_date_from || '-01', 'YYYY-MM-DD'))
    AND (p_date_to IS NULL OR t.period_date < (to_date(p_date_to || '-01', 'YYYY-MM-DD') + interval '1 month'))
  GROUP BY t.spied_offer_id, to_char(t.period_date, 'YYYY-MM')
),

-- CTE 3: Ofertas que TEM main_domain mas NAO tiveram registros em traffic_main (fallback)
--         + Ofertas que NAO tem main_domain (usam todos os dominios)
--         FALLBACK: replica logica do compareTraffic() JS — se main_domain nao tem dados, usa tudo
traffic_fallback AS (
  SELECT
    t.spied_offer_id,
    to_char(t.period_date, 'YYYY-MM') AS month,
    MAX(COALESCE(t.visits, 0)) AS visits
  FROM offer_traffic_data t
  INNER JOIN offers_base o ON o.id = t.spied_offer_id
  WHERE (
    -- Caso 1: oferta sem main_domain → usa todos os dominios
    o.main_domain IS NULL
    OR
    -- Caso 2: oferta com main_domain mas SEM registros em traffic_main → fallback para todos
    (o.main_domain IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM traffic_main tm WHERE tm.spied_offer_id = o.id
    ))
  )
  AND (
    (p_source = 'similarweb' AND t.source = 'similarweb')
    OR (p_source != 'similarweb' AND t.source != 'similarweb')
  )
  AND (p_date_from IS NULL OR t.period_date >= to_date(p_date_from || '-01', 'YYYY-MM-DD'))
  AND (p_date_to IS NULL OR t.period_date < (to_date(p_date_to || '-01', 'YYYY-MM-DD') + interval '1 month'))
  GROUP BY t.spied_offer_id, to_char(t.period_date, 'YYYY-MM')
),

-- CTE 4: Uniao dos dois caminhos (main_domain + fallback, sem overlap)
traffic_agg AS (
  SELECT * FROM traffic_main
  UNION ALL
  SELECT * FROM traffic_fallback
),

-- CTE 5: has_traffic — verifica QUALQUER registro (sem filtros de data/dominio)
--         Mantém paridade com JS: hasTrafficData = allRecords.length > 0
offer_has_traffic AS (
  SELECT DISTINCT t.spied_offer_id, TRUE AS has_traffic
  FROM offer_traffic_data t
  INNER JOIN offers_base o ON o.id = t.spied_offer_id
  WHERE (
    (p_source = 'similarweb' AND t.source = 'similarweb')
    OR (p_source != 'similarweb' AND t.source != 'similarweb')
  )
),

-- CTE 6: Agregar metricas por oferta
offer_metrics AS (
  SELECT
    spied_offer_id,
    -- Sparkline (array cronologico)
    array_agg(visits ORDER BY month) AS sparkline,
    -- Sparkline months (paralelo ao sparkline — frontend reconstroi monthlyData)
    array_agg(month ORDER BY month) AS sparkline_months,
    -- Last month = ultimo valor no range
    (array_agg(visits ORDER BY month DESC))[1] AS last_month,
    -- Prev month = penultimo valor no range
    (array_agg(visits ORDER BY month DESC))[2] AS prev_month,
    -- Peak
    MAX(visits) AS peak,
    -- Peak date (mes do pico)
    (array_agg(month ORDER BY visits DESC))[1] AS peak_date
  FROM traffic_agg
  GROUP BY spied_offer_id
),

-- CTE 7: Resultado final com variacao calculada
result AS (
  SELECT
    o.id, o.nome, o.main_domain, o.status, o.vertical, o.discovered_at,
    COALESCE(m.last_month, 0) AS last_month,
    COALESCE(m.prev_month, 0) AS prev_month,
    CASE
      WHEN COALESCE(m.prev_month, 0) > 0
      THEN ROUND(((m.last_month::NUMERIC - m.prev_month) / m.prev_month) * 100, 2)
      WHEN COALESCE(m.last_month, 0) > 0 THEN 100.00
      ELSE 0.00
    END AS variation,
    COALESCE(m.peak, 0) AS peak,
    COALESCE(m.peak_date, '') AS peak_date,
    COALESCE(m.sparkline, ARRAY[]::INT[]) AS sparkline,
    COALESCE(m.sparkline_months, ARRAY[]::TEXT[]) AS sparkline_months,
    COALESCE(ht.has_traffic, FALSE) AS has_traffic,
    COUNT(*) OVER () AS total_count
  FROM offers_base o
  LEFT JOIN offer_metrics m ON m.spied_offer_id = o.id
  LEFT JOIN offer_has_traffic ht ON ht.spied_offer_id = o.id
)

-- Ordenacao dinamica + Paginacao
SELECT * FROM result
ORDER BY
  CASE WHEN p_sort_field = 'last_month' AND p_sort_dir = 'desc' THEN last_month END DESC NULLS LAST,
  CASE WHEN p_sort_field = 'last_month' AND p_sort_dir = 'asc'  THEN last_month END ASC  NULLS LAST,
  CASE WHEN p_sort_field = 'variation'  AND p_sort_dir = 'desc' THEN variation  END DESC NULLS LAST,
  CASE WHEN p_sort_field = 'variation'  AND p_sort_dir = 'asc'  THEN variation  END ASC  NULLS LAST,
  CASE WHEN p_sort_field = 'peak'       AND p_sort_dir = 'desc' THEN peak       END DESC NULLS LAST,
  CASE WHEN p_sort_field = 'peak'       AND p_sort_dir = 'asc'  THEN peak       END ASC  NULLS LAST,
  CASE WHEN p_sort_field = 'nome'       AND p_sort_dir = 'desc' THEN nome       END DESC NULLS LAST,
  CASE WHEN p_sort_field = 'nome'       AND p_sort_dir = 'asc'  THEN nome       END ASC  NULLS LAST,
  CASE WHEN p_sort_field = 'status'     AND p_sort_dir = 'desc' THEN status     END DESC NULLS LAST,
  CASE WHEN p_sort_field = 'status'     AND p_sort_dir = 'asc'  THEN status     END ASC  NULLS LAST,
  CASE WHEN p_sort_field = 'discovered' AND p_sort_dir = 'desc' THEN discovered_at END DESC NULLS LAST,
  CASE WHEN p_sort_field = 'discovered' AND p_sort_dir = 'asc'  THEN discovered_at END ASC  NULLS LAST
LIMIT CASE WHEN p_page_size > 0 THEN p_page_size ELSE NULL END
OFFSET CASE WHEN p_page_size > 0 THEN p_page * p_page_size ELSE 0 END;
```

#### Notas importantes para implementacao

1. **Filtro de source:** Manter a mesma logica atual — `similarweb` = `source = 'similarweb'`, `semrush` = `source != 'similarweb'` (porque existem varios sources semrush: `semrush_bulk`, `semrush_csv`, `semrush_trend`, etc.)

2. **main_domain priority COM FALLBACK (QA-FIX GAP-1):** A logica tem 3 caminhos:
   - Oferta TEM main_domain E existem registros para ele → usar main_domain records (CTE `traffic_main`)
   - Oferta TEM main_domain mas NAO existem registros → FALLBACK para todos os dominios (CTE `traffic_fallback`)
   - Oferta NAO tem main_domain → usar todos os dominios (CTE `traffic_fallback`)
   Isso replica exatamente a logica do `compareTraffic()` JS (linhas 121-126 de trafficService.ts).

3. **Agregacao por mes:** Usar `MAX(visits)` por mes (nao SUM). Isso e porque o mesmo dominio pode ter multiplos registros no mesmo mes de fontes diferentes, e o MAX e a logica correta (consistente com o frontend atual).

4. **Variacao:** `((last - prev) / prev) * 100`. Se prev = 0 e last > 0, retornar 100. Se ambos = 0, retornar 0.

5. **total_count via window function:** `COUNT(*) OVER ()` retorna o total de linhas antes da paginacao. O frontend usa isso para calcular total de paginas. E eficiente porque o Postgres calcula uma vez.

6. **SECURITY DEFINER + workspace check (QA-FIX GAP-4):** CTE `offers_base` valida que `auth.uid()` pertence ao workspace via subquery em `workspace_members`. Igual padrao das RPCs existentes (`get_traffic_comparison` linhas 431-435).

7. **sparkline_months (QA-FIX GAP-2):** Array `TEXT[]` paralelo ao `sparkline INT[]`. Cada posicao corresponde ao mesmo indice. O frontend reconstroi `monthlyData` com: `new Map(sparkline_months.map((m, i) => [m, sparkline[i]]))`.

8. **has_traffic semantica (QA-FIX GAP-5):** CTE `offer_has_traffic` verifica existencia de QUALQUER registro de trafego para a oferta, SEM filtros de data ou dominio. Isso mantem paridade com o JS (`allRecords.length > 0`).

9. **Date filtering SARGable (QA-FIX GAP-3):** Filtros de data usam `to_date()` no parametro (nao `to_char()` na coluna), permitindo uso do index em `period_date`:
   ```sql
   t.period_date >= to_date(p_date_from || '-01', 'YYYY-MM-DD')
   t.period_date < (to_date(p_date_to || '-01', 'YYYY-MM-DD') + interval '1 month')
   ```

---

### RPC 2: `get_traffic_intel_available_months`

**Objetivo:** Retornar os meses disponiveis para o MonthRangePicker, sem precisar fetch 87k registros.

#### Parametros

| Param | Tipo | Default | Descricao |
|-------|------|---------|-----------|
| `p_workspace_id` | UUID | required | Workspace do usuario |
| `p_source` | TEXT | `'similarweb'` | Fonte de trafego |

#### Retorno

```sql
RETURNS TABLE(month TEXT)  -- 'YYYY-MM' format, sorted ascending
```

#### Logica SQL

```sql
SELECT DISTINCT to_char(period_date, 'YYYY-MM') AS month
FROM offer_traffic_data
WHERE workspace_id = p_workspace_id
  AND workspace_id IN (
    SELECT wm.workspace_id FROM workspace_members wm WHERE wm.user_id = auth.uid()
  )
  AND (
    (p_source = 'similarweb' AND source = 'similarweb')
    OR (p_source != 'similarweb' AND source != 'similarweb')
  )
ORDER BY month;
```

---

## Indexes Necessarios

Os indexes atuais sao insuficientes para estas queries:

```sql
-- Existentes:
-- idx_offer_traffic_domain ON offer_traffic_data(domain)
-- idx_offer_traffic_period ON offer_traffic_data(period_date)

-- NOVOS (necessarios para performance):

-- Composite index para o filtro principal da RPC
CREATE INDEX idx_otd_source_offer_period
  ON offer_traffic_data(source, spied_offer_id, period_date);

-- Index para busca textual de ofertas (ILIKE)
CREATE INDEX idx_spied_offers_nome_trgm
  ON spied_offers USING gin(nome gin_trgm_ops);

-- Index para busca por main_domain
CREATE INDEX idx_spied_offers_main_domain_trgm
  ON spied_offers USING gin(main_domain gin_trgm_ops);

-- OBS: gin_trgm_ops requer extensao pg_trgm.
-- Se nao estiver habilitada, usar indexes btree simples
-- e aceitar que ILIKE fara seq scan (aceitavel para 12k rows).
```

---

## Dados para Chart (sem RPC nova)

Quando o usuario seleciona ofertas para o grafico (max 50), o frontend ja pode usar a RPC existente `get_traffic_comparison(p_offer_ids, p_start_date, p_end_date)` que retorna dados granulares por dominio/mes. Nao precisa de RPC nova para isso.

---

## O que muda no Frontend (Dex faz depois)

Apos Dara criar as RPCs:

1. **`useTrafficIntelligence.ts`** — Reescrever para chamar `get_traffic_intel_rows` com parametros de filtro/sort/paginacao em vez de fetch all + compareTraffic
2. **`types.ts`** — Remover `fetchAllOffersLite()` e `fetchAllTrafficRows()`
3. **`trafficService.ts`** — `compareTraffic()` vira dead code (manter como fallback temporario, remover depois)
4. React Query key inclui todos os parametros: `['traffic-intel-rows', source, dateFrom, dateTo, statuses, search, sortField, sortDir, page, pageSize]`

---

## Impacto Esperado

| Metrica | Antes | Depois |
|---------|-------|--------|
| Dados transferidos | ~55MB (87k + 12k rows) | ~5KB (25 rows paginadas) |
| Tempo de load | 1-2s | <200ms |
| CPU no browser | 200-800ms (compareTraffic) | ~0ms (dados ja prontos) |
| Memoria | ~60MB | ~1MB |
| Mudanca de filtro | Re-agrega 87k rows | Nova query ~100ms |

---

## Compatibilidade

- **NAO quebra nada existente** — as RPCs sao novas, nao substituem RPCs existentes
- **Rollback facil** — se algo der errado, o frontend volta a usar o fetch direto (codigo antigo nao sera deletado imediatamente)
- **Dados chartados** usam `get_traffic_comparison` (ja existente, nao muda)

---

## QA Review Log

> **Reviewer:** Quinn (@qa) — 2026-03-09
> **Verdict:** CONCERNS (6 gaps found)
> **Resolution:** All 6 gaps fixed by Dex — 2026-03-09

| # | Severidade | Gap | Status |
|---|-----------|-----|--------|
| 1 | CRITICO | Fallback main_domain omitido | FIXED — CTEs traffic_main + traffic_fallback |
| 2 | CRITICO | monthlyData ausente no retorno | FIXED — sparkline_months TEXT[] adicionado |
| 3 | HIGH | to_char() no WHERE impede index | FIXED — to_date() no parametro |
| 4 | HIGH | Auth workspace ausente no SQL | FIXED — workspace_members check adicionado |
| 5 | MEDIUM | has_traffic semantica diferente | FIXED — CTE offer_has_traffic sem filtros |
| 6 | LOW | O(n*m) claim exagerado | FIXED — corrigido para O(m + n*k) |

---

## Checklist para Dara

- [x] Criar migration com `get_traffic_intel_rows` (7 CTEs conforme pseudocodigo)
- [x] Criar migration com `get_traffic_intel_available_months`
- [x] Adicionar indexes compostos (5 indexes: composite, workspace+source, trgm x2, ws+status)
- [x] GRANT EXECUTE para authenticated + anon (4 grants)
- [x] NOTIFY pgrst, 'reload schema'
- [x] Incorporar QA GAP-7: fallback date-independent (NOT EXISTS contra tabela direta, nao CTE)
- [x] plpgsql com DECLARE para pre-computar date boundaries (evita to_date repetido)
- [x] Rollback script comentado no final da migration
- [x] COMMENT ON em ambas funcoes
- [ ] Testar com dados reais (12k offers, 87k traffic) — **requer deploy**
- [ ] Validar: resultado da RPC bate com resultado do compareTraffic() para mesmos parametros
- [ ] Validar: fallback main_domain funciona (oferta com main_domain mas sem trafego nesse dominio)
- [ ] Validar: sparkline_months tem mesma length que sparkline
- [ ] Validar: has_traffic = TRUE mesmo quando filtro de data exclui todos os registros (se existem fora do range)
- [ ] Validar: paginacao funciona (total_count correto)
- [ ] Validar: variacao calcula corretamente (edge cases: prev=0, ambos=0, single month)
- [ ] Validar: sparkline array esta em ordem cronologica
- [ ] Validar: workspace auth — usuario nao consegue consultar workspace que nao pertence

**Migration file:** `supabase/migrations/20260309000000_traffic_intel_rpcs.sql`

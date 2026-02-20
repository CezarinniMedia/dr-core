# Brownfield Discovery - Phase 2: Database Audit
**Date:** 2026-02-19
**Agent:** @data-engineer (perspectiva via @architect)

---

## EXECUTIVE SUMMARY

O banco de dados tem 34 tabelas, 87k+ registros de trafego, e 12k+ ofertas espionadas. Identificados **3 problemas criticos de seguranca**, **10+ indexes faltando**, **7 tabelas redundantes**, e **inconsistencias de schema** que impactam performance e manutencao.

---

## 1. PROBLEMAS CRITICOS DE SEGURANCA

### SEC-01: Storage RLS Policies QUEBRADAS
**Severidade:** CRITICA
**Descricao:** Migration 20260209004023 substituiu policies workspace-scoped por policies genericas "authenticated users". Qualquer usuario autenticado pode acessar arquivos de QUALQUER workspace.
**Buckets afetados:** spy-assets, creatives, documents
**Fix:** Restaurar policies com isolamento por workspace

### SEC-02: 6 Tabelas Legacy SEM RLS
**Severidade:** ALTA
**Tabelas:** arsenal_dorks, arsenal_footprints, arsenal_keywords, comparacao_batches, import_batches, trafego_historico
**Risco:** Usuarios podem consultar dados de outros workspaces
**Fix:** Adicionar RLS policies padrao com workspace_id check

### SEC-03: .env Modificado no Git
**Severidade:** CRITICA
**Descricao:** Arquivo .env aparece como modified no git status
**Risco:** Credenciais podem ser commitadas
**Fix:** Adicionar ao .gitignore, git rm --cached .env

---

## 2. INDEXES FALTANDO (Performance)

### CRITICOS (adicionar imediatamente)

```sql
-- 1. FK index FALTANDO em offer_traffic_data (87k+ registros!)
CREATE INDEX idx_offer_traffic_spied_offer
  ON offer_traffic_data(spied_offer_id);

-- 2. Composite index para queries principais
CREATE INDEX idx_offer_traffic_composite
  ON offer_traffic_data(spied_offer_id, period_date DESC, source);

-- 3. Status + vertical combo (filtro mais comum no radar)
CREATE INDEX idx_spied_offers_status_vertical
  ON spied_offers(status, vertical, workspace_id);

-- 4. Workspace isolation em offer_domains
CREATE INDEX idx_offer_domains_workspace
  ON offer_domains(workspace_id);
```

### ALTOS (adicionar esta sprint)

```sql
-- 5. FK index em offer_funnel_steps.domain_id
CREATE INDEX idx_offer_funnel_domain
  ON offer_funnel_steps(domain_id);

-- 6. Full-text search em discovery_query
CREATE INDEX idx_spied_offers_discovery_gin
  ON spied_offers USING GIN (to_tsvector('portuguese', discovery_query));
```

**Impacto esperado:** 10-100x mais rapido nas queries do dashboard e radar com 87k+ registros.

---

## 3. TABELAS REDUNDANTES

| Legacy | Moderna | Campos extras no legacy | Acao |
|--------|---------|------------------------|------|
| ad_bibliotecas (19 cols) | offer_ad_libraries | pagina_nome, pagina_url extras | Migrar campos uteis → deprecar |
| oferta_dominios | offer_domains | whois_*, hosting_provider, ip_address | Migrar whois → deprecar |
| funil_paginas | offer_funnel_steps | - | Deprecar |
| competitors | spied_offers | traffic_score manual | Avaliar se manter |
| fontes_captura | campo discovery_source | - | Deprecar |
| trafego_historico | offer_traffic_data | import_batch_id, comparacao_batch_id | Clarificar uso |

**Recomendacao:** Criar migration para deprecar 4-5 tabelas, migrar campos uteis.

---

## 4. INCONSISTENCIAS DE SCHEMA

| Issue | Severidade | Exemplo |
|-------|-----------|---------|
| Mix de idiomas | MEDIA | trafego_historico (PT) vs offer_traffic_data (EN) |
| Precision decimal variavel | BAIXA | DECIMAL(10,2) vs DECIMAL(12,2) para dinheiro |
| VARCHAR inconsistente para URLs | MEDIA | VARCHAR(255) pode truncar URLs longas |
| Status fields naming | MEDIA | status vs status_tracking vs traffic_trend |
| FK ON DELETE inconsistente | ALTA | Alguns CASCADE, outros SET NULL sem logica clara |
| Sem updated_at em offer_traffic_data | MEDIA | Impossivel saber quando registro foi atualizado |
| Boolean defaults inconsistentes | BAIXA | is_main DEFAULT false vs is_principal DEFAULT NULL |

---

## 5. INTEGRIDADE DE DADOS

### ad_creatives com fonte ambigua
Pode ter competitor_id E spied_offer_id ao mesmo tempo. Falta CHECK constraint.

### UNIQUE constraint de trafego
```sql
UNIQUE(spied_offer_id, domain, period_type, period_date)
```
Nao inclui `source` - pode ter duplicatas de fontes diferentes na mesma data.

### Orphaned records
offer_funnel_steps.domain_id com ON DELETE SET NULL pode deixar steps sem contexto.

---

## 6. PERFORMANCE PARA ESCALA

### Estado atual
- 87k registros de trafego: GERENCIAVEL com indexes corretos
- 12k ofertas: OK

### Projecao 6 meses
- 500k+ trafego (objetivo: rastrear todo DR market)
- 50k+ ofertas
- **Necessario:** Materialized views para aggregacoes no dashboard

### Recomendacao: Materialized View
```sql
CREATE MATERIALIZED VIEW offer_traffic_summary AS
SELECT
  spied_offer_id,
  SUM(visits) as total_visits,
  MAX(period_date) as latest_period,
  MAX(CASE WHEN period_type = 'monthly_sw' THEN visits END) as latest_sw,
  MAX(CASE WHEN period_type = 'monthly' THEN visits END) as latest_sr
FROM offer_traffic_data
GROUP BY spied_offer_id;

-- Refresh diario
REFRESH MATERIALIZED VIEW CONCURRENTLY offer_traffic_summary;
```

---

## 7. PRIORIDADES DE FIX

### Esta Semana
1. Restaurar Storage RLS (30 min)
2. Adicionar RLS em 6 tabelas legacy (1h)
3. Criar 4 indexes criticos (15 min)
4. Remover .env do git (5 min)

### Esta Sprint
5. Adicionar indexes altos (15 min)
6. CHECK constraint em ad_creatives (1h)
7. Deprecar 4-5 tabelas legacy (4h migration + app changes)
8. Padronizar FK ON DELETE (2h)

### Proximo Sprint
9. Materialized view para dashboard (2h)
10. Full-text search em discovery_query (1h)
11. Padronizar naming conventions (6h)

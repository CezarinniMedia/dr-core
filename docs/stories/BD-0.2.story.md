# Story BD-0.2: Add Critical Database Indexes
**Epic:** EPIC-BD (Brownfield Debt)
**Sprint:** 0 - Security Foundation
**Status:** Done
**Estimate:** 1h
**Priority:** CRITICO

---

## Descricao
offer_traffic_data tem 87k+ registros e esta FALTANDO o index no FK spied_offer_id, alem de composite indexes para queries do radar. Isso causa queries 10-100x mais lentas do que necessario.

## Acceptance Criteria

### AC-1: Indexes Criticos Criados
- [ ] Given: offer_traffic_data com 87k+ registros
- [ ] When: query por spied_offer_id + period_date range
- [ ] Then: usa index scan (nao sequential scan)

### AC-2: Performance Medida
- [ ] Given: radar com 12k+ ofertas
- [ ] When: carrega pagina principal
- [ ] Then: tempo de resposta < 2 segundos

## Tasks
- [ ] 1. Criar migration com 6 indexes:
  ```sql
  -- FK index FALTANDO
  CREATE INDEX idx_offer_traffic_spied_offer ON offer_traffic_data(spied_offer_id);
  -- Composite para queries principais
  CREATE INDEX idx_offer_traffic_composite ON offer_traffic_data(spied_offer_id, period_date DESC, source);
  -- Status + vertical combo
  CREATE INDEX idx_spied_offers_status_vertical ON spied_offers(status, vertical, workspace_id);
  -- Workspace em offer_domains
  CREATE INDEX idx_offer_domains_workspace ON offer_domains(workspace_id);
  -- FK em funnel steps
  CREATE INDEX idx_offer_funnel_domain ON offer_funnel_steps(domain_id);
  -- Full-text search
  CREATE INDEX idx_spied_offers_discovery_gin ON spied_offers USING GIN(to_tsvector('portuguese', COALESCE(discovery_query, '')));
  ```
- [ ] 2. Rodar migration em Supabase
- [ ] 3. Verificar EXPLAIN ANALYZE nas queries principais

## File List
- [ ] supabase/migrations/YYYYMMDD_add_critical_indexes.sql

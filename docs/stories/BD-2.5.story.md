# Story BD-2.5: Add Materialized Views for Dashboard Performance
**Epic:** EPIC-BD | **Sprint:** 2 | **Status:** Ready | **Estimate:** 2h | **Priority:** MEDIO

---

## Descricao
Dashboard e SpyRadar executam queries pesadas (COUNT, SUM, MAX) sobre 87k+ registros de trafego a cada carregamento. Com crescimento projetado para 500k+, necessario criar materialized views pre-calculadas.

## Acceptance Criteria

### AC-1: Materialized View de Trafego
- [ ] Given: 87k+ registros em offer_traffic_data
- [ ] When: dashboard ou radar precisa de agregacoes
- [ ] Then: consulta materialized view (pre-calculada)
- [ ] And: resposta < 100ms (vs 500ms+ atual em queries raw)

### AC-2: Materialized View de Stats
- [ ] Given: dashboard mostra contagem de ofertas, dominios, etc
- [ ] When: usuario acessa dashboard
- [ ] Then: dados vem de view pre-calculada
- [ ] And: atualizada automaticamente a cada 15 minutos

### AC-3: Refresh Automatico
- [ ] Given: materialized views existem
- [ ] When: novos dados sao importados
- [ ] Then: views sao refreshed automaticamente
- [ ] And: refresh e CONCURRENT (nao bloqueia leitura)

## SQL a Implementar

### View 1: Traffic Summary por Oferta
```sql
CREATE MATERIALIZED VIEW mv_offer_traffic_summary AS
SELECT
  spied_offer_id,
  COUNT(DISTINCT domain) as domain_count,
  SUM(visits) as total_visits,
  MAX(period_date) as latest_period,
  MIN(period_date) as earliest_period,
  MAX(CASE WHEN period_type = 'monthly_sw' THEN visits END) as latest_sw_visits,
  MAX(CASE WHEN period_type = 'monthly' THEN visits END) as latest_sr_visits,
  AVG(visits) as avg_monthly_visits
FROM offer_traffic_data
GROUP BY spied_offer_id;

CREATE UNIQUE INDEX idx_mv_traffic_summary_offer
  ON mv_offer_traffic_summary(spied_offer_id);
```

### View 2: Dashboard Stats
```sql
CREATE MATERIALIZED VIEW mv_dashboard_stats AS
SELECT
  workspace_id,
  COUNT(*) as total_offers,
  COUNT(DISTINCT main_domain) as unique_domains,
  SUM(CASE WHEN status = 'ativa' THEN 1 ELSE 0 END) as active_offers,
  SUM(CASE WHEN status = 'potencial' THEN 1 ELSE 0 END) as potential_offers,
  MAX(updated_at) as last_updated
FROM spied_offers
GROUP BY workspace_id;

CREATE UNIQUE INDEX idx_mv_dashboard_stats_ws
  ON mv_dashboard_stats(workspace_id);
```

### Refresh (pg_cron ou Edge Function)
```sql
-- Opcao 1: pg_cron (se disponivel no Supabase)
SELECT cron.schedule('refresh-traffic-summary', '*/15 * * * *',
  'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_offer_traffic_summary');

-- Opcao 2: Edge Function chamada por cron externo
-- POST /functions/v1/refresh-materialized-views
```

## Arquivos a Modificar
- [ ] supabase/migrations/YYYYMMDD_add_materialized_views.sql
- [ ] src/pages/Dashboard.tsx (usar mv_dashboard_stats)
- [ ] src/hooks/useSpiedOffers.ts (usar mv_offer_traffic_summary)
- [ ] supabase/functions/refresh-materialized-views/ (se necessario)

## Dependencias
- BD-0.2 concluido (indexes base necessarios)
- BD-2.4 idealmente concluido (tabelas legacy removidas simplificam views)

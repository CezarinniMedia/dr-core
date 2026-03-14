# Performance Diagnostic — Radar de Ofertas (SpyRadar)

**Data:** 2026-02-22
**Autor:** @data-engineer (Dara)
**Status:** Diagnostico completo, aguardando execucao

---

## Resumo Executivo

O sistema carrega **toda a base de dados em memoria** no cliente. Com 12k+ ofertas e 87k+ registros de trafego, isso causa tempos de carregamento de 3-15 segundos. O banco de dados ja tem indexes e materialized views adequados — **o gargalo principal esta nas queries do frontend que ignoram essas otimizacoes**.

---

## Achados por Severidade

### CRITICO — Causa raiz da lentidao

| # | Query/Hook | Problema | Records | Impacto |
|---|-----------|----------|---------|---------|
| C1 | `useLatestTrafficPerOffer()` | Carrega TODOS os 87k+ registros de trafego, filtra client-side para pegar apenas o ultimo por oferta | 87,000+ | SpyRadar inteiro trava |
| C2 | `fetchAllTrafficRows()` | Full table scan da offer_traffic_data em batches de 1000 (sem limite total) | 87,000+ | TrafficIntelligenceView leva 5-15s |
| C3 | `useSpiedOffers()` | Carrega TODAS as 12k+ ofertas em batches paralelos de 1000, sem paginacao server-side real | 12,000+ | Pagina inicial do Radar lenta |

### ALTO — Agrava a lentidao

| # | Query/Hook | Problema | Impacto |
|---|-----------|----------|---------|
| H1 | `useSpiedOffer(id)` | `.select('*, offer_domains(*), offer_traffic_data(*), ...')` — carrega TUDO nested incluindo historico completo de trafego | SpyOfferDetail lento |
| H2 | `useOfferTrafficData()` | Sem `.limit()` — pode puxar 1000+ records por oferta | Charts lentos |

### MEDIO — Oportunidades de otimizacao

| # | Item | Detalhe |
|---|------|---------|
| M1 | `is_workspace_member()` RLS | Funcao STABLE chamada por row — ok para queries pequenas, overhead em 87k rows. Considerar RLS com `auth.uid() IN (SELECT ...)` inline |
| M2 | `workspace_members` sem index explicito | Usa UNIQUE constraint como index implícito (ok, mas index composto (user_id, workspace_id) seria melhor para RLS pattern) |
| M3 | Materialized views subutilizadas | `mv_traffic_summary` e `mv_offer_traffic_summary` existem mas o frontend nao as utiliza para o Radar |
| M4 | React Query staleTime = 60s | Pode causar refetches frequentes dos 87k+ registros |

---

## Estado Atual do Banco (o que JA esta bom)

### Indexes (17 no modulo spy)
- `idx_spied_offers_workspace`, `_status`, `_vertical`, `_domain`, `_discovery` (singles)
- `idx_spied_offers_status_vertical` (composite: status, vertical, workspace_id)
- `idx_spied_offers_discovery_gin` (full-text portugues)
- `idx_offer_traffic_composite` (spied_offer_id, period_date DESC, source)
- Demais FK indexes em offer_domains, offer_ad_libraries, offer_funnel_steps

### Materialized Views (3 + 2 compat)
- `mv_dashboard_metrics` — refresh 4h (pg_cron)
- `mv_traffic_summary` — refresh 6h, agrupado por offer+source
- `mv_spike_detection` — refresh 2h, detecao de spikes
- `mv_dashboard_stats`, `mv_offer_traffic_summary` — backward compat

### RPC Functions
- `bulk_upsert_traffic_data()` — bulk import otimizado (skip spike check)
- `get_dashboard_metrics()` — dashboard KPIs
- `get_traffic_comparison()` — comparacao multi-dominio
- `detect_spikes()` — detecao real-time

### RLS Policies
- Todas as 5 tabelas core com RLS via `is_workspace_member(auth.uid(), workspace_id)`
- Funcao STABLE + SECURITY DEFINER (pattern correto)

---

## Plano de Acao — Priorizado

### Fase 1: Quick Wins do Banco (@data-engineer)

**1.1 — RPC `get_latest_traffic_per_offer(p_workspace_id)`**
Substitui C1 (`useLatestTrafficPerOffer`). Retorna apenas o ultimo registro de trafego por oferta usando `DISTINCT ON`, executado no banco em <50ms vs 87k records no client.

```sql
CREATE FUNCTION get_latest_traffic_per_offer(p_workspace_id UUID)
RETURNS TABLE(spied_offer_id UUID, visits INT, period_date DATE, source VARCHAR)
AS $$
  SELECT DISTINCT ON (t.spied_offer_id)
    t.spied_offer_id, t.visits, t.period_date, t.source
  FROM offer_traffic_data t
  WHERE t.workspace_id = p_workspace_id
  ORDER BY t.spied_offer_id, t.period_date DESC
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

**1.2 — RPC `get_spied_offers_paginated(p_workspace_id, p_limit, p_offset, p_filters)`**
Substitui C3 (`useSpiedOffers`). Paginacao real no banco com counts de relacoes via subquery, retorna apenas 1 pagina por vez.

**1.3 — Index em workspace_members para RLS**
```sql
CREATE INDEX idx_workspace_members_user_ws
ON workspace_members(user_id, workspace_id);
```

### Fase 2: Refactor de Hooks (@dev)

**2.1** — Refatorar `useLatestTrafficPerOffer` para chamar RPC `get_latest_traffic_per_offer` em vez de carregar 87k records
**2.2** — Refatorar `useSpiedOffers` para usar paginacao server-side real (cursor ou offset/limit)
**2.3** — Lazy-load tabs no SpyOfferDetail (nao carregar traffic data ate o tab ser aberto)
**2.4** — Usar `mv_offer_traffic_summary` no TrafficIntelligenceView em vez de `fetchAllTrafficRows`
**2.5** — Implementar virtualizacao (react-window/tanstack-virtual) na tabela do Radar

### Fase 3: Otimizacoes Avancadas

**3.1** — Inline RLS policy (remover funcao, usar subquery direto) para tabelas com >10k rows
**3.2** — Particionamento de `offer_traffic_data` por ano (quando >500k records)
**3.3** — Aumentar `staleTime` para 5min no Radar (dados nao mudam a cada minuto)

---

## Impacto Esperado

| Metrica | Atual | Apos Fase 1+2 |
|---------|-------|---------------|
| SpyRadar load | 3-8s | <1s |
| TrafficIntelligenceView | 5-15s | <2s |
| SpyOfferDetail | 2-5s | <1s |
| Dados transferidos (Radar) | ~15-25MB | <500KB |
| Queries ao banco (page load) | 5-8 full scans | 2-3 paginated |

---

## Dependencias

- **Fase 1** (banco): @data-engineer — pode comecar imediatamente
- **Fase 2** (frontend): @dev — depende dos RPCs da Fase 1
- **Fase 3** (avancado): @data-engineer + @architect — planejamento futuro

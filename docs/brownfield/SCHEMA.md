# Brownfield Discovery - Phase 2: Database Schema
**Date:** 2026-02-19
**Agent:** @data-engineer (perspectiva via @architect)

---

## 1. TABLE INVENTORY (34 tabelas)

### Core Infrastructure (4)
| Tabela | Registros Est. | Funcao |
|--------|---------------|--------|
| profiles | <100 | Perfis de usuario |
| workspaces | <10 | Multi-tenancy |
| workspace_members | <100 | Membros do workspace |
| activity_log | ~1k | Log de auditoria |

### SPY Module - PRIMARY (6)
| Tabela | Registros | Funcao |
|--------|-----------|--------|
| **spied_offers** | **12,000+** | Ofertas espionadas |
| **offer_traffic_data** | **87,000+** | Trafego historico mensal |
| **offer_domains** | ~15,000 | Dominios vinculados |
| offer_ad_libraries | ~500 | Bibliotecas de anuncios |
| offer_funnel_steps | ~200 | Steps do funil |
| ad_creatives | ~1k | Criativos coletados |

### Ofertas Module (6)
| Tabela | Registros | Funcao |
|--------|-----------|--------|
| ofertas | <100 | Ofertas proprias |
| ofertas_brief | <100 | Brief de cada oferta |
| funnel_steps | <50 | Steps de funil proprio |
| avatares | <50 | Perfis de avatar |
| research_notes | <100 | Notas de pesquisa |
| criativos | <50 | Criativos proprios |

### Arsenal (3)
| Tabela | Registros | Funcao |
|--------|-----------|--------|
| arsenal_dorks | <100 | Google dorks salvos |
| arsenal_footprints | <100 | Footprints salvos |
| arsenal_keywords | <100 | Keywords salvas |

### Legacy/Redundantes (7) - DEPRECAR
| Tabela | Substituida por | Acao |
|--------|----------------|------|
| ad_bibliotecas | offer_ad_libraries | DEPRECAR |
| oferta_dominios | offer_domains | DEPRECAR |
| funil_paginas | offer_funnel_steps | DEPRECAR |
| trafego_historico | offer_traffic_data | CLARIFICAR |
| comparacao_batches | - | MONITORAR |
| fontes_captura | discovery_source field | DEPRECAR |
| import_batches | - | MANTER (auditoria) |

### Outros (5)
- competitors (legacy, parcialmente substituido por spied_offers)
- funnel_maps (legacy)
- hooks (hook library)
- analytics_events, app_logs

---

## 2. ENTITY-RELATIONSHIP (Simplificado)

```
auth.users → profiles → workspaces → workspace_members
                              |
              ┌───────────────┼───────────────┐
              v               v               v
         spied_offers     ofertas        competitors
              |               |               |
    ┌─────┬──┼──┬─────┐     ├──avatares    ├──ad_creatives
    v     v  v  v     v     ├──criativos   └──funnel_maps
 domains libs traffic funnel └──hooks
    |                  |
    └──────FK──────────┘ (domain_id)
```

---

## 3. UNIQUE CONSTRAINTS

```sql
-- Trafego: dedup por fonte
offer_traffic_data: UNIQUE(spied_offer_id, domain, period_type, period_date)
-- period_type: "monthly" (Semrush) | "monthly_sw" (SimilarWeb)

-- Workspace members
workspace_members: UNIQUE(workspace_id, user_id)

-- Brief por oferta
ofertas_brief: UNIQUE(oferta_id)
```

---

## 4. INDEXES EXISTENTES (30+)

Indexes em todas as tabelas para workspace_id, status, FKs.
**Ver DB-AUDIT.md para gaps criticos.**

---

## 5. STORAGE BUCKETS (4)

| Bucket | Acesso | Uso |
|--------|--------|-----|
| avatars | public | Fotos de avatar |
| creatives | private | Assets de criativos |
| spy-assets | private | Screenshots, assets SPY |
| documents | private | Documentos gerais |

---

## 6. EDGE FUNCTIONS (2)

- `extract-avatar` - Extracao de avatar via Claude API
- `generate-hooks` - Geracao de hooks

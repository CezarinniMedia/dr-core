# EPIC: Brownfield Technical Debt Resolution
**ID:** EPIC-BD
**Origin:** Brownfield Discovery (2026-02-19)
**Priority:** CRITICAL
**Status:** Ready
**Total Stories:** 17 (3 Sprint 0 + 4 Sprint 1 + 5 Sprint 2 + 5 Sprint 3)
**Estimate Total:** ~75h (realista: ~110h com overhead)

---

## Objetivo
Resolver os 40 debitos tecnicos identificados no Brownfield Discovery, transformando o DR OPS de "MVP funcional com bugs" em "software profissional e escalavel".

## Escopo
- 5 bloqueantes de seguranca
- 12 criticos (performance, visual, code quality)
- 15 importantes (bugs, UX, schema)
- 8 menores (polish)

## Contexto de Negocio
O modulo SPY e a PRIORIDADE #1. Principio Finch: "quem espiona rapido, lanca rapido." O usuario tem TDAH e precisa de resultados visiveis rapidamente. Cada sprint deve entregar valor perceptivel.

## Stories (organizadas por Sprint)

### Sprint 0: Security & Performance Foundation
- BD-0.1: Fix Storage RLS + .env security
- BD-0.2: Add critical database indexes
- BD-0.3: Setup branching strategy

### Sprint 1: Professional Visual Quality
- BD-1.1: Replace all iOS emojis with Lucide icons (2h)
- BD-1.2: Fix table sizing and dimensioning (4h)
- BD-1.3: Fix sidebar collapse + dashboard + charts (6h) [consolida BUG-003, BUG-004, BUG-005]
- BD-1.4: Fix popups, tooltips, sparkline, graph badges (8h) [consolida BUG-009, BUG-011, BUG-012]

### Sprint 2: Scalable Architecture (~30h)
- BD-2.1: Decompose God Components - SpyRadar, ImportModal, TrafficView, hooks (12h)
- BD-2.2: Create service layer - csvImport, traffic, offer, domain services (8h)
- BD-2.3: Implement code splitting + virtualization (4h)
- BD-2.4: Deprecate legacy database tables - 5 tabelas (4h)
- BD-2.5: Add materialized views for dashboard performance (2h)

### Sprint 3: Quality & Polish (~20h)
- BD-3.1: Fix remaining bugs - BUG-006, BUG-007, NEW-01 a NEW-07 (4h)
- BD-3.2: Accessibility overhaul - aria-labels, keyboard nav, focus (3h)
- BD-3.3: Add skeleton loaders and empty states (5h)
- BD-3.4: Add breadcrumb navigation (3h)
- BD-3.5: Write critical integration tests - CSV, trafego, filtros, bulk (5h)

## Criterios de Done
- [ ] Zero debitos S1 (bloqueantes)
- [ ] Zero debitos S2 (criticos)
- [ ] Cobertura de testes > 30% em caminhos criticos
- [ ] Lighthouse score > 80 em performance
- [ ] Zero emojis iOS na interface
- [ ] Storage upload funcional
- [ ] Dashboard com dados reais

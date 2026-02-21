# Brownfield Discovery - Phase 4: Technical Debt Assessment (DRAFT)
**Date:** 2026-02-19
**Agent:** @architect (Aria)
**Sources:** system-architecture.md, SCHEMA.md, DB-AUDIT.md, frontend-spec.md

---

## CLASSIFICACAO DE DEBITOS

### Categorias de Severidade
- **S1 - BLOQUEANTE**: Impede uso ou compromete seguranca
- **S2 - CRITICO**: Degrada significativamente UX ou performance
- **S3 - IMPORTANTE**: Impacta qualidade mas tem workaround
- **S4 - MENOR**: Cosmetico ou futuro

---

## INVENTARIO CONSOLIDADO DE DEBITOS

### S1 - BLOQUEANTE (5 itens)

| ID | Area | Debito | Impacto | Esforco |
|----|------|--------|---------|---------|
| TD-S1-01 | Security | **Storage RLS policies quebradas** - qualquer usuario acessa arquivos de qualquer workspace | Data breach risk | 30min |
| TD-S1-02 | Security | **.env modificado no git** - credenciais possivelmente expostas | Credenciais vazadas | 5min |
| TD-S1-03 | Security | **6 tabelas legacy SEM RLS** (arsenal_*, import_batches, etc) | Cross-workspace data leak | 1h |
| TD-S1-04 | Feature | **Upload de arquivos QUEBRADO** (BUG-001) - RLS bloqueia todo upload | Impossivel upar media | 1h |
| TD-S1-05 | Infra | **Lovable + Claude Code commitam em main** sem branching | Regressoes frequentes | 2h setup |

### S2 - CRITICO (12 itens)

| ID | Area | Debito | Impacto | Esforco |
|----|------|--------|---------|---------|
| TD-S2-01 | Performance | **10+ indexes faltando** em offer_traffic_data (87k rows) | Queries 10-100x mais lentas | 30min |
| TD-S2-02 | UX | **Emojis iOS na interface** em headers, tabs, badges | Visual amador | 2h |
| TD-S2-03 | UX | **Dimensionamento inconsistente** - badges, celulas, botoes | Nao profissional | 4h |
| TD-S2-04 | Code | **God Components** - SpyRadar 1,424 LOC, ImportModal 1,161 LOC | Impossivel manter/testar | 16h |
| TD-S2-05 | Data | **7 tabelas redundantes/legacy** poluindo schema | Confusao, queries duplicadas | 4h |
| TD-S2-06 | UX | **Dashboard mostra zeros** (BUG-005) | Perda de confianca no sistema | 2h |
| TD-S2-07 | UX | **Graficos nao respeitam filtros** (BUG-003) | Dados incorretos mostrados | 3h |
| TD-S2-08 | UX | **Sidebar collapse quebra layout** (BUG-004) | Layout horrivel | 1h |
| TD-S2-09 | Performance | **Zero code-splitting** - tudo no bundle principal | Load time ruim | 2h |
| TD-S2-10 | Code | **Sem service layer** - componentes chamam Supabase direto | Logica espalhada | 8h |
| TD-S2-11 | Code | **Zero testes** (2 arquivos, 1 e exemplo) | Zero confianca em changes | 16h |
| TD-S2-12 | UX | **Popups cortados** (BUG-009) + import overflow com 10k+ | Perda de tempo | 2h |

### S3 - IMPORTANTE (15 itens)

| ID | Area | Debito | Impacto | Esforco |
|----|------|--------|---------|---------|
| TD-S3-01 | UX | Tooltips ausentes em todo sistema (BUG-011) | Adivinhacao | 3h |
| TD-S3-02 | UX | Sparkline nao segue periodo selecionado (BUG-012) | Confusao | 2h |
| TD-S3-03 | UX | Cards de ofertas so abrem pelo nome (BUG-010) | Frustacao | 1h |
| TD-S3-04 | UX | Filtros de ofertas muito pequenos (BUG-009) | Dificil usar | 1h |
| TD-S3-05 | UX | Criativos: card nao reabre (BUG-006) | Feature quebrada | 2h |
| TD-S3-06 | UX | Criativos: delay drag (BUG-007) | Lentidao | 1h |
| TD-S3-07 | Accessibility | 50+ icon buttons sem aria-label | Nao inclusivo | 3h |
| TD-S3-08 | Accessibility | Tabela nao navigavel por teclado | Power users frustrados | 3h |
| TD-S3-09 | Schema | Naming inconsistente (PT vs EN) nas tabelas | Confusao no dev | 6h |
| TD-S3-10 | Schema | FK ON DELETE inconsistente | Orphaned records | 2h |
| TD-S3-11 | Data | ad_creatives com fonte ambigua (sem CHECK) | Inconsistencia | 2h |
| TD-S3-12 | UX | Sem breadcrumbs | Desorientacao | 3h |
| TD-S3-13 | UX | Sem skeleton loaders | Parecer lento | 3h |
| TD-S3-14 | UX | Sem empty states | Confusao no primeiro uso | 2h |
| TD-S3-15 | Performance | Sem virtualizacao para listas 1000+ | Freeze possivel | 4h |

### S4 - MENOR (8 itens)

| ID | Area | Debito | Esforco |
|----|------|--------|---------|
| TD-S4-01 | UX | Sem micro-interactions (hover, transitions) | 3h |
| TD-S4-02 | UX | Font system default (sem custom) | 2h |
| TD-S4-03 | UX | Column search case-sensitive | 1h |
| TD-S4-04 | UX | Screenshot lightbox nao responsivo | 2h |
| TD-S4-05 | Schema | JSON schema validation em campos JSONB | 3h |
| TD-S4-06 | Schema | Decimal precision variavel para money | 1h |
| TD-S4-07 | UX | Dark mode transition abrupta | 1h |
| TD-S4-08 | UX | Notes popover off-screen na borda | 1h |

---

## METRICAS TOTAIS

| Severidade | Quantidade | Horas estimadas |
|-----------|------------|-----------------|
| S1 - Bloqueante | 5 | ~5h |
| S2 - Critico | 12 | ~56h |
| S3 - Importante | 15 | ~38h |
| S4 - Menor | 8 | ~14h |
| **TOTAL** | **40** | **~113h** |

---

## FRAGMENTACAO DO ECOSSISTEMA

### Problema Structural
5 locais diferentes sem integracao:

| Local | Funcao | Sincronizado? |
|-------|--------|--------------|
| /Users/admin/DR-Operations/ | Prompts, swipe, ofertas legacy | NAO |
| /Users/admin/DR-OPS/ | Hub centralizado + webapp | PARCIAL |
| Obsidian Vault | Knowledge base, canvases | NAO |
| Notion (2 workspaces) | Databases legados | NAO |
| dr-core webapp (Supabase) | SPY radar + gestao | SIM |

**Debito:** Dados duplicados entre Notion, Finder e webapp. Prompts em 3 locais diferentes. Sem single source of truth.

---

## ROADMAP SUGERIDO

### Sprint 0: "Stop the Bleeding" (5h)
- [ ] TD-S1-01: Restaurar Storage RLS
- [ ] TD-S1-02: .env no .gitignore
- [ ] TD-S1-03: RLS nas 6 tabelas legacy
- [ ] TD-S1-04: Fix upload RLS
- [ ] TD-S2-01: Criar indexes criticos

### Sprint 1: "Look Professional" (20h)
- [ ] TD-S1-05: Branching strategy
- [ ] TD-S2-02: Remover emojis → Lucide
- [ ] TD-S2-03: Fix sizing/dimensionamento
- [ ] TD-S2-06: Fix dashboard zeros
- [ ] TD-S2-07: Fix graficos vs filtros
- [ ] TD-S2-08: Fix sidebar collapse
- [ ] TD-S2-12: Fix popups cortados

### Sprint 2: "Scale & Maintain" (30h)
- [ ] TD-S2-04: Decompor God Components
- [ ] TD-S2-05: Deprecar tabelas legacy
- [ ] TD-S2-09: Code splitting
- [ ] TD-S2-10: Service layer
- [ ] TD-S3-01 a TD-S3-06: Bugs restantes

### Sprint 3: "Polish & Ship" (20h)
- [ ] TD-S2-11: Testes minimos
- [ ] TD-S3-07 a TD-S3-15: Accessibility + UX polish
- [ ] TD-S4-*: Nice-to-haves

### Sprint 4: "Expand" (TBD)
- [ ] Consolidar dados fragmentados
- [ ] PLANs 06-12
- [ ] AI features (clustering, spike detection)
- [ ] Pipeline automacao PublicWWW → Semrush → SimilarWeb

---

## CONTEXTO DE NEGOCIO PARA PRIORIZACAO

O usuario (Marcos) tem TDAH, precisa de resultados RAPIDOS, e o sistema de espionagem e sua PRIORIDADE #1. O principio Finch: "velocidade > perfeicao". Portanto:

1. **Sprint 0 e inegociavel** - seguranca e performance basica
2. **Sprint 1 e o mais visivel** - faz o sistema parecer profissional
3. **Sprint 2 e para escala** - preparar para 100k+ ofertas
4. **Sprint 3 e qualidade** - profissional de verdade
5. **Sprint 4 e expansao** - novos modulos e automacao

**Principio guia:** Cada sprint deve entregar valor VISIVEL ao usuario.

---

**Status: DRAFT - Pendente revisao de @data-engineer (Fase 5), @ux (Fase 6), e @qa (Fase 7)**

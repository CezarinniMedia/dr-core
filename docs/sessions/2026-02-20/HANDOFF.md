# Handoff - Brownfield Discovery Completo
**Data:** 2026-02-20
**De:** @architect (Aria) - Brownfield Discovery
**Para:** @dev (Dex) - Implementation
**Status:** PRONTO PARA COMEÇAR

---

## O QUE FOI FEITO

Brownfield Discovery completo em 10 fases (2 dias de trabalho):
- **Fase 1:** System Architecture (5 camadas do ecossistema mapeadas)
- **Fase 2:** Database Schema + Audit (34 tabelas, 87k registros, 10+ vulnerabilidades encontradas)
- **Fase 3:** Frontend Specification (UX audit, 7 novos bugs encontrados, 40 gaps para "expensive software")
- **Fase 4:** Technical Debt Catalog (40 debitos classificados)
- **Fases 5-6:** Specialist Reviews (@data-engineer + @ux validaram tudo)
- **Fase 7:** QA Gate (APPROVED)
- **Fase 8:** Final Assessment (roadmap executavel)
- **Fase 9:** Executive Report (resumo executivo)
- **Fase 10:** Stories + Epic (17 stories criados, prontos para implementacao)

---

## DOCUMENTOS PRONTOS

### Documentação Completa (9 arquivos em docs/brownfield/)

1. **system-architecture.md** (440 linhas)
   - 5 camadas do ecossistema (DR-Operations, DR-OPS, webapp, Obsidian, Notion)
   - Tech stack completo (React 18 + Vite + Supabase + shadcn/ui)
   - 8 anti-patterns criticos identificados
   - 10 riscos mapeados com mitigacoes
   - Leia primeiro para contexto geral

2. **SCHEMA.md** (inventario de 34 tabelas)
   - ER diagram completo
   - Unique constraints, indexes, storage buckets
   - Foreign keys mapeados
   - Leia para entender estrutura do banco

3. **DB-AUDIT.md** (seguranca + performance)
   - **CRITICO:** 3 vulnerabilidades de seguranca (Storage RLS quebrado, .env em git, 6 tabelas sem RLS)
   - 10+ indexes faltando (impacto 10-100x em performance)
   - 7 tabelas redundantes identificadas
   - Schema inconsistencies (naming, decimals, timestamps)
   - Data integrity issues
   - Recomendacoes priorizadas por severidade
   - **LEIA PRIMEIRO ANTES DE COMEÇAR SPRINT 0**

4. **frontend-spec.md** (UX audit completo)
   - 7 novos bugs encontrados (NEW-01 a NEW-07)
   - Design system gaps (tipografia, spacing, componentes)
   - Performance audit (bundle, lazy loading, virtualizacao)
   - Accessibility audit (WCAG AA - 50+ buttons sem aria-label)
   - God Components: SpyRadar (1,424), ImportModal (1,161), TrafficView (852)
   - 18 recomendacoes priorizadas by impact
   - Quick wins (6h = 70% improvement)

5. **technical-debt-DRAFT.md**
   - 40 debitos listados: 5 bloqueantes, 12 criticos, 15 importantes, 8 menores
   - ~113h estimado, ~170h realista
   - 4-sprint roadmap com horas por task

6. **specialist-reviews.md**
   - @data-engineer: Confirmou vulnerabilidades DB, sugeriu materialized views
   - @ux-design-expert: Confirmou todos os UX issues, enfatizou "quick wins first"
   - Both: "SPY-only focus, outras mods depois"

7. **qa-review.md**
   - QA Gate: APPROVED ✅
   - 7-point checklist passed
   - Note: multiply estimates by 1.5x for reality

8. **technical-debt-assessment.md**
   - Top 10 acoes por impacto (18h total para maiores wins)
   - Risk map visualization
   - Sprint execution plan detalhado
   - Decisoes arquiteturais confirmadas

9. **TECHNICAL-DEBT-REPORT.md**
   - 1-page executive summary
   - Key numbers, critical issues, 4-sprint plan
   - Decision: "SPY primeiro. Tudo depois."

### Epic + Stories (17 total)

**docs/stories/epics/EPIC-BD-brownfield-debt.md**
- Master epic com todas as stories listadas
- Total: ~75h (realista: ~110h com overhead)
- 4 sprints: 0 (5h), 1 (20h), 2 (30h), 3 (20h)

**Sprint 0 Stories (3)** - 5h total, START HERE
- `BD-0.1.story.md` - Fix Storage RLS + .env security (2h)
- `BD-0.2.story.md` - Add critical database indexes (1h)
- `BD-0.3.story.md` - Setup branching strategy (2h)

**Sprint 1 Stories (4)** - 20h total, PRIORITY after Sprint 0
- `BD-1.1.story.md` - Replace all iOS emojis with Lucide icons (2h)
- `BD-1.2.story.md` - Fix table sizing and dimensioning (4h)
- `BD-1.3.story.md` - Fix sidebar collapse + dashboard + charts (6h)
- `BD-1.4.story.md` - Fix popups, tooltips, sparkline, graph badges (8h)

**Sprint 2 Stories (5)** - 30h total
- `BD-2.1.story.md` - Decompose God Components (12h)
- `BD-2.2.story.md` - Create service layer (8h)
- `BD-2.3.story.md` - Code splitting + virtualization (4h)
- `BD-2.4.story.md` - Deprecate legacy DB tables (4h)
- `BD-2.5.story.md` - Materialized views for dashboard (2h)

**Sprint 3 Stories (5)** - 20h total
- `BD-3.1.story.md` - Fix remaining bugs (4h)
- `BD-3.2.story.md` - Accessibility overhaul (3h)
- `BD-3.3.story.md` - Skeleton loaders + empty states (5h)
- `BD-3.4.story.md` - Breadcrumb navigation (3h)
- `BD-3.5.story.md` - Critical integration tests (5h)

---

## CRITICO - LEIA ANTES DE COMEÇAR

### TOP 3 Issues que Bloqueiam Tudo

1. **Storage RLS Policies Quebradas (SECURITY)**
   - Migration 20260209004023 substituiu policies workspace-scoped por genéricas
   - Qualquer usuario autenticado pode acessar arquivos de QUALQUER workspace
   - FIX: Restaurar policies com isolamento por workspace
   - **TEMPO:** 30 minutos
   - **PRIORIDADE:** MAXIMA - fazer logo no começo do Sprint 0

2. **.env Modified in Git (SECURITY)**
   - .env aparece como modified no git status
   - Credenciais possivelmente expostas
   - FIX: `git rm --cached .env && echo ".env" >> .gitignore`
   - **TEMPO:** 5 minutos
   - **PRIORIDADE:** MAXIMA - fazer junto com Storage RLS

3. **6 Tabelas Legacy Sem RLS (SECURITY)**
   - arsenal_dorks, arsenal_footprints, arsenal_keywords, comparacao_batches, import_batches, trafego_historico
   - Usuarios podem consultar dados de outros workspaces
   - FIX: Adicionar RLS policies padrao com workspace_id check
   - **TEMPO:** 1 hora
   - **PRIORIDADE:** ALTA - Sprint 0

### Quick Wins (6h = 70% improvement)

1. **Remove Emojis iOS** (2h)
   - Headers, tabs, badges - substituir por Lucide icons
   - Imediato impact visual

2. **Fix Table Sizing** (2h)
   - Fixed column widths + line-clamp
   - Remove layout shifts
   - Badges nao quebram em multiplas linhas

3. **Accessibility** (1h)
   - aria-labels em 50+ icon buttons
   - Focus ring visible

4. **Fix Sidebar Collapse** (1h)
   - CSS flex issue - main content flex-1 full width

**Total 6h = Vai fazer parecer "software caro" vs "beta tool"**

---

## COMO COMEÇAR - Passo a Passo

### Passo 1: Ler Contexto (30 min)
```
1. Ler MEMORY.md (este session)
2. Ler system-architecture.md (Fase 1 overview)
3. Ler TECHNICAL-DEBT-REPORT.md (executivo summary)
```

### Passo 2: Entender Vulnerabilidades (1h)
```
1. Ler DB-AUDIT.md - CRITICAL section
2. Ler frontend-spec.md - CRITICAL BUGS section
```

### Passo 3: Sprint 0 Setup (Semana 1)
```
1. Criar dev branch: git checkout -b dev
2. BD-0.1: Fix Storage RLS + .env (2h)
   - Restaurar storage policies workspace-scoped
   - .env para .gitignore
   - Teste: upload de arquivo deve respeitar workspace

3. BD-0.2: Add critical DB indexes (1h)
   - offer_traffic_data (spied_offer_id, period_date DESC, source)
   - offer_traffic_data (spied_offer_id) - FK missing
   - spied_offers (status, vertical, workspace_id)
   - Teste: EXPLAIN ANALYZE queries - should be fast

4. BD-0.3: Setup branching strategy (2h)
   - main = production (protected)
   - dev = staging (for testing)
   - feature branches = dev
   - Lovable ONLY on lovable/feature branches
   - Atualizar CLAUDE.md com instruções
```

### Passo 4: Sprint 1 (Semana 2-3)
```
Implementar 4 stories em paralelo:
- BD-1.1: Emojis → Lucide (2h) - EASY, HIGH IMPACT
- BD-1.2: Table sizing (4h) - MEDIUM, HIGH IMPACT
- BD-1.3: Sidebar + Dashboard + Charts (6h) - COMPLEX
- BD-1.4: Popups + Tooltips (8h) - MEDIUM

Após Sprint 1:
- Sistema vai parecer "software profissional"
- 80% do valor visivel
- Pronto para mostrar para usuarios
```

### Passo 5: Sprint 2-3 (Semanas 4-6)
```
Refatoracao + Features:
- Decompose God Components (arquitetura melhor)
- Service layer (testes possiveis)
- Code splitting (performance)
- Deprecate legacy tables (schema limpo)
- Tests (confianca no sistema)
```

---

## ARQUIVOS CHAVE A CONSULTAR

| Arquivo | Quando | Motivo |
|---------|--------|--------|
| DB-AUDIT.md | PRIMEIRO | Entender vulnerabilidades |
| BD-0.1.story.md | Sprint 0 | Storage RLS fix |
| BD-0.2.story.md | Sprint 0 | Database indexes |
| BD-1.1.story.md | Sprint 1, Week 1 | Quick win - emojis |
| BD-1.2.story.md | Sprint 1, Week 1 | Quick win - sizing |
| technical-debt-assessment.md | Planning | Top 10 actions priority |
| frontend-spec.md | UX work | Bug fixes + design gaps |

---

## DECISIONS JA FEITAS (NAO MUDAR)

✅ **Tech Stack:** React 18 + Vite + TypeScript + Supabase + TailwindCSS + shadcn/ui
✅ **Deploy:** GitHub → Hostinger (keep as is)
✅ **Dark Mode Only:** Remover toggle, manter dark apenas
✅ **SPY First:** 80% do valor - outros modulos esperam
✅ **SimilarWeb Primary:** Trafego total > organic
✅ **Lucide Icons Only:** Nunca emojis iOS
✅ **Performance Critical:** Sistema lida com 14k+ imports frequentes
✅ **Supabase RLS:** Essencial, configuration broke (fix it)

---

## RISCOS A MONITORA

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|---------------|---------|-----------|
| CSV import lento com 14k+ records | ALTA | CRITICO | BD-2.3 (code split) + batch optimization |
| Lovable/Claude Code conflitos | ALTA | ALTO | BD-0.3 (branching strategy) |
| Performance degrada 100k+ offers | MEDIA | CRITICO | BD-2.5 (materialized views) |
| Single point of failure (1 dev) | ALTA | ALTO | Documentacao (CLAUDE.md, stories) |
| Supabase free tier limits | MEDIA | ALTO | Monitor usage, upgrade when needed |

---

## METRICAS DE SUCESSO

### Apos Sprint 0 (1 semana)
- [ ] Storage RLS policies restored
- [ ] .env removed from git
- [ ] All 6 legacy tables have RLS
- [ ] Critical indexes created
- [ ] Branching strategy documented + implemented
- [ ] Dev branch created and protected

### Apos Sprint 1 (3 semanas)
- [ ] Zero iOS emojis in UI
- [ ] All table cells consistent height
- [ ] Sidebar collapse working
- [ ] Dashboard shows real data
- [ ] Charts respect date filters
- [ ] Popups never overflow screen
- [ ] Tooltips on hover (all interactive elements)
- [ ] System looks "professional" (Lighthouse > 80 performance)

### Apos Sprint 2 (6 semanas)
- [ ] SpyRadar < 300 LOC (decomposed)
- [ ] ImportModal < 200 LOC (decomposed)
- [ ] Service layer with 4 modules
- [ ] Code splitting on routes
- [ ] Legacy tables deprecated
- [ ] Materialized views for dashboard

### Apos Sprint 3 (8 semanas)
- [ ] All remaining bugs fixed
- [ ] Accessibility WCAG AA compliant
- [ ] Skeleton loaders on all async
- [ ] Breadcrumbs on detail pages
- [ ] >30% test coverage on critical paths
- [ ] Ready for production scale

---

## PROXIMO PASSO IMEDIATO

1. **Revisar este handoff** (30 min)
2. **Criar dev branch**
3. **Iniciar BD-0.1** (Fix Storage RLS)
4. **Post diariamente em docs/sessions/2026-02-20/progress.md**

---

## CONTATO / ESCALONAMENTO

Se encontrar issues:
- Consulte DB-AUDIT.md (most common issues)
- Consulte frontend-spec.md (UX bugs)
- Consulte technical-debt-assessment.md (priorities)
- Considere usar Ralph Loop para iteracao rapida

---

**Handoff Completo. Sistema pronto para implementacao.**

— Aria, arquitetando o futuro 🏗️

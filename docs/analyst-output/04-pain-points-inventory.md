# Pain Points Inventory — Inventario Completo de Pontos de Dor

> **Autor:** Atlas (@analyst) | **Data:** 2026-02-22
> **Fontes:** docs/bugs.md, brownfield/technical-debt-assessment.md, brownfield/frontend-spec.md, brownfield/DB-AUDIT.md, src/ analysis, Obsidian Vault
> **Status:** FINAL

---

## 1. Classificacao de Severidade

| Nivel | Icone | Criterio | SLA |
|-------|-------|---------|-----|
| S0-BLOQUEANTE | ◼ | Impede uso do sistema ou expoe dados | Fix imediato (<24h) |
| S1-CRITICO | ◼ | Funcionalidade core quebrada ou performance inaceitavel | Fix esta semana |
| S2-IMPORTANTE | ◼ | UX degradada ou funcionalidade secundaria quebrada | Fix este sprint |
| S3-MENOR | ◼ | Inconveniencia ou polish faltando | Fix quando possivel |

---

## 2. Pain Points ATIVOS (Nao Resolvidos)

### Nota sobre Brownfield Stories

As 17 stories do EPIC-BD (Sprint 0-3) estao marcadas como **DONE** nos story files. Porem, o codigo em `feature/vision-1-foundation` ainda nao foi mergeado em `main`. Alem disso, varios pain points documentados no brownfield PERSISTEM ou sao NOVOS (descobertos nesta analise).

---

### 2.1 SEGURANCA (◼ S0-BLOQUEANTE)

| ID | Pain Point | Origem | Status | Impacto |
|----|-----------|--------|--------|---------|
| PP-SEC-01 | **Storage RLS policies abertas — qualquer usuario autenticado acessa qualquer workspace** | DB-AUDIT.md SEC-01 | BD-0.1 DONE (pendente deploy) | Vazamento de dados cross-workspace |
| PP-SEC-02 | **.env modificado no git — credenciais expostas** | DB-AUDIT.md SEC-03 | BD-0.1 DONE (pendente deploy) | Credenciais do Supabase expostas no repositorio |
| PP-SEC-03 | **6 tabelas legacy sem RLS** (arsenal_dorks, arsenal_footprints, arsenal_keywords, comparacao_batches, import_batches, trafego_historico) | DB-AUDIT.md SEC-02 | BD-0.1 DONE (pendente deploy) | Acesso cross-workspace a dados do Arsenal |

**Status real:** Migrations criadas em BD-0.1, mas branch `feature/vision-1-foundation` NAO foi mergeada em `main`. Producao continua vulneravel.

---

### 2.2 PERFORMANCE (◼ S1-CRITICO)

| ID | Pain Point | Origem | Status | Impacto |
|----|-----------|--------|--------|---------|
| PP-PERF-01 | **87k+ traffic records sem indexes otimizados** — queries full scan | DB-AUDIT.md | BD-0.2 DONE (pendente deploy) | 10-100x mais lento que necessario |
| PP-PERF-02 | **CSV import 14k+ congela main thread** — UI trava por 3-15s | performance-diagnostic.md C1-C3 | NAO RESOLVIDO | Experiencia horrorosa em imports grandes |
| PP-PERF-03 | **useLatestTrafficPerOffer() carrega todos 87k+ records para client** | performance-diagnostic.md C1 | BD-2.5 (mat views) mas hook precisa refactor | Load time de 3-8s no SpyRadar |
| PP-PERF-04 | **Zero code-splitting** — tudo no bundle principal | frontend-spec.md | BD-2.3 DONE (pendente deploy) | Tempo de carregamento inicial alto |
| PP-PERF-05 | **Sem virtualizacao em tabelas 1000+ rows** | frontend-spec.md | BD-2.3 DONE (pendente deploy) | DOM com milhares de nodes |

---

### 2.3 BUGS CONFIRMADOS (◼ S1-CRITICO a S3-MENOR)

#### Bugs do docs/bugs.md (Originais)

| ID | Bug | Severidade | Status BD | Status Real |
|----|-----|-----------|----------|------------|
| BUG-001 | Upload de arquivos falha com "row-level security policy" | S0 | BD-0.1 DONE | Pendente deploy |
| BUG-003 | Graficos de trafego nao respeitam todos os filtros de data | S1 | BD-1.3 DONE | Pendente deploy |
| BUG-004 | Sidebar collapse deixa lacuna a direita | S2 | BD-1.3 DONE | Pendente deploy |
| BUG-005 | Dashboard mostra dados zerados | S1 | BD-1.3 DONE | Pendente deploy |
| BUG-006 | Criativos card nao reabre apos criacao | S2 | BD-3.1 DONE | Pendente deploy |
| BUG-007 | Filtros de ofertas nao persistem | S2 | BD-3.1 DONE | Pendente deploy |
| BUG-008 | iOS emojis na interface (aparencia amadora) | S1 | BD-1.1 DONE | Pendente deploy |
| BUG-009 | Popups com informacao cortada, scroll horizontal forcado | S2 | BD-1.4 DONE | Pendente deploy |
| BUG-010 | Dimensionamento inconsistente (texto em 3-4 linhas) | S2 | BD-1.2 DONE | Pendente deploy |
| BUG-011 | Tooltips ausentes no sistema inteiro | S2 | BD-1.4 DONE | Pendente deploy |
| BUG-012 | Sparkline nao acompanha periodo selecionado | S2 | BD-1.4 DONE | Pendente deploy |

#### Bugs Novos (Descobertos no Brownfield)

| ID | Bug | Severidade | Status |
|----|-----|-----------|--------|
| NEW-01 | Layout shift ao toggle de coluna (sem largura fixa) | S2 | BD-3.1 DONE (pendente deploy) |
| NEW-02 | Import modal Step 3 overflow com 10k+ dominios | S2 | BD-3.1 DONE (pendente deploy) |
| NEW-03 | Notes popover abre fora da tela no edge direito | S3 | BD-3.1 DONE (pendente deploy) |
| NEW-04 | Screenshot lightbox nao responsivo (iPad) | S3 | BD-3.1 DONE (pendente deploy) |
| NEW-05 | Shift+click selecao cross-page imprevisivel | S3 | BD-3.1 DONE (pendente deploy) |
| NEW-06 | Column search case-sensitive (sem diacriticos) | S3 | BD-3.1 DONE (pendente deploy) |
| NEW-07 | Tooltip delay muito longo em texto truncado | S3 | BD-3.1 DONE (pendente deploy) |

#### Bugs Novos (Descobertos NESTA Analise)

| ID | Bug | Severidade | Status |
|----|-----|-----------|--------|
| NEW-08 | parseNumber converte bounce_rate 45.5% → 455 (csvClassifier) | S2 | NAO RESOLVIDO |
| NEW-09 | Lovable + Claude Code ambos commitam em main (conflitos) | S1 | BD-0.3 parcial (branching definido, nao enforced) |
| NEW-10 | ad_creatives pode ter competitor_id E spied_offer_id simultaneamente (CHECK ausente) | S2 | NAO RESOLVIDO |
| NEW-11 | offer_funnel_steps com ON DELETE SET NULL deixa steps orfaos | S2 | NAO RESOLVIDO |
| NEW-12 | Sem updated_at em offer_traffic_data (nao sabe quando foi refreshed) | S2 | NAO RESOLVIDO |
| NEW-13 | VARCHAR(255) em URLs pode truncar URLs longas | S3 | NAO RESOLVIDO |
| NEW-14 | FK inconsistente: CASCADE vs SET NULL nas relacoes SPY | S2 | NAO RESOLVIDO |

---

### 2.4 DIVIDA TECNICA (◼ S1-CRITICO a S3-MENOR)

#### Codigo

| ID | Divida | Severidade | Status | Impacto |
|----|--------|-----------|--------|---------|
| TD-CODE-01 | **God Components** — SpyRadar 1424 LOC, ImportModal 1161, TrafficView 852 | S1 | BD-2.1 DONE (pendente deploy) | Impossivel manter/testar |
| TD-CODE-02 | **Sem service layer** — componentes chamam Supabase diretamente | S1 | BD-2.2 DONE (pendente deploy) | Logica de negocio espalhada |
| TD-CODE-03 | **useSpiedOffers.ts 574 LOC** — 10+ hooks misturados | S1 | BD-2.1 DONE (pendente deploy) | Imports circular possiveis |
| TD-CODE-04 | **Zero testes (0% coverage)** — 2 arquivos de teste, maioria exemplo | S1 | BD-3.5 DONE (92 tests, ~30% coverage critico) | Zero confianca em refactoring |
| TD-CODE-05 | **Sem code-splitting** — tudo no bundle principal | S2 | BD-2.3 DONE (pendente deploy) | Load time alto |
| TD-CODE-06 | **Sem error boundaries** — erro em 1 componente crasheia app inteiro | S2 | NAO RESOLVIDO | White screen of death |
| TD-CODE-07 | **Sem Web Worker para CSV** — processamento no main thread | S2 | NAO RESOLVIDO | UI congela com 14k+ |

#### Banco de Dados

| ID | Divida | Severidade | Status | Impacto |
|----|--------|-----------|--------|---------|
| TD-DB-01 | **7 tabelas legacy redundantes** | S2 | BD-2.4 DONE (pendente deploy) | Schema poluido, confusao |
| TD-DB-02 | **Naming inconsistente PT vs EN** (trafego_historico vs offer_traffic_data) | S3 | NAO RESOLVIDO | Confusao em queries |
| TD-DB-03 | **FK ON DELETE inconsistente** (CASCADE vs SET NULL) | S2 | NAO RESOLVIDO | Orfaos possiveis |
| TD-DB-04 | **Sem materialized view para dashboard** | S2 | BD-2.5 DONE (pendente deploy) | Dashboard lento com 500k+ |
| TD-DB-05 | **Sem particionamento para offer_traffic_data** | S3 | NAO RESOLVIDO (necessario em 1M+ rows) | Performance futura |

#### Infraestrutura

| ID | Divida | Severidade | Status | Impacto |
|----|--------|-----------|--------|---------|
| TD-INFRA-01 | **Sem CI/CD pipeline** — nenhum teste roda no deploy | S1 | NAO RESOLVIDO | Deploy cego |
| TD-INFRA-02 | **Sem staging environment** — deploy direto para producao | S1 | NAO RESOLVIDO | Risco em cada deploy |
| TD-INFRA-03 | **Branching strategy definida mas nao enforced** | S2 | BD-0.3 DONE (parcial) | Lovable ainda pode commitar em main |
| TD-INFRA-04 | **Sem monitoring/alerting** | S2 | NAO RESOLVIDO | Sem visibilidade de erros |

---

### 2.5 UX / ACESSIBILIDADE (◼ S2-IMPORTANTE a S3-MENOR)

| ID | Pain Point | Severidade | Status | Impacto |
|----|-----------|-----------|--------|---------|
| PP-UX-01 | **50+ icon buttons sem aria-label** | S2 | BD-3.2 DONE (pendente deploy) | Inacessivel para screen readers |
| PP-UX-02 | **Tabela nao navegavel por teclado** (Tab, Arrow keys) | S2 | BD-3.2 DONE (pendente deploy) | Keyboard users bloqueados |
| PP-UX-03 | **Badges dependem apenas de cor** (sem texto alternativo) | S2 | BD-3.2 DONE (pendente deploy) | Daltonicos nao distinguem |
| PP-UX-04 | **Sem skeleton loaders** — tela branca durante load | S2 | BD-3.3 DONE (pendente deploy) | Percepcao de lentidao |
| PP-UX-05 | **Sem empty states** — tela vazia sem orientacao | S2 | BD-3.3 DONE (pendente deploy) | Usuario perdido |
| PP-UX-06 | **Sem breadcrumbs** — navegacao confusa em detail pages | S3 | BD-3.4 DONE (pendente deploy) | Context loss |
| PP-UX-07 | **Chart color badges nao correspondem as linhas** | S2 | BD-1.4 DONE (pendente deploy) | Confusao visual |
| PP-UX-08 | **Font default do sistema** (nao Inter) | S3 | NAO RESOLVIDO | Aparencia generica |
| PP-UX-09 | **Sem micro-interactions** (hover, slide-in, glow) | S3 | NAO RESOLVIDO | Sem feedback visual |
| PP-UX-10 | **Card de oferta clicavel apenas no nome** (nao no card inteiro) | S3 | NAO RESOLVIDO | Frustration click |

---

### 2.6 FRAGMENTACAO DO ECOSSISTEMA (◼ S1-CRITICO)

| ID | Pain Point | Severidade | Impacto |
|----|-----------|-----------|---------|
| PP-FRAG-01 | **Dados em 5 locais** (Supabase, Finder, Obsidian, Notion, DR-Operations legacy) | S1 | Nao sabe qual e a fonte de verdade |
| PP-FRAG-02 | **Prompts em 3 locais** (Obsidian, DR-Operations/PROMPTS, Claude Projects) | S2 | Duplicacao e desatualizacao |
| PP-FRAG-03 | **Nomenclatura definida no Vault mas nao enforced no webapp** | S2 | Inconsistencia de naming |
| PP-FRAG-04 | **Metricas de performance de criativos em planilha externa** | S1 | Decisoes WIN/KILL fora do sistema |
| PP-FRAG-05 | **Workflow de avatar depende de Claude Desktop externo** | S2 | Context switch + friccao |

---

## 3. Impacto Financeiro Estimado

### Custo de NAO resolver (por semana)

| Pain Point | Custo Semanal Estimado | Racional |
|-----------|----------------------|---------|
| PP-SEC-01 (Storage RLS) | R$0-∞ (risco) | Data breach pode custar tudo |
| PP-PERF-02 (CSV freeze) | ~2h perdidas | 14k+ import × 2-3 vezes/semana |
| PP-PERF-03 (87k load) | ~1h perdida | Page load lento × frequencia diaria |
| PP-FRAG-04 (metrics external) | ~3h perdidas | Context switch para planilha × 5-10 criativos/semana |
| PP-FRAG-05 (avatar external) | ~2h perdidas | Context switch para Claude × 1-2 avatars/semana |
| BUG-001 (upload broken) | ~1h perdida | Workarounds para upload |
| BUG-005 (dashboard zeros) | Confianca perdida | Dashboard inutil, nao consulta mais |

**Estimativa conservadora: ~9 horas/semana perdidas** em friccao e workarounds.

---

## 4. Priorizacao: Pain Points por Urgencia

### Tier 1: AGORA (Impede operacao segura)

| ID | Pain Point | Fix |
|----|-----------|-----|
| PP-SEC-01 | Storage RLS aberto | Deploy BD-0.1 migration |
| PP-SEC-02 | .env no git | Deploy BD-0.1 + git rm --cached |
| PP-SEC-03 | 6 tabelas sem RLS | Deploy BD-0.1 migration |
| BUG-001 | Upload broken | Deploy BD-0.1 RLS fix |

**Blocker:** Branch `feature/vision-1-foundation` precisa ser mergeada ou migrations aplicadas manualmente.

### Tier 2: ESTA SEMANA (Impede operacao eficiente)

| ID | Pain Point | Fix |
|----|-----------|-----|
| PP-PERF-01 | Indexes faltando | Deploy BD-0.2 migration |
| PP-PERF-03 | 87k load client-side | Completar refactor de hooks com RPC |
| BUG-003 | Charts vs date filters | Deploy BD-1.3 fix |
| BUG-005 | Dashboard zeros | Deploy BD-1.3 fix |
| BUG-008 | iOS emojis | Deploy BD-1.1 changes |
| NEW-09 | Lovable commits em main | Enforce branching strategy |

### Tier 3: ESTE SPRINT (Degrada UX significativamente)

| ID | Pain Point | Fix |
|----|-----------|-----|
| PP-PERF-02 | CSV freeze 14k+ | Web Worker implementation |
| BUG-004 | Sidebar gap | Deploy BD-1.3 fix |
| BUG-009 | Popups cortados | Deploy BD-1.4 fix |
| BUG-010 | Dimensionamento | Deploy BD-1.2 fix |
| TD-CODE-06 | Sem error boundaries | Adicionar ErrorBoundary em routes |
| PP-FRAG-04 | Metrics em planilha | Creative lifecycle no webapp |

### Tier 4: PROXIMO SPRINT (Polish e sustentabilidade)

| ID | Pain Point | Fix |
|----|-----------|-----|
| TD-INFRA-01 | Sem CI/CD | GitHub Actions basico |
| TD-INFRA-02 | Sem staging | Branch protection + preview deploys |
| NEW-08 | parseNumber bug | Fix regex em csvClassifier.ts |
| NEW-10 | ad_creatives CHECK | ADD CHECK constraint |
| NEW-11 | Funnel steps orfaos | Mudar SET NULL → CASCADE |
| TD-DB-02 | Naming PT vs EN | Rename incremental |

---

## 5. Heat Map de Pain Points

```
                   ALTA FREQUENCIA
                        │
  ┌─────────────────────┼────────────────────────┐
  │                     │                        │
  │  PP-PERF-03 (87k)  │  PP-PERF-02 (CSV)     │
  │  PP-FRAG-04 (plan) │  BUG-008 (emojis)     │
  │  PP-SEC-01 (RLS)   │  BUG-010 (sizing)     │
  │                     │  PP-FRAG-05 (avatar)  │
  │  ALTA SEVERIDADE    │  MEDIA SEVERIDADE      │
  │  (Fix First)        │  (Fix Soon)            │
  │                     │                        │
  ├─────────────────────┼────────────────────────┤
  │                     │                        │
  │  BUG-001 (upload)   │  PP-UX-08 (font)      │
  │  TD-INFRA-01 (CI)   │  PP-UX-09 (micro-int) │
  │  TD-INFRA-02 (stag) │  PP-UX-10 (card click)│
  │  PP-SEC-02 (.env)   │  NEW-13 (VARCHAR URL) │
  │                     │  TD-DB-02 (naming)    │
  │  ALTA SEVERIDADE    │  BAIXA SEVERIDADE      │
  │  (Critical but Rare)│  (Nice-to-Have)        │
  │                     │                        │
  └─────────────────────┼────────────────────────┘
                        │
                   BAIXA FREQUENCIA
```

---

## 6. Metricas de Saude do Sistema

### Score Atual (0-100)

| Dimensao | Score | Justificativa |
|---------|-------|-------------|
| **Seguranca** | 30/100 | 3 vulnerabilidades criticas, RLS parcialmente aberto |
| **Performance** | 50/100 | RPC implementado mas hooks nao refatorados, indexes pendentes |
| **Estabilidade** | 40/100 | 19 bugs confirmados (12 originais + 7 novos brownfield) |
| **Testabilidade** | 25/100 | 92 tests criados mas ~30% coverage apenas em CSV/traffic |
| **Manutenabilidade** | 45/100 | God components decompostos (pendente deploy), service layer criada |
| **UX** | 55/100 | Core funcional, visual amador (emojis, sizing), sem a11y |
| **Automacao** | 5/100 | Zero automacao de workflows |
| **Documentacao** | 70/100 | Brownfield excelente, Vault rico, mas nao sincronizado |

**Score Geral: 40/100** (MVP funcional com divida tecnica significativa)

### Score APOS Deploy de BD-0.x a BD-3.x

| Dimensao | Score Atual | Score Pos-Deploy | Delta |
|---------|------------|-----------------|-------|
| Seguranca | 30 | 85 | +55 |
| Performance | 50 | 75 | +25 |
| Estabilidade | 40 | 70 | +30 |
| Testabilidade | 25 | 45 | +20 |
| Manutenabilidade | 45 | 75 | +30 |
| UX | 55 | 80 | +25 |
| Automacao | 5 | 5 | 0 |
| Documentacao | 70 | 75 | +5 |
| **Score Geral** | **40** | **64** | **+24** |

**Conclusao:** O EPIC-BD resolve ~60% dos pain points. Os 40% restantes sao:
- Automacao de workflows (nenhuma story no BD)
- CI/CD e staging (nenhuma story no BD)
- Fragmentacao do ecossistema (problema estrutural)
- Performance do CSV (Web Worker nao implementado)

---

## 7. Pain Points por Persona

### Marcos (Operador Solo, ADHD)

| O que mais doi | Frequencia | Impacto Emocional |
|---------------|-----------|-------------------|
| CSV import congela (14k+) | 2-3x/semana | Frustration → distraction |
| Context switch para planilha (WIN/KILL) | Diario | Lost focus → procrastination |
| Context switch para Claude (avatar) | 1-2x/semana | Extra cognitive load |
| Dashboard inutil (zeros) | Diario | "Sistema nao funciona" feeling |
| Emojis iOS = aparencia amadora | Toda vez que abre | "Parece projeto pessoal" shame |
| Upload quebrado | Toda vez que tenta | "Basico nao funciona" anger |

### Padroes ADHD-Specific

| Padrao ADHD | Pain Point Correlacionado | Fix Design |
|------------|--------------------------|-----------|
| Dificuldade em iniciar tarefas | Sem daily briefing | Dashboard com "aqui esta o que precisa de atencao" |
| Hiperfoco → esquece resto | Sem timer/reminder | Checklist de rotina (5 min daily) |
| Distracao por context switch | 6+ ferramentas externas | Single pane of glass |
| Necessidade de feedback visual | Sem micro-interactions | Glow, pulse, transitions |
| Memoria de curto prazo fraca | Notas dispersas | Tudo vinculado a oferta (notes, changelog) |
| Motivacao por resultado visivel | Dashboard zerado | Dashboard real com KPIs que importam |

---

## 8. Resumo Executivo

### Numeros Chave

| Metrica | Valor |
|---------|-------|
| Pain points totais catalogados | **52** |
| S0-BLOQUEANTE | 3 (seguranca) |
| S1-CRITICO | 14 |
| S2-IMPORTANTE | 24 |
| S3-MENOR | 11 |
| Bugs confirmados | 19 (12 originais + 7 brownfield) |
| Bugs novos (esta analise) | 7 |
| Dividas tecnicas ativas | 16 |
| Pain points de fragmentacao | 5 |
| Pain points de UX/a11y | 10 |
| Horas perdidas/semana estimadas | ~9h |
| Score de saude atual | **40/100** |
| Score pos-BD deploy | **64/100** |

### Top 5 Pain Points por Impacto

1. **PP-SEC-01** — Storage RLS aberto (seguranca: qualquer usuario ve tudo)
2. **PP-PERF-03** — 87k records carregados client-side (3-8s load time)
3. **PP-FRAG-04** — Metricas de criativo em planilha externa (decisoes fora do sistema)
4. **PP-PERF-02** — CSV 14k+ congela UI (main thread bloqueado)
5. **BUG-005** — Dashboard zeros (sistema parece quebrado)

### Acao Imediata Requerida

**PRIORIDADE ZERO:** Mergear ou aplicar manualmente as migrations de seguranca (BD-0.1) em producao. Cada dia sem este fix e um dia com dados expostos.

---

*Atlas — catalogando a dor para guiar a cura*

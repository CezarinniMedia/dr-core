# Workflow Analysis — Fluxos Atuais vs Fluxos Ideais

> **Autor:** Atlas (@analyst) | **Data:** 2026-02-22
> **Fontes:** Obsidian Vault (processos operacionais), src/ (implementacao real), Brownfield (gaps)
> **Status:** FINAL

---

## 1. Inventario de Workflows

| # | Workflow | Dominio | Frequencia | Implementado? |
|---|---------|---------|-----------|--------------|
| W-01 | Pipeline de Espionagem | SPY | Semanal | PARCIAL |
| W-02 | Import CSV Universal | SPY | Diario/Semanal | COMPLETO |
| W-03 | Curadoria de Radar | SPY | Diario | COMPLETO |
| W-04 | Analise Profunda de Oferta | SPY | Sob demanda | COMPLETO |
| W-05 | Comparativo de Trafego | SPY | Sob demanda | COMPLETO |
| W-06 | Lancamento de Oferta Propria | OFERTAS | Sob demanda | PARCIAL |
| W-07 | Extracao de Avatar | AVATAR | Sob demanda | STUB |
| W-08 | Producao de Criativo | CRIATIVOS | Continuo | PARCIAL |
| W-09 | Decisao WIN/KILL de Criativo | CRIATIVOS | Semanal | NAO EXISTE |
| W-10 | Rotina Diaria (5 min) | OPS | Diario | NAO EXISTE |
| W-11 | Review Semanal (30 min) | OPS | Semanal | NAO EXISTE |
| W-12 | Review Mensal (1h) | OPS | Mensal | NAO EXISTE |

---

## 2. Analise Detalhada por Workflow

### W-01: Pipeline de Espionagem

#### Fluxo IDEAL (Vault)

```
┌────────────────────────────────────────────────────────┐
│  MINERACAO SEMANAL (automatizada)                       │
│                                                         │
│  1. Arsenal → selecionar top footprints                 │
│  2. PublicWWW → executar busca → exportar CSV            │
│  3. Import DR OPS → auto-classificar → upsert           │
│  4. Semrush Bulk → 100 top dominios → exportar CSV      │
│  5. Import DR OPS → trafego organico upsert             │
│  6. SimilarWeb → 50 top dominios → exportar CSV         │
│  7. Import DR OPS → trafego total upsert                │
│  8. Curadoria rapida → RADAR → ANALYZING/VAULT          │
│                                                         │
│  Tempo total: 2-3 horas/semana                          │
│  Resultado: 100% do mercado coberto, ninguem fora       │
└────────────────────────────────────────────────────────┘
```

#### Fluxo ATUAL (Webapp)

```
┌────────────────────────────────────────────────────────┐
│  MINERACAO MANUAL (ad-hoc)                              │
│                                                         │
│  1. [EXTERNO] Abrir PublicWWW no browser                │
│  2. [EXTERNO] Digitar footprint manualmente             │
│  3. [EXTERNO] Exportar CSV para Downloads/              │
│  4. [WEBAPP]  Abrir Import Modal                        │
│  5. [WEBAPP]  Drag-drop CSV ← ponto de entrada ✅      │
│  6. [WEBAPP]  Auto-classificacao (10 tipos) ✅          │
│  7. [WEBAPP]  Matching (encontrar ofertas existentes) ✅│
│  8. [WEBAPP]  Import (upsert com dedup) ✅              │
│  9. Repetir 1-8 para Semrush...                         │
│  10. Repetir 1-8 para SimilarWeb...                     │
│                                                         │
│  Tempo total: 4-6 horas/semana (muito context-switch)   │
│  Cobertura: parcial (depende da motivacao do operador)  │
└────────────────────────────────────────────────────────┘
```

#### GAP Analysis

| Aspecto | Ideal | Atual | Delta |
|---------|-------|-------|-------|
| Tempo semanal | 2-3h | 4-6h | 2x mais lento |
| Context switches | 0 (tudo no webapp) | 6+ (browser → export → drag) | Friccao alta |
| Cobertura de mercado | 100% | Variavel (depende do humor) | Risco de perder spikes |
| Automacao | Pipeline cron | Zero | Total manual |
| Feedback de progresso | Progress bar, ETA | Toast no final | Sem visibilidade durante |

#### Recomendacoes

1. **Curto prazo (4h):** Adicionar link direto para PublicWWW/Semrush no Arsenal (abre pre-preenchido com footprint)
2. **Medio prazo (16h):** URL import — colar URL do PublicWWW → webapp faz scrape direto
3. **Longo prazo (40h+):** Edge function com Semrush API → import automatico semanal

---

### W-02: Import CSV Universal

#### Fluxo ATUAL (Implementado — 95% ideal)

```
Step 1: UPLOAD ──────────────────────────────────────────
│  • Drag-drop, paste text, ou footprint query            │
│  • Detecta delimiter automaticamente (, ; \t |)         │
│  • Strip BOM (SimilarWeb)                               │
│  • Preview 5 linhas                                     │
│  QUALITY: ★★★★★                                         │

Step 2: CLASSIFICATION ──────────────────────────────────
│  • 10 tipos detectados automaticamente                  │
│  • Periodo extraido do filename (prioridade) ou headers │
│  • Footprint extraido do PublicWWW                      │
│  QUALITY: ★★★★☆ (parseNumber bug: bounce_rate 45.5→455)│

Step 3: MATCHING ────────────────────────────────────────
│  • Para cada dominio: busca em spied_offers + domains   │
│  • Merge manual possivel (override matches)             │
│  • Exclude columns/rows antes de importar               │
│  QUALITY: ★★★★☆ (slow com 14k+, sem Web Worker)       │

Step 4: RESULT ──────────────────────────────────────────
│  • Cria spied_offers para dominios novos (status RADAR) │
│  • Cria offer_domains                                   │
│  • Upsert traffic via RPC bulk_upsert_traffic_data()    │
│  • Cria import_batch (audit trail)                      │
│  • Toast notification com metricas                      │
│  QUALITY: ★★★★★                                         │
```

#### Gaps Remanescentes

| Gap | Severidade | Fix |
|-----|-----------|-----|
| 14k+ rows congela main thread | ALTA | Web Worker (O-25, 8h) |
| parseNumber converte 45.5% → 455 | BAIXA | Fix regex em csvClassifier.ts |
| Sem progress bar durante import | MEDIA | Streaming progress via Web Worker |
| Sem "Apply to All" para tipo/periodo em batch | IMPLEMENTADO ✅ | Ja existe |
| Sem undo/rollback de import | BAIXA | Complexo, baixa prioridade |

---

### W-03: Curadoria de Radar

#### Fluxo ATUAL (Implementado — 85% ideal)

```
1. FILTRAR ──────────────────────────────────────────────
   • Multi-status toggle (badges clicaveis) ✅
   • Vertical filter ✅
   • Discovery source filter ✅
   • Search por nome/dominio ✅
   • MonthRangePicker para trafego ✅
   • Toggle SimilarWeb/SEMrush ✅

2. ORDENAR ──────────────────────────────────────────────
   • Por trafego, variacao %, peak ✅
   • Por data de criacao, atualizacao ✅
   • Colunas visiveis customizaveis ✅

3. AVALIAR (por linha) ──────────────────────────────────
   • Sparkline mostra tendencia ✅
   • Screenshot thumbnail no hover ✅
   • Notas truncadas com tooltip ✅
   • Lightbox com zoom+pan ✅

4. DECIDIR ──────────────────────────────────────────────
   • Status inline (dropdown) ✅
   • Bulk status change ✅
   • Bulk delete ✅
   • Saved views ✅

5. APROFUNDAR ───────────────────────────────────────────
   • Click → 7 tabs detail ✅
```

#### Gaps

| Gap | Impacto | Fix |
|-----|---------|-----|
| Sem keyboard shortcuts (j/k para navegar, s para status) | ALTO para ADHD user | O-19, 8h |
| Sem "Archive Hotmart/irrelevant" quick action | MEDIO | Filtro predefinido em saved view |
| Sem indicador de "novo desde ultima visita" | MEDIO | Campo `last_viewed_at` + badge |
| Sem contagem de ofertas por status no header | BAIXO | Query count simples |

---

### W-04: Analise Profunda de Oferta (7 Tabs)

#### Fluxo ATUAL vs IDEAL

| Tab | Atual | Ideal (Vault) | Gap |
|-----|-------|-------------|-----|
| Overview | Campos basicos + screenshot | + Brief completo + network links | PARCIAL |
| Domains | CRUD funcional | + WHOIS auto + age indicator | PARCIAL |
| Libraries | CRUD manual | + Auto-detect via Meta API | AUSENTE (API) |
| Creatives | Gallery basica | + 5 Angulos tag + performance metrics | PARCIAL |
| Funnel | Tabela linear | Diagrama visual estilo Funnelytics | DIVERGENTE |
| Traffic | Chart + tabela | + Anomaly detection + export | PARCIAL |
| Notes | Markdown textarea | + Changelog auto + structured tags | PARCIAL |

---

### W-05: Comparativo de Trafego (Traffic Intelligence)

#### Fluxo ATUAL (Implementado — 90% ideal)

```
1. SELECIONAR OFERTAS ──────────────────────────────────
   • Filtrar por status, vertical ✅
   • Multi-select para comparar ✅

2. VISUALIZAR ──────────────────────────────────────────
   • Multi-domain chart (N linhas, cores unicas) ✅
   • Sparklines inline na tabela ✅
   • MonthRangePicker controla periodo ✅
   • Toggle SimilarWeb/SEMrush ✅

3. ANALISAR ────────────────────────────────────────────
   • Ordenar por variacao % ✅
   • Ordenar por peak ✅
   • Identificar spike visual ✅
   • Hover mostra valores por ponto ✅

4. INTERAGIR ───────────────────────────────────────────
   • Click toggles visibilidade de linha ✅
   • Legend com cor + nome ✅
   • Pagination (top + bottom) ✅
```

#### Gaps

| Gap | Impacto |
|-----|---------|
| Sem export do chart como imagem/PDF | BAIXO |
| Sem comparativo entre verticais (aggregate) | MEDIO |
| Sem deteccao automatica de correlacao entre ofertas | BAIXO |

---

### W-06: Lancamento de Oferta Propria

#### Fluxo IDEAL (Vault — 20 min setup)

```
Step 1: CRIAR ESTRUTURA DE PASTAS (2 min)
   • Duplicar template _TEMPLATE-OFERTA/
   • Renomear [STATUS]_[AAMM]_[vertical]-[name]/
   • 9 subpastas: 00_BRIEF → 08_SPY

Step 2: CRIAR ENTRADA (Notion → Webapp) (3 min)
   • Preencher: nome, vertical, mercado, ticket, status=RESEARCH

Step 3: PREENCHER BRIEF (10 min)
   • Template completo:
     - Positioning, promise, pricing
     - Avatar preliminar
     - Objectives (CPA/ROAS targets)
     - Competitors identificados
     - Angulos potenciais

Step 4: MARKET RESEARCH (30-60 min)
   • PublicWWW footprint
   • Facebook Ads Library
   • SimilarWeb traffic
   • Google search

Step 5: AVATAR EXTRACTION (20-40 min)
   • Input: Brief + Research
   • Output: Pain matrix, Desire matrix, Objections, Language patterns

Step 6: VALIDACAO
   • Checklist: estrutura OK, brief OK, research OK, avatar OK

TOTAL: ~90 min para oferta pronta para producao
```

#### Fluxo ATUAL (Webapp)

```
Step 1: CRIAR OFERTA (3 min)
   • OfertaFormDialog: nome, vertical, mercado, ticket, status
   • Campos basicos apenas

Step 2: ... (nao existe no webapp)
   • Sem brief template
   • Sem link com pesquisa
   • Sem integracao com avatar
   • Sem checklist de validacao
   • Sem link com spied_offers para clone

TOTAL: 3 min para criar registro basico
   (restante dos 90 min e 100% manual fora do sistema)
```

#### Gap Critico

O Vault documenta um **workflow de 6 etapas com templates, checklists e automacao**. O webapp implementa **apenas a etapa 1 (CRUD basico)**. As 5 etapas restantes acontecem fora do sistema (Finder, Obsidian, Claude Desktop).

**Recomendacao:** Implementar wizard de "Nova Oferta" com:
1. Form basico (ja existe)
2. Brief template (template do Vault)
3. Link para Arsenal (footprints relevantes)
4. Avatar AI extraction (stub ja existe)
5. Clone from spied_offer (pre-populate)
6. Checklist de validacao

---

### W-07: Extracao de Avatar

#### Fluxo IDEAL (Vault)

```
INPUT: Research data + competitor testimonials + forum data

EXTRACTION:
│  1. Pain Matrix (10+ dores especificas, rankeadas 1-10)
│  2. Desire Matrix (10+ desejos especificos, rankeados 1-10)
│  3. Objection Matrix (8+ objecoes: preco, confianca, eficacia, tempo)
│  4. Emotional Triggers (medo, aspiracao, pertencimento, escassez)
│  5. Language Patterns (palavras-gatilho positivas/negativas)
│  6. Demographics (idade, genero, renda, educacao)

PROCESS:
│  • Analisar 3-5 testimonials de competidores
│  • Minerar foruns (Reddit, Facebook Groups)
│  • Entrevistar clientes se possivel
│  • Usar Claude para sintetizar

OUTPUT: [oferta]_avatar_v1_[date].md
   Versao incrementada para A/B testing
```

#### Fluxo ATUAL (Webapp)

```
INPUT: Formulario manual

FIELDS:
│  • nome (text)
│  • estado_atual, estado_desejado (text)
│  • pain_matrix (JSON array — input manual)
│  • desire_matrix (JSON array — input manual)
│  • objecoes (JSON array — input manual)
│  • gatilhos_emocionais (JSON array)
│  • linguagem_avatar (text)
│  • demographics (JSON)

AI EXTRACTION: Modal STUB (renderiza, funcao vazia)

OUTPUT: Registro no Supabase
```

#### Gap Principal

O Vault descreve **extracao AI profunda** com analise de testimonials e forums. O webapp tem **formulario manual** com campo AI stub. A extracao de avatar e ~50% do trabalho de pesquisa e deveria ser automatizada.

---

### W-08: Producao de Criativo

#### Fluxo IDEAL (Vault — 50-100 criativos/mes)

```
1. IDEACAO (5-10 min)
   • Revisar avatar (pain/desire/objection)
   • Revisar spy (angulos competidores)
   • Decidir angulo: dor|curiosidade|resultado|autoridade|medo
   • Criar entrada no tracker

2. GERAR HOOKS (5-15 min)
   • Claude → 10 hook variations baseadas em avatar+angulo
   • Selecionar 3-5 melhores

3. PRODUZIR ASSET (variavel)
   • Imagens: AI gen → edit → export
   • Videos: footage → edit → export → specs por plataforma
   • Naming: DRAFT_[oferta]_[tipo]_[id]_[versao]_[data].[ext]

4. COMPLIANCE CHECK (2-5 min)
   • Verificar claims medicos/FTC

5. UPLOAD (5-10 min)
   • Upload para plataforma (Meta/Google/TikTok)
   • Rename: DRAFT_ → TEST_
   • Budget: R$50-100/dia teste

6. MONITORAR (24-72h)
   • Coleta minima: 100+ clicks OU 72h
   • Metricas: CTR, CPA, ROAS

7. DECISAO (WIN/KILL)
   • WIN: CTR > benchmark, CPA < target, ROAS > 2.5x
     → Rename TEST_ → WINNER_
     → Backup para _SWIPE/ADS-WINNERS/
     → Increase budget 25-50%/dia
   • KILL: CPA > target+25%, CTR < benchmark/2
     → Rename TEST_ → KILLED_
     → Log learnings
     → Nao re-testar
```

#### Fluxo ATUAL (Webapp)

```
1. CRIAR CRIATIVO (CriativosPage)
   • Upload arquivo (drag-drop)
   • Preencher: nome, tipo, hook, copy, CTA, plataforma, angulo
   • Status: draft

2. KANBAN VIEW
   • Mover entre colunas (draft → active → archived → testing)
   • Drag-drop

3. ... (restante nao existe)
   • Sem geracao de hooks AI
   • Sem compliance check
   • Sem WINNER/KILLED lifecycle
   • Sem metricas de performance integradas
   • Sem backup automatico para swipe
   • Sem decision tree data-driven
```

#### Gap: 70% do workflow NAO esta implementado

O Vault descreve um **ciclo completo de 7 etapas** com producao em volume (50-100/mes), decisao data-driven e aprendizado institucional. O webapp implementa **etapa 1 e 2 apenas** (upload + kanban basico). As 5 etapas mais criticas (hooks, compliance, monitoring, WIN/KILL, learning) sao 100% manuais fora do sistema.

---

### W-09: Decisao WIN/KILL de Criativo (NAO EXISTE)

#### Fluxo IDEAL (Vault)

```
TRIGGER: 72h de dados coletados

DECISION TREE:
│
├─ CTR acima do benchmark (1.5-3%)?
│  ├─ NAO → KILL (hook nao para scroll)
│  │        Next: testar angulo diferente
│  │
│  └─ SIM → CPA abaixo do target (AOV/3)?
│     ├─ NAO → KILL (para scroll mas nao converte)
│     │        Next: testar copy/landing diferente
│     │
│     └─ SIM → ROAS > 2.5x?
│        ├─ NAO → TEST (mais dados necessarios, 7 dias)
│        │
│        └─ SIM → WINNER 🏆
│                 Actions:
│                 1. Rename TEST_ → WINNER_
│                 2. Backup para _SWIPE/ADS-WINNERS/
│                 3. Criar metricas: WINNER_[name].txt
│                 4. Aumentar budget 25-50%/dia
│                 5. Criar 3-4 variacoes do winner
│
│  On KILL:
│  1. Rename TEST_ → KILLED_
│  2. Log learnings em _CHANGELOG.md
│  3. NAO re-testar mesmo criativo
│  4. Seguir para proximo angulo

WEBHOOK: Toda sexta-feira (Weekly Review)
```

#### Status Atual: ZERO implementacao

O webapp nao tem NENHUM aspecto deste workflow. Nem campo WINNER/KILLED no schema, nem decision tree, nem metricas de performance por criativo, nem backup automatico. Todas as decisoes WIN/KILL acontecem na cabeca do operador + planilha externa.

---

### W-10/11/12: Rotinas Operacionais (NAO EXISTEM)

#### Rotina Diaria IDEAL (5 min — Vault)

```
1. INBOX Processing (processar downloads do dia)
2. Nomenclature Check (renomear arquivos genericos)
3. Notion Update (status de criativos e ofertas)
4. Quick Log (_CHANGELOG.md com decisoes do dia)
```

#### Rotina Semanal IDEAL (30 min — Vault)

```
1. Creative Review (TEST → WIN/KILL decision)
2. Weekly Metrics (export + analise Meta/Google)
3. Status Updates (ofertas mudaram de status?)
4. Backup Winners (WINNER_ → _SWIPE/)
5. Cleanup (KILLED_ > 30 dias → archive/delete)
```

#### Rotina Mensal IDEAL (1h — Vault)

```
1. Comprehensive Review (revenue, spend, ROAS por oferta)
2. Archive Dead (post-mortem para MORTA)
3. Metrics Consolidation (monthly report)
4. Market Intel Update (competidores ativos? trends?)
5. System Check (estrutura OK? gaps?)
6. Backup (3-2-1 rule)
```

#### Status Atual: ZERO implementacao

O webapp nao tem checklists, reminders, rotinas ou dashboards para suportar estas rotinas. O operador depende inteiramente de disciplina pessoal (dificil com ADHD).

**Recomendacao:** Criar "Daily Briefing" page que mostra:
- Items novos desde ontem
- Criativos em TEST > 72h (precisam decisao)
- Ofertas com spike detectado
- Quick actions: processar INBOX, review criativos

---

## 3. Matriz de Fricao (Friction Points)

### Escala de Fricao

| Nivel | Descricao | Exemplo |
|-------|----------|---------|
| F0 | Zero friction — automatico | Dedup no upsert |
| F1 | 1-click — instantaneo | Inline status change |
| F2 | 2-3 clicks — rapido | Quick-add modal |
| F3 | Form completo — moderado | Full offer form |
| F4 | Multi-step — lento | CSV import 4 steps |
| F5 | Context switch — frustrante | Sair do webapp para PublicWWW |

### Inventario de Friction Points

| Workflow | Etapa | Fricao | Descripcao | Fix Proposto |
|---------|-------|--------|-----------|-------------|
| Espionagem | Buscar footprint | F5 | Sair para PublicWWW | Link direto do Arsenal |
| Espionagem | Export Semrush | F5 | Sair para Semrush | Semrush API (longo prazo) |
| Curadoria | Mudar status | F1 | Inline dropdown ✅ | OK |
| Curadoria | Navegar para oferta | F2 | Click na linha | Keyboard shortcut (Enter) |
| Import | Import CSV | F4 | 4 steps necessarios | Web Worker + progress |
| Analise | Abrir oferta | F2 | Click + load page | Prefetch on hover |
| Lancamento | Criar oferta propria | F3 | Form basico | Wizard com template |
| Lancamento | Clone de spied | F5 | Nao existe link | Clone button (O-03) |
| Avatar | Extrair AI | F5 | Sair para Claude Desktop | Integrar edge function |
| Criativos | Upload | F3 | Form + drag-drop | Bulk upload |
| Criativos | WIN/KILL | F5 | Nao existe no webapp | Decision tree UI |
| Dashboard | Ver metricas | F2 | Load page | Auto-refresh + realtime |
| Arsenal | Usar dork | F5 | Copy → cola no browser | Open in new tab pre-filled |

### Friction Hotspots (F4-F5 = requerem atencao)

```
F5: Context Switch (maior fonte de fricao)
│
├─ PublicWWW search          ← Fix: Arsenal deep link
├─ Semrush export            ← Fix: API integration (long term)
├─ Clone spied → own         ← Fix: Clone button (O-03)
├─ Avatar AI extraction      ← Fix: Edge function (O-14)
├─ Creative WIN/KILL         ← Fix: Decision tree UI (O-09/W-09)
└─ Arsenal → search engine   ← Fix: Open in new tab

F4: Multi-Step
│
├─ CSV Import (4 steps)      ← Fix: Web Worker + streaming
└─ Full Offer Creation       ← Fix: Wizard com brief template
```

---

## 4. Workflow Automation Roadmap

### Nivel 1: Manual Assistido (Hoje → 4 semanas)

| Automacao | Antes | Depois | Esforco |
|----------|-------|--------|---------|
| Arsenal → PublicWWW link | Copy pasta footprint | Click abre PublicWWW pre-preenchido | 2h |
| Clone spied → own | Recriar manualmente | 1-click popula oferta propria | 8h |
| Brief auto-populate | Preencher do zero | Template pre-preenchido do Vault | 4h |
| Decision tree criativo | Na cabeca | UI com threshold + recomendacao | 12h |
| Daily briefing page | Nao existe | Dashboard com items pendentes | 8h |

### Nivel 2: Semi-Automatico (4-8 semanas)

| Automacao | Antes | Depois | Esforco |
|----------|-------|--------|---------|
| Avatar AI extraction | Claude Desktop externo | Edge function no webapp | 8h |
| Hook generation | Claude Desktop externo | Edge function integrado | 12h |
| Spike notification | Sem notificacao | Toast + email quando spike | 8h |
| Screenshot auto-capture | Manual screenshot | Puppeteer edge function | 12h |
| CSV progress streaming | Congela com 14k+ | Web Worker + progress bar | 8h |

### Nivel 3: Automatizado (8-16 semanas)

| Automacao | Antes | Depois | Esforco |
|----------|-------|--------|---------|
| Weekly traffic refresh | Manual reimport | Cron + Semrush API | 24h |
| Trend detection | Nao existe | ML clustering + alerts | 24h |
| Network detection | Manual (inspect code) | Pixel/analytics matching | 16h |
| Creative performance sync | Manual entry | Platform API integration | 40h+ |

### Nivel 4: Autonomo (16+ semanas)

| Automacao | Antes | Depois | Esforco |
|----------|-------|--------|---------|
| Full pipeline cron | Todas as etapas manuais | PublicWWW → Semrush → SW → curadoria assistida | 40h+ |
| AI clustering de ofertas | Lista flat de 12k+ | Grupos automaticos por nicho/promessa/mecanismo | 20h |
| Compliance auto-check | Nao existe | Verificar claims antes de lancar | 12h |
| Predictive spike detection | Reativo (ja aconteceu) | Proativo (vai acontecer) | 24h |

---

## 5. Workflow Coverage Score

| Workflow | Etapas Ideal | Etapas Implementadas | Coverage |
|---------|-------------|---------------------|----------|
| W-01 Pipeline Espionagem | 8 | 4 (steps 5-8 no webapp) | **50%** |
| W-02 Import CSV | 4 | 4 | **95%** |
| W-03 Curadoria Radar | 5 | 5 | **85%** |
| W-04 Analise Profunda | 7 tabs | 7 tabs (parciais) | **80%** |
| W-05 Comparativo Trafego | 4 | 4 | **90%** |
| W-06 Lancamento Oferta | 6 | 1 (CRUD basico) | **15%** |
| W-07 Extracao Avatar | 6 | 1 (form manual) | **15%** |
| W-08 Producao Criativo | 7 | 2 (upload + kanban) | **25%** |
| W-09 Decisao WIN/KILL | 7 | 0 | **0%** |
| W-10 Rotina Diaria | 4 | 0 | **0%** |
| W-11 Review Semanal | 5 | 0 | **0%** |
| W-12 Review Mensal | 6 | 0 | **0%** |

### Coverage por Dominio

| Dominio | Coverage Media | Comentario |
|---------|---------------|-----------|
| SPY (Espionagem) | **80%** | Core bem implementado, pipeline externo |
| OFERTAS (Proprio) | **15%** | Apenas CRUD, sem workflow |
| AVATAR | **15%** | Form manual, AI stub |
| CRIATIVOS | **12%** | Upload basico, sem lifecycle |
| OPS (Rotinas) | **0%** | Nenhuma rotina automatizada |

**Media Geral: ~40%** dos workflows ideais estao implementados no webapp.

---

## 6. Diagrama de Fluxo Consolidado: Estado Atual vs Futuro

### Estado ATUAL

```
                    EXTERNO                      WEBAPP
              ┌──────────────────┐      ┌──────────────────────┐
              │                  │      │                      │
              │  PublicWWW       │─CSV─>│  Import Modal        │
              │  Semrush         │─CSV─>│  (10 tipos, dedup)   │
              │  SimilarWeb      │─CSV─>│                      │
              │                  │      │         ↓             │
              │  Meta Ads Library│─manual│  SpyRadar            │
              │  Claude Desktop  │      │  (curadoria + detail)│
              │  Notion          │      │                      │
              │  Finder          │      │  Ofertas (CRUD)      │
              │                  │      │  Avatar (CRUD)       │
              │  Planilha metrics│      │  Criativos (Kanban)  │
              │  (WIN/KILL)      │      │  Dashboard (basico)  │
              │                  │      │                      │
              └──────────────────┘      └──────────────────────┘
                    60% do trabalho            40% do trabalho
```

### Estado FUTURO (Single Pane of Glass)

```
              ┌──────────────────────────────────────────────────┐
              │                   DR OPS WEBAPP                   │
              │              (fonte unica de verdade)             │
              │                                                   │
              │  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │
              │  │ ESPIONAGEM  │  │ OPERACAO    │  │ INTEL    │ │
              │  │             │  │ PROPRIA     │  │          │ │
              │  │ • Pipeline  │  │ • Wizard    │  │ • Trends │ │
              │  │   auto      │→→│   oferta    │  │ • Spikes │ │
              │  │ • Radar     │  │ • Avatar AI │  │ • Network│ │
              │  │ • Detail    │  │ • Criativos │  │ • Coverage│ │
              │  │ • Compare   │  │   lifecycle │  │          │ │
              │  └─────────────┘  └─────────────┘  └──────────┘ │
              │                                                   │
              │  ┌─────────────────────────────────────────────┐ │
              │  │           AUTOMACAO & AI                     │ │
              │  │  • Edge functions (avatar, hooks, compliance)│ │
              │  │  • Cron (traffic refresh, spike detection)   │ │
              │  │  • Realtime (spike alerts, live updates)     │ │
              │  └─────────────────────────────────────────────┘ │
              │                                                   │
              │  APIs: Semrush | SimilarWeb | Meta | Google       │
              └──────────────────────────────────────────────────┘
                           100% do trabalho no webapp
```

**Objetivo final:** Reduzir context switches de 6+ por sessao para ZERO. Tudo no webapp. Single pane of glass.

---

*Atlas — deconstruindo fluxos para reconstruir melhor*

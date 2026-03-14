# Opportunity Map — Gaps entre o que Existe e o que Deveria Existir

> **Autor:** Atlas (@analyst) | **Data:** 2026-02-22
> **Fontes:** Brownfield (9 docs), Obsidian Vault (operational playbook), src/ (implemented logic), Vision Architecture
> **Status:** FINAL

---

## 1. Metodologia

Cada oportunidade foi mapeada comparando 3 fontes:

1. **O que o Vault documenta** (processo operacional ideal descrito no Obsidian)
2. **O que o webapp implementa** (codigo real em src/)
3. **O que o brownfield identificou** (dividas tecnicas e gaps)

Classificacao de gap: `AUSENTE` (nao existe), `PARCIAL` (existe mas incompleto), `DIVERGENTE` (existe mas diferente do ideal)

---

## 2. Mapa de Oportunidades por Area

### 2.1 ESPIONAGEM — Core Domain (80% do valor)

| # | Capacidade | Vault (Ideal) | Webapp (Real) | Gap | Impacto | Esforco |
|---|-----------|--------------|---------------|-----|---------|---------|
| O-01 | **Pipeline Automatizado Semanal** | PublicWWW → Semrush → SimilarWeb atualizado toda semana, cobertura 100% do mercado | Import manual via CSV drag-drop, usuario executa cada etapa | AUSENTE | CRITICO — velocidade e o principio #1 | ALTO (40h+) |
| O-02 | **Operator Network Detection** | Identificar mesmo pixel/analytics/IP em multiplos dominios → agrupar ofertas por operador | Nenhuma deteccao de rede. `operator_name` e campo manual | AUSENTE | ALTO — revela quem escala e para onde vai | MEDIO (16h) |
| O-03 | **Clone to Own Offer** | Um clique: spied_offer → ofertas propria com dados pre-preenchidos (avatar, brief, criativos) | Nao existe. Criar oferta propria e 100% manual, sem relacao com spied | AUSENTE | ALTO — conecta espionagem com acao | BAIXO (8h) |
| O-04 | **Creative Swipe Library** | _SWIPE/ADS-WINNERS/ organizado por vertical/angulo, com metricas de performance | ad_creatives existe mas sem scoring, sem organizacao por angulo, sem WINNER/KILLED lifecycle | PARCIAL | ALTO — evita reinventar a roda | MEDIO (12h) |
| O-05 | **5 Angulos Framework no UI** | Cada criativo classificado em Dor/Curiosidade/Resultado/Autoridade/Medo com filtro | Campo `angulo` existe em ad_creatives mas sem vocabulario padrao, sem filtro no UI | PARCIAL | MEDIO — organiza abordagem criativa | BAIXO (4h) |
| O-06 | **VSL Forensics** | Transcrever VSL, decompor estrutura (hook 0-30s, agitacao 30s-3m, mecanismo 3-8m, prova 8-12m, oferta 12-15m) | Nenhuma funcionalidade. offer_funnel_steps e generico, nao tem decomposicao de VSL | AUSENTE | MEDIO — inteligencia competitiva profunda | ALTO (24h) |
| O-07 | **Spike Notification System** | Alerta em tempo real quando trafego sobe >100% em 30 dias | RPC detect_spikes() existe, spike_alerts tabela existe, mas sem notificacao push/email/toast ativo | PARCIAL | ALTO — oportunidade perdida = dinheiro perdido | MEDIO (8h) |
| O-08 | **Domain Age/WHOIS Enrichment** | Idade do dominio, registrar, hosting provider auto-detectados | Campos whois_registrar, whois_expiry migrados do legacy, mas nenhum auto-enriquecimento | PARCIAL | BAIXO — nice-to-have para due diligence | MEDIO (12h) |
| O-09 | **Funnel Visual Map** | Diagrama visual estilo Funnelytics (ad → landing → checkout → upsell) | offer_funnel_steps e tabular (lista), nao visual. Sem diagrama de fluxo | DIVERGENTE | MEDIO — visual-first e principio P2 | MEDIO (16h) |
| O-10 | **Market Coverage Dashboard** | "100% do mercado no radar. Ninguem fora." | Sem metricas de cobertura. Nao sabemos quantos % do mercado estao trackeados | AUSENTE | MEDIO — visibilidade operacional | BAIXO (4h) |

### 2.2 OPERACAO PROPRIA — Supporting Domain

| # | Capacidade | Vault (Ideal) | Webapp (Real) | Gap | Impacto | Esforco |
|---|-----------|--------------|---------------|-----|---------|---------|
| O-11 | **Offer Folder Structure** | Template padrao com 9 pastas (00_BRIEF → 08_SPY) + nomenclatura rigida | `ofertas` e registro simples no DB. Sem estrutura de pastas, sem template | DIVERGENTE | MEDIO — organizacao operacional | MEDIO (12h) |
| O-12 | **Creative Status Lifecycle** | DRAFT → TEST → WINNER/KILLED com renaming automatico + backup para _SWIPE | `criativos.status` = draft/active/archived/testing. Sem WINNER/KILLED, sem backup auto | PARCIAL | ALTO — decisao de performance | BAIXO (6h) |
| O-13 | **Performance Metrics per Creative** | CTR, CPA, ROAS trackeados por criativo, decisao WIN/KILL baseada em dados | `performance_metrics` e JSON manual. Sem integracao com plataformas, sem decision tree | PARCIAL | ALTO — data-driven decisions | ALTO (24h+) |
| O-14 | **Avatar AI Extraction** | Claude extrai pain/desire/objection matrix automaticamente de texto/research | AvatarExtractionModal existe como STUB (modal renderiza, funcao nao implementada) | PARCIAL | ALTO — 50% do trabalho de avatar e extracao | MEDIO (8h) |
| O-15 | **Offer Brief Template** | Template padrao: positioning, promise, pricing, avatar, objectives, competitors, angles | Nenhum brief. `ofertas` tem campos basicos mas sem template estruturado | AUSENTE | MEDIO — qualidade do lancamento | BAIXO (4h) |
| O-16 | **Weekly Metrics Review** | Export semanal de Meta/Google, dashboard com Revenue/Spend/ROAS/CPA por oferta | Nenhuma integracao. Metricas de campanha nao existem no sistema | AUSENTE | ALTO — visibilidade financeira | ALTO (40h+) |
| O-17 | **Post-Mortem on Dead Offers** | Documento estruturado: timeline, revenue, cause of death, learnings | Ofertas com status MORTA nao tem template de analise. So muda status | AUSENTE | MEDIO — aprendizado institucional | BAIXO (4h) |

### 2.3 INFRAESTRUTURA & UX

| # | Capacidade | Vault/Vision (Ideal) | Webapp (Real) | Gap | Impacto | Esforco |
|---|-----------|---------------------|---------------|-----|---------|---------|
| O-18 | **Command Palette (Cmd+K)** | Zero-friction capture: Cmd+K abre paleta global para navegar, buscar, executar | CommandPalette.tsx existe, cmdk instalado, mas subutilizado (sem actions de criacao rapida) | PARCIAL | ALTO — ADHD user needs speed | BAIXO (6h) |
| O-19 | **Keyboard Shortcuts** | Operador solo = keyboard-first. Atalhos para tudo | useKeyboardShortcuts hook existe mas NAO IMPLEMENTADO | PARCIAL | ALTO — velocidade operacional | MEDIO (8h) |
| O-20 | **CSV Export** | Exportar radar, trafego, ofertas em CSV para analise externa | Nenhuma funcionalidade de export. Apenas import | AUSENTE | MEDIO — interoperabilidade | BAIXO (4h) |
| O-21 | **Markdown Export/Import (Ofertas + Avatares)** | Exportar/importar em Markdown para portabilidade | Nenhuma. Dados presos no Supabase | AUSENTE | BAIXO — portabilidade de dados | BAIXO (4h) |
| O-22 | **Real-Time Updates** | Supabase Realtime para notificacoes de spike, atualizacoes colaborativas | useRealtimeSubscription hook EXISTE mas NAO CONECTADO | PARCIAL | MEDIO — colaboracao futura | MEDIO (8h) |
| O-23 | **Global Search** | Buscar em TODOS os modulos (ofertas, avatares, criativos, arsenal, notas) | Search apenas local por modulo (nome + main_domain no radar) | PARCIAL | ALTO — discovery speed | MEDIO (12h) |
| O-24 | **Activity History per Offer** | Changelog por oferta: quem mudou o que, quando, por que | activity_log tabela existe mas cobertura esparsa, sem view por oferta | PARCIAL | MEDIO — auditoria e aprendizado | BAIXO (6h) |
| O-25 | **Web Worker for CSV Processing** | CSV processing off main thread para evitar freeze | Todo processamento no main thread. Freeze com 14k+ linhas | AUSENTE | ALTO — UX com volumes grandes | MEDIO (8h) |

### 2.4 INTELIGENCIA & AUTOMACAO

| # | Capacidade | Vault (Ideal) | Webapp (Real) | Gap | Impacto | Esforco |
|---|-----------|--------------|---------------|-----|---------|---------|
| O-26 | **AI Offer Clustering** | Agrupar ofertas similares automaticamente (mesmo nicho, mesma promessa, mesmo mercado) | Nenhum clustering. 12k+ ofertas em lista flat | AUSENTE | ALTO — descobrir padroes em massa | ALTO (20h) |
| O-27 | **Trend Detection** | Identificar verticais/nichos emergentes antes da saturacao | Spike por oferta existe, mas nao trend por vertical/mercado | AUSENTE | CRITICO — competitive advantage | ALTO (24h) |
| O-28 | **Hook Generator Integration** | Gerar 10 hooks automaticamente a partir de avatar + angulo | Claude Project no Obsidian, mas nao integrado ao webapp | AUSENTE | ALTO — accelera producao criativa | MEDIO (12h) |
| O-29 | **Compliance Checker** | Verificar claims medicos/FTC antes de lancar | Claude Project no Obsidian, nao integrado | AUSENTE | MEDIO — evita banimento de ads | MEDIO (12h) |
| O-30 | **Automated Screenshot Capture** | Screenshot automatico de landing pages no import | screenshot_url e campo manual. Nenhuma captura automatica | AUSENTE | MEDIO — evidencia visual automatica | MEDIO (12h) |

---

## 3. Heatmap de Oportunidades (Impacto vs Esforco)

```
                       ALTO IMPACTO
                           │
    ┌──────────────────────┼──────────────────────┐
    │                      │                      │
    │  O-01 Pipeline Auto  │  O-03 Clone to Own   │
    │  O-27 Trend Detect   │  O-05 5 Angulos UI   │
    │  O-07 Spike Notif    │  O-12 Creative LC     │
    │  O-26 AI Clustering  │  O-18 Cmd+K           │
    │  O-16 Weekly Metrics │  O-14 Avatar AI       │
    │  O-13 Creative Perf  │  O-20 CSV Export      │
    │                      │  O-15 Brief Template  │
    │  ALTO ESFORCO        │  BAIXO ESFORCO        │
    │  (Strategic Bets)    │  (Quick Wins)         │
    ├──────────────────────┼──────────────────────┤
    │                      │                      │
    │  O-02 Network Detect │  O-10 Coverage Dash   │
    │  O-06 VSL Forensics  │  O-17 Post-Mortem     │
    │  O-09 Funnel Visual  │  O-21 MD Export       │
    │  O-28 Hook Generator │  O-24 Activity History│
    │  O-25 Web Worker     │                      │
    │  O-29 Compliance     │                      │
    │                      │                      │
    │  ALTO ESFORCO        │  BAIXO ESFORCO        │
    │  (Nice-to-Have)      │  (Low Priority)       │
    │                      │                      │
    └──────────────────────┼──────────────────────┘
                           │
                       BAIXO IMPACTO
```

---

## 4. Quick Wins — Top 10 Oportunidades de Maior ROI

| Rank | ID | Oportunidade | Esforco | Porque Alto ROI |
|------|-----|-------------|---------|----------------|
| 1 | O-03 | Clone spied_offer → oferta propria | 8h | Conecta espionagem com acao. Hoje sao 2 mundos separados |
| 2 | O-05 | 5 Angulos Framework no UI | 4h | Vocabulario padrao ja existe. So falta enforce no campo angulo |
| 3 | O-12 | Creative Status Lifecycle (WINNER/KILLED) | 6h | Vault ja tem decisao tree completa. So falta refletir no DB |
| 4 | O-18 | Command Palette com Quick Actions | 6h | cmdk ja instalado. Adicionar: quick-add offer, navigate, search |
| 5 | O-15 | Offer Brief Template | 4h | Template completo no Vault. So criar formulario no webapp |
| 6 | O-20 | CSV Export | 4h | Funcao pura de serializar dados existentes |
| 7 | O-14 | Avatar AI Extraction | 8h | Modal STUB ja existe. Conectar com Claude API via edge function |
| 8 | O-07 | Spike Notification Toast | 8h | RPC + tabela existem. Falta UI de notificacao |
| 9 | O-10 | Market Coverage Dashboard | 4h | Query simples: total offers por vertical/geo vs benchmark |
| 10 | O-17 | Post-Mortem Template | 4h | Template do Vault. Criar modal/page para ofertas MORTA |

**Total Quick Wins: ~56h para fechar os 10 gaps mais impactantes**

---

## 5. Strategic Bets — Oportunidades Transformacionais

| ID | Oportunidade | Por que Transformacional | Pre-requisitos |
|----|-------------|-------------------------|---------------|
| O-01 | Pipeline Automatizado Semanal | Elimina trabalho manual repetitivo. Cobertura 100% do mercado. Principio "Total Coverage" (P5) | Edge functions, Semrush API, cron jobs |
| O-27 | Trend Detection por Vertical | Descobrir nicho emergente 2-4 semanas antes da saturacao = vantagem competitiva massiva | AI clustering (O-26), volume de dados suficiente |
| O-26 | AI Offer Clustering | 12k+ ofertas sem organizacao. Clustering revela padroes impossiveis de ver manualmente | ML/NLP, embeddings de texto |
| O-16 | Weekly Metrics Dashboard | Conecta espionagem com resultado financeiro. Hoje nao sabemos ROI das operacoes | Meta/Google API integration |
| O-13 | Creative Performance Tracking | Decision tree data-driven: WIN/KILL baseado em CTR/CPA/ROAS reais, nao intuicao | Platform API integration |

---

## 6. Gap por Principio Fundamental

### P1: Speed-First (<100ms perceived)

| Implementado | Gap |
|-------------|-----|
| RPC pagination (server-side) | Web Worker para CSV (O-25) |
| Lazy-loaded modals | Keyboard shortcuts (O-19) |
| DISTINCT ON queries | Command palette actions (O-18) |
| Materialized views | Inline create sem modal |

### P2: Visual-First (Graphs > Tables > Text)

| Implementado | Gap |
|-------------|-----|
| Sparklines no radar | Funnel visual diagram (O-09) |
| Multi-domain chart | VSL structure decomposition (O-06) |
| Status badges coloridos | Heatmap de trafego por vertical |
| MonthRangePicker | Creative gallery com thumbnail grid |

### P3: Zero-Friction Capture

| Implementado | Gap |
|-------------|-----|
| CSV drag-drop import | Clone to own offer 1-click (O-03) |
| Quick-add modal | Command palette quick-add (O-18) |
| Inline status edit | Brief template auto-populate (O-15) |
| | Avatar AI extraction (O-14) |

### P4: Automation-Ready

| Implementado | Gap |
|-------------|-----|
| Smart dedup (upsert) | Weekly pipeline automation (O-01) |
| Bulk operations | Spike notifications (O-07) |
| Import audit trail | Hook generation (O-28) |
| | Screenshot auto-capture (O-30) |

### P5: Total Coverage

| Implementado | Gap |
|-------------|-----|
| 12k+ offers tracked | Coverage metrics dashboard (O-10) |
| 10 CSV types supported | Trend detection cross-market (O-27) |
| Monthly reimport manual | Automated refresh (O-01) |

### P6: Solo Operator (Keyboard-First)

| Implementado | Gap |
|-------------|-----|
| Bulk actions | Keyboard shortcuts (O-19) |
| Saved views | Command palette (O-18) |
| localStorage persistence | Vim-style navigation (future) |

### P7: Data Sanctuary (Never Lose)

| Implementado | Gap |
|-------------|-----|
| Soft-delete (VAULT) | Activity history per offer (O-24) |
| Import audit trail | Post-mortem on dead offers (O-17) |
| Upsert dedup | Version history for notes |
| | Export/backup (O-20, O-21) |

---

## 7. Oportunidades por Horizonte Temporal

### Horizonte 1: Agora (0-2 semanas) — Quick Wins

| ID | Oportunidade | Esforco |
|----|-------------|---------|
| O-05 | 5 Angulos Framework enforced | 4h |
| O-15 | Offer Brief Template | 4h |
| O-17 | Post-Mortem Template | 4h |
| O-20 | CSV Export | 4h |
| O-10 | Coverage Metrics | 4h |
| **Total** | | **20h** |

### Horizonte 2: Proximo (2-6 semanas) — High-Value Features

| ID | Oportunidade | Esforco |
|----|-------------|---------|
| O-03 | Clone to Own Offer | 8h |
| O-12 | Creative Lifecycle (WINNER/KILLED) | 6h |
| O-18 | Command Palette Actions | 6h |
| O-07 | Spike Notifications | 8h |
| O-14 | Avatar AI Extraction | 8h |
| O-19 | Keyboard Shortcuts | 8h |
| O-25 | Web Worker CSV | 8h |
| **Total** | | **52h** |

### Horizonte 3: Futuro (6-12 semanas) — Strategic Bets

| ID | Oportunidade | Esforco |
|----|-------------|---------|
| O-01 | Pipeline Automatizado | 40h+ |
| O-02 | Operator Network Detection | 16h |
| O-26 | AI Offer Clustering | 20h |
| O-27 | Trend Detection | 24h |
| O-09 | Funnel Visual Map | 16h |
| O-28 | Hook Generator Integration | 12h |
| **Total** | | **128h+** |

### Horizonte 4: Visao (12+ semanas) — Ecosystem

| ID | Oportunidade | Esforco |
|----|-------------|---------|
| O-16 | Weekly Metrics + Platform APIs | 40h+ |
| O-13 | Creative Performance Tracking | 24h+ |
| O-06 | VSL Forensics | 24h |
| O-29 | Compliance Checker | 12h |
| O-30 | Auto Screenshot Capture | 12h |
| **Total** | | **112h+** |

---

## 8. Consolidacao: Score de Maturidade por Area

| Area | Vault (Ideal) | Webapp (Real) | Maturidade | Prioridade |
|------|-------------|---------------|-----------|------------|
| Importacao CSV | 10 tipos documentados | 10 tipos implementados | **95%** | Manter |
| Tracking de Trafego | SimilarWeb + Semrush por dominio | Implementado com dedup | **90%** | Manter |
| Curadoria de Status | 9 estados + bulk | Implementado com inline edit | **85%** | Manter |
| Analise de Oferta (7 tabs) | Profunda com todos os campos | Implementado funcional | **80%** | Polir |
| Saved Views / Filtros | Power-user workflow | Implementado com localStorage | **80%** | Manter |
| Arsenal (Dorks/Footprints) | Biblioteca reutilizavel | Implementado basico | **70%** | Expandir |
| Ofertas Proprias | Lifecycle completo com brief | CRUD basico sem brief/metrics | **40%** | Melhorar |
| Avatar / Research | Extracao AI profunda | CRUD basico, AI stub | **35%** | Implementar AI |
| Criativos | WINNER/KILLED lifecycle + metrics | Kanban basico sem lifecycle | **30%** | Reestruturar |
| Dashboard | KPIs financeiros + cobertura | KPIs basicos, sem financeiro | **25%** | Expandir |
| Automacao | Pipeline semanal completo | Zero automacao | **5%** | Strategic bet |
| AI/Intelligence | Clustering, trends, hooks, compliance | Nenhum | **0%** | Futuro |

**Maturidade Media Ponderada: ~55%** (SPY module puxa para cima, restante puxa para baixo)

---

*Atlas — mapeando o territorio entre o real e o possivel*

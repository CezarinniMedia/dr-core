# Estado do Projeto - DR OPS
**Ultima atualizacao:** 2026-03-01
**Atualizado por:** Claude Opus 4.6 (@pm Morgan)

## Status Geral
- **Fase:** Pos-Vision. 6 fases implementadas, todas com QA PASS. Aguardando merge para dev/main.
- **Branch ativa:** `feature/vision-1-foundation` (pronta para merge)
- **Prioridade atual:** Merge → Deploy → Operacao → Proximas features
- **Deploy:** GitHub (CezarinniMedia/dr-core) auto-deploy → Hostinger
- **Testes:** 209 testes (13 arquivos), 0 falhas
- **Build:** PASS (14.23s), typecheck clean (0 erros)

## Stack
| Tecnologia | Status |
|-----------|--------|
| React 18 + Vite + TypeScript | Mantido |
| Supabase (auth, DB, storage, realtime, edge functions) | Mantido + expandido (MVs, RPCs, realtime, pg_cron) |
| TailwindCSS + shadcn/ui | Mantido + design system customizado |
| React Query (TanStack) | Mantido |
| Recharts | Mantido |
| Framer Motion | Mantido |
| TanStack Virtual | Ativado (TrafficTable) |
| Web Worker (nativo) | Novo — CSV processing off-thread |
| cmdk | Ativado — Command Palette (Cmd+K) |
| eslint-plugin-jsx-a11y | Novo — 17 regras de acessibilidade |
| vitest + vitest-axe + @testing-library/react | Novo — 209 testes automatizados |

## Arquitetura Pos-Vision

### Design System
- **Tokens:** 45 tokens CSS em `src/shared/design-system/tokens.css` (100% alinhado ao aesthetic-profile.md)
- **Primitivas:** GlassmorphismCard, LEDGlowBorder, AmbientGlow
- **Componentes:** DataMetricCard, StatusBadge, SparklineBadge
- **Tipografia:** Inter (body) + JetBrains Mono (dados)
- **Tema:** Dark mode exclusivo, paleta violet/teal/amber

### Estrutura Feature-Based
```
src/
├── features/
│   ├── spy/            # Modulo Espionagem (Radar, TrafficIntel, Import, Tabs)
│   ├── dashboard/      # Dashboard reescrito (KPIs, spikes, heatmap)
│   ├── offers/         # Ofertas proprias (3 views)
│   ├── avatar/         # Avatar & Research
│   ├── creatives/      # Criativos (Kanban + naming engine)
│   └── arsenal/        # Arsenal (dorks, footprints, keywords) [NOVO]
├── shared/
│   ├── design-system/  # tokens, primitivas, componentes
│   ├── components/     # layout (sidebar, header, command-palette)
│   ├── hooks/          # useRealtimeSubscription, etc.
│   └── lib/            # utils compartilhados
├── workers/            # Web Worker para CSV
├── pages/              # Paginas/rotas
├── integrations/       # Supabase client + types
└── __tests__/          # 209 testes (lib, hooks, a11y)
```

### Backend (Supabase)
- **3 Materialized Views:** mv_dashboard_metrics, mv_traffic_summary, mv_spike_detection
- **4+ RPCs:** bulk_upsert_traffic_data, get_dashboard_metrics, get_traffic_comparison, detect_spikes, refresh_pipeline, get_pipeline_status, search_spied_offers_*, count_spied_offers_*
- **Realtime:** Trigger spike_alerts com pg_notify
- **pg_cron:** Refresh automatico de MVs (dashboard 4h, trafego 6h, spikes 2h)
- **Server-side pagination:** RPCs para SpyRadar com busca 2-phase (exata + fuzzy)

### Performance
- Web Worker para CSV (14k+ linhas sem travar main thread)
- Virtualizacao no TrafficTable (TanStack Virtual)
- Vendor chunk splitting (react, supabase, query, ui, charts, motion)
- Server-side pagination no SpyRadar (RPCs, nao PostgREST full-scan)
- Fetch paralelo paginado (5 paginas simultaneas) para trafego
- Cache React Query: 5min padrao, 6h para trafego

### Qualidade
- **209 testes** em 13 arquivos (lib: csvClassifier, parseSemrush, trafficProcessing, utils, logger, analytics, storage; hooks: CRUD, traffic, relations, savedViews; a11y: 8 componentes)
- **ESLint jsx-a11y:** 7 regras error, 10 regras warn
- **axe-core:** Testes automatizados de acessibilidade
- **aria-labels:** Em todos os botoes icon-only (10+ componentes)

## Modulos

### Modulo SPY (Radar de Ofertas) — PRIORITARIO
- **SpyRadar:** Server-side pagination, busca 2-phase (exata + fuzzy), multi-status filter, multi-select (Cmd/Shift), bulk actions, colunas personalizaveis (6 grupos, busca, presets), toggle SimilarWeb/SEMrush, Vault toggle, Saved Views com Cmd+K
- **Inteligencia de Trafego:** Sparklines com spike detection (>100% orange pulse), graficos comparativos multi-dominio (12 cores, glassmorphism tooltip), paginacao, ordenacao por trafego/variacao/pico
- **MonthRangePicker:** Estilo Semrush, 6 presets, selecao continua, fixes A+B aplicados
- **Importador Universal CSV:** 10 tipos automaticos, Web Worker off-thread, batch ops (chunks 1000), dedup inteligente, Import Job Tracking com historico e retry
- **Oferta individual:** 7 tabs (Overview, Dominios, Bibliotecas, Ad Creatives, Funil, Trafego, Notas) — todas com design tokens aplicados
- **Pipeline:** Status com refresh manual, advisory lock, indicadores no dashboard
- **Saved Views:** Filtros salvos, pin/delete com confirmacao, deep-linking URL, acesso via Cmd+K

### Dashboard — REESCRITO
- 5 KPI cards com dados reais (via RPC get_dashboard_metrics)
- Spike Detection UI com realtime subscription e toast
- Donut chart de distribuicao de status (design tokens resolvidos em runtime)
- Activity feed com timeline e icones por acao
- Heatmap Calendar (3 meses, 5 niveis de intensidade)
- Pipeline Status Card com refresh manual
- Quick links de navegacao

### Ofertas
- 3 modos de visualizacao: cards, tabela, kanban
- Drag-and-drop status change no kanban
- Edicao completa com 5 cards (detalhes, tech stack, etc.)
- Delete com AlertDialog de confirmacao

### Avatar
- Criacao manual via modal
- Edicao de campos JSONB
- Export Markdown

### Criativos
- Kanban com drag-and-drop
- Naming engine auto-geracao
- Duplicacao de cards
- Campo headline

### Arsenal [NOVO]
- 3 tabs: Dorks, Footprints, Keywords
- CRUD completo com busca sanitizada (protecao SQL injection)
- Favoritar, copiar, contagem de uso
- Delete com AlertDialog de confirmacao

### Command Palette (Cmd+K)
- Navegacao por modulos
- Acesso rapido a Saved Views
- Atalhos de teclado globais

## Brownfield (EPIC-BD)
- **17/17 stories Done** — todas completadas ou absorvidas pelo Vision
- Sprint 0: BD-0.1 (Storage RLS), BD-0.2 (indexes), BD-0.3 (branching) — Done
- Sprint 1: BD-1.1 (Lucide icons), BD-1.2 (table sizing), BD-1.3 (sidebar+dashboard+charts), BD-1.4 (popups+tooltips+sparklines) — Done
- Sprint 2: BD-2.1 (god components), BD-2.2 (service layer), BD-2.3 (code splitting+virtualizacao), BD-2.4 (legacy tables), BD-2.5 (materialized views) — Done
- Sprint 3: BD-3.1 (bugs), BD-3.2 (acessibilidade), BD-3.3 (skeletons), BD-3.4 (breadcrumbs), BD-3.5 (testes) — Done

## Vision (6 Fases)

| Fase | Titulo | Gate | Commits | Testes |
|------|--------|------|---------|--------|
| VISION-1 | Foundation (design system, feature architecture, Cmd+K, keyboard shortcuts) | PASS | 5 | 93/93 |
| VISION-2 | Design System Integration (Web Worker CSV, tokens SPY Radar + Offer Detail) | PASS | 4 | 93/93 |
| VISION-2A | Sacred Features (chart comparativo, sparklines, MonthRangePicker fixes) | PASS | -- | -- |
| VISION-3 | Intelligence Layer (3 MVs, 4 RPCs, spike detection, dashboard rewrite) | PASS | 8 | 93/93 |
| VISION-4 | Modules (Ofertas 3 views, Avatar manual, Criativos naming, Arsenal) | PASS | 5 | N/A |
| VISION-5 | Automation (Import Tracking, Saved Views, Pipeline) | PASS | 6 | N/A |
| VISION-6 | Accessibility, Testing & Performance (209 testes, a11y, virtualizacao) | PASS | 6 | 209/209 |

## Dados no Sistema
- 12k+ ofertas espionadas (importadas via CSV)
- 87k+ registros de trafego historico
- Fontes: PublicWWW (footprint cdn.utmify.com.br) + Semrush (monthly) + SimilarWeb (monthly_sw)
- Target: 500k+ registros de trafego em 6 meses

## Issues Conhecidos (Pos-Vision)
- **ESLint projeto-wide:** 160 erros pre-existentes (maioria @typescript-eslint/no-explicit-any em services/workers) — fora do escopo Vision
- **axe-core em jsdom:** Color contrast checks nao funcionam (limitacao jsdom) — testes cobrem estrutura
- **pg_cron:** Verificar se extensao esta habilitada no Supabase remoto pos-deploy
- **Types.ts:** Regenerar com `supabase gen types typescript` apos deploy das migracoes
- **Backward-compat views:** mv_dashboard_stats e mv_offer_traffic_summary podem ser removidas apos confirmar que frontend usa RPCs novos
- **Tech debt LOW aceito:** ~45 instancias text-muted-foreground, STATUS_BADGE duplicado, useEffect dep em CriativoFormDialog

## Proximas Acoes
Ver `docs/tasks.md`

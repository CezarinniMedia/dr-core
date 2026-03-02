# DR OPS - Webapp de Direct Response Marketing

## Stack
- React 18 + Vite + TypeScript
- Supabase (auth, database, storage, RLS)
- TailwindCSS + shadcn/ui
- Deploy: GitHub (CezarinniMedia/dr-core) → Hostinger (auto-deploy from main)

## Estrutura do Projeto (Feature-Based Architecture — pos-Vision)
```
src/
├── features/                           # Modulos de dominio (feature-based)
│   ├── spy/                            #   SPY MODULE (80% do valor) - PRIORITARIO
│   │   ├── components/
│   │   │   ├── spy-radar/              #     SpyOffersTable, SpyFilterBar, SpyBulkActionsBar, SavedViewsDropdown, SpyColumnSelector, PipelineStatusCard
│   │   │   ├── traffic-intel/          #     TrafficTable (virtualizado), TrafficChartingPanel, TrafficControlBar
│   │   │   ├── import-modal/           #     UniversalImportModal, ImportStepUpload/Classification/Matching/Result, ImportHistoryPanel
│   │   │   ├── tabs/                   #     SpyOverviewTab, SpyDomainsTab, SpyLibrariesTab, SpyCreativesTab, SpyFunnelTab, SpyTrafficTab, SpyNotesTab
│   │   │   ├── TrafficIntelligenceView.tsx, TrafficChart.tsx, MonthRangePicker.tsx
│   │   │   ├── FullOfferFormModal.tsx, QuickAddOfferModal.tsx
│   │   │   └── AdCreativeGallery.tsx, CompetitorCard.tsx, PublicWWWPipeline.tsx
│   │   └── hooks/                      #     useSpiedOffers, useSpiedOffersCRUD, useSpiedOffersTraffic, useSavedViews, useImportHistory, usePipelineStatus, useOfferRelations, useOfferDomains, useCompetitors
│   ├── dashboard/                      #   INTELLIGENCE DASHBOARD (reescrito na Vision)
│   │   ├── components/                 #     SpikeAlertCard, HeatmapCalendar, StatusDistributionChart, ActivityFeed
│   │   └── hooks/                      #     useDashboardMetrics, useSpikeAlerts, useActivityHeatmap
│   ├── offers/                         #   OFERTAS PROPRIAS
│   │   ├── components/                 #     OfertaCard, OfertaFormDialog
│   │   └── hooks/                      #     useOfertas
│   ├── avatar/                         #   AVATAR & RESEARCH
│   │   ├── components/                 #     AvatarCard, AvatarCreateModal, AvatarExtractionModal, PainMatrixCanvas, DesireMatrixPanel
│   │   └── hooks/                      #     useAvatares
│   ├── creatives/                      #   CRIATIVOS
│   │   ├── components/                 #     KanbanBoard, CriativoFormDialog, HooksList, HookGeneratorModal
│   │   └── hooks/                      #     useCriativos
│   └── arsenal/                        #   ARSENAL (Footprints, Dorks, Keywords) — NOVO
│       ├── components/                 #     FootprintsTab, DorksTab, KeywordsTab
│       └── hooks/                      #     useArsenal
│
├── shared/                             # Infraestrutura compartilhada
│   ├── design-system/                  #   Design System (tokens, primitives, componentes)
│   │   ├── tokens.css                  #     CSS custom properties (cores, spacing, animacoes)
│   │   ├── primitives/                 #     AmbientGlow, GlassmorphismCard, LEDGlowBorder
│   │   └── components/                 #     DataMetricCard, SparklineBadge, StatusBadge
│   ├── components/
│   │   ├── layout/                     #     AppSidebar, AppHeader, DashboardLayout
│   │   │   └── command-palette/        #     CommandPalette (Cmd+K)
│   │   ├── ui/                         #     shadcn/ui components (~50 componentes)
│   │   ├── ErrorBoundary.tsx, FileUpload.tsx, NavLink.tsx
│   ├── hooks/                          #     useAuth, useKeyboardShortcuts, useRealtimeSubscription, use-mobile, use-toast
│   ├── lib/                            #     utils, csvClassifier, parseSemrushCSV, storage, logger, analytics
│   └── services/                       #     csvImportService, trafficService, offerService, domainService
│
├── workers/                            # Web Workers (processamento off-thread)
│   ├── csv-processor.worker.ts         #   Processamento de CSV em background
│   └── useCSVWorker.ts                 #   Hook para comunicacao com worker
│
├── pages/                              # Paginas/rotas (delegam para features)
│   ├── SpyRadar.tsx, SpyOfferDetail.tsx, SpyList.tsx, SpyDetail.tsx
│   ├── Dashboard.tsx, Ofertas.tsx, OfertaDetail.tsx, ArsenalPage.tsx
│   ├── AvatarList.tsx, AvatarDetail.tsx, CriativosPage.tsx
│   └── Login.tsx, Index.tsx, NotFound.tsx, PlaceholderPage.tsx
│
├── __tests__/                          # Testes (209 tests, 12 arquivos)
│   ├── lib/                            #   utils, csvClassifier, parseSemrushCSV, trafficProcessing, logger, analytics, storage
│   ├── hooks/                          #   useSpiedOffersCRUD, useSpiedOffersTraffic, useOfferRelations, useSavedViews
│   └── a11y/                           #   Testes automatizados de acessibilidade (axe-core)
│
├── integrations/supabase/
│   ├── client.ts                       #   Supabase client config
│   └── types.ts                        #   Tipos gerados do banco (Database type)
│
supabase/
├── migrations/                         # Migracoes SQL (inclui Phase 3 Intelligence Layer)
├── functions/                          # Edge functions
└── config.toml
```

## Banco de Dados (tabelas principais)
- `spied_offers` - Ofertas espionadas no Radar (main_domain, nome, status, vertical, geo, prioridade, notas)
- `offer_domains` - Dominios vinculados a oferta (domain, url, domain_type, first_seen, discovery_source, discovery_query)
- `offer_traffic_data` - Dados historicos de trafego por dominio/mes (visits, period_date, source)
- `offer_ad_libraries` - Bibliotecas de anuncios (plataforma, pagina, link, qtd_anuncios)
- `offer_funnel_steps` - Etapas do funil (tipo, url, produto, preco, promessa, cloaker, domain_id)
- `spike_alerts` - Alertas de spike de trafego (offer_id, domain_id, alert_type, change_percent, realtime)
- `saved_views` - Filtros salvos do Radar (nome, module, filters JSONB, is_default, is_pinned)
- `import_batches` - Rastreamento de jobs de importacao CSV (tipo_csv, status, linhas_processadas, config JSONB)
- `ad_bibliotecas` - Bibliotecas de ads (alternativa/legacy)
- `offers` - Ofertas proprias do usuario
- `avatars` - Perfis de avatar/publico-alvo
- `ad_creatives` - Criativos salvos
- `profiles` - Perfis de usuario
- `workspaces` - Workspaces (multi-tenant)

### Materialized Views (Phase 3 Intelligence Layer)
- `mv_dashboard_metrics` - KPIs agregados do dashboard (total radar, hot, scaling, spikes 30d)
- `mv_traffic_summary` - Resumo de trafego por oferta/dominio (agregado)
- `mv_spike_detection` - Deteccao de spikes com variacao percentual
- Refresh via `pg_cron`: dashboard 4h, traffic 6h, spikes 2h

### RPCs principais
- `bulk_upsert_traffic_data` - Importacao em lote com skip_spike_check (performance)
- `get_dashboard_metrics` - KPIs do dashboard via MV
- `get_traffic_comparison` - Comparativo de trafego multi-dominio
- `detect_spikes` - Deteccao de spikes por workspace
- `refresh_pipeline` - Refresh manual das MVs com advisory lock
- `get_pipeline_status` - Status das MVs com timestamps de ultimo refresh

## Modulo Prioritario: Espionagem (Radar de Ofertas)
O modulo SPY e o mais importante e mais desenvolvido. Inclui:
- Importador Universal CSV que detecta tipo automaticamente (PublicWWW, Semrush Bulk/Geo/Pages/Subdomains/Subfolders/Traffic Trend)
- Inteligencia de Trafego com sparklines, graficos comparativos multi-dominio, ordenacao, filtros
- TrafficTable virtualizado (TanStack Virtual) para 12k+ linhas com performance
- Saved Views — filtros salvos com dropdown persistente
- Import History — rastreamento de jobs de importacao
- Pipeline Status — visao do pipeline de espionagem
- Workflow: PublicWWW (footprints) → Semrush Bulk (trafego mensal) → Curadoria → Analise detalhada
- Detalhe de oferta com 7 tabs: Overview, Dominios, Bibliotecas, Ad Creatives, Funil, Trafego, Notas

### Modulos adicionais (pos-Vision)
- **Intelligence Dashboard** — Dashboard reescrito com 5 KPIs reais (via RPC), spike detection com realtime (Supabase Realtime + pg_notify), heatmap de atividade, donut chart de status, activity feed
- **Design System** — Tokens CSS customizados (tokens.css), primitives (AmbientGlow, GlassmorphismCard, LEDGlowBorder), componentes (DataMetricCard, SparklineBadge, StatusBadge)
- **Command Palette** — Cmd+K global para navegacao rapida (cmdk)
- **Arsenal** — Modulo de footprints, dorks e keywords para espionagem
- **Service Layer** — Camada de servicos (csvImportService, trafficService, offerService, domainService) entre hooks e Supabase
- **Web Workers** — Processamento de CSV off-thread (csv-processor.worker.ts)

## Comandos
- Dev: `npm run dev`
- Build: `npm run build`
- Typecheck: `npx tsc --noEmit`
- Test: `npx vitest run` (209 testes, 12 arquivos — lib, hooks, a11y)
- Lint: `npx eslint src/` (inclui eslint-plugin-jsx-a11y com 17 regras de acessibilidade)

## Git Branching Strategy

### Branch Structure
- **main** - Production. Auto-deploys to Hostinger. Protected (PR required).
- **dev** - Staging. Base for all feature branches. Requires PR to merge.
- **feature/*** - Development branches. Created from dev.
- **lovable/*** - Lovable.dev branches only. Never commit to main directly.

### Workflow

#### Starting Work
```bash
git checkout dev
git pull origin dev
git checkout -b feature/bd-X-Y-description
```

#### Finishing Work
```bash
git add <files>
git commit -m "feat: description [BD-X.Y]

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
# Push handled by @devops agent or manual
```

#### Merge Flow
```
feature/* → PR → dev → PR → main (auto-deploy)
lovable/* → PR → dev (never direct to main)
```

### Rules
1. NEVER commit directly to main or dev
2. ALWAYS create feature branches from dev
3. ALWAYS include Co-Authored-By footer in commits
4. Lovable MUST use lovable/* branches only
5. Run build + typecheck before pushing

## Regras de Comportamento do Agente

### NUNCA
- Implementar sem mostrar opcoes primeiro (sempre formato 1, 2, 3)
- Deletar/remover conteudo sem perguntar primeiro
- Deletar qualquer coisa criada nos ultimos 7 dias sem aprovacao explicita
- Alterar algo que ja estava funcionando
- Fingir que o trabalho esta concluido quando nao esta
- Processar batch sem validar um primeiro
- Adicionar funcionalidades que nao foram solicitadas
- Usar mock data quando existem dados reais no banco
- Explicar/justificar ao receber criticas (apenas corrigir)
- Confiar em output de AI/subagente sem verificacao
- Criar do zero quando algo similar existe em squads/

### SEMPRE
- Apresentar opcoes no formato "1. X, 2. Y, 3. Z"
- Usar AskUserQuestion tool para esclarecimentos
- Verificar squads/ e componentes existentes antes de criar novos
- Ler o schema COMPLETO antes de propor mudancas no banco
- Investigar causa raiz quando erro persiste
- Commitar antes de passar para a proxima tarefa
- Criar handoff em `docs/sessions/YYYY-MM/` ao final da sessao

## Regras de Codigo
- NUNCA usar emojis iOS na interface, SEMPRE icones Lucide React
- Dark mode e o tema padrao (dark background, light text)
- Performance e critica: sistema lida com 14k+ registros no radar
- Supabase RLS deve estar correto em todas as operacoes
- Todas as queries via React Query hooks (useQuery/useMutation)
- Campo de notas sempre suporta Markdown completo
- Upload via drag-and-drop em todo o sistema
- Tooltips descritivos em todos os elementos interativos
- NUNCA estimar trafego futuro automaticamente
- Manter compatibilidade com importacao CSV existente (nao quebrar parsers)
- Componentes usam shadcn/ui como base
- Ao adicionar campo novo ao banco: atualizar types.ts (ou avisar para rodar supabase gen types)

## Bugs Conhecidos (ver docs/bugs.md para lista completa)
- BUG-001: Upload de arquivos falha com RLS policy error (migration fix_storage_rls criada, pendente deploy)
- BUG-003: Graficos de trafego nao respeitam todos os filtros de data
- BUG-004: Sidebar collapse deixa lacuna a direita
- BUG-006: Criativos - card nao reabre apos criado (Kanban)
- BUG-008: Emojis iOS remanescentes em partes da interface (substituir por Lucide)
- BUG-009: Popups com informacoes cortadas (scroll horizontal desnecessario)
- BUG-010: Dimensionamento geral ruim (texto em multiplas linhas desnecessariamente)
- BUG-012: Trend sparkline nao acompanha periodo selecionado

### Corrigidos na Vision
- ~~BUG-002: Importacao CSV lenta~~ — Reescrito com batch chunks de 500 + Web Worker
- ~~BUG-005: Dashboard mostra dados zerados~~ — Reescrito com Intelligence Dashboard (RPCs reais)
- ~~BUG-011: Tooltips ausentes~~ — Tooltips adicionados em componentes principais

## Contexto de Negocio
Este e um sistema privado para operacao de Direct Response Marketing. O usuario espiona concorrentes (via PublicWWW + Semrush), monitora trafego, identifica sudden spikes, clona ofertas promissoras e gerencia sua operacao. Velocidade e volume sao prioridades (principio Finch: "quem espiona rapido, lanca rapido").

## Documentacao adicional
- `docs/project-state.md` - Estado atual do projeto
- `docs/tasks.md` - Tarefas pendentes
- `docs/bugs.md` - Bugs detalhados
- `docs/architecture.md` - Decisoes de arquitetura
- `docs/changelog.md` - Historico de mudancas
- `docs/stories/` - Stories de desenvolvimento (BD-X.Y.story.md)
- `docs/stories/epics/` - Epics (EPIC-BD-brownfield-debt.md, EPIC-VISION-system-redesign.md)
- `docs/qa/gates/` - QA gates por fase Vision (vision-1 a vision-6)
- `docs/sessions/` - Handoffs de sessao por mes (YYYY-MM/)

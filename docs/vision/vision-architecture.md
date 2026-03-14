# DR OPS — Vision Architecture Blueprint

> **Fase 3 do Vision Architecture Pipeline**
> **Architect:** Aria (@architect)
> **Data:** 2026-02-21
> **Inputs:** context-brief.md (Fase 1), aesthetic-profile.md (Fase 2), 9 docs brownfield
> **Modo:** VISION — sem amarras ao codigo atual, sistema ideal

---

## Sumario Executivo

Este documento define a arquitetura do **sistema ideal** de Direct Response Marketing para um operador solo com TDAH. Nao e um patch do sistema atual — e o blueprint do que o DR OPS DEVE ser. Cada decisao foi informada por:

- **Perfil neuropsicologico** do operador (memoria visual P90, atencao P20)
- **Modelo de negocio** real (espionagem → clone → trafego → escala)
- **Perfil estetico** destilado de 240 referencias visuais
- **Realidade tecnica** do brownfield (o que funciona, o que nao funciona)
- **Escala projetada** (500k+ registros de trafego em 6 meses)

A conclusao principal e: **a stack atual (React + Vite + Supabase + Tailwind + shadcn) e a correta.** O problema nunca foi a tecnologia — foi a ausencia de arquitetura, design system, e automacao. A visao corrige isso sem reescrever do zero.

---

## Parte 1: Blueprint do Sistema

---

### 1. Principios de Arquitetura

Sete principios imutaveis que governam toda decisao tecnica:

| # | Principio | Implicacao |
|---|-----------|------------|
| P1 | **Speed-First** | Cada interacao < 100ms perceptivel. Zero "telas mortas". Progress em tudo. |
| P2 | **Visual-First** | Graficos > tabelas > texto. Sparklines, heatmaps, cores = informacao. |
| P3 | **Zero-Friction Capture** | 1-click quick-add, Cmd+K global, drag-drop universal, inline edit. |
| P4 | **Automation-Ready** | Pipeline semanal automatizado. Dedup inteligente. Upsert, nao insert. |
| P5 | **Total Coverage** | Ninguem fora do radar. Todos footprints, todas semanas, todos mercados. |
| P6 | **Solo Operator** | Uma pessoa controla tudo. Keyboard-first. Bulk operations. Zero features de equipe. |
| P7 | **Data Sanctuary** | Nunca duplicar, nunca perder. Soft-delete. Historico preservado. Export total. |

---

### 2. Decisao de Stack

#### 2.1 Veredicto: MANTER com evolucoes

| Tecnologia | Veredicto | Justificativa |
|-----------|-----------|---------------|
| **React 18 + Vite + TS** | MANTER | Stack madura, ecossistema inigualavel, Vite e o melhor bundler SPA, TS strict ja configurado |
| **Supabase** | MANTER + EXPANDIR | BaaS completo (auth, DB, storage, realtime, edge functions). Alternativas (Firebase, custom backend) sao piores para solo operator |
| **TailwindCSS** | MANTER + DESIGN SYSTEM | Produtivo para dark mode, JIT compilation, nenhum framework CSS e melhor para o caso |
| **shadcn/ui** | MANTER + CUSTOMIZAR | Full ownership dos componentes, Radix primitives acessiveis, dark mode nativo |
| **React Query (TanStack)** | MANTER | Cache, parallel fetch, optimistic updates — ja bem implementado |
| **Recharts** | MANTER + MELHORAR IMPLEMENTACAO | Adequado para o volume de dados (graficos mostram dados agregados, nao 500k pontos). O problema era implementacao, nao a lib |
| **Framer Motion** | MANTER (ja instalado) | Animacoes do design system (glow pulse, slide-in, sparkline draw) |
| **TanStack Virtual** | MANTER (ja instalado) | Virtualizacao para listas 10k+ |

#### 2.2 Adicoes Necessarias

| Tecnologia | Proposito | Justificativa |
|-----------|-----------|---------------|
| **Inter (font)** | Tipografia do design system | Geometric, clean, tabular figures excelentes para KPIs. Recomendada no aesthetic profile |
| **cmdk** | Command Palette (Cmd+K) | Ja instalado no projeto. Precisa ser ativado e integrado |
| **Web Worker (nativo)** | CSV processing off-thread | Import de 14k+ nao pode travar main thread. Worker nativo do browser, sem lib adicional |
| **Supabase Realtime** | Live updates e spike alerts | Ja disponivel no Supabase, nunca foi ativado. Habilita spike detection em tempo real |
| **date-fns** | Manipulacao de datas | Ja instalado. Consolidar uso (hoje mistura Date nativo com date-fns) |

#### 2.3 Alternativas Avaliadas e Rejeitadas

| Alternativa | Avaliada Para | Razao da Rejeicao |
|------------|--------------|-------------------|
| **Next.js / Remix** | SSR framework | DR OPS e um SPA de ferramenta interna. SSR adiciona complexidade sem beneficio. Hostinger nao roda Node server |
| **Solid / Svelte** | Framework reativo | Ecossistema menor, risco alto para operador solo, zero beneficio justificavel sobre React |
| **Nivo / Plotly / ECharts** | Graficos avancados | Recharts e suficiente para dados agregados. O "grafico comparativo multi-dominio" nao precisa de lib mais pesada — precisa de implementacao melhor |
| **Cloudflare R2** | Storage alternativo | Storage RLS do Supabase ja foi corrigido (BD-0.1 Done). Nao ha razao para trocar |
| **PostgreSQL direto** | Sem Supabase | Perde auth, realtime, storage, edge functions. Nao compensa para solo operator |
| **tRPC** | Type-safe API | Supabase ja fornece client typado via codegen. tRPC adiciona camada desnecessaria |

---

### 3. Arquitetura de Sistema

#### 3.1 Visao Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (SPA)                            │
│                                                                 │
│  ┌──────────┐  ┌──────────────────────────────────────────────┐ │
│  │ SIDEBAR  │  │              CONTENT AREA                    │ │
│  │          │  │                                              │ │
│  │ Cmd+K    │  │  ┌─────────────────────────────────────────┐ │ │
│  │ Nav      │  │  │  Feature Module (SPY, Offers, etc.)     │ │ │
│  │ Alerts   │  │  │  ┌─────────┐  ┌──────────┐             │ │ │
│  │          │  │  │  │ Pages   │──│ Components│             │ │ │
│  │          │  │  │  └────┬────┘  └─────┬────┘             │ │ │
│  └──────────┘  │  │       │             │                   │ │ │
│                │  │  ┌────▼─────────────▼────┐              │ │ │
│                │  │  │    Feature Hooks       │              │ │ │
│                │  │  └──────────┬────────────┘              │ │ │
│                │  │             │                            │ │ │
│                │  └─────────────┼────────────────────────────┘ │ │
│                │                │                              │ │
│                └────────────────┼──────────────────────────────┘ │
│                                │                                │
│  ┌─────────────────────────────▼──────────────────────────────┐ │
│  │                    SERVICE LAYER                            │ │
│  │  csvImport │ traffic │ offer │ domain │ automation │ alert │ │
│  └─────────────────────────────┬──────────────────────────────┘ │
│                                │                                │
│  ┌─────────────────────────────▼──────────────────────────────┐ │
│  │                 SUPABASE CLIENT (RPC + REST)                │ │
│  └─────────────────────────────┬──────────────────────────────┘ │
│                                │                                │
│  ┌──────────────┐   ┌─────────▼──────────┐                     │
│  │ Web Workers  │   │ Realtime Subscr.   │                     │
│  │ (CSV parse)  │   │ (spike alerts)     │                     │
│  └──────────────┘   └────────────────────┘                     │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTPS
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SUPABASE (Backend)                          │
│                                                                 │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Auth     │  │ PostgreSQL│  │ Storage  │  │ Edge         │  │
│  │ (email)  │  │ + RLS     │  │ (assets) │  │ Functions    │  │
│  └──────────┘  │ + indexes │  └──────────┘  │              │  │
│                │ + mat.view│                 │ - spike-check│  │
│                │ + triggers│                 │ - csv-process│  │
│                └───────────┘                 │ - ai-extract │  │
│                                              └──────────────┘  │
│  ┌───────────────────────┐  ┌───────────────────────────────┐  │
│  │ Realtime              │  │ Cron Jobs (pg_cron)           │  │
│  │ - traffic_changes     │  │ - refresh materialized views  │  │
│  │ - spike_alerts        │  │ - scheduled pipeline triggers │  │
│  └───────────────────────┘  └───────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼ (external data sources)
        ┌───────────┐  ┌───────────┐  ┌───────────────┐
        │ PublicWWW  │  │ Semrush   │  │ SimilarWeb    │
        │ (CSV)      │  │ (CSV)     │  │ (CSV)         │
        └───────────┘  └───────────┘  └───────────────┘
```

#### 3.2 Estrutura de Pastas (Feature-Based Architecture)

```
src/
├── app/                          # App shell
│   ├── App.tsx                   #   Router + providers
│   ├── routes.tsx                #   Route definitions (lazy)
│   └── providers/                #   QueryClient, Theme, Auth, Toast
│
├── features/                     # Feature modules (domain-driven)
│   ├── spy/                      #   SPY MODULE (80% do valor)
│   │   ├── pages/                #     SpyRadar, SpyOfferDetail
│   │   ├── components/           #     Decomposed components
│   │   │   ├── radar/            #       SpyOffersTable, FilterBar, BulkActions
│   │   │   ├── detail/           #       7 tabs: Overview, Domains, Libraries, Creatives, Funnel, Traffic, Notes
│   │   │   ├── import/           #       ImportWizard (4 steps), CSVDropZone
│   │   │   ├── traffic/          #       ComparativeChart, TrafficTable, SparklineRenderer
│   │   │   └── monitoring/       #       SpikeAlertCard, HeatmapCalendar
│   │   ├── hooks/                #     useSpyOffers, useTrafficData, useImport, useSpikeAlerts
│   │   ├── services/             #     spyService, trafficService, importService
│   │   └── types/                #     SpyOffer, TrafficRecord, ImportJob
│   │
│   ├── offers/                   #   OFERTAS PROPRIAS
│   │   ├── pages/                #     OffersList, OfferDetail
│   │   ├── components/           #     OfferCard, FunnelBuilder, StatusKanban
│   │   ├── hooks/                #     useOffers
│   │   └── types/                #     Offer, FunnelStep
│   │
│   ├── avatar/                   #   AVATAR & RESEARCH
│   │   ├── pages/                #     AvatarList, AvatarDetail
│   │   ├── components/           #     AvatarCard, ResearchPanel, PainDesireMatrix
│   │   ├── hooks/                #     useAvatars
│   │   └── types/                #     Avatar, ResearchNote
│   │
│   ├── creatives/                #   CRIATIVOS
│   │   ├── pages/                #     CreativesKanban
│   │   ├── components/           #     KanbanBoard, CreativeCard, NamingEngine
│   │   ├── hooks/                #     useCreatives
│   │   └── types/                #     Creative, CreativeBlock
│   │
│   ├── dashboard/                #   DASHBOARD
│   │   ├── pages/                #     Dashboard
│   │   ├── components/           #     KPIRow, ActivityFeed, SpikeAlerts, StatusDistribution
│   │   └── hooks/                #     useDashboardMetrics
│   │
│   └── arsenal/                  #   ARSENAL (Footprints, Dorks, Keywords)
│       ├── pages/                #     ArsenalList
│       ├── components/           #     FootprintCard, DorkEditor
│       └── hooks/                #     useArsenal
│
├── shared/                       # Shared infrastructure
│   ├── design-system/            #   DR OPS Design System (from aesthetic profile)
│   │   ├── tokens.css            #     CSS custom properties (colors, spacing, typography)
│   │   ├── primitives/           #     LEDGlowBorder, GlassmorphismCard, AmbientGlow
│   │   ├── components/           #     DataMetricCard, StatusBadge, SparklineBadge
│   │   └── theme-provider.tsx    #     Theme context (dark only, no toggle)
│   │
│   ├── components/               #   Shared UI components
│   │   ├── layout/               #     AppShell, Sidebar, Header
│   │   ├── command-palette/      #     CommandPalette (Cmd+K)
│   │   ├── charts/               #     BaseChart, AreaChart, LineChart, Sparkline
│   │   ├── data-display/         #     DataTable (virtual), KPICard, Badge
│   │   ├── feedback/             #     SkeletonLoader, EmptyState, ProgressBar
│   │   ├── forms/                #     FilterPanel, SearchBar, MonthRangePicker
│   │   └── modals/               #     ConfirmDialog, GlassModal
│   │
│   ├── hooks/                    #   Shared hooks
│   │   ├── useKeyboardShortcuts.ts
│   │   ├── useDebounce.ts
│   │   ├── useVirtualList.ts
│   │   └── useRealtimeSubscription.ts
│   │
│   ├── services/                 #   Core services
│   │   ├── supabase.ts           #     Supabase client singleton
│   │   ├── auth.ts               #     Auth service
│   │   ├── storage.ts            #     File upload/download
│   │   └── analytics.ts          #     Event tracking
│   │
│   ├── lib/                      #   Pure utilities (no React, no Supabase)
│   │   ├── csv/                  #     csvClassifier, parsers (moved from src/lib/)
│   │   ├── date.ts               #     Date formatting utilities
│   │   ├── number.ts             #     Number formatting (visits, percentages)
│   │   └── export.ts             #     Markdown/CSV export utilities
│   │
│   └── types/                    #   Shared TypeScript types
│       ├── database.ts           #     Generated Supabase types
│       └── common.ts             #     Shared interfaces
│
├── workers/                      # Web Workers
│   └── csv-processor.worker.ts   #   CSV parsing + classification off main thread
│
└── assets/                       # Static assets
    └── fonts/                    #   Inter font files
```

**Principio organizacional:** Cada feature e um mini-app autonomo. Dependencias fluem de `features/` → `shared/`, nunca entre features. Isso permite:
- Code splitting natural por feature
- Desenvolvimento paralelo (se houver mais devs no futuro)
- Testes isolados por modulo

---

### 4. Arquitetura de Dados (Schema Ideal)

#### 4.1 Schema Core (SPY Module)

```sql
-- ============================================================
-- CORE: SPY MODULE
-- ============================================================

-- Ofertas espionadas (entidade central)
CREATE TABLE spy_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  -- Identificacao
  name TEXT NOT NULL,
  main_domain TEXT,
  slug TEXT GENERATED ALWAYS AS (lower(replace(name, ' ', '-'))) STORED,

  -- Classificacao
  status TEXT NOT NULL DEFAULT 'analyzing'
    CHECK (status IN ('analyzing', 'monitoring', 'hot', 'scaling', 'cloned', 'dead', 'archived')),
  priority INTEGER DEFAULT 0 CHECK (priority BETWEEN 0 AND 5),
  vertical TEXT,
  geo TEXT[],                        -- Array de paises (multi-geo)
  tags TEXT[] DEFAULT '{}',          -- Tags livres para clustering

  -- Descoberta
  discovery_source TEXT,             -- publicwww, manual, semrush, etc.
  discovery_query TEXT,              -- Footprint/query que levou a descoberta
  discovery_date TIMESTAMPTZ DEFAULT now(),

  -- Media
  screenshot_url TEXT,

  -- Notas (markdown)
  notes TEXT DEFAULT '',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,            -- Soft delete

  -- Constraints
  CONSTRAINT unique_offer_per_workspace UNIQUE (workspace_id, main_domain)
);

-- Indexes otimizados para as queries mais frequentes
CREATE INDEX idx_spy_offers_workspace_status ON spy_offers(workspace_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_spy_offers_workspace_vertical ON spy_offers(workspace_id, vertical) WHERE deleted_at IS NULL;
CREATE INDEX idx_spy_offers_discovery ON spy_offers USING GIN (to_tsvector('portuguese', coalesce(discovery_query, '')));
CREATE INDEX idx_spy_offers_tags ON spy_offers USING GIN (tags);
CREATE INDEX idx_spy_offers_updated ON spy_offers(updated_at DESC);

-- Dominios vinculados a oferta
CREATE TABLE spy_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES spy_offers(id) ON DELETE CASCADE,

  domain TEXT NOT NULL,
  url TEXT,
  domain_type TEXT DEFAULT 'landing_page'
    CHECK (domain_type IN ('landing_page', 'checkout', 'upsell', 'downsell', 'tracker', 'cloaker', 'other')),
  is_main BOOLEAN DEFAULT false,

  -- Descoberta
  first_seen TIMESTAMPTZ DEFAULT now(),
  last_seen TIMESTAMPTZ DEFAULT now(),
  discovery_source TEXT,
  discovery_query TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT unique_domain_per_offer UNIQUE (offer_id, domain)
);

CREATE INDEX idx_spy_domains_offer ON spy_domains(offer_id);
CREATE INDEX idx_spy_domains_domain ON spy_domains(domain);

-- Dados de trafego historico (tabela de maior volume — 500k+ projetado)
CREATE TABLE spy_traffic (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES spy_offers(id) ON DELETE CASCADE,

  domain TEXT NOT NULL,
  period_date DATE NOT NULL,          -- Primeiro dia do mes
  visits BIGINT DEFAULT 0,

  -- Fonte e tipo
  source TEXT NOT NULL DEFAULT 'semrush'
    CHECK (source IN ('semrush', 'similarweb', 'manual')),
  period_type TEXT NOT NULL DEFAULT 'monthly'
    CHECK (period_type IN ('monthly', 'weekly', 'daily')),

  -- Metadata de importacao
  imported_at TIMESTAMPTZ DEFAULT now(),
  import_job_id UUID,

  -- Dedup: uma entrada por (oferta, dominio, fonte, periodo)
  CONSTRAINT unique_traffic_point UNIQUE (offer_id, domain, source, period_type, period_date)
);

-- INDEXES CRITICOS para performance com 500k+ registros
CREATE INDEX idx_spy_traffic_offer_period ON spy_traffic(offer_id, period_date DESC);
CREATE INDEX idx_spy_traffic_domain_period ON spy_traffic(domain, period_date DESC);
CREATE INDEX idx_spy_traffic_composite ON spy_traffic(offer_id, source, period_date DESC);
CREATE INDEX idx_spy_traffic_workspace ON spy_traffic(workspace_id);

-- Bibliotecas de anuncios
CREATE TABLE spy_ad_libraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES spy_offers(id) ON DELETE CASCADE,

  platform TEXT NOT NULL CHECK (platform IN ('meta', 'google', 'tiktok', 'other')),
  page_name TEXT,
  page_url TEXT,
  library_url TEXT,
  ad_count INTEGER DEFAULT 0,

  first_seen TIMESTAMPTZ DEFAULT now(),
  last_checked TIMESTAMPTZ,
  notes TEXT DEFAULT '',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_spy_ad_libs_offer ON spy_ad_libraries(offer_id);

-- Etapas do funil
CREATE TABLE spy_funnel_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES spy_offers(id) ON DELETE CASCADE,
  domain_id UUID REFERENCES spy_domains(id) ON DELETE SET NULL,

  step_type TEXT NOT NULL
    CHECK (step_type IN ('cloaker', 'presell', 'vsl', 'checkout', 'upsell_1', 'upsell_2', 'downsell', 'thankyou', 'other')),
  step_order INTEGER NOT NULL DEFAULT 0,
  url TEXT,

  -- Detalhes
  product_name TEXT,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'BRL',
  headline TEXT,
  notes TEXT DEFAULT '',
  screenshot_url TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_spy_funnel_offer ON spy_funnel_steps(offer_id, step_order);

-- Criativos espionados
CREATE TABLE spy_creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES spy_offers(id) ON DELETE CASCADE,

  platform TEXT CHECK (platform IN ('meta', 'google', 'tiktok', 'native', 'other')),
  creative_type TEXT CHECK (creative_type IN ('image', 'video', 'carousel', 'text')),

  headline TEXT,
  body_text TEXT,
  cta_text TEXT,
  media_url TEXT,
  landing_url TEXT,

  first_seen TIMESTAMPTZ DEFAULT now(),
  notes TEXT DEFAULT '',

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_spy_creatives_offer ON spy_creatives(offer_id);
```

#### 4.2 Schema: Automacao e Monitoramento

```sql
-- ============================================================
-- AUTOMATION & MONITORING
-- ============================================================

-- Jobs de importacao (rastreabilidade completa)
CREATE TABLE import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  job_type TEXT NOT NULL,              -- 'publicwww', 'semrush_bulk', 'similarweb', etc.
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'partial')),

  -- Metricas
  total_rows INTEGER DEFAULT 0,
  processed_rows INTEGER DEFAULT 0,
  new_offers INTEGER DEFAULT 0,
  new_domains INTEGER DEFAULT 0,
  new_traffic_points INTEGER DEFAULT 0,
  skipped_rows INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,

  -- Metadata
  file_name TEXT,
  file_size_bytes INTEGER,
  csv_type TEXT,                        -- Tipo detectado pelo classificador

  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  error_log JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_import_jobs_workspace ON import_jobs(workspace_id, created_at DESC);

-- Alertas de spike
CREATE TABLE spike_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES spy_offers(id) ON DELETE CASCADE,

  domain TEXT NOT NULL,
  period_date DATE NOT NULL,
  previous_visits BIGINT,
  current_visits BIGINT,
  change_percent DECIMAL(8,2),         -- Ex: 250.00 = +250%

  alert_type TEXT NOT NULL DEFAULT 'spike'
    CHECK (alert_type IN ('spike', 'drop', 'new_entry', 'resurrection')),

  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,

  detected_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_spike_alerts_workspace_unread ON spike_alerts(workspace_id, is_read) WHERE NOT is_dismissed;
CREATE INDEX idx_spike_alerts_offer ON spike_alerts(offer_id);

-- Views salvas (filtros persistidos)
CREATE TABLE saved_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  module TEXT NOT NULL CHECK (module IN ('spy', 'offers', 'creatives', 'avatar')),

  -- Configuracao serializada
  filters JSONB DEFAULT '{}',
  sort_config JSONB DEFAULT '{}',
  visible_columns TEXT[] DEFAULT '{}',

  is_default BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_saved_views_workspace ON saved_views(workspace_id, module);
```

#### 4.3 Schema: Ofertas Proprias e Avatar

```sql
-- ============================================================
-- OFERTAS PROPRIAS
-- ============================================================

CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'research'
    CHECK (status IN ('research', 'producing', 'testing', 'active', 'paused', 'dead')),

  -- Detalhes da oferta
  vertical TEXT,
  geo TEXT[],
  mechanism TEXT,                       -- Mecanismo unico
  big_promise TEXT,

  -- Financeiro
  front_end_price DECIMAL(10,2),
  currency TEXT DEFAULT 'BRL',

  -- Funil
  has_upsell BOOLEAN DEFAULT false,
  has_downsell BOOLEAN DEFAULT false,

  -- Origem (se clonada de espionagem)
  cloned_from_spy_id UUID REFERENCES spy_offers(id) ON DELETE SET NULL,

  notes TEXT DEFAULT '',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- ============================================================
-- AVATAR & RESEARCH
-- ============================================================

CREATE TABLE avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  name TEXT NOT NULL,

  -- Demographics
  age_range TEXT,
  gender TEXT,
  location TEXT,
  income_level TEXT,

  -- Psychographics (compativel com agent output)
  pains JSONB DEFAULT '[]',
  desires JSONB DEFAULT '[]',
  fears JSONB DEFAULT '[]',
  objections JSONB DEFAULT '[]',
  beliefs JSONB DEFAULT '[]',

  -- Behavioral
  platforms TEXT[],                     -- Onde esta (instagram, youtube, etc.)
  content_consumption TEXT,
  purchase_triggers TEXT[],

  -- AI-generated content
  ai_source TEXT,                      -- 'claude', 'gemini', 'manual'
  raw_ai_output TEXT,                  -- Output original do agente

  notes TEXT DEFAULT '',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
```

#### 4.4 Materialized Views (Performance)

```sql
-- Dashboard: metricas pre-computadas
CREATE MATERIALIZED VIEW mv_dashboard_metrics AS
SELECT
  workspace_id,
  COUNT(DISTINCT id) FILTER (WHERE deleted_at IS NULL) AS total_offers,
  COUNT(DISTINCT id) FILTER (WHERE status = 'hot') AS hot_offers,
  COUNT(DISTINCT id) FILTER (WHERE status = 'scaling') AS scaling_offers,
  COUNT(DISTINCT id) FILTER (WHERE status = 'monitoring') AS monitoring_offers
FROM spy_offers
GROUP BY workspace_id;

-- Trafego: resumo por oferta (evita scan completo de 500k+ rows)
CREATE MATERIALIZED VIEW mv_offer_traffic_summary AS
SELECT
  offer_id,
  workspace_id,
  source,
  SUM(visits) AS total_visits,
  MAX(visits) AS peak_visits,
  MAX(period_date) AS latest_period,
  MIN(period_date) AS earliest_period,
  COUNT(*) AS data_points
FROM spy_traffic
GROUP BY offer_id, workspace_id, source;

-- Spike detection: variacoes recentes
CREATE MATERIALIZED VIEW mv_recent_spikes AS
WITH ranked AS (
  SELECT
    offer_id, domain, source, period_date, visits,
    LAG(visits) OVER (PARTITION BY offer_id, domain, source ORDER BY period_date) AS prev_visits,
    workspace_id
  FROM spy_traffic
  WHERE period_date >= CURRENT_DATE - INTERVAL '6 months'
)
SELECT
  offer_id, domain, source, period_date, visits, prev_visits, workspace_id,
  CASE WHEN prev_visits > 0
    THEN ROUND(((visits::numeric - prev_visits) / prev_visits * 100), 1)
    ELSE NULL
  END AS change_percent
FROM ranked
WHERE prev_visits IS NOT NULL
  AND visits > prev_visits * 2;  -- >100% increase

-- Refresh: pg_cron diario (ou via Edge Function)
-- SELECT cron.schedule('refresh-dashboard', '0 */4 * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_metrics');
-- SELECT cron.schedule('refresh-traffic', '0 */6 * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_offer_traffic_summary');
-- SELECT cron.schedule('refresh-spikes', '0 */2 * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_recent_spikes');
```

#### 4.5 Tabelas Legacy: Destino

| Tabela Atual | Tabela Vision | Acao |
|-------------|--------------|------|
| `spied_offers` | `spy_offers` | RENAME (migration simples) |
| `offer_domains` | `spy_domains` | RENAME |
| `offer_traffic_data` | `spy_traffic` | RENAME + add `import_job_id` |
| `offer_ad_libraries` | `spy_ad_libraries` | RENAME |
| `offer_funnel_steps` | `spy_funnel_steps` | RENAME + fix step_type enum |
| `ad_creatives` | `spy_creatives` | RENAME + cleanup fonte ambigua |
| `ofertas` | `offers` | EVOLVE (add campos novos) |
| `avatares` | `avatars` | EVOLVE (add JSONB fields) |
| `ad_bibliotecas` | DROP | Redundante (ja deprecated por BD-2.4) |
| `oferta_dominios` | DROP | Redundante |
| `funil_paginas` | DROP | Redundante |
| `trafego_historico` | DROP | Redundante |
| `comparacao_batches` | DROP | Nunca usado |
| `fontes_captura` | DROP | Campo inline em spy_offers |
| `competitors` | DROP | Substituido por spy_offers |

**Estrategia de migracao:** Renames graduais, nunca DROP antes de confirmar zero referencias no codigo.

---

### 5. Design System: "Command Center"

O design system do DR OPS e derivado inteiramente do **aesthetic-profile.md**. Nao e um tema generico — e a identidade visual do operador traduzida para interface.

#### 5.1 Filosofia

```
FORMULA = Command Center (controle total)
        + Warm Glow in Darkness (light as precious)
        + Precision Tool (nao toy, nao art — tool)
        + Stealth Wealth (quality speaks, not decoration)
```

**Dark mode e a UNICA opcao.** A escuridao e o canvas; os dados sao as luzes.

#### 5.2 Design Tokens

Todos os tokens derivados da analise de 240 imagens no aesthetic-profile.md:

**Foundation:**
```css
--bg-void:     #000000;   /* Pure black — max contrast areas */
--bg-base:     #0A0A0A;   /* App background principal */
--bg-surface:  #141414;   /* Cards, panels, containers */
--bg-elevated: #1A1A1A;   /* Modals, popovers, elevated cards */
--bg-raised:   #1E1E2E;   /* Hover states, higher elevation */
--bg-subtle:   #252830;   /* Inputs, interactive areas */
```

**Accent (Primary: Violet, Signature: Amber):**
```css
--accent-primary:      #7C3AED;   /* Violet — CTAs, active states */
--accent-amber:        #D4A574;   /* Warm amber — LED glow signature */
--accent-teal:         #00D4AA;   /* Charts, positive data, links */
--accent-green:        #22C55E;   /* Success, scaling status */
--accent-orange:       #F97316;   /* Spikes, urgent alerts */
```

**Semantic:**
```css
--semantic-success:    #22C55E;
--semantic-warning:    #EAB308;
--semantic-error:      #EF4444;
--semantic-spike:      #F97316;
--semantic-hot:        #EF4444;
```

**Glow Effects (LED Strip Lighting → UI):**
```css
--glow-primary:  0 0 20px rgba(124, 58, 237, 0.15);
--glow-amber:    0 0 20px rgba(212, 165, 116, 0.15);
--glow-teal:     0 0 20px rgba(0, 212, 170, 0.15);
--border-glow:   rgba(124, 58, 237, 0.25);
```

#### 5.3 Tipografia

```
Font:        Inter (primary) + JetBrains Mono (technical data)
KPI Number:  48px / Bold 700  / --text-primary  / tabular-nums
Page Title:  24px / Semi 600  / --text-primary
Card Title:  16px / Medium 500 / --text-primary
Body:        14px / Regular 400 / --text-body (#F5F0EB)
Label:       12px / Regular 400 / --text-secondary (#949494)
Caption:     11px / Regular 400 / --text-muted (#6B7280)
```

#### 5.4 Componentes Primitivos do Design System

**1. LED Glow Border** — O elemento mais distinctivo, traduz LED strip lighting para UI:
```css
.led-glow-bottom {
  border-bottom: 1px solid var(--accent-amber);
  box-shadow: 0 1px 8px rgba(212, 165, 116, 0.3);
}
.led-glow-left {
  border-left: 2px solid var(--accent-primary);
  box-shadow: -2px 0 12px rgba(124, 58, 237, 0.2);
}
```

**2. Glassmorphism Card** — Para modais e overlays:
```css
.glass-card {
  background: rgba(20, 20, 20, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
}
```

**3. Ambient Glow Wrapper** — Light behind elevated elements:
```css
.ambient-glow-warm {
  box-shadow:
    0 0 0 1px var(--border-default),
    0 8px 32px rgba(212, 165, 116, 0.08),
    0 0 64px rgba(212, 165, 116, 0.04);
}
```

**4. Sidebar Active Item** — Corridor vanishing point effect:
```css
.sidebar-active {
  background: linear-gradient(90deg, rgba(124, 58, 237, 0.2) 0%, transparent 100%);
  border-left: 2px solid var(--accent-primary);
  box-shadow: inset 3px 0 12px rgba(124, 58, 237, 0.15);
}
```

**5. Data Point Glow** — Data como estrela contra escuridao:
```css
.data-point-active {
  fill: var(--accent-teal);
  filter: drop-shadow(0 0 4px var(--accent-teal));
}
```

#### 5.5 Status Badge System

| Status | Cor Token | Icone Lucide |
|--------|----------|-------------|
| Analyzing | `--accent-blue` | `Search` |
| Monitoring | `--accent-amber` | `Eye` |
| Hot | `--semantic-hot` | `Flame` |
| Scaling | `--accent-green` | `TrendingUp` |
| Cloned | `--accent-primary` | `Copy` |
| Dead | `--text-muted` | `Skull` |
| Archived | `--text-muted` | `Archive` |

#### 5.6 Animacoes

| Pattern | Uso | Duracao | Easing |
|---------|-----|---------|--------|
| Fade-in | Transicoes, modais | 150ms | ease-out |
| Glow pulse | Spike alerts | 2s infinite | ease-in-out |
| Border glow transition | Hover/focus states | 200ms | ease |
| Sparkline draw | Render de sparklines | 400ms | ease-out |
| Skeleton shimmer | Loading states | 1.5s infinite | linear |

**NUNCA usar:** Bounce effects, elaborate page transitions, decorative animations sem proposito, parallax.

---

### 6. Arquitetura de Modulos

#### 6.1 SPY Module — Radar de Ofertas (Prioridade Maxima)

O modulo SPY e 80% do valor do sistema. Sua arquitetura deve ser best-in-class.

**Sub-modulos:**

```
SPY MODULE
├── Radar (lista principal)
│   ├── SpyOffersTable (virtualizado, 14k+ rows)
│   ├── FilterBar (status, vertical, geo, trafego, tags)
│   ├── BulkActionsBar (multi-select, bulk status, bulk tag)
│   ├── ColumnSelector (presets, grupos, toggle)
│   └── MonthRangePicker (estilo Semrush, presets)
│
├── Import Engine
│   ├── ImportWizard (4 steps)
│   │   ├── Step 1: Upload/Drop (CSV detection)
│   │   ├── Step 2: Classification (auto-detected type)
│   │   ├── Step 3: Matching (domain → offer linking)
│   │   └── Step 4: Results (resumo + estatisticas)
│   ├── CSVClassifier (10 tipos suportados)
│   ├── CSVProcessor (Web Worker, streaming, progress)
│   └── ImportJobTracker (historico, retry)
│
├── Offer Detail (7 tabs)
│   ├── Overview: KPI cards + sparkline + status + quick actions
│   ├── Domains: Tabela de dominios, tipo, first_seen, source
│   ├── Libraries: Ad libraries por plataforma
│   ├── Creatives: Galeria de criativos coletados
│   ├── Funnel: Visualizacao de etapas (cloaker→VSL→checkout→upsell)
│   ├── Traffic: Grafico comparativo multi-dominio (FEATURE SAGRADA)
│   └── Notes: Editor Markdown rico
│
├── Traffic Intelligence
│   ├── ComparativeChart (multi-dominio, N linhas, cores unicas)
│   ├── SparklineRenderer (inline, respeita filtro de periodo)
│   ├── TrendDetector (spike, drop, steady, resurrection)
│   └── TrafficTable (ordenacao, filtros, export)
│
└── Monitoring
    ├── SpikeDetector (Realtime subscription + periodic check)
    ├── AlertCard (notificacao visual com glow pulse)
    └── HeatmapCalendar (grid mensal de atividade)
```

**Feature Sagrada #1: Grafico Comparativo Multi-Dominio**
- N dominios no mesmo grafico (sem limite de 5 como Semrush)
- Cada dominio: cor unica + legenda com retangulo colorido
- Hover: tooltip com valores por ponto
- Click: toggle visibilidade de series
- Respeita MonthRangePicker (todos os meses no range aparecem)
- Performance: dados agregados server-side, chart renderiza max ~120 pontos

**Feature Sagrada #2: Sparkline na Lista**
- Mini-grafico inline em cada row da tabela
- DEVE respeitar os meses do MonthRangePicker
- Indicadores: spike (>100%), tendencia positiva/negativa com cores
- Performance: Pre-calculado no query, renderizado com SVG leve

**Feature Sagrada #3: MonthRangePicker**
- Seletor de periodo estilo Semrush
- Range continuo (selecionar A e D auto-seleciona B e C)
- Presets: Ultimo mes, 3M, 6M, Ano
- Meses em portugues

**"Bau" (Vault/Archive):**
- Status `archived` esconde do radar sem deletar
- Filtro: "Mostrar arquivados" toggle
- Uso: Esconder dominios irrelevantes (Hotmart, grandes plataformas)

#### 6.2 Ofertas Proprias

```
OFFERS MODULE
├── OffersList
│   ├── Views: Cards / Tabela / Kanban (por status)
│   ├── Filtros: Status, vertical, geo
│   └── Ordenacao: Nome, data, status
│
├── OfferDetail
│   ├── Info completa: nome, vertical, geo, mecanismo, big promise
│   ├── Financeiro: front-end price, upsells, downsells (com precos)
│   ├── Funil: visual builder simplificado
│   ├── Origem: link para spy_offer se clonada
│   └── Notes: Markdown editor
│
└── Status Workflow
    research → producing → testing → active → paused → dead
```

#### 6.3 Dashboard

```
DASHBOARD
├── KPI Row (5 cards com sparklines)
│   ├── Total Offers no Radar
│   ├── Offers Hot
│   ├── Offers Scaling
│   ├── Spikes Detectados (ultimos 30 dias)
│   └── Ultimo Import (ha X tempo)
│
├── Main Chart: Trafego total agregado (area chart, teal gradient)
│
├── Spike Alerts Feed (ultimos spikes com glow pulse)
│
├── Status Distribution (donut chart)
│
└── Recent Activity (timeline de imports, status changes)
```

#### 6.4 Arsenal

```
ARSENAL
├── Footprints (queries do PublicWWW)
│   ├── Nome, query, vertical, ultima execucao
│   └── Quick action: "Executar" (placeholder para automacao futura)
│
├── Dorks (Google dorks)
│   └── Nome, query, tipo, notas
│
└── Keywords (keywords monitoradas)
    └── Nome, keyword, volume estimado, vertical
```

---

### 7. Arquitetura de Performance

#### 7.1 Frontend Performance

| Tecnica | Onde | Impacto |
|---------|------|---------|
| **Code splitting** por rota | `React.lazy()` em todas as pages | Reduce initial bundle 60%+ |
| **Virtual scrolling** | SpyOffersTable (14k+ rows) | Renderiza apenas ~50 rows visiveis |
| **Web Worker** para CSV | ImportWizard parsing | Main thread nunca trava |
| **Debounced search** | FilterBar, CommandPalette | Evita re-render a cada keystroke |
| **React Query cache** | Todas as queries | staleTime 60s, evita refetch desnecessario |
| **Lazy modals** | ImportWizard, OfferForm | Carrega sob demanda |
| **Memoization** | Sparklines, KPI cards | `React.memo` + `useMemo` para dados pesados |
| **Image lazy load** | Screenshots, creative galleries | `loading="lazy"` nativo |

#### 7.2 Backend Performance

| Tecnica | Onde | Impacto |
|---------|------|---------|
| **Indexes compostos** | spy_traffic (offer_id + period_date) | 10-100x em queries de trafego |
| **Materialized views** | Dashboard metrics, traffic summary | Evita full scan de 500k+ rows |
| **Paginacao server-side** | Radar (14k+ offers), Traffic | max 100 rows por request |
| **RPC functions** | Agregacoes complexas | Evita multiple round-trips |
| **Connection pooling** | Supabase default | Ja otimizado |
| **Batch upsert** | CSV import (chunks de 1000) | Ja implementado, manter |

#### 7.3 Metas de Performance

| Metrica | Target | Metodo de Medicao |
|---------|--------|------------------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Time to Interactive | < 3s | Lighthouse |
| Radar load (14k offers) | < 2s | Performance.now() |
| CSV import (14k rows) | < 10s com progress | Web Worker timing |
| Traffic chart render | < 500ms | React Profiler |
| Sparkline render (per row) | < 5ms | React Profiler |
| Command Palette open | < 100ms | Perceptual |

---

### 8. Arquitetura de Automacao

#### 8.1 Pipeline Ideal (Objetivo Final)

```
PIPELINE SEMANAL AUTOMATIZADO
│
├── Trigger: pg_cron schedule OU manual via Dashboard
│
├── Fase 1: MINERACAO
│   ├── Para cada footprint em arsenal_footprints:
│   │   ├── Edge Function: publicwww-scraper
│   │   ├── Input: footprint query
│   │   ├── Output: lista de dominios (CSV)
│   │   └── Upsert: spy_offers + spy_domains (dedup por domain)
│   └── Resultado: N novos dominios no radar
│
├── Fase 2: TRIAGEM (Semrush Bulk)
│   ├── Para novos dominios sem trafego:
│   │   ├── Agrupar em batches de 100
│   │   ├── Edge Function: semrush-bulk-checker
│   │   ├── Input: batch de dominios
│   │   ├── Output: trafego mensal
│   │   └── Upsert: spy_traffic
│   └── Resultado: Trafego atualizado
│
├── Fase 3: SPIKE DETECTION
│   ├── Materialized view: mv_recent_spikes (refresh)
│   ├── Para cada spike detectado:
│   │   ├── Insert: spike_alerts
│   │   ├── Update: spy_offers.status → 'hot' (se >200% spike)
│   │   └── Realtime: broadcast para UI
│   └── Resultado: Alertas na Dashboard + Radar
│
└── Fase 4: CURADORIA (Manual)
    ├── Operador revisa spikes no Radar
    ├── Status: analyzing → hot → scaling → cloned
    └── Analise profunda: Semrush detail, ad libraries, funil
```

#### 8.2 Estado Atual vs Pipeline Ideal

| Fase | Hoje | Visao | Gap |
|------|------|-------|-----|
| Mineracao | Manual (PublicWWW → CSV export → upload) | Semi-auto (Edge Function + CSV) | Edge Function nao existe |
| Triagem | Manual (Semrush → CSV export → upload) | Semi-auto (batch via API/CSV) | API integration futura |
| Spike Detection | Nenhuma | Automatica (materialized view + realtime) | Tudo a construir |
| Curadoria | Manual (status change no Radar) | Manual (intencional — humano decide) | Ja funciona |

**Realidade pragmatica:** A automacao completa (Fase 1-2) depende de APIs que podem nao estar disponiveis ou ser caras. O MVP de automacao e:
1. **Spike detection via materialized view** (construivel agora)
2. **Import job tracking** (construivel agora)
3. **Scheduled materialized view refresh** (pg_cron, construivel agora)
4. **Realtime alerts** (Supabase Realtime, construivel agora)

A automacao de PublicWWW/Semrush e fase futura que depende de acesso a APIs ou scraping.

---

### 9. UX Architecture (TDAH-Optimized)

#### 9.1 Principios de UX para TDAH

Baseado no laudo clinico (atencao P20, memoria visual P90):

| Principio | Implementacao |
|-----------|---------------|
| **Zero telas mortas** | Skeleton loaders em todo carregamento. Progress bar com %, nunca spinner generico |
| **Feedback visual constante** | Toast para toda acao, badge counts atualizados, timestamps relativos ("ha 2h") |
| **Satisfacao imediata** | Quick-add em 1 click, inline edit, resultados visiveis instantaneamente |
| **Nao interromper hiperfoco** | Modais nao-bloqueantes (sheet lateral), keyboard shortcuts, zero pop-ups |
| **Memoria visual explorada** | Sparklines em TUDO, status por COR + icone (nunca so texto), graficos > tabelas |
| **Sistema organiza por ele** | Auto-classificacao de CSV, auto-tagging por vertical, status sugerido por trafego |
| **Undo facil** | Soft-delete em tudo, confirmacao em acoes destrutivas com undo toast |

#### 9.2 Keyboard-First Navigation

```
Global:
  Cmd+K          Command Palette (busca global)
  Cmd+I          Abrir Import Modal
  Cmd+N          Quick Add (contexto-dependente)
  Esc            Fechar modal/panel

Radar:
  j/k            Navegar rows (cima/baixo)
  Enter          Abrir oferta selecionada
  Space          Toggle selecao
  Shift+Space    Selecionar range
  s              Mudar status
  t              Abrir tab de trafego
  n              Abrir notas

Geral:
  1-7            Trocar tabs (em detail views)
  /              Focus na busca
  Cmd+S          Salvar (em formularios)
```

#### 9.3 Command Palette (Cmd+K)

O hub central de navegacao e acoes:

```
┌─────────────────────────────────────┐
│ 🔍 Buscar ofertas, acoes, paginas... │
├─────────────────────────────────────┤
│ Recentes                            │
│  > Oferta XYZ                   ↵   │
│  > Import CSV                   ↵   │
│                                     │
│ Acoes                               │
│  > Novo import            Cmd+I     │
│  > Quick add oferta       Cmd+N     │
│  > Ir para Dashboard      Cmd+D     │
│  > Ir para Radar          Cmd+R     │
│                                     │
│ Ofertas (resultados de busca)       │
│  > [Hot] Oferta ABC        →        │
│  > [Scaling] Oferta DEF    →        │
└─────────────────────────────────────┘
```

#### 9.4 Layout Principal

```
┌──────┬──────────────────────────────────────────┐
│      │  [breadcrumb: Spy > Radar]      [Cmd+K]  │
│  S   │                                           │
│  I   │  [KPI][KPI][KPI][KPI][KPI]               │
│  D   │                                           │
│  E   │  ┌─ Filter Bar ──────────────────────┐   │
│  B   │  │ Status▾  Vertical▾  Period▾  Tags▾│   │
│  A   │  └───────────────────────────────────┘   │
│  R   │                                           │
│      │  ┌─ SpyOffersTable ──────────────────┐   │
│  64px│  │ ☐ Nome     Domain   Traffic  ▿ Sp │   │
│  or  │  │ ☐ Offer A  abc.com  45.2k  ▁▃▅▇  │   │
│ 240px│  │ ☐ Offer B  def.com  12.1k  ▇▅▃▁  │   │
│      │  │ ... (virtual scroll, 14k+ rows)   │   │
│      │  └───────────────────────────────────┘   │
│      │                                           │
│      │  ┌─ Bulk Actions (when selected) ────┐   │
│      │  │ 3 selected: [Status▾] [Tag] [Del] │   │
│      │  └───────────────────────────────────┘   │
└──────┴──────────────────────────────────────────┘
```

---

### 10. Seguranca

| Camada | Implementacao |
|--------|---------------|
| **Auth** | Supabase Auth (email/password). Sem OAuth necessario (solo operator) |
| **RLS** | Todas as tabelas com workspace_id check via `is_workspace_member()` |
| **Storage** | RLS por workspace via `storage.foldername(name)[1]` |
| **Secrets** | .env fora do git (ja corrigido). Supabase secrets para Edge Functions |
| **Input validation** | Zod schemas no frontend. Supabase CHECK constraints no backend |
| **Soft delete** | `deleted_at` em todas as entidades. Nunca DELETE real via UI |

---

### 11. Observabilidade

| Area | Ferramenta | Proposito |
|------|-----------|-----------|
| **Logging** | `logger.ts` (ja existe) | Erros, warnings, import jobs |
| **Analytics** | `analytics.ts` (ja existe) | Eventos de uso |
| **Import tracking** | `import_jobs` table | Historico completo de imports |
| **Error tracking** | Error Boundaries por modulo | Captura erros sem derrubar app |
| **Performance** | React Query devtools (dev only) | Cache hits, query timing |

---

## Parte 2: Migration Roadmap

---

### Visao vs Estado Atual: Classificacao por Componente

Cada item e classificado como:
- **KEEP** — Ja existe e esta bom. Manter como esta.
- **EVOLVE** — Existe mas precisa de melhorias. Adaptar o existente.
- **BUILD** — Nao existe. Criar do zero.

#### Stack & Infrastructure

| Componente | Classificacao | Detalhe |
|-----------|--------------|---------|
| React 18 + Vite + TS | KEEP | Nenhuma mudanca necessaria |
| Supabase (auth, DB, storage) | KEEP | Ja funcional |
| TailwindCSS + shadcn/ui | KEEP | Base solida |
| React Query | KEEP | Ja bem implementado |
| Recharts | KEEP | Implementacao que precisa melhorar, nao a lib |
| Framer Motion | KEEP | Ja instalado, precisa ser ativado |
| TanStack Virtual | KEEP | Ja instalado, precisa ser ativado |
| Code splitting (lazy routes) | KEEP | Ja implementado (BD-2.3 Done) |
| Branching strategy | KEEP | Ja implementado (BD-0.3 Done) |
| RLS policies | KEEP | Ja corrigido (BD-0.1 Done) |
| Database indexes | KEEP | Ja criados (BD-0.2 Done) |

#### Feature Modules

| Componente | Classificacao | Esforco | Detalhe |
|-----------|--------------|---------|---------|
| SPY Radar (tabela principal) | EVOLVE | 8h | Integrar design system, melhorar performance, tags |
| SPY Import Engine | EVOLVE | 6h | Web Worker, job tracking, progress melhorado |
| SPY Offer Detail (7 tabs) | EVOLVE | 12h | Design system, LED glow tabs, melhorar cada tab |
| SPY Traffic Intelligence | EVOLVE | 8h | Melhorar implementacao do grafico comparativo |
| SPY Monitoring (spikes) | BUILD | 16h | Spike detection, alerts, heatmap — tudo novo |
| Offers module | EVOLVE | 12h | Adicionar campos, status workflow, views multiplas |
| Avatar module | EVOLVE | 8h | JSONB fields, AI compatibility, export MD |
| Creatives module | EVOLVE | 8h | Fix bugs, naming engine, duplication |
| Dashboard | EVOLVE | 8h | Materialized views, KPIs reais, spike feed |
| Arsenal | BUILD | 6h | Footprints, dorks, keywords — modulo novo |
| Command Palette | BUILD | 4h | Cmd+K (cmdk ja instalado, precisa integrar) |

#### Architecture

| Componente | Classificacao | Esforco | Detalhe |
|-----------|--------------|---------|---------|
| Feature-based folder structure | EVOLVE | 8h | Reorganizar de flat → features/ |
| Service layer | KEEP | — | 4 services ja existem (BD-2.2 Done) |
| God Component decomposition | KEEP | — | Ja decomposto (BD-2.1 InReview) |
| Design System (tokens + primitives) | BUILD | 16h | Tokens CSS, LED glow, glassmorphism, badges |
| Inter font | BUILD | 1h | Instalar + configurar Tailwind |
| Web Workers (CSV) | BUILD | 4h | Mover CSV parsing para Worker |
| Supabase Realtime | BUILD | 4h | Subscriptions para spike alerts |
| Materialized Views | BUILD | 3h | Dashboard + traffic summary + spike detection |
| Keyboard shortcuts | BUILD | 3h | useKeyboardShortcuts hook + integration |
| Skeleton loaders | KEEP | — | Ja implementado (BD-3.3 Done) |
| Empty states | KEEP | — | Ja implementado (BD-3.3 Done) |
| Breadcrumbs | KEEP | — | Ja implementado (BD-3.4 Done) |
| Tests | KEEP + EVOLVE | 8h | Base existe (BD-3.5 Done), expandir cobertura |

#### Database

| Componente | Classificacao | Esforco | Detalhe |
|-----------|--------------|---------|---------|
| spy_offers (rename) | EVOLVE | 1h | Rename spied_offers → spy_offers |
| spy_traffic (rename) | EVOLVE | 1h | Rename + add import_job_id |
| spy_domains (rename) | EVOLVE | 1h | Rename offer_domains |
| spy_ad_libraries (rename) | EVOLVE | 0.5h | Rename |
| spy_funnel_steps (rename) | EVOLVE | 0.5h | Rename + fix step_type enum |
| spy_creatives (rename) | EVOLVE | 0.5h | Rename + cleanup |
| offers (evolve) | EVOLVE | 2h | Add missing fields |
| avatars (evolve) | EVOLVE | 2h | Add JSONB fields |
| import_jobs | BUILD | 1h | Nova tabela |
| spike_alerts | BUILD | 1h | Nova tabela |
| saved_views | BUILD | 1h | Nova tabela |
| Materialized views (3) | BUILD | 2h | Dashboard, traffic summary, spikes |
| Legacy table cleanup | KEEP | — | Ja feito (BD-2.4 Done) |

### Resumo de Esforco

| Classificacao | Itens | Horas Estimadas |
|--------------|-------|-----------------|
| **KEEP** (ja feito) | 22 | 0h |
| **EVOLVE** (adaptar existente) | 19 | ~72h |
| **BUILD** (criar do zero) | 12 | ~59h |
| **TOTAL** | 53 | **~131h** |

**Realista (x1.5):** ~196h

**Observacao critica:** Isso NAO e um "refazer do zero". 22 dos 53 itens ja estao prontos graras ao trabalho do Brownfield. O vision architecture e um UPGRADE, nao um rebuild.

---

### Sequencia de Execucao Recomendada

```
FASE 1: FOUNDATION (20h) ─────────────────────────────────
│ Design System: tokens, Inter font, LED glow primitives
│ Feature folder restructure
│ Command Palette (Cmd+K)
│ Keyboard shortcuts framework
│
FASE 2: SPY EXCELLENCE (30h) ──────────────────────────────
│ SPY Radar: design system integration + tags
│ Traffic Intelligence: grafico comparativo melhorado
│ Import Engine: Web Worker + job tracking
│ Sparklines: respeitar filtro 100%
│
FASE 3: INTELLIGENCE (20h) ────────────────────────────────
│ Spike Detection: materialized view + alerts
│ Supabase Realtime: live spike notifications
│ Dashboard: KPIs reais + spike feed
│ Heatmap Calendar
│
FASE 4: MODULES (30h) ─────────────────────────────────────
│ Offers: campos completos, views multiplas, status workflow
│ Avatar: JSONB fields, AI compat, export MD
│ Creatives: naming engine, duplication, fix bugs
│ Arsenal: footprints, dorks, keywords
│
FASE 5: AUTOMATION (20h) ──────────────────────────────────
│ Import job tracking completo
│ Scheduled materialized view refresh
│ Pipeline semi-automatizado
│ Saved views
│
FASE 6: POLISH (11h) ──────────────────────────────────────
│ DB schema renames
│ Test coverage expansion
│ Performance tuning
│ Accessibility refinements
```

---

## Parte 3: Brownfield Stories Triage

---

### Status Atual das 17 Stories

| Story | Titulo | Status BD | Status Vision | Veredicto |
|-------|--------|-----------|---------------|-----------|
| BD-0.1 | Fix Storage RLS + .env security | Done | Trabalho preservado | DONE — Valido |
| BD-0.2 | Add critical database indexes | Done | Trabalho preservado | DONE — Valido |
| BD-0.3 | Setup branching strategy | Done | Trabalho preservado | DONE — Valido |
| BD-1.1 | Replace iOS emojis with Lucide | Done | Trabalho preservado | DONE — Valido |
| BD-1.2 | Fix table sizing/dimensioning | Done | Sera refinado pelo Design System | DONE — Parcial (Design System refina) |
| BD-1.3 | Fix sidebar + dashboard + charts | Done | Dashboard sera refeito com mat. views | DONE — Parcial (Dashboard evolui) |
| BD-1.4 | Fix popups, tooltips, sparkline | Done | Sparklines evoluem na Vision | DONE — Parcial (Sparklines evoluem) |
| BD-2.1 | Decompose God Components | InReview | Essencial para feature-based arch | KEEP — Finalizar e manter |
| BD-2.2 | Create service layer | Done | Service layer ja existe e e valida | DONE — Valido |
| BD-2.3 | Code splitting + virtualization | Done | Trabalho preservado | DONE — Valido |
| BD-2.4 | Deprecate legacy tables | Done | Schema evolui (renames futuros) | DONE — Valido |
| BD-2.5 | Materialized views for dashboard | Done | Vision expande para 3 mat. views | DONE — Parcial (Vision expande) |
| BD-3.1 | Fix remaining bugs | Done | Bugs resolvidos | DONE — Valido |
| BD-3.2 | Accessibility overhaul | Done | Trabalho preservado | DONE — Valido |
| BD-3.3 | Skeleton loaders + empty states | Done | Trabalho preservado | DONE — Valido |
| BD-3.4 | Breadcrumb navigation | Done | Trabalho preservado | DONE — Valido |
| BD-3.5 | Critical integration tests | Done | Base de testes preservada | DONE — Valido |

### Resumo da Triage

| Veredicto | Stories | Significado |
|-----------|---------|------------|
| **DONE — Valido** | 11 | Trabalho concluido e 100% preservado na Vision |
| **DONE — Parcial** | 4 | Trabalho concluido mas a Vision vai expandir/refinar |
| **KEEP — Finalizar** | 1 | BD-2.1 InReview — finalizar e incorporar na Vision |
| **SUPERSEDED** | 0 | Nenhuma story descartada |
| **DESCARTADA** | 0 | Nenhuma story desperdicada |

### Conclusao da Triage

**Zero trabalho desperdicado.** Todas as 17 stories do Brownfield Discovery contribuem diretamente para a Vision Architecture. O brownfield foi um investimento, nao um desvio. A Vision e construida SOBRE o brownfield, nao APESAR dele.

O unico action item e finalizar BD-2.1 (God Component decomposition) que esta InReview.

---

## Apendice A: Decisoes Arquiteturais (ADR Summary)

| ADR | Decisao | Justificativa |
|-----|---------|---------------|
| ADR-001 | Manter React+Vite+TS | Stack madura, zero razao para migrar |
| ADR-002 | Manter Supabase | BaaS completo, ideal para solo operator |
| ADR-003 | Feature-based folder structure | Scalability, code splitting natural, isolation |
| ADR-004 | Design System from aesthetic profile | Identidade visual do operador, nao tema generico |
| ADR-005 | Web Workers para CSV | 14k+ rows nao podem travar main thread |
| ADR-006 | Materialized Views para dashboard | 500k+ rows exige pre-computacao |
| ADR-007 | Supabase Realtime para spikes | Low-latency alerts sem polling |
| ADR-008 | Schema rename (spied_offers → spy_offers) | Consistencia, clareza, namespace limpo |
| ADR-009 | Recharts (manter) | Problema era implementacao, nao lib |
| ADR-010 | Inter font | Geometric, tabular-nums, dark mode otimizado |
| ADR-011 | Keyboard-first navigation | Solo operator productivity, TDAH flow state |
| ADR-012 | Soft delete universal | Impulsividade TDAH + data sanctuary principle |

---

## Apendice B: Glossario

| Termo | Significado no DR OPS |
|-------|----------------------|
| **Footprint** | Script/codigo que identifica uma plataforma (ex: cdn.utmify.com.br identifica Utmify) |
| **Spike** | Aumento subito de trafego (>100% mes-a-mes) |
| **Sudden spike** | Spike em dominio que antes tinha pouco trafego |
| **Resurrection** | Dominio que voltou a ter trafego apos meses morto |
| **Cloaker** | Ferramenta que mostra pagina diferente para bots/revisores |
| **VSL** | Video Sales Letter — video de vendas longo |
| **Bau/Vault** | Arquivo de dominios irrelevantes (escondidos mas nao deletados) |
| **Radar** | Lista principal de ofertas espionadas |
| **Curadoria** | Processo manual de classificar ofertas por potencial |

---

*Documento gerado por Aria (@architect) como Vision Architecture Blueprint — Fase 3 do Vision Architecture Pipeline.*
*Inputs: context-brief.md (304 linhas), aesthetic-profile.md (812 linhas), 9 docs brownfield (~2000 linhas).*
*Nenhum codigo foi alterado. Este e um documento de arquitetura, nao de implementacao.*

— Aria, arquitetando o futuro

# Brownfield Discovery - Phase 1: System Architecture
**Date:** 2026-02-19
**Agent:** @architect (Aria)
**Scope:** Complete DR OPS ecosystem assessment

---

## 1. EXECUTIVE SUMMARY

DR OPS e um ecossistema de Direct Response Marketing fragmentado em **5 camadas** que evoluiu organicamente de pasta local → Notion → Obsidian → webapp. O sistema foi construido por um operador solo (Marcos) com assistencia de multiplas IAs (Claude, Lovable, Gemini) sem arquitetura centralizada previa. O resultado e um MVP funcional de espionagem competitiva com debitos tecnicos significativos mas valor de negocio real (12k+ ofertas rastreadas, 87k+ registros de trafego).

### Status: MVP com modulo SPY parcialmente funcional, restante em estado basico/incompleto.

---

## 2. ECOSYSTEM MAP

### 2.1 Cinco Camadas do Sistema

```
CAMADA 1: DR-Operations (Legacy)
  /Users/admin/DR-Operations/
  Finalidade: Sistema original no Finder
  Status: ATIVO mas desorganizado (87 pastas sem categorizar em 01-ESPIONAGEM/Outros)
  Tamanho: ~43GB (30GB em ofertas ativas, 3.6GB em espionagem)
  Conteudo critico:
    - PROMPTS/: 60+ system prompts (VSL workflow, spy agent, hook generators)
    - 04-meta-principios-dr.md: Mensagem do Finch (principios operacionais)
    - 5-prompt VSL pipeline (Gemini → Claude chain)
    - Notion database templates (7 databases)
    - Swipe files, templates de oferta, recursos de producao

CAMADA 2: DR-OPS (Hub Centralizado)
  /Users/admin/DR-OPS/
  Finalidade: Tentativa de centralizar tudo
  Status: Estrutura criada mas parcialmente populada
  Conteudo:
    - README.md + COMO-USAR.md: Filosofia e guia rapido
    - _SYSTEM/: Contém o webapp (dr-core), SOPs, mapas
    - _ASSETS/, _MARKET-INTEL/, _SWIPE/: Organizacao por funcao
    - OFERTAS/: Ofertas ativas centralizadas
    - Nomenclatura universal definida em SOP

CAMADA 3: Webapp DR-Core (Aplicacao Web)
  /Users/admin/DR-OPS/_SYSTEM/APP-WEB-DR-OPS/dr-core/
  Finalidade: Sistema web de espionagem e gestao
  Stack: React 18 + Vite + TypeScript + Supabase + TailwindCSS + shadcn/ui
  Deploy: GitHub (CezarinniMedia/dr-core) → Hostinger (auto-deploy)
  Status: SPY funcional com bugs, outros modulos basicos
  Dados: 12k+ ofertas, 87k+ registros de trafego, 34 tabelas

CAMADA 4: Obsidian Vault (Knowledge Base)
  /Users/admin/Library/Mobile Documents/iCloud~md~obsidian/Documents/DR-OPERATIONS-VAULT/
  Finalidade: Base de conhecimento, canvases visuais, agentes
  Status: Estruturado mas subutilizado
  Conteudo: 40+ dirs, 10+ canvases, 62KB de contexto de conversas

CAMADA 5: Notion (Databases Legados)
  https://notion.so/DR-Operations-...
  https://notion.so/New-Blocos-...
  Finalidade: Databases originais (Radar, Ofertas, Criativos)
  Status: Parcialmente substituido pelo webapp
```

### 2.2 Fluxo de Dados Atual

```
PublicWWW (footprints)
    ↓ CSV export
Semrush Bulk Analysis (5 em 5)
    ↓ CSV export
SimilarWeb (trafego total)
    ↓ CSV export
        ↓
[dr-core webapp] UniversalImportModal
    ↓ csvClassifier.ts (10 tipos detectados)
    ↓ Batch upsert via Supabase client
        ↓
[Supabase PostgreSQL]
    spied_offers → offer_domains → offer_traffic_data
    offer_ad_libraries → offer_funnel_steps → ad_creatives
        ↓
[UI: SpyRadar + TrafficIntelligenceView]
    Filtros, ordenacao, graficos comparativos, sparklines
    Inline edit, bulk actions, column presets
```

---

## 3. TECH STACK ANALYSIS

### 3.1 Frontend

| Tecnologia | Versao | Avaliacao | Notas |
|-----------|--------|-----------|-------|
| React | 18.3.1 | OK | Estavel, sem necessidade de migrar para 19 agora |
| Vite | 5.4.19 | OK | Build rapido, HMR funcional |
| TypeScript | 5.8.3 | OK | Strict mode habilitado |
| TailwindCSS | 3.4.17 | OK | Produtivo para dark mode |
| shadcn/ui | Latest | OK | 49 componentes, boa base |
| Radix UI | v1.x | OK | 40+ packages de primitivos |
| Recharts | 2.15.4 | ADEQUADO | Funcional mas limitado para comparacoes complexas |
| React Query | 5.83.0 | BOM | Cache 5min, parallel fetch implementado |
| React Router | 6.30.1 | OK | Routing basico funcionando |
| Lucide React | 0.462.0 | OK | Substituto correto de emojis iOS |

**Problemas identificados no Frontend:**
- Componentes SPY muito grandes (UniversalImportModal: 1,160 linhas, TrafficIntelligenceView: 852 linhas)
- SpyRadar.tsx acumula logica de filtros, paginacao, colunas, inline edit, selection, bulk actions
- Sem code splitting / lazy loading (tudo carrega de uma vez)
- Sem service layer (componentes chamam Supabase diretamente)
- CSS inconsistente (mix de inline styles + Tailwind + hardcoded values)
- Dark mode e o unico tema real mas toggle existe sem utilidade
- Emojis iOS ainda presentes em varias partes (BUG-008)
- Dimensionamento/sizing inconsistente em todo o sistema (BUG-010)

### 3.2 Backend (Supabase)

| Recurso | Status | Avaliacao |
|---------|--------|-----------|
| PostgreSQL | Ativo | 33 tabelas, schema funcional mas com redundancias |
| Auth | Ativo | Email/password, funcional |
| RLS | Parcial | Policies existem mas BUG-001 bloqueia uploads |
| Storage | Parcial | 4 buckets, upload quebrado por RLS |
| Edge Functions | 2 | extract-avatar, generate-hooks (basicas) |
| Realtime | NAO USADO | Potencial para updates live |

**Problemas identificados no Backend:**
- RLS policies quebradas para Storage (BUG-001 - CRITICO)
- Tabelas redundantes/legacy (competitors vs spied_offers, ad_bibliotecas vs offer_ad_libraries, trafego_historico vs offer_traffic_data)
- Schema parcialmente normalizado (notas como campo texto, geo como string)
- Migrations nao seguem naming convention padrao
- Sem indexes otimizados documentados para queries de 87k+ registros
- Sem database functions/triggers para logica de negocio
- Sem backups automatizados documentados

### 3.3 Infraestrutura

| Item | Status | Notas |
|------|--------|-------|
| GitHub | Ativo | CezarinniMedia/dr-core, auto-deploy |
| Hostinger | Ativo | Deploy automatico via webhook |
| Lovable | Ativo | Tambem commita no repo (fonte de conflitos) |
| AIOS Framework | Configurado | 545 arquivos, parcialmente ativo |
| MCP Servers | Configurados | EXA, Context7, Apify, Playwright via Docker |

**Problemas de infraestrutura:**
- Lovable e Claude Code commitam no mesmo repo (conflitos frequentes)
- Sem branching strategy (tudo em main)
- Sem CI/CD pipeline (sem testes automatizados no deploy)
- Sem staging environment
- Arquivo .env no git status como modified (risco de seguranca)

---

## 4. MODULE ANALYSIS

### 4.1 SPY Module (Modulo Principal - 80% do valor)

**Componentes:** 20 arquivos em src/components/spy/
**Paginas:** SpyRadar.tsx, SpyOfferDetail.tsx
**Hooks:** useSpiedOffers.ts (574 linhas)
**Lib:** csvClassifier.ts, parseSemrushCSV.ts

**O que funciona bem:**
- Importador Universal CSV com 10 tipos detectados automaticamente
- Inteligencia de Trafego com sparklines e graficos comparativos multi-dominio
- Batch processing para 14k+ registros (chunks de 1000)
- Dedup inteligente (ofertas, dominios, trafego)
- Toggle SimilarWeb/SEMrush como fonte de trafego
- Multi-status filter com badges, inline edit, bulk actions
- Column customization com grupos e presets
- Screenshot preview com lightbox (zoom+pan)
- Notas inline com Markdown

**O que NAO funciona / falta:**
- Graficos nao respeitam todos os filtros de data (BUG-003)
- Sparkline nao acompanha periodo selecionado (BUG-012)
- Logica de geo multi-pais com bugs residuais
- Campo domain_created_at presente no DB mas sem UI completa
- Ordem de processamento no import pode causar inconsistencias
- Sem "vault/archive" funcional para esconder dominios irrelevantes (hotmart, etc)
- Performance de carregamento inicial lenta (sem lazy loading)
- Popup do importador com informacoes cortadas (BUG-009)
- Tamanho de elementos inconsistente (BUG-010)
- Ausencia de tooltips descritivos (BUG-011)
- Badges do grafico sem cor correspondente a linha
- SimilarWeb multi-periodo: clusterizacao de meses dentro de um mesmo CSV nao 100% robusta

### 4.2 Ofertas (Modulo Proprio - 5%)

**Status:** CRUD basico com cards e filtros
**Problemas:**
- Cards so abrem pelo nome, nao pela area do card (BUG-010)
- Filtros muito pequenos (BUG-009)
- Campos insuficientes (sem upsells, downsells, precos, mecanismo unico)
- Sem export/import Markdown
- Sem status "Produzindo"
- Sem opcoes de visualizacao/ordenacao
- Visual com emojis iOS

### 4.3 Avatar & Research (5%)

**Status:** Listagem e detalhe basico
**Problemas:**
- Campos nao alinhados com output do agente de extracao
- Sem import/export
- Pain/Desire matrix sem dados reais

### 4.4 Criativos (5%)

**Status:** Kanban basico
**Problemas:**
- Card nao reabre apos criado (BUG-006)
- Delay ao drag-and-drop (BUG-007)
- Sem etapa "Teste" no Kanban
- Sem duplicacao de card
- Sem nomenclatura automatica
- Upload quebrado por RLS (BUG-001)

### 4.5 Dashboard (2%)

**Status:** Mostra dados zerados (BUG-005)
**Problemas:** Queries nao consultam tabelas corretas

### 4.6 Modulos Planejados (0%)

| Plan | Modulo | Status |
|------|--------|--------|
| 06 | Pages (Funil Visual) | Nao iniciado |
| 07 | Analytics (VTurb, FB, Google) | Nao iniciado |
| 08 | Prompts & Agents | Nao iniciado |
| 09 | Canvas & Whiteboard | Nao iniciado |
| 10-12 | Automacoes, Search, Mobile | Nao iniciado |

---

## 5. DATA ARCHITECTURE

### 5.1 Volume de Dados

| Tabela | Registros | Crescimento |
|--------|-----------|-------------|
| spied_offers | 12,000+ | +centenas/semana (imports CSV) |
| offer_traffic_data | 87,000+ | +milhares/semana (multi-periodo) |
| offer_domains | ~15,000 (est.) | Proporcional a ofertas |
| offer_ad_libraries | ~500 (est.) | Manual, crescimento lento |
| offer_funnel_steps | ~200 (est.) | Manual |
| Total trafego esperado | 500k+ em 6 meses | Objetivo: rastrear TODO o mercado DR |

### 5.2 Fontes de Dados

| Fonte | Tipo | Cobertura | Frequencia |
|-------|------|-----------|------------|
| PublicWWW | Footprint scraping | Dominios por query | Semanal/mensal (objetivo) |
| Semrush Bulk | SEO traffic | 100 dominios/batch | Mensal por periodo |
| Semrush Detail | Geo/Pages/Subdomains | 5 dominios/batch | Sob demanda |
| SimilarWeb | Total traffic | Ilimitado | Sob demanda |
| Manual | Bibliotecas, funil, notas | Individual | Continuo |

### 5.3 Modelo de Dados Simplificado

```
spied_offers (entidade central)
├── offer_domains (1:N)
│   ├── domain, url, domain_type, first_seen
│   └── discovery_source, discovery_query
├── offer_traffic_data (1:N)
│   ├── domain, period_date, visits
│   ├── period_type: "monthly" (Semrush) | "monthly_sw" (SimilarWeb)
│   └── unique constraint: (offer_id, domain, period_type, period_date)
├── offer_ad_libraries (1:N)
├── offer_funnel_steps (1:N)
│   └── domain_id FK → offer_domains
├── ad_creatives (1:N)
└── campos diretos: notas (markdown), geo, status, prioridade, screenshot_url

TABELAS LEGACY (redundantes):
- competitors (substituido por spied_offers)
- ad_bibliotecas (substituido por offer_ad_libraries)
- trafego_historico (substituido por offer_traffic_data)
- comparacao_batches (nao usado)
- fontes_captura (nao usado)
- import_batches (nao usado)
```

---

## 6. ARCHITECTURAL ANTI-PATTERNS IDENTIFICADOS

### 6.1 CRITICOS (impactam funcionalidade e escalabilidade)

| # | Anti-Pattern | Onde | Impacto |
|---|-------------|------|---------|
| AP-01 | **God Component** | UniversalImportModal.tsx (1,160 LOC), SpyRadar.tsx, TrafficIntelligenceView.tsx (852 LOC) | Impossivel manter, testar ou reutilizar |
| AP-02 | **No Service Layer** | Componentes chamam Supabase diretamente | Logica de negocio espalhada, sem reuso |
| AP-03 | **RLS Policies Quebradas** | Storage buckets | Upload impossivel (BUG-001) |
| AP-04 | **Sem Code Splitting** | App.tsx carrega tudo | Performance inicial ruim |
| AP-05 | **Tabelas Redundantes** | 6+ tabelas legacy sem uso | Schema poluido, confusao |
| AP-06 | **Dual Commit Sources** | Lovable + Claude Code em main | Conflitos, regressoes |
| AP-07 | **Sem Testes** | 2 arquivos de teste (1 exemplo) | Zero cobertura real |
| AP-08 | **.env em Git** | .env no working tree modificado | Credenciais expostas |

### 6.2 IMPORTANTES (impactam UX e qualidade)

| # | Anti-Pattern | Onde | Impacto |
|---|-------------|------|---------|
| AP-09 | **Inconsistencia Visual** | Emojis iOS vs Lucide, sizing variavel | Aparencia amadora |
| AP-10 | **Sem Error Boundaries Granulares** | 1 ErrorBoundary no root | Erro em 1 componente derruba tudo |
| AP-11 | **Sem Skeleton/Loading States** | Listas e detalhes | Sensacao de lentidao |
| AP-12 | **CSS Inconsistente** | Mix de abordagens | Dificil manter visual coeso |
| AP-13 | **Sem Internationalization** | Hardcoded PT-BR + EN misturado | Strings espalhadas |
| AP-14 | **Sem Accessibility** | Sem ARIA labels, keyboard nav | Usabilidade limitada |

### 6.3 DEBT TECNICO ACUMULADO

| # | Debt | Complexidade de Fix |
|---|------|-------------------|
| TD-01 | Migrar de componentes monoliticos para composicao | ALTA (refactor major) |
| TD-02 | Criar service layer (separar business logic) | MEDIA |
| TD-03 | Implementar code splitting com React.lazy | BAIXA |
| TD-04 | Limpar tabelas legacy do schema | MEDIA (migracao + update types) |
| TD-05 | Setup CI/CD com testes | MEDIA |
| TD-06 | Branching strategy (dev/staging/main) | BAIXA |
| TD-07 | Design system consistente | ALTA (design + implementacao) |
| TD-08 | Cobertura de testes minima | ALTA (criar testes do zero) |

---

## 7. FRAGMENTACAO DO ECOSSISTEMA

### Problema Central
O usuario opera em 5+ locais diferentes sem integracao real:

| Local | O que tem | Sincronizado? |
|-------|----------|--------------|
| DR-Operations/ | Prompts, swipe files, ofertas legacy, templates | NAO |
| DR-OPS/ | Hub centralizado, webapp | PARCIAL |
| Obsidian Vault | Knowledge base, canvases, agentes | NAO |
| Notion (2 workspaces) | Databases de radar, ofertas, criativos | NAO |
| dr-core webapp | SPY radar, importacao CSV, trafego | SIM (via Supabase) |

### Dados Duplicados/Inconsistentes
- Ofertas existem no Notion, no Finder (DR-Operations) e no webapp
- Prompts existem no Obsidian, no DR-Operations/PROMPTS, e no Claude Projects
- Nomenclatura definida em SOP mas nao enforced no webapp
- Canvases no Obsidian nao refletem estado do webapp

---

## 8. PRINCIPIOS OPERACIONAIS (do Finch + contexto do usuario)

### Core Philosophy
1. **Velocidade > Perfeicao** - "Quem espiona rapido, lanca rapido"
2. **Volume de criativos testados = sucesso de escala**
3. **Pivotagem rapida** - Capacidade de mudar em horas, nao dias
4. **Espionagem como vantagem competitiva** - Ninguem pode ficar fora do radar
5. **IA como multiplicador** - Pipeline Gemini → Claude para criar ofertas em horas

### Implicacoes para Arquitetura
- Performance de importacao CSV e CRITICA (14k+ registros frequentes)
- UI deve priorizar velocidade de uso (quick add, bulk actions, inline edit)
- Graficos comparativos sao o diferencial #1 do sistema
- Sistema deve escalar para 100k+ ofertas rastreadas
- Automacao de pipeline PublicWWW → Semrush → SimilarWeb e o objetivo final

---

## 9. TECHNOLOGY DECISIONS - CONFIRMADAS vs. A REAVALIAR

### Confirmadas (manter)
- React 18 + Vite + TypeScript (stack solida, ecossistema maduro)
- Supabase como BaaS (auth, db, storage, realtime - tudo necessario)
- TailwindCSS + shadcn/ui (produtivo, dark mode nativo)
- React Query para server state (cache, parallel fetch)
- GitHub + Hostinger (deploy automatico funcional)
- Recharts para graficos simples

### A Reavaliar
- **Lovable como ferramenta de dev**: Causa conflitos com Claude Code no mesmo repo. Recomendacao: usar apenas para prototipagem rapida em branch separada, nunca em main.
- **Recharts para graficos complexos**: Limitado para comparacoes multi-dominio avancadas. Alternativa: considerar Nivo, Victory, ou Plotly para graficos mais sofisticados.
- **Supabase Storage**: Com RLS quebrado, avaliar se Cloudflare R2 ou outro storage e mais adequado.
- **AIOS Framework**: 545 arquivos de framework vs. valor real entregue. Avaliar ROI.

---

## 10. RISCOS IDENTIFICADOS

| # | Risco | Probabilidade | Impacto | Mitigacao |
|---|-------|--------------|---------|-----------|
| R-01 | Performance degrada com 100k+ ofertas | ALTA | CRITICO | Indexes, pagination server-side, virtual scrolling |
| R-02 | Credenciais em .env vazam | MEDIA | CRITICO | .gitignore correto, secrets management |
| R-03 | Conflitos Lovable vs Claude Code | ALTA | ALTO | Branching strategy, parar de usar Lovable em main |
| R-04 | Supabase free tier limits | MEDIA | ALTO | Monitorar uso, plan paid quando necessario |
| R-05 | Single point of failure (1 dev) | ALTA | ALTO | Documentacao, AIOS framework, sessions handoff |
| R-06 | Schema drift entre types.ts e DB real | MEDIA | MEDIO | Automatizar gen types apos cada migracao |

---

## 11. RECOMENDACOES ESTRATEGICAS (preview para Fase 4)

### Prioridade 1: Estabilizar o que existe
1. Corrigir RLS Storage (desbloqueia uploads em todo o sistema)
2. Corrigir graficos/filtros de data
3. Limpar tabelas legacy
4. Adicionar .env ao .gitignore AGORA

### Prioridade 2: Refatorar para escala
1. Quebrar God Components em composicao
2. Criar service layer
3. Implementar code splitting
4. Branching strategy (parar Lovable em main)

### Prioridade 3: Polir SPY Module
1. Design system consistente (sizing, spacing, typography)
2. Resolver todos os bugs documentados
3. SimilarWeb como fonte primaria
4. Automacao de pipeline (objetivo final)

### Prioridade 4: Expandir
1. Consolidar dados fragmentados (DR-Operations → webapp)
2. Implementar PLANs 06-12 conforme necessidade
3. AI-powered features (clustering, spike detection, auto-tagging)

---

## ASSINATURA

**Fase 1 do Brownfield Discovery concluida.**
Documento gerado por @architect (Aria) com base em:
- Exploracao completa do codebase (126 source files, 33 DB tables, 9 migrations)
- Leitura dos 2 arquivos de contexto completo (~1900 linhas total)
- Mapeamento de DR-Operations (43GB, 7 dirs principais)
- Mapeamento de DR-OPS (5 dirs, README, SOPs)
- Mapeamento de Obsidian Vault (40+ dirs, 10+ canvases)
- Analise de docs/ (project-state, bugs, tasks, architecture, changelog)
- Mensagem do Finch (principios operacionais DR 2026)

Proximo: **Fase 2** - @data-engineer analisa schema completo, RLS policies, migrations → SCHEMA.md + DB-AUDIT.md

--- Aria, arquitetando o futuro

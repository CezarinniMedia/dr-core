# Domain Model Completo — DR OPS

> **Autor:** Atlas (@analyst) | **Data:** 2026-02-22
> **Fontes:** Brownfield Discovery (9 docs), Obsidian Vault, src/ analysis, CLAUDE.md, APP-WEB context
> **Status:** FINAL

---

## 1. Visao Geral do Dominio

DR OPS e um **Sistema de Inteligencia para Direct Response Marketing** que opera em ciclo continuo:

```
ESPIONAR → IDENTIFICAR → CLONAR → TESTAR → ESCALAR → MONITORAR
     ↑                                                    |
     └────────────────────────────────────────────────────┘
```

O sistema serve um **operador solo** (Marcos, ADHD, QI 118, memoria visual percentil 90) cujo principio fundamental e:

> "Quem espiona rapido, lanca rapido. Delay mata." — Thiago Finch

---

## 2. Entidades do Dominio

### 2.1 Mapa de Entidades (Entity Relationship)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        WORKSPACE (Multi-Tenant)                         │
│  Todas as entidades estao isoladas por workspace_id via RLS             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐    1:N    ┌──────────────────┐                    │
│  │  SPIED_OFFERS   │──────────>│  OFFER_DOMAINS   │                    │
│  │  (12k+ records) │          │  (~15k records)   │                    │
│  │                 │    1:N    ├──────────────────┤                    │
│  │  Entidade       │──────────>│ OFFER_TRAFFIC    │                    │
│  │  Central do     │          │ DATA (87k+)      │                    │
│  │  Modulo SPY     │    1:N    ├──────────────────┤                    │
│  │                 │──────────>│ OFFER_AD_LIBS    │                    │
│  │                 │          │ (~500 records)    │                    │
│  │                 │    1:N    ├──────────────────┤                    │
│  │                 │──────────>│ OFFER_FUNNEL     │                    │
│  │                 │          │ STEPS (~200)     │                    │
│  │                 │    1:N    ├──────────────────┤                    │
│  │                 │──────────>│ AD_CREATIVES     │                    │
│  └───────┬─────────┘          │ (shared w/       │                    │
│          │                     │  ofertas)         │                    │
│          │                     └──────────────────┘                    │
│          │                                                              │
│          │ conceptual clone                                             │
│          │                                                              │
│  ┌───────▼─────────┐    1:N    ┌──────────────────┐                    │
│  │    OFERTAS       │──────────>│    AVATARES      │                    │
│  │  (Own Offers)    │          │  (Personas)      │                    │
│  │                 │    1:N    ├──────────────────┤                    │
│  │  Contrapartida  │──────────>│    CRIATIVOS     │                    │
│  │  propria das    │          │  (Own Creatives) │                    │
│  │  spied_offers   │          └──────────────────┘                    │
│  └─────────────────┘                                                    │
│                                                                         │
│  ┌──────────────────────────────────────────────┐                      │
│  │              ARSENAL (Research Tools)          │                      │
│  │  ┌────────────┐ ┌─────────────┐ ┌──────────┐ │                      │
│  │  │   DORKS    │ │ FOOTPRINTS  │ │ KEYWORDS │ │                      │
│  │  │ (searches) │ │ (patterns)  │ │(research)│ │                      │
│  │  └────────────┘ └─────────────┘ └──────────┘ │                      │
│  └──────────────────────────────────────────────┘                      │
│                                                                         │
│  ┌──────────────────────────────────────────────┐                      │
│  │           INFRAESTRUTURA                      │                      │
│  │  ┌──────────┐ ┌─────────────┐ ┌────────────┐ │                      │
│  │  │ PROFILES │ │IMPORT_BATCH │ │SAVED_VIEWS │ │                      │
│  │  │          │ │(audit trail)│ │(presets)   │ │                      │
│  │  └──────────┘ └─────────────┘ └────────────┘ │                      │
│  └──────────────────────────────────────────────┘                      │
│                                                                         │
│  ┌──────────────────────────────────────────────┐                      │
│  │           LEGACY (Deprecar)                   │                      │
│  │  ad_bibliotecas, oferta_dominios,             │                      │
│  │  funil_paginas, trafego_historico,            │                      │
│  │  comparacao_batches, fontes_captura           │                      │
│  └──────────────────────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Entidades Detalhadas

#### SPIED_OFFERS — Ofertas Espionadas (Core Entity)

| Atributo | Tipo | Regra de Negocio |
|----------|------|------------------|
| `nome` | VARCHAR | Nome da oferta (ex: "Cha Bariatrico") |
| `main_domain` | VARCHAR | Dominio principal (ex: "chabariatrico.fun") |
| `status` | ENUM | RADAR → ANALYZING → HOT → SCALING → CLONED → DYING → DEAD → VAULT → NEVER_SCALED |
| `vertical` | VARCHAR | Mercado: nutra, info, tech, pharma, finance |
| `subnicho` | VARCHAR | Sub-categoria (emagrecimento, skincare) |
| `geo` | VARCHAR | Mercado geografico (BR, USA, LATAM, EU) |
| `priority` | INT(0-10) | Prioridade manual do curador |
| `discovery_source` | VARCHAR | publicwww, semrush, manual, viral, youtube |
| `discovery_query` | TEXT | Footprint original que encontrou |
| `product_ticket` | DECIMAL | Ticket medio (AOV) |
| `product_promise` | TEXT | Promessa principal da oferta |
| `screenshot_url` | TEXT | Screenshot da landing page |
| `traffic_trend` | VARCHAR | up, down, stable, spike |
| `notas` | TEXT(MD) | Notas de pesquisa (Markdown completo) |
| `operator_name` | VARCHAR | Nome do operador/afiliado |
| `checkout_provider` | VARCHAR | Stripe, Kiwify, Hotmart |
| `vsl_player` | VARCHAR | Wistia, Vimeo, PandaVideo |

**Regras:**
- Status e **opiniao do curador**, NAO e calculado automaticamente por trafego
- Revenue estimado NUNCA e auto-calculado (regra explicita no CLAUDE.md)
- VAULT = soft-delete, recuperavel, excluido do radar principal
- Suporta multiple domains (1:N com offer_domains)

#### OFFER_TRAFFIC_DATA — Dados de Trafego Historico

| Atributo | Tipo | Regra de Negocio |
|----------|------|------------------|
| `spied_offer_id` | UUID FK | Qual oferta |
| `domain` | VARCHAR | Dominio especifico (tracking por dominio) |
| `period_date` | DATE | Mes (armazenado como YYYY-MM-01) |
| `visits` | INT | Visitas mensais |
| `period_type` | VARCHAR | "monthly" (SEMrush organic) ou "monthly_sw" (SimilarWeb total) |
| `source` | VARCHAR | semrush_csv, similarweb_csv, manual |

**Regras Criticas:**
- **SimilarWeb = Source of Truth** para trafego total (paid + organic + direct + referral)
- **SEMrush = Organico apenas** (usado para analise de funil)
- Upsert key: (spied_offer_id, domain, period_date, period_type)
- 87k+ registros atuais, projecao 500k+ em 6 meses

#### OFERTAS — Ofertas Proprias

| Atributo | Tipo | Regra de Negocio |
|----------|------|------------------|
| `nome` | VARCHAR | Nome da oferta propria |
| `status` | ENUM | RESEARCH → TEST → ATIVA → PAUSE → MORTA |
| `ticket_front` | DECIMAL | Preco front-end |
| `cpa_target` | DECIMAL | Meta de CPA (Cost Per Acquisition) |
| `roas_target` | DECIMAL | Meta de ROAS (Return On Ad Spend) |
| `aov_target` | DECIMAL | Meta de AOV (Average Order Value) |
| `promessa_principal` | TEXT | Promessa principal |
| `mecanismo_unico` | TEXT | USP (Unique Selling Proposition) |

**Formula de Profitabilidade:**
```
CPA maximo = AOV / 3 (para ROAS minimo de 3x)
Se AOV = R$170 → CPA max = R$56.67
```

#### AVATARES — Perfis Psicologicos (NAO demograficos)

| Atributo | Tipo | Regra de Negocio |
|----------|------|------------------|
| `pain_matrix` | JSON[] | Array de {nivel: 1-10, dor: "string"} rankeado |
| `desire_matrix` | JSON[] | Array de {nivel: 1-10, desejo: "string"} rankeado |
| `objecoes` | JSON[] | Array de {objecao: "string", tipo: "price\|trust\|efficacy\|time"} |
| `gatilhos_emocionais` | JSON[] | Triggers: medo, aspiracao, pertencimento, escassez |
| `linguagem_avatar` | TEXT | Padrao de fala: formal, casual, giria, tecnico |

**Insight do Vault:**
> "Avatar NAO e demografia. E psicologia. Nao 'mulheres 40+', mas sim 'Joana que nao consegue subir escada sem dor no joelho e tem vergonha do proprio corpo'."

#### ARSENAL — Biblioteca de Pesquisa

3 entidades complementares que institucionalizam o conhecimento do pesquisador:

| Entidade | Proposito | Exemplo |
|----------|----------|---------|
| **DORKS** | Queries de busca reutilizaveis | `inurl:checkout.php site:*.com.br` |
| **FOOTPRINTS** | Padroes que identificam tech stacks | `pixel.facebook.com`, `cdn.utmify.com.br` |
| **KEYWORDS** | Banco de palavras-chave | `cha para emagrecer` (comercial, PT-BR) |

Todas tem: `vezes_usado` (contador), `is_favorito`, `eficacia` (rating)

---

## 3. Bounded Contexts (Contextos Delimitados)

### 3.1 Mapa de Contextos

```
┌─────────────────────────────────────────────────────────────────┐
│                    DR OPS DOMAIN                                 │
│                                                                  │
│  ┌───────────────────────────────────┐  ┌────────────────────┐  │
│  │     ESPIONAGEM (SPY)              │  │   OPERACAO PROPRIA │  │
│  │     [Core Domain — 80% valor]     │  │   [Supporting]     │  │
│  │                                   │  │                    │  │
│  │  • Descoberta de ofertas          │  │  • Ofertas proprias│  │
│  │  • Tracking de trafego            │──│  • Avatares        │  │
│  │  • Curadoria de status            │  │  • Criativos       │  │
│  │  • Analise de funil               │  │  • Campanhas (TBD) │  │
│  │  • Biblioteca de ads              │  │                    │  │
│  │  • Import massivo CSV             │  │                    │  │
│  └───────────┬───────────────────────┘  └────────────────────┘  │
│              │                                                    │
│  ┌───────────▼───────────────────────┐  ┌────────────────────┐  │
│  │     ARSENAL (Research Tools)      │  │   DASHBOARD        │  │
│  │     [Supporting]                  │  │   [Generic]        │  │
│  │                                   │  │                    │  │
│  │  • Dorks / Footprints / Keywords  │  │  • KPIs agregados  │  │
│  │  • Biblioteca de pesquisa         │  │  • Spike alerts    │  │
│  │  • Tracking de eficacia           │  │  • Activity feed   │  │
│  └───────────────────────────────────┘  └────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              INFRAESTRUTURA COMPARTILHADA                 │  │
│  │                                                           │  │
│  │  • Auth + Workspace isolation (RLS)                       │  │
│  │  • Storage (Supabase buckets)                             │  │
│  │  • Import pipeline (CSV classifier + parsers)             │  │
│  │  • Saved views + Column presets                           │  │
│  │  • Activity logging                                       │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Linguagem Ubiqua (Ubiquitous Language)

| Termo DR | Significado Tecnico | Contexto |
|----------|-------------------|----------|
| **Radar** | Lista completa de spied_offers com status RADAR | Ponto de entrada da curadoria |
| **Hot** | Oferta com spike de trafego (>30% MoM) | Candidata a clone |
| **Scaling** | Oferta em crescimento consistente | Monitoramento intensivo |
| **Vault** | Soft-delete, fora do radar mas recuperavel | Arquivo reversivel |
| **Footprint** | Pattern HTML/JS que identifica tech stack | Input principal do PublicWWW |
| **Dork** | Query de busca otimizada (Google/PublicWWW) | Arsenal de pesquisa |
| **Spike** | Aumento subito de trafego (>100% em 30 dias) | Alerta de oportunidade |
| **Curadoria** | Processo manual de avaliar e classificar ofertas | Status = opiniao do curador |
| **Clone** | Adaptar oferta concorrente para lancamento proprio | Objetivo final da espionagem |
| **Angulo** | Abordagem psicologica do criativo (dor, curiosidade, resultado, autoridade, medo) | 5 angulos fundamentais |
| **Ticket** | Preco front-end do produto (AOV) | Base para calculo de CPA |
| **Operador** | Pessoa/empresa por tras de uma ou mais ofertas | Network detection |
| **Pipeline** | PublicWWW → Semrush Bulk → SimilarWeb → Curadoria | Fluxo de dados de entrada |

---

## 4. Aggregates e Domain Events

### 4.1 Aggregate Roots

| Aggregate | Root Entity | Child Entities | Invariants |
|-----------|------------|---------------|------------|
| **SpiedOffer** | spied_offers | offer_domains, offer_traffic_data, offer_ad_libraries, offer_funnel_steps, ad_creatives | Status valido no enum; main_domain in offer_domains; workspace isolation |
| **OwnOffer** | ofertas | avatares, criativos | Status valido; slug unico; cpa_target <= aov_target/3 |
| **Arsenal** | (3 roots independentes) | dorks, footprints, keywords | query/footprint/keyword unico por workspace |
| **ImportBatch** | import_batches | (nenhum filho) | arquivo_nome preservado; metricas consistentes |

### 4.2 Domain Events (Atuais e Desejados)

| Evento | Status | Trigger | Consequencia |
|--------|--------|---------|-------------|
| `OfferDiscovered` | IMPLEMENTADO | CSV import cria nova offer | Status = RADAR, toast notification |
| `TrafficDataImported` | IMPLEMENTADO | CSV upsert traffic records | Invalidate RQ cache, recalculate sparklines |
| `StatusChanged` | IMPLEMENTADO | Curador muda status inline | Update record, invalidate cache |
| `BulkStatusChanged` | IMPLEMENTADO | Bulk action no radar | Update N records, invalidate cache |
| `SpikeDetected` | PARCIAL | RPC detect_spikes() | Cria spike_alert, exibe no dashboard (sem notificacao) |
| `OfferCloned` | NAO IMPLEMENTADO | Copiar spied_offer → ofertas | Deveria criar oferta propria com dados pre-preenchidos |
| `CreativeWon` | NAO IMPLEMENTADO | Performance > threshold | Deveria marcar como WINNER, backup para swipe |
| `CreativeKilled` | NAO IMPLEMENTADO | Performance < threshold | Deveria marcar como KILLED, log learnings |
| `WeeklyPipelineRun` | NAO IMPLEMENTADO | Cron semanal | Deveria re-importar trafego de todas as ofertas |
| `OperatorNetworkDetected` | NAO IMPLEMENTADO | Mesmo pixel/analytics em multiplos dominios | Deveria agrupar ofertas por operador |

---

## 5. Workflows do Dominio

### 5.1 Pipeline de Espionagem (Core Workflow)

```
FASE 1: MINERACAO (Semanal)
├─ Operador usa PublicWWW com footprints do Arsenal
├─ Exporta CSV com milhares de dominios
├─ Importa via UniversalImportModal (auto-classifica tipo)
└─ Sistema cria spied_offers com status RADAR

FASE 2: TRIAGEM MASSIVA (Semrush Bulk)
├─ Upload top 100 dominios no Semrush
├─ Exporta CSV com trafego mensal
├─ Importa via sistema (upsert por dominio+mes)
└─ SparkLines + variacao % permitem decisao rapida

FASE 3: CURADORIA (Manual — Status Updates)
├─ Curador revisa radar: ordena por trafego, filtra por vertical
├─ Muda status: RADAR → ANALYZING (promissores)
│                RADAR → VAULT (irrelevantes: Hotmart, porn, etc.)
│                ANALYZING → HOT (spike detectado)
│                ANALYZING → DEAD (sem trafego)
└─ Bulk actions para limpar lixo em massa

FASE 4: ANALISE PROFUNDA (Offer Detail — 7 Tabs)
├─ Tab Dominios: mapear todos os dominios variantes
├─ Tab Bibliotecas: encontrar paginas de ads no Meta/TikTok
├─ Tab Criativos: salvar screenshots e videos dos ads
├─ Tab Funil: mapear etapas (optin → VSL → checkout → upsell)
├─ Tab Trafego: comparar dominios, identificar tendencias
├─ Tab Notas: documentar insights em Markdown
└─ Tab Overview: resumo executivo da oferta

FASE 5: CLONE/ADAPTACAO (Manual → Ofertas Proprias)
├─ Criar oferta propria inspirada na spied_offer
├─ Extrair avatar profundo (pain/desire/objection matrix)
├─ Gerar hooks e copy com base no avatar
├─ Produzir criativos (50-100/mes = volume ideal)
└─ Lancar trafego pago (Meta, Google, TikTok)

FASE 6: MONITORAMENTO CONTINUO
├─ Re-importar trafego mensalmente
├─ Detectar spikes (>100% em 30 dias)
├─ Ajustar status conforme evolucao
└─ Repetir ciclo
```

### 5.2 Lifecycle de Status (Spied Offer)

```
                    ┌──────────┐
                    │  RADAR   │ ← Entrada (CSV import ou manual)
                    └────┬─────┘
                         │ curadoria manual
                    ┌────▼─────┐
               ┌────│ANALYZING │────┐
               │    └────┬─────┘    │
               │         │          │
          ┌────▼───┐ ┌───▼────┐ ┌──▼────┐
          │  HOT   │ │SCALING │ │ DYING │
          │(spike) │ │(growth)│ │(decay)│
          └───┬────┘ └───┬────┘ └──┬────┘
              │          │         │
          ┌───▼────┐     │    ┌───▼────┐
          │ CLONED │     │    │  DEAD  │
          │(lancou)│     │    │(morto) │
          └────────┘     │    └────────┘
                         │
                    ┌────▼────────┐
                    │NEVER_SCALED │
                    │(tentou,     │
                    │ nao deu)    │
                    └─────────────┘

    Qualquer status → VAULT (soft-delete, recuperavel)
```

### 5.3 Lifecycle de Status (Own Offer)

```
    RESEARCH → TEST → ATIVA → PAUSE → MORTA
                        │       │
                        │       └──→ ATIVA (reativacao)
                        │
                        └──→ MORTA (direto se falhar)
```

### 5.4 Lifecycle de Criativo (Do Vault Operacional)

```
    DRAFT → TEST → WINNER ──→ _SWIPE/ (backup permanente)
                   │
                   └──→ KILLED (log learnings, seguir em frente)
```

**Criterios de Decisao (72h de dados):**

| Metrica | WIN | KILL |
|---------|-----|------|
| CTR | > 1.5-3% | < benchmark/2 |
| CPA | <= AOV/3 | > target + 25% |
| ROAS | > 2.5x (min), 3x+ (ideal) | < 2x |

---

## 6. Integracao com Ecossistema Externo

### 6.1 Fontes de Dados (External Data Sources)

```
┌─────────────┐     CSV Export      ┌──────────────────────┐
│  PublicWWW   │ ──────────────────> │                      │
│  (footprint) │                     │   DR OPS WEBAPP      │
├─────────────┤     CSV Export      │   (Supabase DB)      │
│  Semrush     │ ──────────────────> │                      │
│  (organic)   │                     │   UniversalImport    │
├─────────────┤     CSV Export      │   Modal              │
│  SimilarWeb  │ ──────────────────> │   (10 CSV types)     │
│  (total)     │                     │                      │
├─────────────┤     Manual          │                      │
│  Meta Ads    │ ──────────────────> │   Ad Libraries Tab   │
│  Library     │                     │                      │
├─────────────┤     Manual          │                      │
│  TikTok Ads  │ ──────────────────> │   Ad Libraries Tab   │
└─────────────┘                     └──────────────────────┘
```

### 6.2 Ecossistema Fragmentado (5 Camadas)

| Camada | Localizacao | Conteudo | Status |
|--------|------------|----------|--------|
| 1. DR-Operations legacy | ~/DR-Operations (43GB) | Prompts, swipe files, offers legacy | Shadow data |
| 2. DR-OPS hub | ~/DR-OPS/_SYSTEM/ | Estrutura central, templates | Organizacional |
| 3. dr-core webapp | Supabase DB + SPA | Dados estruturados, 12k+ offers | Source of truth |
| 4. Obsidian Vault | iCloud Obsidian | Knowledge base, SOPs, canvases | Documentacao |
| 5. Notion (legacy) | 2 workspaces | Databases antigos | Deprecar |

**Decisao Arquitetural:** Supabase = unica fonte de verdade. Demais sao sombras.

---

## 7. Modelo de Dados Logico (Database Schema)

### 7.1 Tabelas Ativas (27 de 34)

**SPY Module (Core — 6 tabelas):**

| Tabela | Records | FK Principal | Papel |
|--------|---------|-------------|-------|
| spied_offers | 12k+ | workspace_id | Ofertas espionadas |
| offer_domains | ~15k | spied_offer_id | Dominios por oferta |
| offer_traffic_data | 87k+ | spied_offer_id | Trafego mensal por dominio |
| offer_ad_libraries | ~500 | spied_offer_id | Links de bibliotecas de ads |
| offer_funnel_steps | ~200 | spied_offer_id | Etapas do funil |
| ad_creatives | ~1k | spied_offer_id OR oferta_id | Criativos salvos |

**Own Offers Module (6 tabelas):**

| Tabela | FK Principal | Papel |
|--------|-------------|-------|
| ofertas | workspace_id | Ofertas proprias |
| avatares | oferta_id | Perfis psicologicos |
| criativos | oferta_id | Criativos proprios |
| ofertas_brief | oferta_id | Brief inicial |
| research_notes | oferta_id | Notas de pesquisa |
| funnel_steps | oferta_id | Funil proprio |

**Arsenal (3 tabelas):**

| Tabela | Papel |
|--------|-------|
| arsenal_dorks | Queries de busca |
| arsenal_footprints | Padroes de deteccao |
| arsenal_keywords | Palavras-chave |

**Infraestrutura (8 tabelas):**

| Tabela | Papel |
|--------|-------|
| profiles | Perfil do usuario |
| workspaces | Multi-tenant workspace |
| workspace_members | Membros do workspace |
| activity_log | Log de atividades |
| import_batches | Audit trail de imports |
| saved_views | Presets de filtros/colunas |
| spike_alerts | Alertas de spike |
| mv_* (materialized views) | Dashboard + traffic summary + spike detection |

**Legacy — Deprecar (7 tabelas):**

| Tabela | Substituida Por |
|--------|----------------|
| ad_bibliotecas | offer_ad_libraries |
| oferta_dominios | offer_domains |
| funil_paginas | offer_funnel_steps |
| trafego_historico | offer_traffic_data |
| comparacao_batches | (removido) |
| fontes_captura | discovery_source em spied_offers |
| competitors (parcial) | spied_offers |

### 7.2 Constraints e Invariantes

| Constraint | Tabela | Regra |
|-----------|--------|-------|
| UNIQUE(offer_id, domain, period_type, period_date) | offer_traffic_data | Previne duplicacao por source |
| RLS workspace_id | Todas as 27 tabelas | Isolamento multi-tenant |
| FK ON DELETE CASCADE | offer_domains → spied_offers | Cascata na delecao |
| FK ON DELETE SET NULL | offer_funnel_steps → domains | Orfao possivel (BUG) |
| is_main = true (only 1) | offer_domains | Apenas 1 dominio principal por oferta |

---

## 8. Invariantes de Negocio

### Regras Inviolaveis

1. **Trafego e fact, status e opinion** — Dados de trafego sao importados objetivamente; status e julgamento subjetivo do curador
2. **Revenue NUNCA auto-calculado** — Estimativa de receita e responsabilidade humana
3. **SimilarWeb = total, SEMrush = organic** — Nunca misturar fontes no mesmo grafico sem indicar
4. **Import nunca duplica** — Upsert key garante dedup (offer_id + domain + period_date + period_type)
5. **Workspace isolation e absoluta** — RLS em todas as tabelas, nenhum vazamento cross-workspace
6. **VAULT != DELETE** — Soft-delete recuperavel, diferente de exclusao permanente
7. **Period date = 1o do mes** — Todas as datas de periodo armazenadas como YYYY-MM-01
8. **Filename > Headers** — Periodo extraido do nome do arquivo tem prioridade sobre colunas CSV
9. **Arsenal e cumulativo** — Dorks, footprints e keywords nunca se perdem (incrementa vezes_usado)
10. **5 Angulos = Framework Completo** — Todo criativo e classificado em: Dor, Curiosidade, Resultado, Autoridade, Medo

---

## 9. Metricas Chave do Dominio

### KPIs Operacionais (do Vault)

| KPI | Formula | Target |
|-----|---------|--------|
| CTR (Click-Through Rate) | Clicks / Impressions × 100% | 1.5-3% |
| CPA (Cost Per Acquisition) | Total Spend / Conversions | <= AOV / 3 |
| ROAS (Return On Ad Spend) | Revenue / Spend | >= 3x |
| AOV (Average Order Value) | Front-end + (% upsell × preco upsell) | Vertical-dependent |
| Spike Threshold | current_month > prev_month × 1.3 | Detectar em <24h |
| Creative Win Rate | Winners / Total Tested | ~10-20% |
| Time to First Test | Discovery → Ads Live | 3-5 dias |

### Volumes de Dados

| Metrica | Atual | Projecao 6 Meses |
|---------|-------|-----------------|
| spied_offers | 12k+ | 50k+ |
| traffic_records | 87k+ | 500k+ |
| offer_domains | ~15k | 60k+ |
| CSV records/import | 14k+ | 14k+ (constante) |
| Criativos/mes target | ? | 50-100 |

---

*Atlas — investigando a verdade*

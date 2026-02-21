# Story BD-1.3: Fix Sidebar Collapse + Dashboard + Charts
**Epic:** EPIC-BD | **Sprint:** 1 | **Status:** InReview | **Estimate:** 6h | **Priority:** CRITICO

---

## Descricao
3 bugs visuais criticos consolidados:
- BUG-004: Sidebar collapse deixa lacuna direita (CSS flex issue)
- BUG-005: Dashboard mostra zeros (queries incorretas)
- BUG-003: Graficos de trafego nao respeitam filtros de data

## Acceptance Criteria

### AC-1: Sidebar (BUG-004)
- [x] Given: sidebar aberta ocupando espaco
- [x] When: usuario clica para esconder sidebar
- [x] Then: conteudo principal expande para 100% da largura
- [x] And: sem lacuna/espaco vazio a direita

### AC-2: Dashboard (BUG-005)
- [x] Given: 12k+ ofertas espionadas no banco
- [x] When: usuario acessa Dashboard
- [x] Then: stats mostram numeros REAIS (ofertas, trafego, etc)
- [x] And: dados vem de spied_offers (nao de ofertas que esta vazio)

### AC-3: Charts (BUG-003)
- [x] Given: grafico de trafego com dados de multiplos meses
- [x] When: usuario seleciona periodo personalizado (ex: Jun-Oct 2025)
- [x] Then: grafico mostra APENAS dados desse periodo
- [x] And: eixo X ajusta para o range selecionado

## Arquivos a Modificar
- [x] src/components/layout/DashboardLayout.tsx (sidebar CSS)
- [ ] src/components/layout/AppSidebar.tsx (sem alteracao necessaria)
- [x] src/pages/Dashboard.tsx (queries)
- [ ] src/components/spy/TrafficChart.tsx (sem alteracao - chart se ajusta ao data recebido)
- [x] src/components/spy/TrafficIntelligenceView.tsx (filtro de data normalizado)
- [ ] src/components/spy/tabs/SpyTrafficTab.tsx (ja funcionava corretamente)

## Tasks
- [x] 1. Fix sidebar gap - remover div wrapper redundante no DashboardLayout
- [x] 2. Fix dashboard zeros - substituir stats hardcoded por queries Supabase reais
- [x] 3. Fix chart date filters - normalizar comparacao de datas (YYYY-MM-DD -> YYYY-MM)
- [x] 4. Verificar build + typecheck

## Dev Agent Record

### Debug Log
- BUG-004: DashboardLayout tinha div.min-h-screen.flex.w-full redundante dentro de SidebarProvider que ja cria div.flex.w-full. Removido wrapper, adicionado min-w-0 no content para prevenir overflow
- BUG-005: Dashboard.tsx tinha stats totalmente hardcoded (value: "0"). Criado useDashboardStats() hook com 4 queries paralelas via Promise.all: spied_offers, avatars, ad_creatives, offer_traffic_data (todas com count exact, head: true para performance). Adicionado formatCount helper e loading state
- BUG-003: TrafficIntelligenceView comparava period_date "YYYY-MM-DD" diretamente com rangeFrom/rangeTo "YYYY-MM", usando hack rangeTo + "-31". Normalizado para comparar date.slice(0,7) com rangeFrom/rangeTo diretamente
- SpyTrafficTab ja usava period_date.slice(0,7) - nao precisou de fix
- TrafficChart nao faz filtragem propria - recebe dados ja filtrados. Sem alteracao necessaria
- Build e typecheck passam sem erros

### Files Modified
- src/components/layout/DashboardLayout.tsx
- src/pages/Dashboard.tsx
- src/components/spy/TrafficIntelligenceView.tsx

### Agent Model Used
claude-opus-4-6

## Change Log
- 2026-02-20: @dev - Sidebar gap fixado (layout simplificado), Dashboard com dados reais (4 queries), Chart date filter normalizado

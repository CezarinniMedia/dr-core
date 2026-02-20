# Story BD-1.3: Fix Sidebar Collapse + Dashboard + Charts
**Epic:** EPIC-BD | **Sprint:** 1 | **Status:** Ready | **Estimate:** 6h | **Priority:** CRITICO

---

## Descricao
3 bugs visuais criticos consolidados:
- BUG-004: Sidebar collapse deixa lacuna direita (CSS flex issue)
- BUG-005: Dashboard mostra zeros (queries incorretas)
- BUG-003: Graficos de trafego nao respeitam filtros de data

## Acceptance Criteria

### AC-1: Sidebar (BUG-004)
- [ ] Given: sidebar aberta ocupando espaco
- [ ] When: usuario clica para esconder sidebar
- [ ] Then: conteudo principal expande para 100% da largura
- [ ] And: sem lacuna/espaco vazio a direita

### AC-2: Dashboard (BUG-005)
- [ ] Given: 12k+ ofertas espionadas no banco
- [ ] When: usuario acessa Dashboard
- [ ] Then: stats mostram numeros REAIS (ofertas, trafego, etc)
- [ ] And: dados vem de spied_offers (nao de ofertas que esta vazio)

### AC-3: Charts (BUG-003)
- [ ] Given: grafico de trafego com dados de multiplos meses
- [ ] When: usuario seleciona periodo personalizado (ex: Jun-Oct 2025)
- [ ] Then: grafico mostra APENAS dados desse periodo
- [ ] And: eixo X ajusta para o range selecionado

## Arquivos a Modificar
- [ ] src/components/layout/DashboardLayout.tsx (sidebar CSS)
- [ ] src/components/layout/AppSidebar.tsx
- [ ] src/pages/Dashboard.tsx (queries)
- [ ] src/components/spy/TrafficChart.tsx (filtro de data)
- [ ] src/components/spy/tabs/SpyTrafficTab.tsx

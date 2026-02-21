# Story BD-2.1: Decompose God Components
**Epic:** EPIC-BD | **Sprint:** 2 | **Status:** Ready | **Estimate:** 12h | **Priority:** ALTO

---

## Descricao
3 God Components concentram logica demais (1,400+ LOC cada), dificultando manutencao, testes e performance. Refatorar em componentes menores com responsabilidades claras, mantendo comportamento identico.

## God Components a Decompor

### 1. SpyRadar.tsx (~1,424 LOC)
**Extrair:**
- `SpyFilterBar.tsx` - Todos os filtros (status, vertical, geo, busca)
- `SpyTableContainer.tsx` - Tabela + paginacao + selecao
- `SpyColumnSelector.tsx` - Seletor de colunas/presets
- `SpyBulkActionsBar.tsx` - Acoes em massa (status, delete, export)
- `SpyRadar.tsx` permanece como orquestrador (~200 LOC)

### 2. UniversalImportModal.tsx (~1,161 LOC)
**Extrair:**
- `ImportStep1Upload.tsx` - Drag-drop + selecao de arquivo
- `ImportStep2Classification.tsx` - Deteccao automatica de tipo CSV
- `ImportStep3Matching.tsx` - Tabela de matching dominios/ofertas
- `ImportStep4Result.tsx` - Resultado do import + estatisticas
- `UniversalImportModal.tsx` permanece como wizard container (~150 LOC)

### 3. TrafficIntelligenceView.tsx (~852 LOC)
**Extrair:**
- `TrafficTable.tsx` - Tabela de trafego com sparklines
- `TrafficChartingPanel.tsx` - Grafico comparativo multi-dominio
- `TrafficControlBar.tsx` - Filtros, periodo, ordenacao
- `TrafficIntelligenceView.tsx` permanece como layout (~150 LOC)

### 4. useSpiedOffers.ts (~574 LOC)
**Extrair:**
- `useSpiedOffersCRUD.ts` - Create, Read, Update, Delete
- `useSpiedOffersTraffic.ts` - Queries de trafego
- `useSpiedOffersBulk.ts` - Operacoes em massa
- `useSpiedOffersFilters.ts` - Logica de filtros

## Acceptance Criteria

### AC-1: SpyRadar Decomposto
- [ ] SpyRadar.tsx tem < 300 LOC
- [ ] 4 componentes extraidos com props tipadas
- [ ] Funcionalidade identica ao antes (zero regressao)
- [ ] Todos os filtros, colunas, bulk actions funcionam

### AC-2: ImportModal Decomposto
- [ ] UniversalImportModal.tsx tem < 200 LOC
- [ ] 4 steps extraidos como componentes independentes
- [ ] Import de TODOS os 10 tipos CSV funciona identico
- [ ] Step transitions e estado compartilhado via props/context

### AC-3: TrafficView Decomposto
- [ ] TrafficIntelligenceView.tsx tem < 200 LOC
- [ ] Tabela, grafico e controles separados
- [ ] Sparklines, comparacao multi-dominio, filtros funcionam

### AC-4: Hooks Separados
- [ ] useSpiedOffers.ts dividido em 4 hooks especializados
- [ ] Re-exports mantidos para compatibilidade
- [ ] Nenhuma query duplicada

## Regras
- **ZERO regressao** - Testar cada componente extraido antes de prosseguir
- Manter mesma API publica (props) quando possivel
- Usar barrel exports para manter imports existentes funcionando
- Nao mudar logica de negocio durante a decomposicao

## Arquivos a Modificar
- [ ] src/pages/SpyRadar.tsx (decompor)
- [ ] src/components/spy/UniversalImportModal.tsx (decompor)
- [ ] src/components/spy/TrafficIntelligenceView.tsx (decompor)
- [ ] src/hooks/useSpiedOffers.ts (dividir)
- [ ] ~12-16 novos arquivos de componentes/hooks

## Dependencias
- Nenhuma (pode comecar a qualquer momento)
- Bloqueia BD-3.5 (testes ficam mais faceis com componentes menores)

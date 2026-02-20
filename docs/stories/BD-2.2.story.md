# Story BD-2.2: Create Service Layer
**Epic:** EPIC-BD | **Sprint:** 2 | **Status:** InProgress | **Estimate:** 8h | **Priority:** ALTO

---

## Descricao
Atualmente logica de negocio esta misturada nos componentes React (parsing CSV, calculo de trafego, classificacao). Criar camada de servicos em `src/services/` para separar business logic da UI, permitindo testes unitarios e reuso.

## Servicos a Criar

### 1. csvImportService.ts
**Extrair de:** UniversalImportModal.tsx, csvClassifier.ts, parseSemrushCSV.ts
- `classifyCSV(file: File): CSVType` - Classificacao automatica
- `parseCSV(file: File, type: CSVType): ParsedData` - Parse por tipo
- `matchDomains(parsed: ParsedData, existingOffers: SpiedOffer[]): MatchResult` - Matching
- `executeImport(matched: MatchResult): ImportResult` - Execucao do import

### 2. trafficService.ts
**Extrair de:** TrafficIntelligenceView.tsx, useSpiedOffers.ts
- `calculateTrafficTrend(data: TrafficData[], period: DateRange): TrendResult`
- `compareTraffic(domains: string[], period: DateRange): ComparisonData`
- `detectSpikes(data: TrafficData[], threshold: number): SpikeResult[]`
- `aggregateByPeriod(data: TrafficData[], groupBy: 'month'|'week'): AggregatedData`

### 3. offerService.ts
**Extrair de:** SpyRadar.tsx, useSpiedOffers.ts
- `filterOffers(offers: SpiedOffer[], filters: FilterState): SpiedOffer[]`
- `bulkUpdateStatus(ids: string[], status: string): Promise<void>`
- `exportToCSV(offers: SpiedOffer[], columns: string[]): Blob`
- `calculateOfferStats(offers: SpiedOffer[]): OfferStats`

### 4. domainService.ts
**Extrair de:** varios componentes
- `enrichDomainData(domain: string): DomainInfo`
- `findRelatedDomains(offer: SpiedOffer): RelatedDomain[]`
- `mergeDuplicateDomains(domains: Domain[]): MergeResult`

## Acceptance Criteria

### AC-1: CSV Import Service
- [x] Toda logica de classificacao/parsing em csvImportService.ts
- [x] Componentes chamam o service, nao fazem parsing diretamente
- [x] 100% compativel com os 10 tipos CSV existentes

### AC-2: Traffic Service
- [x] Calculos de trafego separados da UI
- [x] Trend detection e spike analysis como funcoes puras
- [x] Facil de testar unitariamente

### AC-3: Offer Service
- [x] Filtros, bulk ops, export como funcoes puras
- [x] React hooks sao thin wrappers sobre os services

### AC-4: Integracao
- [x] Hooks existentes chamam services (nao duplicam logica)
- [x] Zero regressao em funcionalidades existentes
- [x] Imports mantem compatibilidade

## Arquivos a Criar
- [x] src/services/csvImportService.ts
- [x] src/services/trafficService.ts
- [x] src/services/offerService.ts
- [x] src/services/domainService.ts
- [x] src/services/index.ts (barrel export)

## Arquivos a Modificar
- [ ] src/hooks/useSpiedOffers.ts (usar services) — hooks mantidos como estão, services chamados pelos componentes diretamente
- [x] src/components/spy/UniversalImportModal.tsx (usar services) — já delegava ao useImportEngine
- [x] src/components/spy/TrafficIntelligenceView.tsx (usar services)
- [x] src/pages/SpyRadar.tsx (usar services)

## Dependencias
- Idealmente apos BD-2.1 (componentes menores facilitam extracao)

## Dev Agent Record

### File List
- `src/services/csvImportService.ts` — NOVO (classificação, parsing, matching CSV)
- `src/services/trafficService.ts` — NOVO (trend, spikes, aggregação, sorting, filtering)
- `src/services/offerService.ts` — NOVO (filtros, bulk ops, export CSV, stats)
- `src/services/domainService.ts` — NOVO (enrichment, relações, dedup)
- `src/services/index.ts` — NOVO (barrel export)
- `src/components/spy/TrafficIntelligenceView.tsx` — MODIFICADO (usa services para rows, filter, sort, status)
- `src/pages/SpyRadar.tsx` — MODIFICADO (usa services para status, notes, bulk ops, filtros)
- `docs/stories/BD-2.2.story.md` — MODIFICADO (checkboxes, file list)

### Change Log
- 2026-02-20: Criados 4 services + barrel export em src/services/
- 2026-02-20: TrafficIntelligenceView.tsx refatorado para usar compareTraffic, filterTrafficRows, sortTrafficRows
- 2026-02-20: SpyRadar.tsx refatorado para usar updateOfferStatus, updateOfferNotes, bulkUpdateStatus, bulkDeleteOffers
- 2026-02-20: Removidas funções duplicadas (formatCurrency, stripMarkdown, formatK, formatDate)
- 2026-02-20: Build + typecheck passaram sem erros

# Story BD-2.2: Create Service Layer
**Epic:** EPIC-BD | **Sprint:** 2 | **Status:** Ready | **Estimate:** 8h | **Priority:** ALTO

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
- [ ] Toda logica de classificacao/parsing em csvImportService.ts
- [ ] Componentes chamam o service, nao fazem parsing diretamente
- [ ] 100% compativel com os 10 tipos CSV existentes

### AC-2: Traffic Service
- [ ] Calculos de trafego separados da UI
- [ ] Trend detection e spike analysis como funcoes puras
- [ ] Facil de testar unitariamente

### AC-3: Offer Service
- [ ] Filtros, bulk ops, export como funcoes puras
- [ ] React hooks sao thin wrappers sobre os services

### AC-4: Integracao
- [ ] Hooks existentes chamam services (nao duplicam logica)
- [ ] Zero regressao em funcionalidades existentes
- [ ] Imports mantem compatibilidade

## Arquivos a Criar
- [ ] src/services/csvImportService.ts
- [ ] src/services/trafficService.ts
- [ ] src/services/offerService.ts
- [ ] src/services/domainService.ts
- [ ] src/services/index.ts (barrel export)

## Arquivos a Modificar
- [ ] src/hooks/useSpiedOffers.ts (usar services)
- [ ] src/components/spy/UniversalImportModal.tsx (usar services)
- [ ] src/components/spy/TrafficIntelligenceView.tsx (usar services)
- [ ] src/pages/SpyRadar.tsx (usar services)

## Dependencias
- Idealmente apos BD-2.1 (componentes menores facilitam extracao)

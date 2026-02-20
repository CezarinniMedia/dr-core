# Story BD-3.5: Write Critical Integration Tests
**Epic:** EPIC-BD | **Sprint:** 3 | **Status:** Ready | **Estimate:** 5h | **Priority:** ALTO

---

## Descricao
Cobertura de testes e 0%. Criar testes para os caminhos mais criticos do sistema: importacao CSV, calculo de trafego, e operacoes CRUD. Priorizar testes que previnem regressoes nos fluxos mais usados.

## Acceptance Criteria

### AC-1: Testes de CSV Import
- [ ] Teste: classifyCSV identifica corretamente os 10 tipos CSV
- [ ] Teste: parseSemrushCSV retorna dados corretos para cada formato
- [ ] Teste: CSV com encoding diferente (UTF-8, Latin-1) e tratado
- [ ] Teste: CSV com separador ; (Semrush BR) funciona
- [ ] Teste: CSV vazio retorna erro adequado

### AC-2: Testes de Trafego
- [ ] Teste: aggregacao mensal calcula totais corretos
- [ ] Teste: filtro de periodo retorna apenas dados no range
- [ ] Teste: deteccao de spike identifica variacoes > threshold
- [ ] Teste: dados SimilarWeb (monthly_sw) vs SEMrush (monthly) sao tratados separadamente

### AC-3: Testes de Filtros
- [ ] Teste: filtro por status retorna apenas ofertas com status X
- [ ] Teste: filtro combinado (status + vertical + geo) funciona
- [ ] Teste: busca textual encontra por nome, dominio, discovery_query
- [ ] Teste: paginacao retorna paginas corretas

### AC-4: Testes de Bulk Operations
- [ ] Teste: bulk status update atualiza N ofertas corretamente
- [ ] Teste: bulk delete remove ofertas selecionadas
- [ ] Teste: selecao cross-page funciona

### AC-5: Infraestrutura de Teste
- [ ] Vitest configurado e rodando
- [ ] Test utils com mocks do Supabase
- [ ] CI-ready: `npm test` funciona sem banco real
- [ ] Cobertura > 30% nos caminhos criticos

## Arquivos de Teste a Criar
- [ ] src/__tests__/lib/csvClassifier.test.ts
- [ ] src/__tests__/lib/parseSemrushCSV.test.ts
- [ ] src/__tests__/services/trafficService.test.ts (se BD-2.2 concluido)
- [ ] src/__tests__/services/offerService.test.ts (se BD-2.2 concluido)
- [ ] src/__tests__/hooks/useSpiedOffers.test.ts
- [ ] src/__tests__/setup.ts (mocks, utils)

## Arquivos a Modificar
- [ ] vitest.config.ts (configurar se necessario)
- [ ] package.json (scripts de teste)

## Prioridade de Testes
1. CSV Classification (CRITICO - nao pode regressar com 10 tipos)
2. CSV Parsing (CRITICO - dados corretos ou corrupcao)
3. Traffic aggregation (ALTO - dashboard depende)
4. Filters (MEDIO - UX impactada)
5. Bulk ops (MEDIO - operacoes destrutivas)

## Dependencias
- Idealmente apos BD-2.1 e BD-2.2 (componentes menores e service layer facilitam testes)
- Pode comecar sem eles, testando diretamente os modulos lib/

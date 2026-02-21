# Story BD-1.2: Fix Table Sizing and Dimensioning
**Epic:** EPIC-BD | **Sprint:** 1 | **Status:** Done | **Estimate:** 4h | **Priority:** CRITICO

---

## Descricao
BUG-010: Dimensionamento inconsistente em tabelas, badges, botoes em todo o sistema. Celulas com alturas variaveis, badges quebrando em multiplas linhas, colunas sem largura fixa. Resultado: visual amador e nao profissional.

## Acceptance Criteria
- [x] Todas as celulas de tabela com altura consistente (1 linha, truncado)
- [x] Badges de status NUNCA quebram em multiplas linhas
- [x] Colunas com largura fixa ou min-width definido
- [x] "Semrush Bulk Analysis" em 1 linha, nao 3
- [x] Import modal sem scroll horizontal desnecessario
- [x] line-clamp aplicado em textos longos com tooltip ao hover

## Arquivos a Modificar
- [x] src/pages/SpyRadar.tsx (tabela principal)
- [x] src/components/spy/TrafficIntelligenceView.tsx (tabela trafego)
- [x] src/components/spy/UniversalImportModal.tsx (tabela matching)
- [ ] CSS global ou componentes Table do shadcn/ui

## Tasks
- [x] 1. Analisar dimensionamento atual das 3 tabelas
- [x] 2. Adicionar whitespace-nowrap em todos os badges de status
- [x] 3. Adicionar truncate em celulas de texto (nome, subnicho, produto, operador, checkout, fonte)
- [x] 4. Fixar larguras de colunas na tabela de matching do import modal
- [x] 5. Verificar build + typecheck

## Dev Agent Record

### Debug Log
- SpyRadar: adicionado whitespace-nowrap nos badges de status e vertical, truncate em nome, subnicho, product_name, operator, checkout, fonte
- TrafficIntelligenceView: adicionado whitespace-nowrap nos badges de status, truncate em nome/dominio da oferta
- UniversalImportModal: larguras fixas nas 5 colunas da tabela de matching, whitespace-nowrap em badges de tipo CSV e acao, truncate em dominio e nome de oferta
- Typecheck e build passam sem erros
- CSS global nao precisou de alteracao (fixes sao inline via Tailwind classes)

### Files Modified
- src/pages/SpyRadar.tsx
- src/components/spy/TrafficIntelligenceView.tsx
- src/components/spy/UniversalImportModal.tsx

### Agent Model Used
claude-opus-4-6

## Change Log
- 2026-02-20: @dev - Todos os fixes de dimensionamento aplicados. Badges nao quebram, celulas truncadas, colunas com largura fixa.

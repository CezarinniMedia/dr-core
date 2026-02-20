# Story BD-1.2: Fix Table Sizing and Dimensioning
**Epic:** EPIC-BD | **Sprint:** 1 | **Status:** Ready | **Estimate:** 4h | **Priority:** CRITICO

---

## Descricao
BUG-010: Dimensionamento inconsistente em tabelas, badges, botoes em todo o sistema. Celulas com alturas variaveis, badges quebrando em multiplas linhas, colunas sem largura fixa. Resultado: visual amador e nao profissional.

## Acceptance Criteria
- [ ] Todas as celulas de tabela com altura consistente (1 linha, truncado)
- [ ] Badges de status NUNCA quebram em multiplas linhas
- [ ] Colunas com largura fixa ou min-width definido
- [ ] "Semrush Bulk Analysis" em 1 linha, nao 3
- [ ] Import modal sem scroll horizontal desnecessario
- [ ] line-clamp aplicado em textos longos com tooltip ao hover

## Arquivos a Modificar
- [ ] src/pages/SpyRadar.tsx (tabela principal)
- [ ] src/components/spy/TrafficIntelligenceView.tsx (tabela trafego)
- [ ] src/components/spy/UniversalImportModal.tsx (tabela matching)
- [ ] CSS global ou componentes Table do shadcn/ui

# Story BD-1.4: Fix Popups, Tooltips, Sparkline, Graph Badges
**Epic:** EPIC-BD | **Sprint:** 1 | **Status:** Ready | **Estimate:** 8h | **Priority:** CRITICO

---

## Descricao
Conjunto de fixes de UX que completam o "look professional":
- BUG-009: Popups/modais com informacoes cortadas
- BUG-011: Tooltips ausentes em todo sistema
- BUG-012: Sparkline nao segue periodo selecionado
- Badges de cor no grafico comparativo nao correspondem a cor da linha

## Acceptance Criteria

### AC-1: Popups Responsivos (BUG-009)
- [ ] Import modal: todas as colunas visiveis sem scroll horizontal
- [ ] Matching table: "Tipo CSV" e "Acao" em 1 linha cada
- [ ] Modais responsivos com max-w adequado

### AC-2: Tooltips (BUG-011)
- [ ] Todos os icone-only buttons tem tooltip descritivo
- [ ] Status badges tem tooltip com descricao do status
- [ ] Texto truncado mostra conteudo completo ao hover
- [ ] Delay de tooltip < 300ms

### AC-3: Sparkline (BUG-012)
- [ ] Given: periodo filtrado no MonthRangePicker
- [ ] When: visualiza sparklines na inteligencia de trafego
- [ ] Then: sparklines mostram APENAS o periodo filtrado

### AC-4: Graph Badges
- [ ] Given: multiplos dominios no grafico comparativo
- [ ] When: visualiza legenda/badges no topo
- [ ] Then: cada badge tem retangulo arredondado com a COR da linha + nome do dominio
- [ ] And: clicar no badge remove/adiciona o dominio do grafico

## Arquivos a Modificar
- [ ] src/components/spy/UniversalImportModal.tsx
- [ ] src/pages/SpyRadar.tsx (tooltips, sparkline)
- [ ] src/components/spy/TrafficIntelligenceView.tsx (sparkline, badges)
- [ ] src/components/spy/TrafficChart.tsx (badges de cor)
- [ ] Multiplos componentes para tooltips

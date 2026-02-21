# Story BD-1.4: Fix Popups, Tooltips, Sparkline, Graph Badges
**Epic:** EPIC-BD | **Sprint:** 1 | **Status:** InReview | **Estimate:** 8h | **Priority:** CRITICO

---

## Descricao
Conjunto de fixes de UX que completam o "look professional":
- BUG-009: Popups/modais com informacoes cortadas
- BUG-011: Tooltips ausentes em todo sistema
- BUG-012: Sparkline nao segue periodo selecionado
- Badges de cor no grafico comparativo nao correspondem a cor da linha

## Acceptance Criteria

### AC-1: Popups Responsivos (BUG-009)
- [x] Import modal: todas as colunas visiveis sem scroll horizontal
- [x] Matching table: "Tipo CSV" e "Acao" em 1 linha cada
- [x] Modais responsivos com max-w adequado

### AC-2: Tooltips (BUG-011)
- [x] Todos os icone-only buttons tem tooltip descritivo
- [x] Status badges tem tooltip com descricao do status
- [x] Texto truncado mostra conteudo completo ao hover
- [x] Delay de tooltip < 300ms

### AC-3: Sparkline (BUG-012)
- [x] Given: periodo filtrado no MonthRangePicker
- [x] When: visualiza sparklines na inteligencia de trafego
- [x] Then: sparklines mostram APENAS o periodo filtrado

### AC-4: Graph Badges
- [x] Given: multiplos dominios no grafico comparativo
- [x] When: visualiza legenda/badges no topo
- [x] Then: cada badge tem retangulo arredondado com a COR da linha + nome do dominio
- [x] And: clicar no badge remove/adiciona o dominio do grafico

## Arquivos a Modificar
- [x] src/components/spy/UniversalImportModal.tsx (column widths ja fixadas em BD-1.2)
- [x] src/pages/SpyRadar.tsx (tooltips com tip descritivo em STATUS_BADGE, TooltipProvider delay 200ms)
- [x] src/components/spy/TrafficIntelligenceView.tsx (sparkline sem slice, badges com cores, tooltips)
- [ ] src/components/spy/TrafficChart.tsx (sem alteracao - chart ja usa cores internamente)

## Tasks
- [x] 1. Sparkline: remover cap de 6 pontos (slice(-6)) para usar todos os dados filtrados
- [x] 2. Chart badges: adicionar CHART_LINE_COLORS com quadrado colorido sincronizado com linha
- [x] 3. Status tooltips SpyRadar: adicionar tip descritivo a cada STATUS_BADGE + Tooltip wrapper
- [x] 4. Status tooltips TrafficIntelligenceView: mesmo padrao de tip + Tooltip wrapper
- [x] 5. Icon button tooltips: converter title para Tooltip nos botoes BarChart3 e Eye
- [x] 6. TooltipProvider delayDuration={200} em SpyRadar e TrafficIntelligenceView
- [x] 7. Verificar build + typecheck

## Dev Agent Record

### Debug Log
- AC-1 (Popups): Ja resolvido em BD-1.2 com column widths fixas e whitespace-nowrap no UniversalImportModal
- AC-3 (Sparkline): TrafficIntelligenceView usava `vals.slice(-6)` para limitar sparkline a 6 pontos. Removido slice para usar todos os dados do periodo filtrado
- AC-4 (Chart badges): Adicionado CHART_LINE_COLORS array sincronizado com TrafficChart. Cada badge agora tem <span> colorido (w-2.5 h-2.5 rounded-sm) + preferencia por main_domain no label
- AC-2 (Tooltips SpyRadar): Adicionado campo `tip` com descricao PT-BR a cada STATUS_BADGE. Envolvido DropdownMenu com Tooltip/TooltipTrigger/TooltipContent. Texto truncado ja tem tooltip via title/Tooltip em celulas
- AC-2 (Tooltips TrafficIntelligenceView): Mesmo padrao - tip no STATUS_BADGE, Tooltip wrapper no status badge, convertido BarChart3 e Eye de title para Tooltip component
- TooltipProvider com delayDuration={200} em ambos SpyRadar e TrafficIntelligenceView
- TrafficChart nao precisou de alteracao - cores vem do array interno
- Build e typecheck passam sem erros

### Files Modified
- src/pages/SpyRadar.tsx
- src/components/spy/TrafficIntelligenceView.tsx

### Agent Model Used
claude-opus-4-6

## Change Log
- 2026-02-20: @dev - Sparkline sem cap, chart badges com cores, tooltips descritivos em status badges e icon buttons, delay 200ms

# Story BD-3.1: Fix Remaining Bugs
**Epic:** EPIC-BD | **Sprint:** 3 | **Status:** Done | **Estimate:** 4h | **Priority:** ALTO

---

## Descricao
Resolver bugs restantes que nao foram cobertos nos Sprints 0-1, incluindo bugs encontrados durante o Brownfield Discovery (NEW-01 a NEW-07) e bugs existentes nos modulos secundarios.

## Bugs a Resolver

### De docs/bugs.md
- **BUG-006:** Criativos kanban - drag-and-drop inconsistente entre colunas
- **BUG-007:** Ofertas proprias - filtros nao persistem entre sessoes

### Do Brownfield Discovery (frontend-spec.md)
- **NEW-01:** Layout shift ao toggle de colunas (sem largura fixa nas colunas)
- **NEW-02:** Import modal Step 3 overflow com 10k+ dominios (sem virtualizacao no matching)
- **NEW-03:** Notes popover abre off-screen na borda direita da tela
- **NEW-04:** Screenshot lightbox nao responsivo em tablets (iPad)
- **NEW-05:** Shift+click cross-page selection imprevisivel (selecao bulk entre paginas)
- **NEW-06:** Column search case-sensitive (nao ignora acentos/diacritics)
- **NEW-07:** Tooltip delay muito longo em texto truncado (> 500ms)

## Acceptance Criteria

### AC-1: BUG-006 - Kanban Drag-and-Drop
- [x] Given: usuario arrasta criativo entre colunas do kanban
- [x] When: solta na coluna destino
- [x] Then: criativo aparece na posicao correta
- [x] And: estado persiste apos refresh

### AC-2: BUG-007 - Filtros Persistentes
- [x] Given: usuario aplica filtros em Ofertas
- [x] When: navega para outra pagina e volta
- [x] Then: filtros estao mantidos (via URL params ou localStorage)

### AC-3: NEW-01 - Layout Shift
- [x] Given: usuario faz toggle de colunas no SpyRadar
- [x] When: coluna aparece/desaparece
- [x] Then: nenhum layout shift visivel (larguras fixas)

### AC-4: NEW-02 - Import Overflow
- [x] Given: import com 10k+ dominios no Step 3
- [x] When: matching table renderiza
- [x] Then: sem overflow horizontal, preview limitado a 500 rows com notice

### AC-5: NEW-03 - Notes Popover Position
- [x] Given: oferta na borda direita da tabela
- [x] When: usuario abre notes popover
- [x] Then: popover ajusta posicao para nao sair da tela

### AC-6: Bugs Menores (NEW-04 a NEW-07)
- [x] Screenshot lightbox responsivo em tablets
- [x] Shift+click selection funciona cross-page corretamente
- [x] Column search ignora case e diacriticos
- [x] Tooltip delay < 300ms em texto truncado

## Arquivos a Modificar
- [x] src/components/criativos/KanbanBoard.tsx (BUG-006)
- [x] src/pages/Ofertas.tsx (BUG-007)
- [x] src/pages/SpyRadar.tsx (NEW-01, NEW-03, NEW-04, NEW-05, NEW-06, NEW-07)
- [x] src/components/spy/UniversalImportModal.tsx (NEW-02)
- [x] src/App.tsx (NEW-07 global tooltip delay)

## Dependencias
- BD-1.2 e BD-1.4 concluidos (fixes de sizing e tooltips ja aplicados)

---

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-6

### Completion Notes
- BUG-006: KanbanBoard agora tem visual feedback no drop zone (highlight azul) + skipsa mutations desnecessarias quando status nao muda
- BUG-007: statusFilter persistido via localStorage key "ofertas-status-filter"
- NEW-01: `table-layout: fixed; min-width: 800px` previne layout shift
- NEW-02: Preview limitado a 500 rows com notice — importacao completa nao afetada
- NEW-03: PopoverContent com `side="left" avoidCollisions collisionPadding={16}`
- NEW-04: Lightbox usa `w-[90vw] max-w-5xl h-[85svh]` + botoes touch-friendly (h-9 em mobile)
- NEW-05: `lastClickedIndex` agora armazena indice absoluto, corrigindo range selection cross-page
- NEW-06: `normalizeStr()` remove diacriticos para busca de colunas accent-insensitive
- NEW-07: `TooltipProvider delayDuration={200}` aplicado globalmente em App.tsx

### File List
- src/components/criativos/KanbanBoard.tsx (modified)
- src/pages/Ofertas.tsx (modified)
- src/pages/SpyRadar.tsx (modified)
- src/components/spy/UniversalImportModal.tsx (modified)
- src/App.tsx (modified)

### Change Log
- 2026-02-20: @dev implementou todos os 9 bugs/fixes da BD-3.1 — commit 9bb258f
- 2026-02-20: @qa revisou — PASS with CONCERNS (ver QA Results)

---

## QA Results

### Verdict: PASS with CONCERNS
**Reviewer:** Quinn (@qa) | **Date:** 2026-02-20

### Checks
- TypeScript: PASS (0 erros)
- Build: PASS (12.6s)
- AC Coverage: 9/9 PASS
- Segurança: PASS
- Regressoes: PASS

### Issues

**MEDIUM:**
- M-1: `handleDragLeave` em KanbanBoard.tsx — cast `e.relatedTarget as Node` deveria ser `as Node | null`
- M-2: `useNavigate` importado mas nao usado em KanbanBoard.tsx (dead code pre-existente)
- M-3: `normalizeStr` em SpyRadar.tsx recriado a cada render — mover para fora do componente

**LOW:**
- L-1: `avoidCollisions` no PopoverContent redundante (ja e default no Radix UI)
- L-2: Unidade `svh` no lightbox — suporte iOS 15.4+ apenas (impacto minimo)

### Decision
PASS — Story aprovada para merge. Issues M-1 a M-3 nao bloqueantes, recomendados para cleanup futuro.

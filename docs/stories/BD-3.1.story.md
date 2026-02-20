# Story BD-3.1: Fix Remaining Bugs
**Epic:** EPIC-BD | **Sprint:** 3 | **Status:** Ready | **Estimate:** 4h | **Priority:** ALTO

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
- [ ] Given: usuario arrasta criativo entre colunas do kanban
- [ ] When: solta na coluna destino
- [ ] Then: criativo aparece na posicao correta
- [ ] And: estado persiste apos refresh

### AC-2: BUG-007 - Filtros Persistentes
- [ ] Given: usuario aplica filtros em Ofertas
- [ ] When: navega para outra pagina e volta
- [ ] Then: filtros estao mantidos (via URL params ou localStorage)

### AC-3: NEW-01 - Layout Shift
- [ ] Given: usuario faz toggle de colunas no SpyRadar
- [ ] When: coluna aparece/desaparece
- [ ] Then: nenhum layout shift visivel (larguras fixas)

### AC-4: NEW-02 - Import Overflow
- [ ] Given: import com 10k+ dominios no Step 3
- [ ] When: matching table renderiza
- [ ] Then: sem overflow horizontal, virtualizacao aplicada

### AC-5: NEW-03 - Notes Popover Position
- [ ] Given: oferta na borda direita da tabela
- [ ] When: usuario abre notes popover
- [ ] Then: popover ajusta posicao para nao sair da tela

### AC-6: Bugs Menores (NEW-04 a NEW-07)
- [ ] Screenshot lightbox responsivo em tablets
- [ ] Shift+click selection funciona cross-page corretamente
- [ ] Column search ignora case e diacriticos
- [ ] Tooltip delay < 300ms em texto truncado

## Arquivos a Modificar
- [ ] src/pages/CriativosPage.tsx (BUG-006)
- [ ] src/pages/Ofertas.tsx (BUG-007)
- [ ] src/pages/SpyRadar.tsx (NEW-01, NEW-05, NEW-06)
- [ ] src/components/spy/UniversalImportModal.tsx (NEW-02)
- [ ] src/components/spy/ componentes com popovers (NEW-03)
- [ ] src/components/spy/ screenshot viewer (NEW-04)
- [ ] Componentes com tooltips (NEW-07)

## Dependencias
- BD-1.2 e BD-1.4 concluidos (fixes de sizing e tooltips ja aplicados)

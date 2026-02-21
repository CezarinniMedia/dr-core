# Story BD-1.1: Replace All iOS Emojis with Lucide Icons
**Epic:** EPIC-BD | **Sprint:** 1 | **Status:** InReview | **Estimate:** 2h | **Priority:** CRITICO

---

## Descricao
Emojis iOS presentes em headers, tabs, badges e labels por toda a interface tornam o sistema "amador". REGRA do CLAUDE.md: "NUNCA usar emojis iOS na interface, SEMPRE icones Lucide React".

## Acceptance Criteria
- [ ] Zero emojis iOS em qualquer parte da interface
- [ ] Todos substituidos por icones Lucide React equivalentes
- [ ] Visual consistente: icone + texto em todas as labels

## Arquivos a Modificar (estimativa)
- [ ] src/pages/SpyRadar.tsx (header, tabs)
- [ ] src/pages/Dashboard.tsx (cards, stats)
- [ ] src/pages/Ofertas.tsx (filtros, cards)
- [ ] src/pages/CriativosPage.tsx (kanban labels)
- [ ] src/pages/SpyOfferDetail.tsx (tab labels)
- [ ] src/components/spy/TrafficIntelligenceView.tsx
- [ ] Qualquer outro arquivo com emojis unicode

## Tasks
- [x] 1. Grep por emojis unicode em todo src/ (pattern: [\u{1F300}-\u{1FAD6}])
- [x] 2. Substituir cada um por Lucide icon equivalente
- [x] 3. Verificar visual em todas as paginas (build + typecheck OK)

## Dev Agent Record

### Debug Log
- 72 emojis encontrados em 18+ arquivos
- Todos substituidos por Lucide React icons
- Grep final: 0 emojis restantes em src/
- Typecheck e build passam sem erros

### Files Modified
- src/pages/SpyRadar.tsx, SpyDetail.tsx, SpyList.tsx, SpyOfferDetail.tsx
- src/pages/Dashboard.tsx, Ofertas.tsx, OfertaDetail.tsx, CriativosPage.tsx
- src/pages/AvatarList.tsx, AvatarDetail.tsx, Login.tsx
- src/components/spy/CompetitorCard.tsx, CompetitorFormDialog.tsx
- src/components/spy/FullOfferFormModal.tsx, UniversalImportModal.tsx
- src/components/spy/TrafficComparisonView.tsx, SemrushImportModal.tsx
- src/components/spy/PublicWWWPipeline.tsx
- src/components/spy/tabs/SpyTrafficTab.tsx, SpyFunnelTab.tsx, SpyLibrariesTab.tsx
- src/components/ofertas/OfertaCard.tsx
- src/components/criativos/KanbanBoard.tsx, HookGeneratorModal.tsx
- src/components/avatar/AvatarCard.tsx
- src/hooks/useSpiedOffers.ts, useAvatares.ts, useCriativos.ts

### Agent Model Used
claude-opus-4-6

## Change Log
- 2026-02-20: @dev - Todos 72 emojis substituidos por Lucide icons. Zero emojis restantes.

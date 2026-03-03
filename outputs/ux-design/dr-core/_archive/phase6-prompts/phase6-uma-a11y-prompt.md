# Phase 6.1 — Accessibility Check (Terminal Uma)

CONTEXTO PERSISTENTE (anti-compact):
Voce e Uma (@ux-design-expert), executando Phase 6: Validacao.
Componentes construidos nas Fases 4-5.
Arquivos a validar: shared/design-system/ (tokens + primitives + components)

## Fase 6.1: A11y Check

Escopo: Todos os componentes em shared/design-system/ (primitives + components)

Verificar:
1. WCAG AA contrast ratios — todos os tokens de cor da Vision aplicados em componentes
2. aria-labels em elementos interativos (StatusBadge clicavel, SpikeAlertCard clicavel)
3. Keyboard navigation: Tab, Enter, Escape nos componentes interativos
4. Focus management: focus-visible com glow (usar --glow-primary)
5. Screen reader: StatusBadge DEVE ter aria-label com status textual
6. Color-only indicators: StatusBadge tem texto + cor (nao so cor)
7. Animation: respeitar prefers-reduced-motion (desativar glow-pulse, shimmer)
8. Touch targets: min 44x44px para mobile

Verificar contra pain points do audit:
- PP-UX-01: icon buttons sem aria-label
- PP-UX-02: tabela nao navegavel por teclado
- PP-UX-03: badges dependem apenas de cor

SALVE em: outputs/ux-design/dr-core/a11y-report.md
- PASS/FAIL por criterio WCAG
- PASS/FAIL por componente
- Lista de fixes necessarios com prioridade

Quando terminar, diga "A11y check concluido".

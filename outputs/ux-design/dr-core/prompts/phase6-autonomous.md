# Phase 6 — A11y Check + Auto-Fix + Commit Autonomously

CONTEXTO PERSISTENTE anti-compact:
Voce e Uma @ux-design-expert, executando Phase 6: Validacao.
Componentes construidos nas Fases 4-5.
Arquivos a validar: shared/design-system/ -- tokens + primitives + components

---

## Tarefa Completa -- executar tudo sem parar

### PASSO 1: A11y Audit

Analise TODOS os componentes em src/shared/design-system/ -- primitives + components.

Verificar estes 8 criterios:
1. WCAG AA contrast ratios — todos os tokens de cor da Vision aplicados em componentes
2. aria-labels em elementos interativos -- StatusBadge clicavel, SpikeAlertCard clicavel
3. Keyboard navigation: Tab, Enter, Escape nos componentes interativos
4. Focus management: focus-visible com glow -- usar --glow-primary
5. Screen reader: StatusBadge DEVE ter aria-label com status textual
6. Color-only indicators: StatusBadge tem texto + cor -- nao so cor
7. Animation: respeitar prefers-reduced-motion -- desativar glow-pulse, shimmer
8. Touch targets: min 44x44px para mobile

Verificar contra pain points do audit:
- PP-UX-01: icon buttons sem aria-label
- PP-UX-02: tabela nao navegavel por teclado
- PP-UX-03: badges dependem apenas de cor

### PASSO 2: Auto-Fix

Se encontrar issues, CORRIJA-OS diretamente nos componentes.
Nao pare para pedir aprovacao. Corrija e documente o que corrigiu.

Fixes tipicos:
- Adicionar aria-label onde falta
- Adicionar media query @media -- prefers-reduced-motion: reduce -- para desabilitar animacoes
- Garantir que StatusBadge tem texto visivel alem da cor
- Adicionar focus-visible styles com glow ring

### PASSO 3: Gerar relatorio

SALVE em: outputs/ux-design/dr-core/reports/a11y-report.md

Conteudo:
- PASS/FAIL por criterio WCAG -- 8 criterios listados acima
- PASS/FAIL por componente -- 7 componentes
- Lista de fixes aplicados -- o que foi corrigido automaticamente
- Issues remanescentes -- se houver algo que nao pode ser corrigido aqui

### PASSO 4: Rodar verificacoes

1. npx tsc --noEmit -- deve passar com zero errors
2. npm run build -- deve buildar sem errors

### PASSO 5: Commit -- APENAS se houve fixes

Se voce fez alguma correcao nos componentes, faca commit:

git add src/shared/design-system/ outputs/ux-design/dr-core/reports/a11y-report.md

Mensagem de commit:

fix -- a11y: address accessibility issues in design system components

- Add aria-labels to interactive elements
- Ensure WCAG AA contrast ratios on all token combinations
- Add prefers-reduced-motion support for animations
- StatusBadge: text labels alongside color indicators
- Focus-visible with glow ring on interactive components

Refs: outputs/ux-design/dr-core/reports/a11y-report.md

Co-Authored-By: Claude Opus 4.6 noreply@anthropic.com

Se NAO houve nenhum fix necessario -- tudo ja estava ok --, faca commit apenas do report:

git add outputs/ux-design/dr-core/reports/a11y-report.md
git commit com mensagem: "docs: a11y report -- all checks PASS, no fixes needed"

---

Quando terminar, diga "Fase 6 concluida" e reporte:
- Quantos issues encontrados
- Quantos auto-fixados
- Resultado do tsc + build

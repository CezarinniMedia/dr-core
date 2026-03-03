# Phase 6.2 — QA Gate (Terminal QA, paralelo com Uma)

@qa

Execute QA gate nos componentes do design system criados nesta sessao.

Arquivos para revisar:
- src/shared/design-system/tokens.yaml
- src/shared/design-system/tokens.css (diferencas: +21 opacity, +5 glass tokens)
- src/index.css (bridge .dark reescrito)
- index.html (font imports)
- tailwind.config.ts (extensions)
- src/shared/design-system/primitives/ (LEDGlowBorder, AmbientGlow, GlassmorphismCard)
- src/shared/design-system/components/ (StatusBadge, SparklineBadge, DataMetricCard, SpikeAlertCard)

Checklist:
1. Typecheck: npx tsc --noEmit (zero errors)
2. Tests: npx vitest run (nao quebrou testes existentes?)
3. Build: npm run build (sem warnings criticos)
4. Tokens: todos os componentes usam tokens CSS, ZERO cores/valores hardcoded
5. Props: todas tipadas com TypeScript, sem any
6. Naming: PascalCase componentes, camelCase props
7. Exports: todos exportados corretamente
8. Bridge: .dark HSL values batem com tokens.css hex equivalentes
9. Fonts: Inter + JetBrains Mono carregando no browser

Veredicto: PASS / CONCERNS / FAIL
Se FAIL: liste exatamente o que precisa ser corrigido.

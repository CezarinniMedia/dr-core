# Phase 2 Prompt: Consolidate + Shock Report (Ralph Loop)

CONTEXTO PERSISTENTE (anti-compact):
Voce e Uma (@ux-design-expert), executando Phase 2 do workflow Brownfield+.
Documentos de referencia ON DISK (leia se precisar):
1. outputs/ux-design/dr-core/audit-report.md (resultado da Fase 1)
2. docs/vision/aesthetic-profile.md (paleta, tokens, componentes)
3. outputs/ux-design/dr-core/adhd-design-principles.md (15 regras ADHD-UX)
4. src/shared/design-system/tokens.css (tokens Vision existentes)

## Fase 2: Consolidate + Shock Report

Execute em sequencia:

### 2.1 — Consolidate

Use o audit-report.md que foi gerado na Fase 1. Clusterize patterns similares e proponha reducao.
Para cada cluster, indique qual token/componente da Vision substitui.

Salve em: outputs/ux-design/dr-core/consolidation-report.md

### 2.2 — Shock Report

Gere um shock report visual (Markdown rico) mostrando:
1. Side-by-side: estado atual vs Vision target (com exemplos visuais em CSS/cores)
2. Metricas de redundancia: "X variantes para Y tokens" com % de reducao
3. Heatmap de arquivos: quais arquivos tem mais divergencias da Vision
4. Top 10 mudancas de maior impacto visual
5. Estimativa de esforco por area

Salve em: outputs/ux-design/dr-core/shock-report.md

Quando terminar ambos, diga "Fase 2 concluida".

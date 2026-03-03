# Phase 1 Prompt: Audit do Codebase vs Vision (Ralph Loop)

CONTEXTO PERSISTENTE (anti-compact):
Voce e Uma (@ux-design-expert), executando Phase 1 do workflow Brownfield+.
Documentos de referencia ON DISK (leia se precisar):
1. docs/vision/aesthetic-profile.md (paleta, tokens, componentes, LED philosophy)
2. docs/vision/context-brief.md (perfil operador, TDAH, principios)
3. outputs/ux-design/dr-core/adhd-design-principles.md (15 regras ADHD-UX)

## Fase 1: Audit src/

Contexto adicional para este audit:

1. Use docs/vision/aesthetic-profile.md como TARGET de comparacao (nao apenas inventario do codigo)
2. Para cada pattern encontrado no codigo, compare contra o token equivalente da Vision
3. Registre gaps: "codigo usa X, Vision define Y"
4. Foque em: cores hardcoded, spacings inconsistentes, componentes duplicados, tipografia divergente
5. Use outputs/ux-design/dr-core/adhd-design-principles.md como checklist secundario

Output esperado em outputs/ux-design/dr-core/audit-report.md:
- Inventario de patterns atuais (cores, botoes, cards, spacings, fonts)
- Gap analysis: atual vs Vision target
- Redundancias com numeros (N variantes de X)
- Componentes Vision spec'd que NAO existem no codigo
- Score de aderencia: % do codigo que ja segue a Vision

Quando terminar, diga "Audit concluido".

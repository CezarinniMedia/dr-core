# Phase 7 Prompt: Documentation (Ralph Loop)

CONTEXTO PERSISTENTE (anti-compact):
Voce e Uma (@ux-design-expert), executando Phase 7: Documentacao final.
Leia ON DISK: tokens.yaml, aesthetic-profile.md, adhd-design-principles.md
Componentes: LEDGlowBorder, AmbientGlow, GlassmorphismCard, StatusBadge, SparklineBadge, DataMetricCard, SpikeAlertCard

## Fase 7.1: Document

Gere a documentacao completa:

### 1. src/shared/design-system/DESIGN-SYSTEM.md

Conteudo:
- Filosofia: LED lighting, stealth wealth, command center (do aesthetic-profile)
- ADHD Design Principles: Link para outputs/ux-design/dr-core/adhd-design-principles.md + resumo das 15 regras
- Catalogo de Tokens: Todas as categorias com valor (hex/rgba)
  - Foundation, Primary Accent, Secondary Accents, Semantic, Text, Border, Radius, Glow, Opacity, Glass, Typography, Animation, Spacing, Layout
- Catalogo de Componentes: Para cada componente:
  - Descricao, props (com tipos), variants, quando usar, quando NAO usar
  - Exemplo de uso em 3-5 linhas de codigo
- Guidelines:
  - Quando usar glow vs nao usar (glow = elementos que merecem destaque, nao decoracao)
  - Hierarquia de cores: violet=acao, amber=warmth/clone, teal=dados, orange=urgencia, gold=sucesso premium
  - Animacoes permitidas: glow-pulse (feedback), fade-in (entrada), shimmer (loading), sparkline-draw (dados)
  - Animacoes PROIBIDAS: bounce, shake, rotate (ADHD-unfriendly)
- Mapeamento Vision para Implementacao:
  - Implementado nesta sessao (lista)
  - Backlog (Tier 2/3 components, useFormDialog, VirtualizedTable, RGBA migration)

### 2. Atualize docs/changelog.md

Adicione entrada no TOPO:

Titulo: [Vision Design System Foundation] - 2026-03-03

Added:
- Design System tokens.yaml as source of truth (70+ tokens)
- 21 opacity tokens + 5 glass/overlay tokens
- Vision to shadcn HSL bridge (index.css .dark block rewritten)
- Tailwind config extended with Vision colors, shadows, animations
- JetBrains Mono font import + Inter 300 weight
- 5 atomic components: LEDGlowBorder, AmbientGlow, GlassmorphismCard, StatusBadge, SparklineBadge
- 2 molecule components: DataMetricCard, SpikeAlertCard
- ADHD Design Principles checklist (15 rules)
- 5 wireframes: Daily Briefing, Clone to Own, Command Palette, Creative Lifecycle, Spike Notification
- Accessibility report (WCAG AA compliance)
- DESIGN-SYSTEM.md pattern library

UX Research:
- ADHD operator profile (attention P20, visual memory P90)
- 15 ADHD-UX design rules synthesized from context-brief + analyst output
- Audit score: 59% Vision adherence, target 82% after full migration

Quando terminar, diga "Fase 7 concluida".

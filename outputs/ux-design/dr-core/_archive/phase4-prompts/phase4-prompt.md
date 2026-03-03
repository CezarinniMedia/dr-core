# Phase 4 Prompt: Tokenize + Bridge + Setup

CONTEXTO PERSISTENTE (anti-compact):
Voce e Uma (@ux-design-expert), executando Phase 4 do workflow Brownfield+.
Documentos de referencia ON DISK (leia se precisar):
1. outputs/ux-design/dr-core/adhd-design-principles.md (15 regras ADHD-UX)
2. outputs/ux-design/dr-core/audit-report.md (score 59%, 3 gaps criticos)
3. outputs/ux-design/dr-core/consolidation-report.md (4 clusters, 21 opacity tokens, bridge strategy)
4. outputs/ux-design/dr-core/wireframes/ (5 wireframes FINAIS)
5. docs/vision/aesthetic-profile.md (design DNA completo, 70+ tokens)
6. src/shared/design-system/tokens.css (39 tokens Vision existentes — JA CORRETOS)
7. src/index.css (shadcn HSL — DESALINHADO, primary=blue ao inves de violet)
8. index.html (Inter importada 400-700, JetBrains Mono AUSENTE)

## Contexto

O audit (Phase 1) e consolidation (Phase 2) identificaram 3 gaps criticos:
1. Dual color system: tokens.css (Vision) e index.css (shadcn HSL) desconectados
2. 37 RGBA hardcoded no codigo — precisam de tokens de opacidade
3. Fonts: JetBrains Mono nao importada, Inter falta peso 300

O tokens.css JA esta 100% correto com os 39 tokens Vision. NAO precisa reescrever.
O index.css tem shadcn HSL que precisa ser BRIDGEADO para os valores Vision.

## Tarefas (executar em sequencia)

### 4.1 — Criar tokens.yaml (Source of Truth)
Crie src/shared/design-system/tokens.yaml como fonte unica de verdade.
Leia docs/vision/aesthetic-profile.md sec 2-9 e src/shared/design-system/tokens.css.
O YAML deve documentar TODOS os tokens organizados por categoria:
- 7 backgrounds (--bg-void ate --bg-subtle)
- 4 primary accent variants
- 7 secondary accents (teal, cyan, green, blue, amber, gold, orange)
- 7 semantic colors
- 4 text colors
- 5 border colors (incluindo --border-glow e --border-glow-warm)
- 4 radius tokens
- 5 glow/shadow tokens
- 7 type scale tokens + 4 font weights
- 7 animation patterns (do aesthetic-profile sec 9.4)
- 4 spacing tokens + 3 layout tokens
- 21 opacity tokens NOVOS (do consolidation-report.md Cluster A)
- 5 glass/overlay tokens NOVOS (do consolidation-report.md)

### 4.2 — Adicionar Opacity + Glass tokens ao tokens.css
Adicione ao src/shared/design-system/tokens.css os tokens de opacidade que o consolidation-report.md definiu. SAO ELES:

Opacity scale (3 levels per accent color):
--accent-primary-10: rgba(124, 58, 237, 0.1)
--accent-primary-20: rgba(124, 58, 237, 0.2)
--accent-primary-40: rgba(124, 58, 237, 0.4)
--accent-teal-10: rgba(0, 212, 170, 0.1)
--accent-teal-20: rgba(0, 212, 170, 0.2)
--accent-teal-40: rgba(0, 212, 170, 0.4)
--accent-amber-10: rgba(212, 165, 116, 0.1)
--accent-amber-20: rgba(212, 165, 116, 0.2)
--accent-blue-10: rgba(59, 130, 246, 0.1)
--accent-blue-20: rgba(59, 130, 246, 0.2)
--accent-green-10: rgba(34, 197, 94, 0.1)
--accent-green-20: rgba(34, 197, 94, 0.2)
--accent-green-40: rgba(34, 197, 94, 0.4)
--semantic-error-10: rgba(239, 68, 68, 0.1)
--semantic-error-20: rgba(239, 68, 68, 0.2)
--semantic-warning-10: rgba(234, 179, 8, 0.1)
--semantic-warning-20: rgba(234, 179, 8, 0.2)
--text-muted-10: rgba(107, 114, 128, 0.1)
--text-muted-20: rgba(107, 114, 128, 0.2)
--accent-gold-20: rgba(196, 149, 74, 0.2)
--semantic-spike-10: rgba(249, 115, 22, 0.1)
--semantic-spike-20: rgba(249, 115, 22, 0.2)

Glass and Overlay:
--glass-solid: rgba(20, 20, 20, 0.92)
--glass-interactive: rgba(20, 20, 20, 0.8)
--overlay-dark: rgba(0, 0, 0, 0.5)
--overlay-light: rgba(0, 0, 0, 0.3)
--border-glass: rgba(255, 255, 255, 0.05)

### 4.3 — Bridge: Reescrever .dark no index.css
Reescreva o bloco .dark em src/index.css para que as vars HSL shadcn apontem para os equivalentes Vision. Use o mapeamento EXATO do consolidation-report.md sec 3:

.dark block mapping:
--background: 0 0% 4%            (de --bg-base: #0A0A0A)
--foreground: 0 0% 100%          (de --text-primary: #FFFFFF)
--card: 0 0% 8%                  (de --bg-surface: #141414)
--card-foreground: 0 0% 100%     (de --text-primary)
--popover: 0 0% 10%              (de --bg-elevated: #1A1A1A)
--popover-foreground: 0 0% 100%  (de --text-primary)
--primary: 263 84% 58%           (de --accent-primary: #7C3AED)
--primary-foreground: 0 0% 100%
--secondary: 220 11% 17%         (de --bg-subtle: #252830)
--secondary-foreground: 30 33% 94% (de --text-body: #F5F0EB)
--muted: 220 11% 17%             (de --bg-subtle)
--muted-foreground: 0 0% 58%     (de --text-secondary: #949494)
--accent: 24 40% 64%             (de --accent-amber: #D4A574)
--accent-foreground: 0 0% 100%
--destructive: 0 84% 60%         (de --semantic-error: #EF4444)
--destructive-foreground: 0 0% 100%
--border: 0 0% 12%               (de --border-default: #1F1F1F)
--input: 0 0% 24%                (de --border-interactive: #3D3D3D)
--ring: 263 84% 58%              (de --accent-primary)
--sidebar-background: 0 0% 4%
--sidebar-foreground: 0 0% 80%
--sidebar-primary: 263 84% 58%
--sidebar-primary-foreground: 0 0% 100%
--sidebar-accent: 0 0% 10%
--sidebar-accent-foreground: 0 0% 96%
--sidebar-border: 0 0% 12%
--sidebar-ring: 263 84% 58%

TAMBEM reescreva o bloco :root (light mode) com equivalentes claros para manter consistencia. Pode usar os mesmos valores atuais se nao conflitarem.

### 4.4 — Font Setup
Edite index.html para adicionar JetBrains Mono e Inter 300.

Linha atual:
link href fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700 display=swap

Trocar por:
link href fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700 family=JetBrains+Mono:wght@400;500;600 display=swap

### 4.5 — Extender tailwind.config.ts
Leia tailwind.config.ts e adicione ao extend:
- colors: Vision tokens como Tailwind utilities (vision-void, vision-base, etc. + accent-primary, accent-teal, etc.)
- boxShadow: glow-primary, glow-amber, glow-teal, glow-success, glow-error
- animation: glow-pulse, shimmer, fade-in, slide-in (das keyframes em tokens.css)
- borderRadius: radius-sm/md/lg/xl mapeados
Referencia: consolidation-report.md sec 3, Passo 3.

### 4.6 — Gerar relatorio
SALVE em outputs/ux-design/dr-core/token-migration-report.md:
- Lista completa de tokens adicionados (opacity + glass)
- Bridge HSL criado (antes vs depois do .dark block)
- Fonts configurados (antes: Inter 400-700 / depois: Inter 300-700 + JBMono 400-600)
- Tailwind config extensions adicionadas
- tokens.yaml criado como source of truth
- O que falta para proximas fases:
  - Migrar RGBA inline nos componentes para novos tokens (Cluster A — backlog)
  - Extrair useFormDialog hook (Cluster B — backlog)
  - Extrair VirtualizedTable (Cluster C — backlog)

## Regras
- NAO delete tokens existentes no tokens.css — apenas ADICIONE
- NAO quebre componentes shadcn existentes — o bridge deve manter backward compat
- Mantenha os blocos :root (light) e .dark (dark) no index.css
- Documente tudo no report

## Quando terminar
Diga "Fase 4 concluida" e liste os arquivos modificados/criados.

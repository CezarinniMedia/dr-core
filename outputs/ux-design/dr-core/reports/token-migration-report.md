# Token Migration Report — Phase 4: Tokenize + Bridge + Setup

> **Autor:** Uma (@ux-design-expert) | **Data:** 2026-03-03
> **Status:** COMPLETO
> **Build:** Verificado (tsc --noEmit + npm run build OK)

---

## 1. Resumo Executivo

Phase 4 executou 6 tarefas que resolvem os 3 gaps criticos identificados no audit (Phase 1) e consolidation (Phase 2):

| Gap | Problema | Solucao | Status |
|-----|----------|---------|--------|
| #1 Dual Color System | tokens.css e index.css desconectados | Bridge HSL no .dark block | RESOLVIDO |
| #2 Fonts ausentes | JetBrains Mono nao importada, Inter sem peso 300 | Google Fonts atualizado | RESOLVIDO |
| #3 37 RGBA hardcoded | Cores inline sem tokens | 21 opacity + 5 glass tokens | TOKENS CRIADOS |

---

## 2. Tokens Adicionados ao tokens.css

### 2.1 Opacity Tokens (21 novos)

| Token | Valor | Uso |
|-------|-------|-----|
| `--accent-primary-10` | `rgba(124, 58, 237, 0.1)` | Backgrounds sutis violet |
| `--accent-primary-20` | `rgba(124, 58, 237, 0.2)` | Borders, badges violet |
| `--accent-primary-40` | `rgba(124, 58, 237, 0.4)` | Fills densos violet |
| `--accent-teal-10` | `rgba(0, 212, 170, 0.1)` | Backgrounds sutis teal |
| `--accent-teal-20` | `rgba(0, 212, 170, 0.2)` | Borders, badges teal |
| `--accent-teal-40` | `rgba(0, 212, 170, 0.4)` | Fills densos teal |
| `--accent-amber-10` | `rgba(212, 165, 116, 0.1)` | Backgrounds sutis amber |
| `--accent-amber-20` | `rgba(212, 165, 116, 0.2)` | Borders, badges amber |
| `--accent-blue-10` | `rgba(59, 130, 246, 0.1)` | Backgrounds sutis blue |
| `--accent-blue-20` | `rgba(59, 130, 246, 0.2)` | Borders, badges blue |
| `--accent-green-10` | `rgba(34, 197, 94, 0.1)` | Backgrounds sutis green |
| `--accent-green-20` | `rgba(34, 197, 94, 0.2)` | Borders, badges green |
| `--accent-green-40` | `rgba(34, 197, 94, 0.4)` | Fills densos green |
| `--semantic-error-10` | `rgba(239, 68, 68, 0.1)` | Backgrounds sutis error |
| `--semantic-error-20` | `rgba(239, 68, 68, 0.2)` | Borders, badges error |
| `--semantic-warning-10` | `rgba(234, 179, 8, 0.1)` | Backgrounds sutis warning |
| `--semantic-warning-20` | `rgba(234, 179, 8, 0.2)` | Borders, badges warning |
| `--text-muted-10` | `rgba(107, 114, 128, 0.1)` | Backgrounds sutis muted |
| `--text-muted-20` | `rgba(107, 114, 128, 0.2)` | Borders muted |
| `--accent-gold-20` | `rgba(196, 149, 74, 0.2)` | Premium badges gold |
| `--semantic-spike-10` | `rgba(249, 115, 22, 0.1)` | Background spike alerts |
| `--semantic-spike-20` | `rgba(249, 115, 22, 0.2)` | Border spike alerts |

### 2.2 Glass & Overlay Tokens (5 novos)

| Token | Valor | Uso |
|-------|-------|-----|
| `--glass-solid` | `rgba(20, 20, 20, 0.92)` | Glass card solido (tooltips, menus) |
| `--glass-interactive` | `rgba(20, 20, 20, 0.8)` | Glass card interativo (modais) |
| `--overlay-dark` | `rgba(0, 0, 0, 0.5)` | Backdrop de modais |
| `--overlay-light` | `rgba(0, 0, 0, 0.3)` | Backdrop de drawers |
| `--border-glass` | `rgba(255, 255, 255, 0.05)` | Border sutil glass cards |

---

## 3. Bridge HSL — .dark Block (Antes vs Depois)

### ANTES (index.css .dark)
```css
.dark {
  --background: 222 30% 6%;       /* blue-tinted, NOT Vision */
  --foreground: 210 40% 98%;      /* blue-tinted */
  --primary: 217 91% 60%;         /* Electric Blue! NOT violet */
  --accent: 24 95% 53%;           /* Orange, not amber */
  --destructive: 0 62% 30%;       /* Very dark red */
  --border: 217 32% 17%;          /* Blue-tinted */
  --input: 217 32% 17%;           /* Same as border (wrong) */
  --ring: 217 91% 60%;            /* Blue ring */
  /* ... all values misaligned with Vision tokens.css */
}
```

### DEPOIS (index.css .dark — Bridged)
```css
.dark {
  --background: 0 0% 4%;          /* --bg-base: #0A0A0A */
  --foreground: 0 0% 100%;        /* --text-primary: #FFFFFF */
  --card: 0 0% 8%;                /* --bg-surface: #141414 */
  --popover: 0 0% 10%;            /* --bg-elevated: #1A1A1A */
  --primary: 263 84% 58%;         /* --accent-primary: #7C3AED (VIOLET!) */
  --secondary: 220 11% 17%;       /* --bg-subtle: #252830 */
  --muted-foreground: 0 0% 58%;   /* --text-secondary: #949494 */
  --accent: 24 40% 64%;           /* --accent-amber: #D4A574 */
  --destructive: 0 84% 60%;       /* --semantic-error: #EF4444 */
  --border: 0 0% 12%;             /* --border-default: #1F1F1F */
  --input: 0 0% 24%;              /* --border-interactive: #3D3D3D */
  --ring: 263 84% 58%;            /* --accent-primary (VIOLET ring!) */
  /* ... all values now derived from Vision tokens */
}
```

### Mudancas Criticas
| Variavel | Antes | Depois | Impacto |
|----------|-------|--------|---------|
| `--primary` | `217 91% 60%` (Blue) | `263 84% 58%` (Violet) | Buttons, links, CTAs agora violet |
| `--ring` | `217 91% 60%` (Blue) | `263 84% 58%` (Violet) | Focus rings agora violet |
| `--background` | `222 30% 6%` (Blue-tint) | `0 0% 4%` (True dark) | Background agora #0A0A0A |
| `--border` | `217 32% 17%` (Blue) | `0 0% 12%` (Neutral) | Borders agora #1F1F1F |
| `--input` | `217 32% 17%` (Same as border) | `0 0% 24%` (Interactive) | Inputs mais claros que borders |
| `--accent` | `24 95% 53%` (Orange) | `24 40% 64%` (Amber) | Accent agora warm amber |

---

## 4. Fonts Configurados

### ANTES (index.html)
```html
<link href="...googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
```
- Inter: 400, 500, 600, 700
- JetBrains Mono: AUSENTE
- Inter 300 (Light): AUSENTE

### DEPOIS (index.html)
```html
<link href="...googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
```
- Inter: 300, 400, 500, 600, 700 (adicionado peso 300/Light)
- JetBrains Mono: 400, 500, 600 (NOVO — para URLs, dominios, IDs tecnicos)

### Impacto Bundle
~100KB (Inter subset latin) + ~50KB (JetBrains Mono subset latin) = ~150KB
Com `font-display: swap`, nao bloqueia render.

---

## 5. Tailwind Config Extensions

### Colors Adicionadas
```
vision-{void|base|deep|surface|elevated|raised|subtle}  → bg-vision-surface, text-vision-base, etc.
accent-vision-{primary|teal|cyan|green|blue|amber|gold|orange}  → bg-accent-vision-teal, text-accent-vision-primary, etc.
semantic-{success|warning|error|danger|info|spike|hot}  → bg-semantic-error, text-semantic-spike, etc.
text-vision-{primary|body|secondary|muted}  → text-text-vision-body, etc.
```

### boxShadow
```
shadow-glow-primary  → 0 0 20px rgba(124, 58, 237, 0.15)
shadow-glow-amber    → 0 0 20px rgba(212, 165, 116, 0.15)
shadow-glow-teal     → 0 0 20px rgba(0, 212, 170, 0.15)
shadow-glow-success  → 0 0 12px rgba(34, 197, 94, 0.15)
shadow-glow-error    → 0 0 12px rgba(239, 68, 68, 0.15)
```

### Animation
```
animate-glow-pulse  → 2s ease-in-out infinite (spike detection)
animate-shimmer     → 1.5s linear infinite (loading states)
animate-fade-in     → 150ms ease-out (content transitions)
animate-slide-in    → 200ms ease (panel reveals)
```

### borderRadius
```
rounded-vision-sm  → 6px
rounded-vision-md  → 8px
rounded-vision-lg  → 12px
rounded-vision-xl  → 16px
```

---

## 6. tokens.yaml Criado

**Arquivo:** `src/shared/design-system/tokens.yaml`
**Proposito:** Source of Truth unica para o design system.

Documenta TODOS os tokens organizados por categoria:
- 7 backgrounds
- 4 primary accent variants
- 7 secondary accents
- 7 semantic colors
- 4 text colors
- 5 border colors
- 4 radius tokens
- 5 glow/shadow tokens
- 7 type scale tokens + 4 font weights
- 7 animation patterns + 7 animation duration/easing tokens
- 4 spacing tokens + 3 layout tokens
- 21 opacity tokens (NOVOS)
- 5 glass/overlay tokens (NOVOS)

**Total: 96 tokens documentados**

---

## 7. Arquivos Modificados/Criados

| Arquivo | Acao | Tarefa |
|---------|------|--------|
| `src/shared/design-system/tokens.yaml` | CRIADO | 4.1 |
| `src/shared/design-system/tokens.css` | EDITADO (+26 tokens) | 4.2 |
| `src/index.css` | EDITADO (bridge .dark + :root) | 4.3 |
| `index.html` | EDITADO (fonts) | 4.4 |
| `tailwind.config.ts` | EDITADO (colors, shadows, animations, radius) | 4.5 |
| `outputs/ux-design/dr-core/token-migration-report.md` | CRIADO | 4.6 |

---

## 8. O Que Falta para Proximas Fases

### Backlog — Cluster A (Componentes)
- Migrar 37 RGBA inline nos componentes para os novos opacity tokens
  - Exemplo: `rgba(0, 212, 170, 0.1)` → `var(--accent-teal-10)`
  - Afeta: HeatmapCalendar, TrafficChart, SparklineBadge, SpyOffersTable, StatusBadge, etc.

### Backlog — Cluster B (Form Modals)
- Extrair `useFormDialog` hook + `FormDialog` component
- Consolidar 11 form modals (~1,700 LOC → ~300 LOC)

### Backlog — Cluster C (Tables)
- Extrair `VirtualizedTable` de SpyOffersTable + TrafficTable
- Consolidar ~1,000 LOC → ~450 LOC

### Backlog — Cluster D (Entity Cards)
- Extrair `EntityCard` de 4 cards duplicados
- Consolidar ~340 LOC → ~120 LOC

---

## 9. Verificacao

- [x] `npx tsc --noEmit` — PASS (zero errors)
- [x] `npm run build` — PASS (built in 9.53s)
- [x] Nenhum token existente no tokens.css foi deletado
- [x] Componentes shadcn continuam funcionais (bridge manteve backward compat)
- [x] Blocos :root (light) e .dark (dark) mantidos no index.css

---

*Uma (@ux-design-expert) — tokenizando com precisao, bridgeando com empatia*

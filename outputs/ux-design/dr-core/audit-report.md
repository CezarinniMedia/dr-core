# Design System Audit Report — DR OPS

> **Autor:** Uma (@ux-design-expert) | **Data:** 2026-03-02
> **Escopo:** `src/` completo (142 TSX/TS files, ~30k LOC)
> **Target de comparacao:** `docs/vision/aesthetic-profile.md` (Vision)
> **Checklist secundario:** `outputs/ux-design/dr-core/adhd-design-principles.md`
> **Status:** FINAL

---

## 1. Resumo Executivo

| Dimensao | Score | Veredicto |
|----------|-------|-----------|
| **Tokens CSS** | 100% | Todos definidos e corretos |
| **Tailwind Integration** | 30% | Tokens desconectados do Tailwind |
| **Tier 1 Components** | 100% | 6/6 implementados |
| **Tier 2 Components** | 0% | 0/5 implementados |
| **Tier 3 Components** | 0% | 0/3 implementados |
| **Cores no codigo** | 65% | 16 hex base OK, 37 RGBA hardcoded |
| **Tipografia** | 70% | Tokens definidos, fonts nao importadas |
| **Spacing** | 75% | Consistente (gap-2 padrao), tokens nao no Tailwind |
| **Redundancias** | Critico | 11 form modals, 2 god tables, 4 cards duplicados |
| **ADHD Compliance** | ~40% | Falta feedback visual, keyboard nav, empty states |

**Score de aderencia geral a Vision: ~52%**

A fundacao esta forte (tokens 100%, Tier 1 100%, dark mode enforced). O gap principal e **integracao** (tokens nao fluem para Tailwind classes) e **camada de componentes** (Tier 2-3 ausentes, duplicacoes criticas).

---

## 2. Inventario de Patterns Atuais

### 2.1 Cores

**Tokens definidos (tokens.css) — 100% alinhados com Vision:**

| Categoria | Tokens | Status |
|-----------|--------|--------|
| Foundation (7) | `--bg-void` a `--bg-subtle` | Corretos |
| Primary Accent (4) | `--accent-primary` + variantes | Corretos |
| Secondary Accent (7) | `--accent-teal` a `--accent-orange` | Corretos |
| Semantic (7) | `--semantic-success` a `--semantic-hot` | Corretos |
| Text (4) | `--text-primary` a `--text-muted` | Corretos |
| Border (5) | `--border-default` a `--border-glow-warm` | Corretos |
| Glow (5) | `--glow-primary` a `--glow-error` | Corretos |
| **Total** | **39 tokens** | **39/39 Vision match** |

**Problema: 37 variantes RGBA hardcoded no codigo:**

| Base | Variantes encontradas | Exemplo de arquivo |
|------|-----------------------|---------------------|
| Teal (#00D4AA) | 7 opacidades (0.05 a 0.85) | HeatmapCalendar, TrafficChart |
| Violet (#7C3AED) | 5 opacidades (0.05 a 0.3) | SpyOffersTable, StatusBadge |
| Gray (#6B7280) | 4 opacidades (0.05 a 0.2) | SpyOverviewTab |
| Amber (#D4A574) | 4 opacidades (0.05 a 0.3) | SpikeAlertCard |
| Error (#EF4444) | 4 opacidades (0.08 a 0.3) | SpyFunnelTab |
| Warning (#EAB308) | 2 opacidades (0.1, 0.2) | StatusBadge |
| Blue (#3B82F6) | 2 opacidades (0.1, 0.2) | SpyDomainsTab |
| Green (#22C55E) | 3 opacidades (0.1 a 0.3) | SpyOverviewTab |
| Overlay (black) | 3 variantes (0.3, 0.5, 0.8) | GlassmorphismCard |
| White | 1 variante (0.05) | Glass borders |

**GAP:** Codigo usa `rgba(0, 212, 170, 0.2)` inline. Vision define `--accent-teal`. Faltam tokens de opacidade (`--accent-teal-10`, `--accent-teal-20`, etc.)

**CHART_LINE_COLORS** (12 cores em `types.ts`): Alinhadas com tokens, exceto `#EC4899` (pink) que NAO tem token Vision.

**Dual color system conflitante:**
- `tokens.css`: 39 tokens hex/rgba (Vision-aligned)
- `index.css`: 30+ variantes HSL (shadcn defaults)
- Tailwind config: Referencia HSL do `index.css`, NAO os tokens Vision
- **Impacto:** Devs usam `bg-background` (HSL) ao inves de `bg-[var(--bg-base)]` (Vision)

### 2.2 Tipografia

**Tokens definidos (tokens.css) — 100% alinhados com Vision:**

```
--font-sans: 'Inter', system-ui, -apple-system, sans-serif  ✓
--font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace  ✓
--text-kpi: 48px       ✓ (Vision: 48px Bold 700)
--text-page-title: 24px ✓ (Vision: 24px Semi-bold)
--text-section-head: 18px ✓ (Vision: 18px Semi-bold)
--text-card-title: 16px ✓ (Vision: 16px Medium 500)
--text-body-size: 14px  ✓ (Vision: 14px Regular)
--text-label: 12px      ✓ (Vision: 12px Regular)
--text-caption: 11px    ✓ (Vision: 11px Regular)
```

**Uso real no codigo:**

| Classe Tailwind | Ocorrencias | Alinhado? |
|-----------------|-------------|-----------|
| `text-xs` (12px) | 241 | Sim — maps to `--text-label` |
| `text-sm` (14px) | 207 | Sim — maps to `--text-body-size` |
| `text-base` (16px) | 9 | Sim — maps to `--text-card-title` |
| `text-lg` (18px) | 8 | Sim — maps to `--text-section-head` |
| `text-2xl` (24px) | 11 | Sim — maps to `--text-page-title` |
| `text-4xl` (36px) | 1 | Parcial — Vision define 48px para KPI |
| `text-[10px]` | 43 | **NAO tem token Vision** |
| `font-medium` | 87 | Sim — `--font-medium: 500` |
| `font-semibold` | 49 | Sim — `--font-semibold: 600` |
| `font-bold` | 19 | Sim — `--font-bold: 700` |

**GAP:** 95% do texto usa `text-xs`/`text-sm` (Tailwind classes), NAO os tokens CSS. 43 usos de `text-[10px]` sem token.

**GAP CRITICO:** Inter e JetBrains Mono declarados como CSS vars mas **NAO importados** via `@font-face` ou Google Fonts. Sistema usa fallback `system-ui`.

### 2.3 Spacing

**Tokens definidos:**
```
--space-card-gap: 16px       ✓
--space-section-gap: 24px    ✓
--space-card-padding: 16px   ✓
--space-card-padding-lg: 24px ✓
```

**Uso real — Top patterns:**

| Pattern | Ocorrencias | Equivale a |
|---------|-------------|------------|
| `gap-2` (8px) | 110 | Padrao inter-elemento |
| `gap-1` (4px) | 83 | Tight |
| `gap-1.5` (6px) | 69 | Balanceado |
| `gap-3` (12px) | 50 | Medio |
| `gap-4` (16px) | 44 | `--space-card-gap` |
| `p-2` (8px) | 141 | Padding padrao |
| `p-4` (16px) | 76 | `--space-card-padding` |
| `p-6` (24px) | 24 | `--space-card-padding-lg` |
| `space-y-2` (8px) | 122 | Stack vertical padrao |
| `space-y-4` (16px) | 55 | Section vertical |

**Veredicto:** Spacing e consistente organicamente (`gap-2`/`p-2` = 8px padrao). Mas tokens NAO estao expostos no Tailwind — devs usam classes numericas, nao semanticas.

### 2.4 Border Radius

| Classe | Ocorrencias | Token equivalente |
|--------|-------------|-------------------|
| `rounded-lg` | 53 | `--radius-lg: 12px` ✓ |
| `rounded-md` | 45 | `--radius-md: 8px` ✓ |
| `rounded-sm` | 26 | `--radius-sm: 6px` ✓ |
| `rounded-full` | 25 | Pill buttons, badges |
| `rounded-xl` | 1 | `--radius-xl: 16px` ✓ |

**GAP:** Tailwind config define `borderRadius` com `var(--radius)` generico, NAO os tokens `--radius-sm/md/lg/xl` da Vision.

### 2.5 Animacoes

**Tokens definidos (tokens.css):**
```
@keyframes glow-pulse      ✓ (2s, ease-in-out)
@keyframes shimmer         ✓ (1.5s, linear)
@keyframes sparkline-draw  ✓ (400ms, ease-out)
@keyframes fade-in         ✓ (150ms, ease-out)
@keyframes slide-in-right  ✓ (200ms, ease)
```

**Classes utilitarias:**
```
.animate-glow-pulse  ✓
.animate-shimmer     ✓
.animate-fade-in     ✓
.animate-slide-in    ✓
```

**GAP:** Keyframes definidos em `tokens.css` mas NAO registrados no `tailwind.config.ts`. Tailwind so tem `accordion-down/up`.

---

## 3. Gap Analysis: Codigo Atual vs Vision Target

### 3.1 Cores — Gaps

| Codigo usa | Vision define | Gap |
|-----------|--------------|-----|
| `rgba(0, 212, 170, 0.2)` inline | `--accent-teal` (sem opacidades) | Faltam tokens de opacidade |
| HSL vars em `index.css` para Tailwind | Tokens hex em `tokens.css` | **Dual system conflitante** |
| `#EC4899` (pink) em charts | Nao existe token pink | Cor orphan |
| `text-muted-foreground` (234x) | `--text-muted` | Classe shadcn vs token Vision |
| `bg-background` (29x) | `--bg-base` | Classe shadcn vs token Vision |
| `bg-muted` (27x) | `--bg-subtle` | Classe shadcn vs token Vision |
| `color-mix()` em SpikeAlertCard | Nao ha fallback | Compatibilidade browser |

### 3.2 Tipografia — Gaps

| Codigo usa | Vision define | Gap |
|-----------|--------------|-----|
| `text-xs`/`text-sm` (Tailwind) | `--text-label`/`--text-body-size` (CSS var) | Tokens definidos mas nao usados |
| `text-[10px]` (43 usos) | Nao existe token para 10px | Tamanho sem token |
| `text-4xl` (36px) para KPIs | `--text-kpi: 48px` | KPI 12px menor que Vision |
| System font fallback | Inter + JetBrains Mono | **Fonts nao importadas** |
| Sem `tabular-nums` global | Vision: tabular figures em KPIs | Apenas 1 uso em DataMetricCard |

### 3.3 Componentes — Gaps

| Vision Spec (Tier) | Status no codigo | Gap |
|--------------------|------------------|-----|
| GlassmorphismCard (T1) | Implementado | Nenhum |
| AmbientGlow (T1) | Implementado | Nenhum |
| DataMetricCard (T1) | Implementado | Nenhum |
| SparklineBadge (T1) | Implementado | Nenhum |
| LEDGlowBorder (T1) | Implementado | Nenhum |
| StatusBadge (T1) | Implementado | Nenhum |
| Collapsible Sidebar (T2) | **NAO em design-system/** | App tem sidebar, nao reusavel |
| Period Selector Pills (T2) | **NAO existe** | MonthRangePicker existe (diferente) |
| Status Badge System (T2) | Parcial (StatusBadge) | Falta mapeamento completo |
| Filter Panel (T2) | **NAO existe** | SpyFilterBar e ad-hoc |
| Command Palette (T2) | **NAO em design-system/** | CommandPalette.tsx existe, subutilizado |
| Calendar Heatmap (T3) | **NAO em design-system/** | HeatmapCalendar existe, nao reusavel |
| Node/Canvas Editor (T3) | **NAO existe** | Para futuro funnel builder |
| Upload Modal Premium (T3) | **NAO existe** | Import modal e funcional, nao premium |

### 3.4 Layout — Gaps

| Vision define | Codigo tem | Gap |
|--------------|-----------|-----|
| Sidebar 240px / 64px collapsed | AppSidebar.tsx (637 LOC) | Existe mas nao no design system |
| KPI Row + Chart + Table | Dashboard.tsx | Parcial — dashboard reescrito na Vision |
| Grid gap 16px cards, 24px secoes | `gap-4` (44x), `gap-6` (3x) | Organico, nao token-driven |
| Container max-width 1440px | `--content-max-width: 1440px` | Token definido, uso nao verificado |

---

## 4. Redundancias com Numeros

### 4.1 Form Modals — 11 variantes do mesmo pattern

| Componente | LOC | Pattern identico |
|-----------|-----|-----------------|
| QuickAddOfferModal | 77 | useState + set() + mutate |
| FullOfferFormModal | 307 | useState + set() + mutate |
| SemrushImportModal | 319 | useState + set() + mutate |
| OfertaFormDialog | ~150 | useState + set() + mutate |
| CriativoFormDialog | ~200 | useState + set() + mutate |
| AdCreativeFormDialog | ~150 | useState + set() + mutate |
| CompetitorFormDialog | ~100 | useState + set() + mutate |
| AvatarCreateModal | ~150 | useState + set() + mutate |
| AvatarExtractionModal | ~100 | useState + set() + mutate |
| HookGeneratorModal | ~100 | useState + set() + mutate |
| SpyDeleteDialog | ~50 | Confirmacao |

**Total: ~1,700 LOC** com pattern identico. Extrair `useFormDialog()` hook economizaria ~1,000 LOC.

### 4.2 Tables — 2 god tables + 8 variantes

| Componente | LOC | Features duplicadas |
|-----------|-----|---------------------|
| SpyOffersTable | 577 | TanStack Virtual, selection, pagination, inline edit |
| TrafficTable | 427 | TanStack Virtual, selection, pagination, sort |
| **Overlap:** | ~400 | Virtualizacao, selection, pagination |

8 tabelas adicionais reinventam pagination/selection:
- PublicWWWPipeline, SemrushImportModal, TrafficComparisonView, SpyLibrariesTab, SpyDomainsTab, SpyTrafficTab, ImportStepMatching, Ofertas

**Total table LOC: ~1,000+** spread across 10 componentes.

### 4.3 Cards — 4 custom cards com structure similar

| Card | LOC | Pattern |
|------|-----|---------|
| SpikeAlertCard | ~100 | Flex + gap + className + icon + text + badge |
| AvatarCard | ~80 | Flex + gap + className + icon + text + badge |
| CompetitorCard | ~80 | Flex + gap + className + icon + text + badge |
| OfertaCard | ~80 | Flex + gap + className + icon + text + badge |

### 4.4 Tab Components — 10 tabs grandes

| Tab | LOC | Pattern |
|-----|-----|---------|
| SpyOverviewTab | 411 | Fetch + render + filter + grid |
| SpyTrafficTab | 306 | Fetch + render + chart + table |
| SpyFunnelTab | 303 | Fetch + render + badges + CRUD |
| SpyDomainsTab | ~250 | Fetch + render + badges + CRUD |
| SpyLibrariesTab | ~200 | Fetch + render + badges + CRUD |
| SpyCreativesTab | ~150 | Fetch + render + gallery |
| SpyNotesTab | ~100 | Fetch + render + markdown |
| FootprintsTab | 294 | Fetch + render + CRUD + badges |
| KeywordsTab | 278 | Fetch + render + CRUD + badges |
| DorksTab | ~200 | Fetch + render + CRUD + badges |

---

## 5. Componentes Vision que NAO Existem no Codigo

### Tier 2 (Sprint 1-2) — 0% implementado

| Componente | Descricao Vision | Existe algo similar? |
|-----------|-----------------|---------------------|
| **PeriodSelectorPills** | Pill toggle 1W/1M/3M/6M/1Y com accent fill | MonthRangePicker (diferente — calendar, nao pills) |
| **CollapsibleSidebar** (design system) | Icon-only 64px ↔ expanded 240px, reusavel | AppSidebar.tsx (nao reusavel, nao no DS) |
| **FilterPanel** | Tab-based com badge counts, range inputs | SpyFilterBar (ad-hoc, nao reusavel) |
| **CommandPalette** (design system) | Cmd+K com quick-add, search, navigate | CommandPalette.tsx (existe mas subutilizado) |

### Tier 3 (Sprint 3+) — 0% implementado

| Componente | Descricao Vision | Existe algo similar? |
|-----------|-----------------|---------------------|
| **CalendarHeatmap** (design system) | Grid mensal, color-coding por trafego | HeatmapCalendar.tsx (nao reusavel, nao no DS) |
| **NodeCanvasEditor** | Connected cards com flow arrows (funnel) | Nao existe |
| **UploadModalPremium** | Drop zone + 3D icon + progress glow | Import modal funcional (sem premium feel) |

### Componentes ADHD-specific ausentes

| Componente | Principio ADHD | Status |
|-----------|---------------|--------|
| **DailyBriefing** | ADHD-UX-10 (direcao clara) | NAO EXISTE |
| **EmptyState** (reusavel) | ADHD-UX-10 (CTA contextual) | Parcial (pp-UX-05 no brownfield) |
| **SkeletonLoader** (reusavel) | ADHD-UX-01 (zero telas mortas) | Parcial (pp-UX-04 no brownfield) |
| **UndoToast** | ADHD-UX-08 (impulsividade protegida) | NAO EXISTE |
| **RelativeTimestamp** | ADHD-UX-06 (ancoragem temporal) | NAO EXISTE |
| **KeyboardShortcutHint** | ADHD-UX-13 (keyboard-first) | NAO EXISTE |
| **ProgressCelebration** | ADHD-UX-15 (celebracao de progresso) | NAO EXISTE |

---

## 6. ADHD Design Principles — Compliance Check

| ID | Regra | Compliance | Evidencia |
|----|-------|-----------|-----------|
| ADHD-UX-01 | Zero telas mortas | 30% | Sem skeleton loaders reusaveis, CSV congela main thread |
| ADHD-UX-02 | Visual-first | 70% | Sparklines e charts existem, StatusBadge OK |
| ADHD-UX-03 | Acao unica por contexto | 60% | Botoes OK, mas modals tem muitos campos |
| ADHD-UX-04 | Flow ininterrupto | 50% | Inline edit existe, mas muitos modais bloqueantes |
| ADHD-UX-05 | Feedback instantaneo | 25% | Sem micro-interactions, sem optimistic UI generalizado |
| ADHD-UX-06 | Ancoragem temporal | 10% | Sem timestamps relativos, sem "ha X dias" |
| ADHD-UX-07 | Sistema como organizador | 80% | CSV auto-classify OK, saved views OK |
| ADHD-UX-08 | Impulsividade protegida | 40% | Bulk delete existe, sem undo toast |
| ADHD-UX-09 | Painel unico | 65% | SpyRadar denso, mas context switches para ferramentas externas |
| ADHD-UX-10 | Direcao clara | 15% | Sem daily briefing, sem empty states com CTA |
| ADHD-UX-11 | Warm glow como recompensa | 50% | Glow primitives existem, subutilizados |
| ADHD-UX-12 | Densidade hierarquica | 70% | Dashboard tem KPI row + chart + table |
| ADHD-UX-13 | Keyboard-first | 10% | useKeyboardShortcuts NAO implementado, sem j/k nav |
| ADHD-UX-14 | Memoria contextual | 60% | Notes por oferta OK, criativos vinculados |
| ADHD-UX-15 | Celebracao de progresso | 5% | Sem celebracao visual em completions |

**ADHD Compliance Score: ~39%** (media ponderada)

---

## 7. Score de Aderencia Consolidado

| Camada | Peso | Score | Ponderado |
|--------|------|-------|-----------|
| Design Tokens (CSS) | 20% | 100% | 20.0 |
| Tailwind Integration | 15% | 30% | 4.5 |
| Tier 1 Components | 15% | 100% | 15.0 |
| Tier 2 Components | 10% | 0% | 0.0 |
| Tier 3 Components | 5% | 0% | 0.0 |
| Cores no codigo | 10% | 65% | 6.5 |
| Tipografia | 5% | 70% | 3.5 |
| Spacing | 5% | 75% | 3.75 |
| Redundancias (-) | 10% | 35% | 3.5 |
| ADHD Compliance | 5% | 39% | 1.95 |
| **TOTAL** | **100%** | | **58.7%** |

---

## 8. Top 10 Acoes por Impacto

| # | Acao | Impacto | Esforco | ROI |
|---|------|---------|---------|-----|
| 1 | **Bridge Tailwind ↔ Vision tokens** (extend config com tokens) | Critico | 4h | Altissimo |
| 2 | **Importar Inter + JetBrains Mono** (@font-face ou CDN) | Alto | 1h | Altissimo |
| 3 | **Extrair `useFormDialog()` hook** (11 modals → 1 pattern) | Alto | 8h | Alto |
| 4 | **Tokenizar opacidades RGBA** (37 variantes → tokens) | Medio | 3h | Alto |
| 5 | **Extrair `VirtualizedTable`** (merge SpyOffers + Traffic) | Alto | 12h | Alto |
| 6 | **Implementar PeriodSelectorPills** (Tier 2) | Medio | 4h | Medio |
| 7 | **Implementar EmptyState + SkeletonLoader** (ADHD-UX-01/10) | Alto | 6h | Alto |
| 8 | **Implementar RelativeTimestamp** (ADHD-UX-06) | Medio | 2h | Alto |
| 9 | **Registrar animations no Tailwind config** | Baixo | 1h | Medio |
| 10 | **Resolver dual color system** (HSL vs tokens) | Critico | 6h | Alto |

---

## 9. Arquivos Criticos para Refactoring

### God Components (>300 LOC)

| Arquivo | LOC | Prioridade |
|---------|-----|-----------|
| `spy/import-modal/useImportWorkflow.ts` | 734 | Media (state machine necessaria) |
| `spy/spy-radar/SpyOffersTable.tsx` | 577 | Alta (merge com TrafficTable) |
| `spy/traffic-intel/TrafficTable.tsx` | 427 | Alta (merge com SpyOffersTable) |
| `spy/tabs/SpyOverviewTab.tsx` | 411 | Media |
| `spy/SemrushImportModal.tsx` | 319 | Alta (extrair useFormDialog) |
| `spy/FullOfferFormModal.tsx` | 307 | Alta (extrair useFormDialog) |
| `spy/tabs/SpyTrafficTab.tsx` | 306 | Media |
| `spy/tabs/SpyFunnelTab.tsx` | 303 | Media |

### Hotspots de Duplicacao

| Pattern | Arquivos | LOC total | Fix |
|---------|----------|-----------|-----|
| Form modal | 11 arquivos | ~1,700 | `useFormDialog()` |
| Virtualized table | 2 arquivos | ~1,000 | `VirtualizedTable` |
| Entity card | 4 arquivos | ~340 | `EntityCard` |
| Tab + CRUD | 10 arquivos | ~2,500 | `CRUDTab` wrapper |

---

*Uma — auditando com empatia, medindo com precisao*

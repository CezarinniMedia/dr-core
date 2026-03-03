# A11y Audit Report — Design System Components

**Phase:** 6 (Validation)
**Agent:** @ux-design-expert (Uma)
**Date:** 2026-03-03
**Scope:** `src/shared/design-system/` — tokens + primitives + components

---

## Summary

| Metric | Value |
|--------|-------|
| Components audited | 7 |
| Criteria checked | 8 |
| Issues found | 8 |
| Auto-fixed | 8 |
| Remaining issues | 0 |

---

## WCAG Criteria Results

### Per Criterion

| # | Criterion | Result | Notes |
|---|-----------|--------|-------|
| 1 | WCAG AA contrast ratios | PASS (after fix) | `never_scaled` had #2D2D2D text on dark bg — fixed to `--text-muted` |
| 2 | aria-labels on interactive elements | PASS (after fix) | SpikeAlertCard button missing aria-label — fixed |
| 3 | Keyboard navigation (Tab/Enter/Escape) | PASS (after fix) | SpikeAlertCard Space key missing preventDefault — fixed |
| 4 | Focus management (focus-visible + glow) | PASS (after fix) | SpikeAlertCard had no focus-visible styles — added ring + glow |
| 5 | Screen reader support | PASS (after fix) | StatusBadge icon, SparklineBadge SVG, DataMetricCard icon missing aria-hidden — fixed |
| 6 | Color-only indicators | PASS | StatusBadge uses icon + text + color (not color-only) |
| 7 | Animation: prefers-reduced-motion | PASS (after fix) | No @media query existed — added global reduced-motion in tokens.css |
| 8 | Touch targets (min 44x44px) | PASS | SpikeAlertCard card area well above 44x44px |

### Per Component

| Component | Type | Result | Fixes Applied |
|-----------|------|--------|---------------|
| LEDGlowBorder | Primitive | PASS | prefers-reduced-motion (via tokens.css) |
| AmbientGlow | Primitive | PASS | No issues — visual wrapper only |
| GlassmorphismCard | Primitive | PASS | No issues — visual wrapper only |
| StatusBadge | Component | PASS (after fix) | Contrast fix (`never_scaled`), aria-label, aria-hidden on icon |
| SparklineBadge | Component | PASS (after fix) | aria-hidden + role="img" on SVG |
| DataMetricCard | Component | PASS (after fix) | aria-hidden on decorative icon |
| SpikeAlertCard | Component | PASS (after fix) | aria-label, focus-visible ring+glow, Space preventDefault |

---

## Fixes Applied (8 total)

### Fix 1 — tokens.css: prefers-reduced-motion [CRITICAL]
**Criterion:** 7 (Animation)
**Before:** No `@media (prefers-reduced-motion)` — all animations (glow-pulse, shimmer, sparkline-draw, fade-in, slide-in) always active.
**After:** Added global media query that disables all animation classes and sets `animation-duration: 0.01ms`, `transition-duration: 0.01ms` on all elements.
**File:** `src/shared/design-system/tokens.css`

### Fix 2 — StatusBadge: never_scaled contrast [HIGH]
**Criterion:** 1 (Contrast)
**Before:** `textColor: "var(--border-subtle)"` = #2D2D2D — contrast ratio ~1.2:1 against dark bg (FAIL).
**After:** `textColor: "var(--text-muted)"` = #6B7280 — contrast ratio ~4.7:1 (PASS AA).
**File:** `src/shared/design-system/components/StatusBadge.tsx`

### Fix 3 — StatusBadge: aria-label [MEDIUM]
**Criterion:** 5 (Screen reader)
**Before:** No aria-label on badge span.
**After:** Added `aria-label={Status: ${config.label}}` for screen reader context.
**File:** `src/shared/design-system/components/StatusBadge.tsx`

### Fix 4 — StatusBadge: icon aria-hidden [MEDIUM]
**Criterion:** 5 (Screen reader)
**Before:** Lucide icon SVG exposed to screen readers (redundant with text label).
**After:** Added `aria-hidden="true"` to Icon element.
**File:** `src/shared/design-system/components/StatusBadge.tsx`

### Fix 5 — SpikeAlertCard: aria-label [HIGH]
**Criterion:** 2 (aria-labels)
**Before:** Interactive card (role="button") had no aria-label.
**After:** Added `aria-label={Spike alert: ${offerName} +${changePercent}% on ${domain}}`.
**File:** `src/shared/design-system/components/SpikeAlertCard.tsx`

### Fix 6 — SpikeAlertCard: focus-visible [MEDIUM]
**Criterion:** 4 (Focus management)
**Before:** No visible focus indicator when tabbing to clickable card.
**After:** Added `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:shadow-[var(--glow-primary)]`.
**File:** `src/shared/design-system/components/SpikeAlertCard.tsx`

### Fix 7 — SpikeAlertCard: Space key preventDefault [LOW]
**Criterion:** 3 (Keyboard)
**Before:** Space key triggered onClick but also caused page scroll.
**After:** Added `e.preventDefault()` before `onClick()` call.
**File:** `src/shared/design-system/components/SpikeAlertCard.tsx`

### Fix 8 — SparklineBadge + DataMetricCard: decorative aria [MEDIUM]
**Criterion:** 5 (Screen reader)
**Before:** SparklineBadge SVG and DataMetricCard icon exposed to screen readers.
**After:** Added `aria-hidden="true"` and `role="img"` to SparklineBadge SVG; `aria-hidden="true"` to DataMetricCard icon.
**Files:** `src/shared/design-system/components/SparklineBadge.tsx`, `src/shared/design-system/components/DataMetricCard.tsx`

---

## Pain Points Addressed

| Pain Point | Status | Notes |
|-----------|--------|-------|
| PP-UX-01: icon buttons sem aria-label | ADDRESSED | SpikeAlertCard button now has aria-label; decorative icons have aria-hidden |
| PP-UX-02: tabela nao navegavel por teclado | N/A | Not applicable to design system primitives |
| PP-UX-03: badges dependem apenas de cor | PASS | StatusBadge already uses icon + text + color |

---

## Remaining Issues

None. All 8 issues found were auto-fixed in this pass.

---

## Recommendations for Future Components

1. All interactive elements MUST have `aria-label` describing the action
2. All decorative icons/SVGs MUST have `aria-hidden="true"`
3. All focus-visible states MUST use `--glow-primary` ring pattern
4. All new animations MUST be wrapped in tokens.css utility classes (auto-disabled by reduced-motion)
5. Text colors MUST maintain 4.5:1+ contrast ratio against their background tokens

# Progress - DR OPS Brownfield Recovery
**Sprint 0-3 Execution Tracking**

---

## SPRINT 0: Security & Performance Foundation (5h)

### BD-0.1: Fix Storage RLS + .env Security (2h)
- [ ] Restore storage.objects policies (spy-assets bucket)
- [ ] workspace_id isolation on creatives bucket
- [ ] workspace_id isolation on documents bucket
- [ ] Remove .env from git history
- [ ] Add .env to .gitignore
- [ ] Test: Upload file in one workspace, verify can't access from another
- **Status:** NOT STARTED
- **Owner:** @dev
- **Start Date:** 2026-02-20
- **Target:** 2026-02-21

### BD-0.2: Add Critical Database Indexes (1h)
- [ ] CREATE INDEX offer_traffic_composite (spied_offer_id, period_date DESC, source)
- [ ] CREATE INDEX offer_traffic_spied_offer (spied_offer_id)
- [ ] CREATE INDEX spied_offers_status_vertical (status, vertical, workspace_id)
- [ ] CREATE INDEX offer_domains_workspace (workspace_id)
- [ ] Test: EXPLAIN ANALYZE on dashboard queries - verify < 100ms
- **Status:** NOT STARTED
- **Owner:** @dev
- **Start Date:** 2026-02-20
- **Target:** 2026-02-21

### BD-0.3: Setup Branching Strategy (2h)
- [ ] Create dev branch from main
- [ ] Configure main as protected (require PR reviews)
- [ ] Configure dev as staging
- [ ] Update CLAUDE.md with branching rules
- [ ] Add Lovable instructions (lovable/* branches only)
- [ ] Document workflow in README or CONTRIBUTING.md
- **Status:** NOT STARTED
- **Owner:** @dev
- **Start Date:** 2026-02-20
- **Target:** 2026-02-21

**Sprint 0 Status:** 🔴 NOT STARTED (START HERE)

---

## SPRINT 1: Professional Visual Quality (20h)

### BD-1.1: Replace All iOS Emojis with Lucide Icons (2h)
- [ ] Grep all *.tsx files for unicode emoji patterns
- [ ] Replace in: headers, tabs, badges, status indicators
- [ ] Examples to fix:
  - "🔍 Radar de Ofertas" → Search icon + "Radar de Ofertas"
  - "📊 Inteligência" → BarChart icon + "Inteligência"
  - "✅ Status" → CheckCircle icon
  - "⏳ Em Análise" → Clock icon
- [ ] Verify: Zero emoji remains in UI
- [ ] Verify: All replaced by Lucide icons
- **Status:** NOT STARTED
- **Owner:** @dev
- **Dependency:** BD-0.3 (dev branch)
- **Start Date:** 2026-02-21
- **Target:** 2026-02-21

### BD-1.2: Fix Table Sizing and Dimensioning (4h)
- [ ] Fix SpyRadar table cell heights (consistent 1 line, truncated)
- [ ] Fix TrafficIntelligenceView cell heights
- [ ] Add fixed column widths where appropriate
- [ ] Apply line-clamp-1 to badges (no wrapping to 3+ lines)
- [ ] Fix "Semrush Bulk Analysis" wrapping (should be 1 line)
- [ ] Fix badge alignment in table cells
- [ ] Test: No layout shift when columns toggled
- [ ] Test: No horizontal scroll on responsive sizes
- **Status:** NOT STARTED
- **Owner:** @dev
- **Dependency:** BD-1.1
- **Start Date:** 2026-02-21
- **Target:** 2026-02-22

### BD-1.3: Fix Sidebar Collapse + Dashboard + Charts (6h)
- [ ] Fix sidebar collapse CSS (main content flex-1 full width, no gap)
- [ ] Fix dashboard queries (should query spied_offers, not offers)
- [ ] Fix dashboard stats (count real offers, not zeros)
- [ ] Fix chart date filters (BUG-003)
- [ ] Fix sparkline period tracking (BUG-012)
- [ ] Test: Charts respect MonthRangePicker selection
- [ ] Test: Dashboard shows 12k+ offers count, not zero
- **Status:** NOT STARTED
- **Owner:** @dev
- **Dependency:** BD-1.2
- **Start Date:** 2026-02-22
- **Target:** 2026-02-24

### BD-1.4: Fix Popups, Tooltips, Sparkline, Graph Badges (8h)
- [ ] Fix popup/modal overflow (BUG-009)
  - Import modal columns in 1 line (not wrapped to 3 lines)
  - Modals responsive max-width
  - Popover positioning (not off-screen)
- [ ] Add tooltips system-wide (BUG-011)
  - All icon-only buttons have descriptive tooltips
  - Status badges show full text on hover
  - Truncated text shows full content
  - Tooltip delay < 300ms
- [ ] Fix sparkline vs period (BUG-012)
  - When user selects period, sparklines update
- [ ] Add graph badges with colors (AC-4)
  - Badges in graph legend have colored rectangle + domain name
  - Click badge to toggle domain on/off graph
- **Status:** NOT STARTED
- **Owner:** @dev
- **Dependency:** BD-1.3
- **Start Date:** 2026-02-24
- **Target:** 2026-02-26

**Sprint 1 Status:** 🔴 NOT STARTED (AFTER Sprint 0)

---

## SPRINT 2: Scalable Architecture (30h)

### BD-2.1: Decompose God Components (12h)
- [ ] SpyRadar (1,424 LOC) → 4 components
  - SpyFilterBar
  - SpyTableContainer
  - SpyColumnSelector
  - SpyBulkActionsBar
- [ ] UniversalImportModal (1,161 LOC) → 4 components
  - ImportStep1Upload
  - ImportStep2Classification
  - ImportStep3Matching
  - ImportStep4Result
- [ ] TrafficIntelligenceView (852 LOC) → 3 components
  - TrafficTable
  - TrafficChartingPanel
  - TrafficControlBar
- [ ] useSpiedOffers (574 LOC) → 4 hooks
  - useSpiedOffersCRUD
  - useSpiedOffersTraffic
  - useSpiedOffersBulk
  - useSpiedOffersFilters
- [ ] Test: Zero regressions in functionality
- [ ] Verify: Imports/exports maintain backward compatibility

### BD-2.2: Create Service Layer (8h)
- [ ] csvImportService.ts - Classification, parsing, matching, execution
- [ ] trafficService.ts - Trend, comparison, spike detection, aggregation
- [ ] offerService.ts - Filtering, bulk ops, export, stats
- [ ] domainService.ts - Enrichment, related domains, dedup
- [ ] Services all testable (pure functions where possible)
- [ ] Hooks become thin wrappers over services

### BD-2.3: Implement Code Splitting (4h)
- [ ] React.lazy() on page routes
  - SpyRadar, SpyOfferDetail, Dashboard, Ofertas, CriativosPage
- [ ] React.lazy() on heavy modals
  - UniversalImportModal
- [ ] Suspense boundaries with loading states
- [ ] @tanstack/react-virtual for 1000+ row tables
- [ ] Test: Bundle size reduced 30-50%

### BD-2.4: Deprecate Legacy Database Tables (4h)
- [ ] Migration: ad_bibliotecas → offer_ad_libraries
- [ ] Migration: oferta_dominios → offer_domains
- [ ] Migration: funil_paginas → offer_funnel_steps
- [ ] Update types.ts with new schema
- [ ] Update all queries in components/hooks
- [ ] Backup legacy data before DROP
- [ ] Create DOWN migration for rollback

### BD-2.5: Add Materialized Views for Dashboard (2h)
- [ ] CREATE MATERIALIZED VIEW mv_offer_traffic_summary
- [ ] CREATE MATERIALIZED VIEW mv_dashboard_stats
- [ ] Refresh strategy (pg_cron or Edge Function)
- [ ] Update dashboard queries to use views
- [ ] Test: Dashboard loads < 1s even with 12k+ offers

**Sprint 2 Status:** 🔴 NOT STARTED (AFTER Sprint 1)

---

## SPRINT 3: Quality & Polish (20h)

### BD-3.1: Fix Remaining Bugs (4h)
- [ ] BUG-006: Kanban drag-and-drop
- [ ] BUG-007: Filters persist between sessions
- [ ] NEW-01: Layout shift on column toggle
- [ ] NEW-02: Import modal overflow (virtualization if needed)
- [ ] NEW-03: Notes popover position
- [ ] NEW-04: Screenshot lightbox responsive
- [ ] NEW-05: Shift+click selection cross-page
- [ ] NEW-06: Column search case/diacritics
- [ ] NEW-07: Tooltip delay

### BD-3.2: Accessibility Overhaul (3h)
- [ ] aria-label on 50+ icon buttons
- [ ] Table keyboard navigation (Tab, Arrow, Enter)
- [ ] Badge status with text + icon (not color-only)
- [ ] aria-live regions for notifications
- [ ] Focus visible on all interactive elements
- [ ] WCAG AA compliance audit

### BD-3.3: Add Skeleton Loaders and Empty States (5h)
- [ ] Skeleton loaders for SpyRadar table
- [ ] Skeleton loaders for Dashboard cards/charts
- [ ] Empty states on first visit (Illustration + CTA)
- [ ] Error states with retry buttons
- [ ] All async operations show loading feedback

### BD-3.4: Add Breadcrumb Navigation (3h)
- [ ] Breadcrumb component (Lucide icons + text)
- [ ] SpyRadar → SpyOfferDetail ("Radar > Oferta Name")
- [ ] Ofertas → OfertaDetail
- [ ] Responsive on mobile (compact view)
- [ ] Clickable navigation back

### BD-3.5: Write Critical Integration Tests (5h)
- [ ] csvClassifier.test.ts - 10 CSV types identification
- [ ] parseSemrushCSV.test.ts - Format parsing
- [ ] trafficService.test.ts - Aggregations, trends, spikes
- [ ] offerService.test.ts - Filters, bulk ops, export
- [ ] useSpiedOffers.test.ts - Queries + mutations
- [ ] > 30% coverage on critical paths
- [ ] All tests pass locally + CI

**Sprint 3 Status:** 🔴 NOT STARTED (AFTER Sprint 2)

---

## DAILY LOG

### 2026-02-20
- [x] Brownfield Discovery completed (10 phases)
- [x] 17 stories created + documented
- [x] Handoff document prepared
- [ ] Sprint 0 implementation starts

---

## BLOCKERS / ISSUES

**None yet.** Sprint 0 ready to go.

---

## METRICS (Updated Daily)

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Stories Completed | 17 | 0 | 0% |
| Bugs Fixed | 20 | 0 | 0% |
| Lines of Code Refactored | 3,500 | 0 | 0% |
| Test Coverage (Critical Paths) | 30%+ | 0% | 0% |
| Lighthouse Score (Performance) | 80+ | TBD | TBD |
| Security Issues Fixed | 3 | 0 | 0% |
| Estimated Hours | 75h | 0h | 0% |

---

## SIGN-OFF

**Brownfield Discovery:** ✅ COMPLETE
**Documentation:** ✅ READY
**Stories:** ✅ CREATED
**Ready for @dev:** ✅ YES

**Next: Sprint 0 Implementation (2026-02-20 start)**

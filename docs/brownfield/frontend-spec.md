# Brownfield Discovery - Phase 3: Frontend Spec
**Date:** 2026-02-19
**Agent:** @ux-design-expert (perspectiva via @architect)

---

## EXECUTIVE SUMMARY

O frontend tem base tecnica solida (React 18 + Vite + shadcn/ui) mas sofre de **God Components** (1,400+ linhas), **inconsistencia visual** (emojis iOS + sizing variavel), **zero code-splitting**, e **ausencia de accessibility**. Estimativa: **40-50h de trabalho** para atingir nivel "software caro".

---

## 1. GOD COMPONENTS (Refatorar)

| Componente | Linhas | Responsabilidades | Decomposicao sugerida |
|-----------|--------|-------------------|----------------------|
| SpyRadar.tsx | ~1,424 | Filtros, tabela, colunas, presets, modals, bulk, pagination, notes | TableContainer, FilterBar, ColumnSelector, BulkActionsBar |
| UniversalImportModal.tsx | ~1,161 | 4-step wizard completo | Step1Upload, Step2Classification, Step3Matching, Step4Result |
| TrafficIntelligenceView.tsx | ~852 | Tabela + charting + controles | TrafficTable, ChartingPanel, ControlBar |
| useSpiedOffers.ts | 574 | 10+ hooks em 1 arquivo | Separar por concern (CRUD, traffic, bulk) |

---

## 2. BUGS VISUAIS CONFIRMADOS

### De docs/bugs.md (ativos)
- **BUG-001:** Upload RLS - CRITICO
- **BUG-003:** Graficos vs filtros de data
- **BUG-004:** Sidebar collapse → lacuna direita
- **BUG-005:** Dashboard zeros
- **BUG-008:** Emojis iOS na interface
- **BUG-009:** Popups com info cortada
- **BUG-010:** Dimensionamento inconsistente
- **BUG-011:** Tooltips ausentes
- **BUG-012:** Sparkline nao segue periodo

### NOVOS (encontrados no audit)
- **NEW-01:** Layout shift ao toggle de colunas (sem largura fixa)
- **NEW-02:** Import modal Step 3 overflow com 10k+ dominios
- **NEW-03:** Notes popover abre off-screen na borda direita
- **NEW-04:** Screenshot lightbox nao responsivo (iPad)
- **NEW-05:** Shift+click cross-page selection imprevisivel
- **NEW-06:** Column search case-sensitive (sem diacritics)
- **NEW-07:** Tooltip delay muito longo em texto truncado

---

## 3. GAP PARA "SOFTWARE CARO"

### Visual
| Gap | Impacto | Fix |
|-----|---------|-----|
| Emojis iOS em headers/tabs | Aparencia amadora | Substituir por Lucide icons (2h) |
| Sizing inconsistente em tabelas | Nao profissional | Larguras fixas + line-clamp (4h) |
| Font system default | Generico | Custom font Inter/Sohne (2h) |
| Sem micro-interactions | Sensacao "morta" | Hover scale, slide-in toasts (3h) |
| Cards sem hierarquia de elevacao | Plano/boring | Sombras gradient (1h) |
| Modais com sizing inconsistente | Desorganizado | Padronizar max-w + responsive (1h) |

### UX
| Gap | Impacto | Fix |
|-----|---------|-----|
| Sem breadcrumbs | Desorientacao | Componente + routing (3h) |
| Sem skeleton loaders | Parecer lento | shimmer placeholders (3h) |
| Sem empty states | Confusao | Ilustracoes + CTAs claros (2h) |
| Sem global search | Ineficiencia | Command palette (cmdk ja instalado) (4h) |
| Sem keyboard shortcuts | Power users frustrados | Hotkeys (2h) |

### Accessibility (WCAG AA)
| Gap | Fix |
|-----|-----|
| 50+ icon buttons sem aria-label | Adicionar labels (3h) |
| Tabela nao navigavel por teclado | Tab through rows (3h) |
| Badges dependem so de cor | Adicionar texto/icone (1h) |
| Sem aria-live para toasts | Regiao live (30min) |

---

## 4. PERFORMANCE

### Problemas
- **Zero code-splitting**: Tudo carrega no bundle principal
- **Sem lazy loading**: Modais e charts sempre no DOM
- **Sem virtualizacao**: Tabelas com 1000+ rows possíveis
- **Screenshot lightbox**: Imagem nativa pode ser 5MB+

### Fixes
```tsx
// Code splitting por rota
const SpyRadar = React.lazy(() => import('./pages/SpyRadar'));
const SpyOfferDetail = React.lazy(() => import('./pages/SpyOfferDetail'));

// Virtualizacao para tabelas grandes
import { useVirtualizer } from '@tanstack/react-virtual';

// Lazy load de modais
const UniversalImportModal = React.lazy(() => import('./components/spy/UniversalImportModal'));
```

---

## 5. DESIGN SYSTEM - Estado Atual vs Necessario

| Aspecto | Atual | Necessario |
|---------|-------|-----------|
| Cores | 5 cores semanticas OK | OK, adicionar brand color |
| Tipografia | System font | Custom font (Inter) |
| Espacamento | Inconsistente | Grid de 4/8/12/16/24px |
| Icones | Mix Lucide + emojis | 100% Lucide |
| Componentes | 49 shadcn base | OK, customizar |
| Temas | Dark mode unico | OK (dark only) |
| Responsividade | Parcial | Breakpoints definidos |
| Motion | Zero | Framer Motion (ja instalado) |

---

## 6. QUICK WINS (6h → 70% melhoria)

1. **Substituir TODOS emojis por Lucide icons** (2h)
2. **Fixar larguras de coluna + line-clamp** (2h)
3. **Adicionar aria-labels em icon buttons** (1h)
4. **Fix sidebar collapse CSS** (1h)

---

## 7. TIMELINE PARA "EXPENSIVE SOFTWARE"

| Fase | Horas | Resultado |
|------|-------|-----------|
| Quick wins | 6h | 70% profissional |
| Sprint 1 (critico + alto) | 30h | 95% profissional |
| Sprint 2 (polish) | 10h | Enterprise-grade |
| **TOTAL** | **46h** | **Software caro** |

# Story BD-2.3: Implement Code Splitting + Virtualization
**Epic:** EPIC-BD | **Sprint:** 2 | **Status:** Done | **Estimate:** 4h | **Priority:** MEDIO

---

## Descricao
Zero code-splitting: todo o app carrega em um unico bundle. Com 12+ paginas e modais pesados, isso impacta o First Contentful Paint. Adicionar lazy loading por rota e virtualizacao para tabelas com 1000+ rows.

## Acceptance Criteria

### AC-1: Code Splitting por Rota
- [x] Given: usuario acessa a pagina inicial
- [x] When: bundle principal carrega
- [x] Then: apenas o codigo da rota atual e carregado
- [x] And: outras paginas carregam sob demanda (React.lazy)

### AC-2: Lazy Loading de Modais
- [x] Given: usuario esta no SpyRadar
- [x] When: nao abriu modal de import
- [x] Then: codigo do UniversalImportModal NAO esta no bundle
- [x] And: carrega apenas ao abrir o modal

### AC-3: Virtualizacao de Tabelas
- [x] Given: tabela com 500+ rows
- [x] When: usuario faz scroll
- [x] Then: apenas rows visiveis estao no DOM (~30-50)
- [x] And: scroll e suave e performatico

### AC-4: Loading States
- [x] Given: pagina carregando via lazy load
- [x] When: codigo esta sendo baixado
- [x] Then: mostra Suspense fallback (spinner ou skeleton)

## Implementacao

### Rotas (React.lazy)
```tsx
// Em App.tsx ou routes.tsx
const SpyRadar = React.lazy(() => import('./pages/SpyRadar'));
const SpyOfferDetail = React.lazy(() => import('./pages/SpyOfferDetail'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Ofertas = React.lazy(() => import('./pages/Ofertas'));
const CriativosPage = React.lazy(() => import('./pages/CriativosPage'));
```

### Modais (Dynamic Import)
```tsx
const UniversalImportModal = React.lazy(
  () => import('./components/spy/UniversalImportModal')
);
```

### Virtualizacao (@tanstack/react-virtual)
```tsx
import { useVirtualizer } from '@tanstack/react-virtual';
// Aplicar na tabela principal do SpyRadar
```

## Arquivos a Modificar
- [x] src/App.tsx (lazy routes + Suspense wrapper)
- [x] src/pages/SpyRadar.tsx (lazy modais + virtualizer)
- [x] src/components/spy/spy-radar/SpyOffersTable.tsx (virtualizer)
- [x] package.json (@tanstack/react-virtual ^3.13.18 instalado)

## File List (implementado)
- `src/App.tsx` — React.lazy para todas as rotas, PageLoader fallback
- `src/pages/SpyRadar.tsx` — lazy modais (UniversalImportModal, FullOfferFormModal, QuickAddOfferModal, TrafficIntelligenceView) + useVirtualizer na tabela principal
- `src/components/spy/spy-radar/SpyOffersTable.tsx` — useVirtualizer integrado
- `package.json` + `package-lock.json` — @tanstack/react-virtual adicionado

## Metricas de Sucesso
- Bundle principal < 500KB (atualmente ~todo junto)
- First Contentful Paint < 2s
- Tabela com 1000 rows: DOM nodes < 100

## Dev Notes
- Virtualização ativa threshold: >100 rows visíveis (modo "all" com 12k+ registros)
- Quando virtualizing: table container vira `overflow-auto maxHeight:70vh`, header sticky
- Login não é lazy (carrega imediatamente para evitar flash)
- Cada chunk de página gerado separado no build: Dashboard (8KB), SpyRadar (103KB), UniversalImportModal (128KB)

## Change Log
- 2026-02-20: Implementado por @dev (BD-2.3)

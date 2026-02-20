# Story BD-2.3: Implement Code Splitting + Virtualization
**Epic:** EPIC-BD | **Sprint:** 2 | **Status:** Ready | **Estimate:** 4h | **Priority:** MEDIO

---

## Descricao
Zero code-splitting: todo o app carrega em um unico bundle. Com 12+ paginas e modais pesados, isso impacta o First Contentful Paint. Adicionar lazy loading por rota e virtualizacao para tabelas com 1000+ rows.

## Acceptance Criteria

### AC-1: Code Splitting por Rota
- [ ] Given: usuario acessa a pagina inicial
- [ ] When: bundle principal carrega
- [ ] Then: apenas o codigo da rota atual e carregado
- [ ] And: outras paginas carregam sob demanda (React.lazy)

### AC-2: Lazy Loading de Modais
- [ ] Given: usuario esta no SpyRadar
- [ ] When: nao abriu modal de import
- [ ] Then: codigo do UniversalImportModal NAO esta no bundle
- [ ] And: carrega apenas ao abrir o modal

### AC-3: Virtualizacao de Tabelas
- [ ] Given: tabela com 500+ rows
- [ ] When: usuario faz scroll
- [ ] Then: apenas rows visiveis estao no DOM (~30-50)
- [ ] And: scroll e suave e performatico

### AC-4: Loading States
- [ ] Given: pagina carregando via lazy load
- [ ] When: codigo esta sendo baixado
- [ ] Then: mostra Suspense fallback (spinner ou skeleton)

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
- [ ] src/App.tsx ou routes config (lazy routes)
- [ ] src/pages/SpyRadar.tsx (lazy modais)
- [ ] src/components/spy/tabs/ (virtualizacao em tabelas)
- [ ] package.json (adicionar @tanstack/react-virtual se necessario)

## Metricas de Sucesso
- Bundle principal < 500KB (atualmente ~todo junto)
- First Contentful Paint < 2s
- Tabela com 1000 rows: DOM nodes < 100

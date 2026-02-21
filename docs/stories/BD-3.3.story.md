# Story BD-3.3: Add Skeleton Loaders and Empty States
**Epic:** EPIC-BD | **Sprint:** 3 | **Status:** InProgress | **Estimate:** 5h | **Priority:** MEDIO

---

## Descricao
Sistema mostra tela branca ou spinner generico durante carregamento, e nada util quando nao ha dados. Adicionar skeleton loaders (shimmer placeholders) para todas as views e empty states com CTAs claros.

## Acceptance Criteria

### AC-1: Skeleton Loaders - SpyRadar
- [x] Given: SpyRadar esta carregando dados
- [x] When: query esta em loading
- [x] Then: mostra skeleton da tabela (8 rows com shimmer)
- [x] And: skeleton tem mesma estrutura visual que tabela real

### AC-2: Skeleton Loaders - Dashboard
- [x] Given: Dashboard esta carregando
- [x] When: cards/graficos estao em loading
- [x] Then: mostra skeletons nos valores dos cards
- [x] And: transicao suave de skeleton para dados reais

### AC-3: Skeleton Loaders - Detail Pages
- [x] Given: SpyOfferDetail esta carregando
- [x] When: dados da oferta estao loading
- [x] Then: skeleton do header, tabs e conteudo principal

### AC-4: Empty States - SpyRadar
- [x] Given: SpyRadar sem nenhuma oferta espionada
- [x] When: usuario acessa pela primeira vez
- [x] Then: mostra icone Radar + texto "Nenhuma oferta no radar ainda"
- [x] And: CTA: "Importar CSV" + "Quick Add"

### AC-5: Empty States - Outras Paginas
- [x] Given: qualquer pagina sem dados
- [x] When: usuario acessa
- [x] Then: mostra empty state com icone Lucide + texto descritivo + CTA
- [x] Paginas: Ofertas, Criativos (Dashboard ja tinha error state)

### AC-6: Error States
- [x] Given: query falha com erro
- [x] When: usuario esta na pagina
- [x] Then: mostra mensagem de erro amigavel + botao "Tentar novamente"
- [x] And: nao mostra tela branca ou stack trace

## Componentes a Criar
- [x] src/components/ui/Skeleton.tsx (ja existia no shadcn)
- [x] src/components/ui/EmptyState.tsx (icone + titulo + descricao + CTA)
- [x] src/components/ui/ErrorState.tsx (mensagem + retry button)

## Arquivos a Modificar
- [x] src/pages/SpyRadar.tsx (skeleton tabela + empty state + error state)
- [x] src/pages/Dashboard.tsx (skeleton cards)
- [x] src/pages/SpyOfferDetail.tsx (skeleton header + tabs + card)
- [x] src/pages/Ofertas.tsx (skeleton grid + empty state via EmptyState)
- [x] src/pages/CriativosPage.tsx (empty states via EmptyState)
- [ ] src/components/spy/TrafficIntelligenceView.tsx (ja tinha loading indicator funcional)

## Dev Agent Record

### File List
- `src/components/ui/EmptyState.tsx` (NEW) - Componente reusavel de empty state
- `src/components/ui/ErrorState.tsx` (NEW) - Componente reusavel de error state
- `src/pages/SpyRadar.tsx` (MODIFIED) - Skeleton tabela 8 rows, ErrorState, EmptyState com dual CTA
- `src/pages/Dashboard.tsx` (MODIFIED) - Skeleton nos valores dos stat cards
- `src/pages/SpyOfferDetail.tsx` (MODIFIED) - Skeleton header + tabs + card content
- `src/pages/Ofertas.tsx` (MODIFIED) - Skeleton grid 6 cards, EmptyState
- `src/pages/CriativosPage.tsx` (MODIFIED) - EmptyState em 2 locais

### Change Log
- 2026-02-20: Criados EmptyState e ErrorState components, adicionados skeletons e empty/error states em 5 paginas

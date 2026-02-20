# Story BD-3.3: Add Skeleton Loaders and Empty States
**Epic:** EPIC-BD | **Sprint:** 3 | **Status:** Ready | **Estimate:** 5h | **Priority:** MEDIO

---

## Descricao
Sistema mostra tela branca ou spinner generico durante carregamento, e nada util quando nao ha dados. Adicionar skeleton loaders (shimmer placeholders) para todas as views e empty states com CTAs claros.

## Acceptance Criteria

### AC-1: Skeleton Loaders - SpyRadar
- [ ] Given: SpyRadar esta carregando dados
- [ ] When: query esta em loading
- [ ] Then: mostra skeleton da tabela (5-10 rows com shimmer)
- [ ] And: skeleton tem mesma estrutura visual que tabela real

### AC-2: Skeleton Loaders - Dashboard
- [ ] Given: Dashboard esta carregando
- [ ] When: cards/graficos estao em loading
- [ ] Then: mostra skeletons de cards e graficos
- [ ] And: transicao suave de skeleton → dados reais

### AC-3: Skeleton Loaders - Detail Pages
- [ ] Given: SpyOfferDetail esta carregando
- [ ] When: dados da oferta estao loading
- [ ] Then: skeleton das tabs e conteudo principal

### AC-4: Empty States - SpyRadar
- [ ] Given: SpyRadar sem nenhuma oferta espionada
- [ ] When: usuario acessa pela primeira vez
- [ ] Then: mostra ilustracao + texto "Nenhuma oferta espionada"
- [ ] And: CTA: "Importar CSV" (abre import modal)

### AC-5: Empty States - Outras Paginas
- [ ] Given: qualquer pagina sem dados
- [ ] When: usuario acessa
- [ ] Then: mostra empty state com icone Lucide + texto descritivo + CTA
- [ ] Paginas: Dashboard, Ofertas, Criativos, Avatar

### AC-6: Error States
- [ ] Given: query falha com erro
- [ ] When: usuario esta na pagina
- [ ] Then: mostra mensagem de erro amigavel + botao "Tentar novamente"
- [ ] And: nao mostra tela branca ou stack trace

## Componentes a Criar
- [ ] src/components/ui/Skeleton.tsx (se nao existir no shadcn)
- [ ] src/components/ui/EmptyState.tsx (icone + titulo + descricao + CTA)
- [ ] src/components/ui/ErrorState.tsx (mensagem + retry button)

## Arquivos a Modificar
- [ ] src/pages/SpyRadar.tsx (skeleton + empty state)
- [ ] src/pages/Dashboard.tsx (skeleton + empty state)
- [ ] src/pages/SpyOfferDetail.tsx (skeleton)
- [ ] src/pages/Ofertas.tsx (empty state)
- [ ] src/pages/CriativosPage.tsx (empty state)
- [ ] src/components/spy/TrafficIntelligenceView.tsx (skeleton + empty)

## Design
- Skeleton: fundo dark-lighter com shimmer animation (CSS only, sem lib)
- Empty states: Lucide icon grande (48px) + titulo + descricao + CTA primary
- Error states: AlertCircle icon + mensagem + retry button

## Dependencias
- Nenhuma dependencia tecnica

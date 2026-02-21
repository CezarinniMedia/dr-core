# Story BD-3.4: Add Breadcrumb Navigation
**Epic:** EPIC-BD | **Sprint:** 3 | **Status:** InProgress | **Estimate:** 3h | **Priority:** BAIXO

---

## Descricao
Usuarios perdem contexto de navegacao, especialmente em paginas de detalhe (ex: SpyOfferDetail). Adicionar breadcrumbs consistentes em todas as paginas para orientacao e navegacao rapida.

## Acceptance Criteria

### AC-1: Breadcrumb no SpyOfferDetail
- [x] Given: usuario esta na pagina de detalhe de uma oferta
- [x] When: visualiza o header
- [x] Then: ve breadcrumb "Radar de Ofertas > [Nome da Oferta]"
- [x] And: "Radar de Ofertas" e clicavel e volta para SpyRadar

### AC-2: Breadcrumb em Todas as Paginas
- [x] Given: usuario esta em qualquer pagina do sistema
- [x] When: visualiza o header
- [x] Then: ve breadcrumb mostrando hierarquia atual
- [x] Exemplos:
  - Dashboard (apenas titulo, sem breadcrumb - e a home)
  - Radar de Ofertas (titulo simples)
  - Radar de Ofertas > Oferta XYZ
  - Ofertas > [Nome Oferta]
  - Avatares > [Nome Avatar]

### AC-3: Breadcrumb Responsivo
- [x] Given: tela menor que 768px
- [x] When: breadcrumb seria muito longo
- [x] Then: mostra apenas "< Voltar para [Pai]" em formato compacto

### AC-4: Componente Reutilizavel
- [x] Given: novo pagina precisa de breadcrumb
- [x] When: developer adiciona
- [x] Then: pode usar `<PageBreadcrumb items={[...]} />` com tipagem

## Componente
```tsx
interface BreadcrumbItemDef {
  label: string;
  href?: string; // se ausente, item atual (nao clicavel)
  icon?: LucideIcon;
}

<PageBreadcrumb items={[
  { label: 'Radar de Ofertas', href: '/spy', icon: Radar },
  { label: 'Oferta XYZ' }
]} />
```

## Arquivos a Criar
- [x] src/components/ui/PageBreadcrumb.tsx

## Arquivos a Modificar
- [x] src/pages/SpyOfferDetail.tsx
- [x] src/pages/OfertaDetail.tsx
- [x] src/pages/AvatarDetail.tsx
- [x] ~~src/pages/SpyRadar.tsx~~ (nao necessario - titulo h1 ja suficiente para top-level)
- [x] ~~src/pages/Ofertas.tsx~~ (nao necessario - top-level page)
- [x] ~~src/pages/CriativosPage.tsx~~ (nao necessario - top-level page)
- [x] ~~src/pages/Dashboard.tsx~~ (home, sem breadcrumb conforme spec)
- [x] ~~src/components/layout/DashboardLayout.tsx~~ (nao necessario - breadcrumbs nas proprias pages)

## Dependencias
- Nenhuma

## Dev Agent Record

### File List
- `src/components/ui/PageBreadcrumb.tsx` (CREATED) - Componente reutilizavel com responsividade (mobile: "< Voltar para [Pai]", desktop: trail completo)
- `src/components/ui/breadcrumb.tsx` (EXISTING) - Primitivos shadcn/ui usados como base
- `src/pages/SpyOfferDetail.tsx` (MODIFIED) - Breadcrumb "Radar de Ofertas > [Nome]", removido ArrowLeft back button
- `src/pages/OfertaDetail.tsx` (MODIFIED) - Breadcrumb "Ofertas > [Nome]", removido ArrowLeft back button
- `src/pages/AvatarDetail.tsx` (MODIFIED) - Breadcrumb "Avatares > [Nome]", removido ArrowLeft back button

### Change Log
- 2026-02-20: Criado PageBreadcrumb wrapper sobre shadcn primitivos, integrado em 3 detail pages, responsivo md breakpoint

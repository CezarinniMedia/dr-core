# Story BD-3.4: Add Breadcrumb Navigation
**Epic:** EPIC-BD | **Sprint:** 3 | **Status:** Ready | **Estimate:** 3h | **Priority:** BAIXO

---

## Descricao
Usuarios perdem contexto de navegacao, especialmente em paginas de detalhe (ex: SpyOfferDetail). Adicionar breadcrumbs consistentes em todas as paginas para orientacao e navegacao rapida.

## Acceptance Criteria

### AC-1: Breadcrumb no SpyOfferDetail
- [ ] Given: usuario esta na pagina de detalhe de uma oferta
- [ ] When: visualiza o header
- [ ] Then: ve breadcrumb "Radar de Ofertas > [Nome da Oferta]"
- [ ] And: "Radar de Ofertas" e clicavel e volta para SpyRadar

### AC-2: Breadcrumb em Todas as Paginas
- [ ] Given: usuario esta em qualquer pagina do sistema
- [ ] When: visualiza o header
- [ ] Then: ve breadcrumb mostrando hierarquia atual
- [ ] Exemplos:
  - Dashboard (apenas titulo, sem breadcrumb - e a home)
  - Radar de Ofertas (titulo simples)
  - Radar de Ofertas > Oferta XYZ
  - Ofertas > Nova Oferta
  - Criativos > Board Kanban

### AC-3: Breadcrumb Responsivo
- [ ] Given: tela menor que 768px
- [ ] When: breadcrumb seria muito longo
- [ ] Then: mostra apenas "< Voltar para [Pai]" em formato compacto

### AC-4: Componente Reutilizavel
- [ ] Given: novo pagina precisa de breadcrumb
- [ ] When: developer adiciona
- [ ] Then: pode usar `<Breadcrumb items={[...]} />` com tipagem

## Componente
```tsx
interface BreadcrumbItem {
  label: string;
  href?: string; // se ausente, item atual (nao clicavel)
  icon?: LucideIcon;
}

<Breadcrumb items={[
  { label: 'Radar de Ofertas', href: '/spy', icon: Radar },
  { label: 'Oferta XYZ' }
]} />
```

## Arquivos a Criar
- [ ] src/components/ui/Breadcrumb.tsx

## Arquivos a Modificar
- [ ] src/pages/SpyOfferDetail.tsx
- [ ] src/pages/SpyRadar.tsx
- [ ] src/pages/Ofertas.tsx
- [ ] src/pages/CriativosPage.tsx
- [ ] src/pages/Dashboard.tsx (verificar se precisa)
- [ ] src/components/layout/DashboardLayout.tsx (area para breadcrumb)

## Dependencias
- Nenhuma

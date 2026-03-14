# Plano de Melhoria UX — 2026-03-04

> **Baseado em:** 15 screenshots de reclamacoes + 4 arquivos de contexto antigos
> **Decisoes do usuario:** Inline edit = prioridade alta, funil visual = quer, pipeline auto = manual ok por enquanto
> **Branch:** feature/vision-1-foundation

---

## Verificacao de Wishlist (Contextos Antigos)

| Feature | Existe? | Acao |
|---------|---------|------|
| Status "Produzindo" (Ofertas) | NAO | Adicionar |
| Click card inteiro (Ofertas) | NAO | Implementar |
| Inline status change (Radar) | SIM | Nenhuma |
| Stage "Teste" (Criativos Kanban) | SIM (TEST existe) | Nenhuma |
| Duplicar criativo | SIM | Nenhuma |
| Auto-naming criativos | SIM | Nenhuma |
| Color labels no grafico | SIM | Nenhuma |
| CSV delimiter selector | PARCIAL (so paste) | Estender para file upload |
| Inline status (Traffic) | SIM | Nenhuma |
| Scale signals toggles | SIM (wired) | Investigar visual — usuario diz "nao clicavel" |

---

## Plano de Implementacao por Prioridade

### FASE 1 — Bugs & Quick Wins (estimativa: 1 sessao)

| # | Item | Tipo | Esforco |
|---|------|------|---------|
| 1.1 | Scale signals: investigar por que parecem nao clicaveis (esta wired, pode ser visual/CSS) | Bug investigate | Baixo |
| 1.2 | Trend/variacao/ultimo mes inconsistentes (D1) | Bug | Medio |
| 1.3 | Status ALL CAPS → Title Case em TODOS os dropdowns/badges | Visual fix | Baixo |
| 1.4 | Metric cards overflow (auto-sizing font) | Visual fix | Baixo |
| 1.5 | Header/sidebar desalinhamento | Visual fix | Baixo |
| 1.6 | Click card inteiro (Ofertas) | UX fix | Baixo |
| 1.7 | Status "Produzindo" nas Ofertas | Feature tiny | Baixo |

### FASE 2 — Layout & Botoes (estimativa: 1 sessao)

| # | Item | Tipo | Esforco |
|---|------|------|---------|
| 2.1 | Sidebar collapse → conteudo expande full width | Layout fix | Medio |
| 2.2 | Botoes de filtro (status chips) — aumentar tamanho, melhorar visual em TODAS as paginas | Design system | Medio |
| 2.3 | Design system refinement geral (spacing, elevation, hierarquia visual) | Design system | Medio |

### FASE 3 — Inline Edit na Pagina de Oferta (estimativa: 2 sessoes)

**Abordagem:** Cada secao da pagina de detalhe da oferta (SpyOfferDetail) tera toggle View/Edit.

| # | Item | Detalhes |
|---|------|---------|
| 3.1 | Header com toggle View/Edit global | Botao "Editar" alterna toda a pagina para modo edicao |
| 3.2 | Secoes individuais editaveis inline | Dados Basicos, Inteligencia, Descoberta, Produto & Oferta, Estimativas, Operador, Notas |
| 3.3 | Auto-save ou Save/Cancel por secao | Cada secao pode salvar independentemente |
| 3.4 | Manter modal FullOfferForm para Quick Add apenas | O modal fica so para criar nova oferta rapida |

### FASE 4 — Views/Presets Unificacao + Colunas (estimativa: 1 sessao)

| # | Item | Detalhes |
|---|------|---------|
| 4.1 | Unificar Views e Presets em conceito unico "Views" | View = colunas + filtros + ordenacao |
| 4.2 | Adicionar mais opcoes de colunas no Radar | Vertical, Geo, Fonte, Prioridade, Notes preview, Screenshot |
| 4.3 | Ordenacao drag-and-drop dentro de grupos (estilo FB Ads) | Arrastar colunas para reordenar |
| 4.4 | Delimiter selector para file upload (nao so paste) | Estender ImportStepUpload |

### FASE 5 — Funil Visual (estimativa: 2-3 sessoes)

| # | Item | Detalhes |
|---|------|---------|
| 5.1 | Pesquisa de abordagem (React Flow vs canvas custom) | Avaliar libs: reactflow, @xyflow/react |
| 5.2 | Nodes: Cloaker, Landing Page, VSL, Checkout, Upsell, Downsell | Cada node com campos editaveis |
| 5.3 | Edges com labels (redirect, purchase, decline) | Conexoes entre steps |
| 5.4 | Integracao com offer_funnel_steps existente | Salvar/carregar do banco |
| 5.5 | Tab "Funil" na pagina de detalhe | Substituir lista de steps |

### FASE 6 — Wishlist & Polish (estimativa: 1-2 sessoes)

| # | Item | Prioridade |
|---|------|-----------|
| 6.1 | Export Markdown (ofertas + avatares) | Media |
| 6.2 | Screenshot preview na lista do Radar (hover) | Media |
| 6.3 | Notes preview na lista (hover + click) | Media |
| 6.4 | Bulk action bar sticky (acompanha scroll) | Media |
| 6.5 | Tooltips faltantes | Baixa |

---

## Dependencias e Ordem

```
FASE 1 (bugs/quick wins) — sem dependencias, comecar imediatamente
    ↓
FASE 2 (layout/botoes) — depende parcialmente de FASE 1
    ↓
FASE 3 (inline edit) — independente, pode ser paralela com FASE 2
    ↓
FASE 4 (views/colunas) — independente
    ↓
FASE 5 (funil visual) — independente, mas e a mais complexa
    ↓
FASE 6 (polish) — depois de tudo
```

---

## Arquivos Principais Afetados

### Fase 1-2
- `src/features/spy/components/tabs/SpyOverviewTab.tsx` (scale signals)
- `src/features/spy/components/traffic-intel/TrafficTable.tsx` (trend bug)
- `src/features/spy/components/spy-radar/SpyOffersTable.tsx` (status format)
- `src/features/offers/components/OfertaCard.tsx` (click card, status produzindo)
- `src/shared/components/layout/DashboardLayout.tsx` (sidebar collapse)
- `src/shared/design-system/tokens.css` (spacing, elevation)

### Fase 3
- `src/pages/SpyOfferDetail.tsx` (view/edit toggle)
- `src/features/spy/components/tabs/SpyOverviewTab.tsx` (inline edit mode)
- `src/features/spy/components/FullOfferFormModal.tsx` (restringir a quick add)

### Fase 4
- `src/features/spy/components/spy-radar/SpyColumnSelector.tsx`
- `src/features/spy/components/spy-radar/SavedViewsDropdown.tsx`
- `src/features/spy/components/traffic-intel/TrafficControlBar.tsx`

### Fase 5
- NOVO: `src/features/spy/components/tabs/SpyFunnelTab.tsx` (reescrever)
- NOVO: `src/features/spy/components/funnel/` (FunnelCanvas, FunnelNode, etc.)

---

## Metricas de Sucesso

- [ ] Zero bugs P0 (scale signals + trend data)
- [ ] Build + TypeCheck + Tests passando apos cada fase
- [ ] Usuario consegue editar oferta sem abrir modal
- [ ] Sidebar collapse funciona corretamente
- [ ] Botoes de filtro visivelmente maiores e mais profissionais
- [ ] Status sempre em Title Case
